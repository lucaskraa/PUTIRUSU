require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 1000);

if (!DATABASE_URL) throw new Error('DATABASE_URL ausente no .env');
if (!JWT_SECRET) throw new Error('JWT_SECRET ausente no .env');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 12,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', error => console.error('Erro inesperado no PostgreSQL:', error));

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: NODE_ENV === 'production' ? process.env.CORS_ORIGIN : true }));
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 60000, limit: 180, standardHeaders: true, legacyHeaders: false }));
app.use('/api/ai', rateLimit({ windowMs: 60000, limit: 30, standardHeaders: true, legacyHeaders: false }));

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function cleanText(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('E-mail inválido.');
    error.status = 400;
    throw error;
  }
  return email;
}

function validatePassword(value) {
  const password = String(value || '');
  if (password.length < 6) {
    const error = new Error('A senha precisa ter pelo menos 6 caracteres.');
    error.status = 400;
    throw error;
  }
  return password;
}

function normalizeAnswer(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'«»]/g, '')
    .replace(/\s+/g, ' ');
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authRequired(req, res, next) {
  const [type, token] = String(req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, error: 'Token ausente.' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: 'Token inválido ou expirado.' });
  }
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function fallbackAnswer(message, mode = 'teacher') {
  const text = cleanText(message).toLowerCase();
  if (mode === 'review') {
    return [
      'Revisão local:',
      '1. Reescreva três respostas erradas.',
      '2. Leia cada resposta em voz alta.',
      '3. Crie uma frase nova com a mesma estrutura.',
      '4. Revise novamente amanhã.',
      '',
      'Configure OPENAI_API_KEY para uma revisão personalizada pela IA real.'
    ].join('\n');
  }
  if (text.includes('alfabeto') || text.includes('cirílico') || text.includes('cirilico')) {
    return [
      'Divida o alfabeto em três grupos:',
      '1. Letras conhecidas: А, К, М, О, Т.',
      '2. Falsas amigas: В=V, Н=N, Р=R, С=S.',
      '3. Letras novas: Ж, Ц, Ч, Ш, Щ, Ы.',
      '',
      'Treine lendo: мама, вода, город, школа, Россия.'
    ].join('\n');
  }
  if (text.includes('corrig')) {
    return [
      'Correção local:',
      '• Verifique sujeito, verbo e caso.',
      '• No presente, normalmente não use есть para profissão.',
      '• Exemplo correto: Я студент.',
      '',
      'A IA real oferece correção detalhada quando a chave está configurada.'
    ].join('\n');
  }
  return [
    'Professor local:',
    'Use um destes modelos:',
    '• Я хочу... = Eu quero...',
    '• Мне нужно... = Eu preciso...',
    '• Где...? = Onde...?',
    '• Сколько стоит...? = Quanto custa...?',
    '',
    'Configure OPENAI_API_KEY no .env para respostas completas.'
  ].join('\n');
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  if (!Array.isArray(data.output)) return '';
  return data.output
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item && item.type === 'output_text')
    .map(item => item.text || '')
    .join('\n')
    .trim();
}

async function callOpenAI({ instructions, input, temperature = 0.35, maxOutputTokens = AI_MAX_OUTPUT_TOKENS, mode = 'teacher' }) {
  if (!OPENAI_API_KEY) {
    return { fallback: true, text: fallbackAnswer(input, mode), model: 'local-fallback' };
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input,
      temperature,
      max_output_tokens: maxOutputTokens
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Erro OpenAI:', data);
    return {
      fallback: true,
      text: fallbackAnswer(input, mode),
      model: 'local-fallback',
      providerError: data.error?.message || `HTTP ${response.status}`
    };
  }

  return {
    fallback: false,
    text: extractOutputText(data) || fallbackAnswer(input, mode),
    model: data.model || OPENAI_MODEL,
    responseId: data.id || null
  };
}

function teacherInstructions(profile = {}) {
  return [
    'Você é a professora virtual do aplicativo PUTIRUSU, um curso brasileiro de russo.',
    'Responda em português do Brasil e use russo quando necessário.',
    'Toda frase russa nova deve ter pronúncia aproximada e tradução.',
    'Corrija com respeito e objetividade.',
    'Ao corrigir, use: erro, forma correta, explicação e novo exemplo.',
    'Dê prioridade ao russo moderno, uso real, fala, escrita e compreensão.',
    'Não entregue o gabarito completo antes do aluno tentar.',
    `Aluno: ${profile.name || 'Estudante'}.`,
    `Nível: ${profile.current_level || 'A1'}.`,
    `Objetivo: ${profile.goal || 'aprender russo'}.`,
    `XP: ${profile.total_xp || 0}.`
  ].join('\n');
}

async function loadProfile(userId) {
  const result = await pool.query(
    `SELECT id,name,email,role,current_level,goal,avatar,daily_goal_minutes,streak,total_xp,last_study_date
     FROM users WHERE id=$1`,
    [userId]
  );
  return result.rows[0];
}

async function saveConversation({ userId, mode, title, scenario, userMessage, assistantMessage, model, fallback }) {
  return transaction(async client => {
    const conv = await client.query(
      `INSERT INTO ai_conversations (user_id,mode,title,scenario)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [userId, mode, title, scenario || null]
    );
    await client.query(
      `INSERT INTO ai_messages (conversation_id,role,content,provider,model,fallback)
       VALUES ($1,'user',$2,'user',NULL,FALSE),($1,'assistant',$3,'openai',$4,$5)`,
      [conv.rows[0].id, userMessage, assistantMessage, model, fallback]
    );
    return conv.rows[0].id;
  });
}

app.get('/api/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({
    ok: true,
    app: 'PUTIRUSU',
    version: '14.0.0',
    database: 'postgresql',
    ai: OPENAI_API_KEY ? 'real' : 'fallback',
    model: OPENAI_MODEL
  });
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name, 100);
  const email = validateEmail(req.body.email);
  const password = validatePassword(req.body.password);
  if (name.length < 2) return res.status(400).json({ ok: false, error: 'Digite seu nome.' });

  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rows[0]) return res.status(409).json({ ok: false, error: 'Este e-mail já está cadastrado.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (name,email,password_hash)
     VALUES ($1,$2,$3)
     RETURNING id,name,email,role,current_level,goal,avatar,daily_goal_minutes,streak,total_xp`,
    [name, email, passwordHash]
  );
  const user = result.rows[0];
  res.status(201).json({ ok: true, token: signToken(user), user });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const email = validateEmail(req.body.email);
  const password = String(req.body.password || '');
  const result = await pool.query(
    `SELECT id,name,email,password_hash,role,current_level,goal,avatar,daily_goal_minutes,streak,total_xp
     FROM users WHERE email=$1`,
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ ok: false, error: 'E-mail ou senha incorretos.' });
  }
  delete user.password_hash;
  res.json({ ok: true, token: signToken(user), user });
}));

app.get('/api/profile', authRequired, asyncHandler(async (req, res) => {
  const user = await loadProfile(req.user.sub);
  res.json({ ok: true, user });
}));

app.put('/api/profile', authRequired, asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name, 100) || 'Estudante';
  const goal = cleanText(req.body.goal, 500) || 'Aprender russo';
  const avatar = cleanText(req.body.avatar, 20) || '🇷🇺';
  const currentLevel = ['A1','A2','B1','B2','C1'].includes(req.body.currentLevel) ? req.body.currentLevel : 'A1';
  const dailyGoal = Math.max(5, Math.min(240, Number(req.body.dailyGoalMinutes || 20)));
  const result = await pool.query(
    `UPDATE users SET name=$2,goal=$3,avatar=$4,current_level=$5,daily_goal_minutes=$6
     WHERE id=$1
     RETURNING id,name,email,role,current_level,goal,avatar,daily_goal_minutes,streak,total_xp,last_study_date`,
    [req.user.sub, name, goal, avatar, currentLevel, dailyGoal]
  );
  res.json({ ok: true, user: result.rows[0] });
}));

app.get('/api/profile/dashboard', authRequired, asyncHandler(async (req, res) => {
  const [userResult, progressResult, reviewResult, achievementsResult] = await Promise.all([
    pool.query(
      `SELECT id,name,email,role,current_level,goal,avatar,daily_goal_minutes,streak,total_xp,last_study_date
       FROM users WHERE id=$1`,
      [req.user.sub]
    ),
    pool.query(
      `SELECT COUNT(*) FILTER (WHERE status='completed')::int AS completed_lessons,
              COALESCE(AVG(best_score) FILTER (WHERE status='completed'),0)::int AS average_score,
              COALESCE(SUM(time_spent_seconds),0)::int AS time_spent_seconds
       FROM user_lesson_progress WHERE user_id=$1`,
      [req.user.sub]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS due_reviews FROM review_items
       WHERE user_id=$1 AND next_review_at<=NOW()`,
      [req.user.sub]
    ),
    pool.query(
      `SELECT a.code,a.name,a.description,a.icon,ua.earned_at
       FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id
       WHERE ua.user_id=$1 ORDER BY ua.earned_at DESC LIMIT 8`,
      [req.user.sub]
    )
  ]);
  res.json({
    ok: true,
    user: userResult.rows[0],
    stats: { ...progressResult.rows[0], due_reviews: reviewResult.rows[0].due_reviews },
    achievements: achievementsResult.rows
  });
}));

app.get('/api/course', authRequired, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT cl.id AS level_id,cl.code AS level_code,cl.name AS level_name,
            cl.description AS level_description,cl.position AS level_position,
            l.id AS lesson_id,l.external_id,l.title,l.subtitle,l.position AS lesson_position,
            l.estimated_minutes,l.xp,l.is_exam,
            COALESCE(ulp.status,'available') AS status,
            COALESCE(ulp.best_score,0) AS best_score
     FROM course_levels cl
     JOIN courses c ON c.id=cl.course_id
     JOIN lessons l ON l.level_id=cl.id AND l.published=TRUE
     LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id=l.id AND ulp.user_id=$1
     WHERE c.slug='russo-completo' AND c.published=TRUE
     ORDER BY cl.position,l.position`,
    [req.user.sub]
  );

  const levels = [];
  const map = new Map();
  for (const row of result.rows) {
    if (!map.has(row.level_id)) {
      const level = {
        id: row.level_id,
        code: row.level_code,
        name: row.level_name,
        description: row.level_description,
        position: row.level_position,
        lessons: []
      };
      map.set(row.level_id, level);
      levels.push(level);
    }
    map.get(row.level_id).lessons.push({
      id: row.lesson_id,
      externalId: row.external_id,
      title: row.title,
      subtitle: row.subtitle,
      position: row.lesson_position,
      estimatedMinutes: row.estimated_minutes,
      xp: row.xp,
      isExam: row.is_exam,
      status: row.status,
      bestScore: row.best_score
    });
  }
  res.json({ ok: true, levels });
}));

app.get('/api/course/lessons/:lessonId', authRequired, asyncHandler(async (req, res) => {
  const lessonResult = await pool.query(
    `SELECT l.*,cl.code AS level_code,cl.name AS level_name,
            COALESCE(ulp.status,'available') AS status,
            COALESCE(ulp.best_score,0) AS best_score
     FROM lessons l
     JOIN course_levels cl ON cl.id=l.level_id
     LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id=l.id AND ulp.user_id=$2
     WHERE l.id=$1 AND l.published=TRUE`,
    [req.params.lessonId, req.user.sub]
  );
  const lesson = lessonResult.rows[0];
  if (!lesson) return res.status(404).json({ ok: false, error: 'Aula não encontrada.' });

  const [vocabResult, exerciseResult] = await Promise.all([
    pool.query(
      `SELECT id,russian,pronunciation,portuguese,example_russian,example_portuguese,position
       FROM vocabulary WHERE lesson_id=$1 ORDER BY position`,
      [lesson.id]
    ),
    pool.query(
      `SELECT id,type,prompt,options,answer,accepted_answers,explanation,position,points
       FROM exercises WHERE lesson_id=$1 ORDER BY position`,
      [lesson.id]
    )
  ]);

  res.json({
    ok: true,
    lesson: {
      id: lesson.id,
      externalId: lesson.external_id,
      levelCode: lesson.level_code,
      levelName: lesson.level_name,
      title: lesson.title,
      subtitle: lesson.subtitle,
      estimatedMinutes: lesson.estimated_minutes,
      xp: lesson.xp,
      isExam: lesson.is_exam,
      grammar: lesson.grammar,
      objectives: lesson.objectives,
      dialogue: lesson.dialogue,
      examples: lesson.examples,
      reviewTips: lesson.review_tips,
      status: lesson.status,
      bestScore: lesson.best_score,
      vocabulary: vocabResult.rows,
      exercises: exerciseResult.rows.map(exercise => ({
        id: exercise.id,
        type: exercise.type,
        prompt: exercise.prompt,
        options: exercise.options,
        answer: ['writing','essay','speaking','listening'].includes(exercise.type) ? exercise.answer : undefined,
        acceptedAnswers: exercise.accepted_answers,
        explanation: exercise.explanation,
        position: exercise.position,
        points: exercise.points
      }))
    }
  });
}));

app.post('/api/progress/attempts', authRequired, asyncHandler(async (req, res) => {
  const exerciseId = req.body.exerciseId;
  const answer = cleanText(req.body.answer, 4000);

  const result = await transaction(async client => {
    const exerciseResult = await client.query(
      `SELECT e.*,l.id AS lesson_id FROM exercises e
       JOIN lessons l ON l.id=e.lesson_id WHERE e.id=$1`,
      [exerciseId]
    );
    const exercise = exerciseResult.rows[0];
    if (!exercise) {
      const error = new Error('Exercício não encontrado.');
      error.status = 404;
      throw error;
    }

    const accepted = Array.isArray(exercise.accepted_answers) ? exercise.accepted_answers : [];
    const candidates = [exercise.answer, ...accepted].map(normalizeAnswer);
    const normalized = normalizeAnswer(answer);
    const openType = ['writing','essay','speaking'].includes(exercise.type);
    const isCorrect = openType ? normalized.length >= 2 : candidates.includes(normalized);
    const score = isCorrect ? exercise.points : 0;

    await client.query(
      `INSERT INTO exercise_attempts (user_id,exercise_id,answer,is_correct,score,feedback)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [req.user.sub, exercise.id, answer, isCorrect, score, isCorrect ? 'Resposta aceita.' : exercise.explanation]
    );

    if (!isCorrect) {
      await client.query(
        `INSERT INTO review_items (user_id,exercise_id,kind,prompt,expected_answer,user_answer,difficulty)
         VALUES ($1,$2,$3,$4,$5,$6,2)`,
        [req.user.sub, exercise.id, exercise.type, exercise.prompt, exercise.answer, answer]
      );
    }

    await client.query(
      `INSERT INTO user_lesson_progress (user_id,lesson_id,status,attempts)
       VALUES ($1,$2,'started',1)
       ON CONFLICT (user_id,lesson_id) DO UPDATE SET
         attempts=user_lesson_progress.attempts+1,
         status=CASE WHEN user_lesson_progress.status='completed' THEN 'completed' ELSE 'started' END`,
      [req.user.sub, exercise.lesson_id]
    );

    if (isCorrect) {
      await client.query('UPDATE users SET total_xp=total_xp+$2 WHERE id=$1',[req.user.sub,score]);
    }

    return {
      isCorrect,
      score,
      correctAnswer: exercise.answer,
      explanation: exercise.explanation
    };
  });

  res.json({ ok: true, ...result });
}));

app.post('/api/progress/lessons/:lessonId/complete', authRequired, asyncHandler(async (req, res) => {
  const lessonId = req.params.lessonId;
  const safeScore = Math.max(0, Math.min(100, Number(req.body.score || 0)));
  const safeTime = Math.max(0, Math.min(86400, Number(req.body.timeSpentSeconds || 0)));

  const result = await transaction(async client => {
    const lessonResult = await client.query('SELECT id,xp,level_id FROM lessons WHERE id=$1',[lessonId]);
    const lesson = lessonResult.rows[0];
    if (!lesson) {
      const error = new Error('Aula não encontrada.');
      error.status = 404;
      throw error;
    }

    const existingResult = await client.query(
      'SELECT status FROM user_lesson_progress WHERE user_id=$1 AND lesson_id=$2',
      [req.user.sub,lessonId]
    );
    const wasCompleted = existingResult.rows[0]?.status === 'completed';

    await client.query(
      `INSERT INTO user_lesson_progress
       (user_id,lesson_id,status,best_score,attempts,time_spent_seconds,completed_at)
       VALUES ($1,$2,'completed',$3,1,$4,NOW())
       ON CONFLICT (user_id,lesson_id) DO UPDATE SET
         status='completed',
         best_score=GREATEST(user_lesson_progress.best_score,EXCLUDED.best_score),
         attempts=user_lesson_progress.attempts+1,
         time_spent_seconds=user_lesson_progress.time_spent_seconds+EXCLUDED.time_spent_seconds,
         completed_at=COALESCE(user_lesson_progress.completed_at,NOW())`,
      [req.user.sub,lessonId,safeScore,safeTime]
    );

    if (!wasCompleted) {
      await client.query(
        `UPDATE users SET total_xp=total_xp+$2,last_study_date=CURRENT_DATE WHERE id=$1`,
        [req.user.sub,lesson.xp]
      );
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS total FROM user_lesson_progress
       WHERE user_id=$1 AND status='completed'`,
      [req.user.sub]
    );
    const completedCount = countResult.rows[0].total;

    if (completedCount >= 1) {
      await client.query(
        `INSERT INTO user_achievements (user_id,achievement_id)
         SELECT $1,id FROM achievements WHERE code='FIRST_LESSON' ON CONFLICT DO NOTHING`,
        [req.user.sub]
      );
    }
    if (completedCount >= 10) {
      await client.query(
        `INSERT INTO user_achievements (user_id,achievement_id)
         SELECT $1,id FROM achievements WHERE code='TEN_LESSONS' ON CONFLICT DO NOTHING`,
        [req.user.sub]
      );
    }

    return { completed: true, xpEarned: wasCompleted ? 0 : lesson.xp, completedCount };
  });

  res.json({ ok: true, ...result });
}));

app.get('/api/progress/reviews', authRequired, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id,kind,prompt,expected_answer,user_answer,difficulty,next_review_at,interval_days,repetitions
     FROM review_items WHERE user_id=$1 AND next_review_at<=NOW()
     ORDER BY next_review_at LIMIT 30`,
    [req.user.sub]
  );
  res.json({ ok: true, items: result.rows });
}));

app.post('/api/progress/reviews/:reviewId/answer', authRequired, asyncHandler(async (req, res) => {
  const currentResult = await pool.query(
    'SELECT * FROM review_items WHERE id=$1 AND user_id=$2',
    [req.params.reviewId,req.user.sub]
  );
  const item = currentResult.rows[0];
  if (!item) return res.status(404).json({ ok: false, error: 'Item de revisão não encontrado.' });

  const correct = Boolean(req.body.correct);
  const repetitions = correct ? item.repetitions + 1 : 0;
  const intervalDays = correct ? Math.min(60, Math.max(1, item.interval_days * 2)) : 1;
  const difficulty = correct ? Math.max(1, item.difficulty - 1) : Math.min(5, item.difficulty + 1);

  const update = await pool.query(
    `UPDATE review_items SET repetitions=$3,interval_days=$4,difficulty=$5,last_result=$6,
       next_review_at=NOW()+($4||' days')::interval
     WHERE id=$1 AND user_id=$2 RETURNING *`,
    [req.params.reviewId,req.user.sub,repetitions,intervalDays,difficulty,correct]
  );
  res.json({ ok: true, item: update.rows[0] });
}));

app.post('/api/ai/teacher', authRequired, asyncHandler(async (req, res) => {
  const message = cleanText(req.body.message, 4000);
  if (!message) return res.status(400).json({ ok: false, error: 'Digite uma mensagem.' });
  const profile = await loadProfile(req.user.sub);
  const result = await callOpenAI({
    instructions: teacherInstructions(profile),
    input: message,
    temperature: 0.35,
    mode: 'teacher'
  });
  await saveConversation({
    userId: req.user.sub,
    mode: 'teacher',
    title: message.slice(0,100),
    userMessage: message,
    assistantMessage: result.text,
    model: result.model,
    fallback: result.fallback
  });
  await pool.query(
    `INSERT INTO user_achievements (user_id,achievement_id)
     SELECT $1,id FROM achievements WHERE code='FIRST_AI_CHAT' ON CONFLICT DO NOTHING`,
    [req.user.sub]
  );
  res.json({
    ok: true,
    mode: result.fallback ? 'fallback' : 'real_ai',
    answer: result.text,
    model: result.model,
    providerError: result.providerError || null
  });
}));

app.post('/api/ai/scenario', authRequired, asyncHandler(async (req, res) => {
  const scenario = cleanText(req.body.scenario,100) || 'conversa geral';
  const message = cleanText(req.body.message,3000);
  if (!message) return res.status(400).json({ ok: false, error: 'Digite uma resposta.' });
  const profile = await loadProfile(req.user.sub);
  const instructions = [
    teacherInstructions(profile),
    `Cenário atual: ${scenario}.`,
    'Interprete uma pessoa russa paciente e mantenha a situação realista.',
    'Responda em russo e depois explique em português.',
    'Corrija no máximo um erro importante do aluno.',
    'Finalize com uma pergunta curta para continuar a conversa.'
  ].join('\n');
  const result = await callOpenAI({ instructions, input: message, temperature: 0.55, mode: 'teacher' });
  await saveConversation({
    userId: req.user.sub,
    mode: 'scenario',
    title: `Cenário: ${scenario}`,
    scenario,
    userMessage: message,
    assistantMessage: result.text,
    model: result.model,
    fallback: result.fallback
  });
  res.json({ ok: true, mode: result.fallback ? 'fallback' : 'real_ai', answer: result.text, model: result.model });
}));

app.post('/api/ai/correct', authRequired, asyncHandler(async (req, res) => {
  const phrase = cleanText(req.body.phrase,3000);
  const expected = cleanText(req.body.expected,2000);
  if (!phrase) return res.status(400).json({ ok: false, error: 'Digite uma frase.' });
  const profile = await loadProfile(req.user.sub);
  const instructions = [
    teacherInstructions(profile),
    'Você está no modo corretor.',
    'Responda com quatro seções: Correção, Explicação, Pronúncia e Novo exemplo.',
    'Se a frase for aceitável, diga que está correta e explique por quê.'
  ].join('\n');
  const input = [`Frase do aluno: ${phrase}`, expected ? `Modelo ou objetivo: ${expected}` : ''].filter(Boolean).join('\n');
  const result = await callOpenAI({ instructions, input, temperature: 0.2, mode: 'teacher' });
  await saveConversation({
    userId: req.user.sub,
    mode: 'correction',
    title: 'Correção de frase',
    userMessage: input,
    assistantMessage: result.text,
    model: result.model,
    fallback: result.fallback
  });
  res.json({ ok: true, mode: result.fallback ? 'fallback' : 'real_ai', correction: result.text, model: result.model });
}));

app.post('/api/ai/review', authRequired, asyncHandler(async (req, res) => {
  const profile = await loadProfile(req.user.sub);
  const dueResult = await pool.query(
    `SELECT kind,prompt,expected_answer,user_answer,difficulty
     FROM review_items WHERE user_id=$1 ORDER BY next_review_at LIMIT 12`,
    [req.user.sub]
  );
  const supplied = Array.isArray(req.body.mistakes) ? req.body.mistakes.slice(-12) : [];
  const mistakes = dueResult.rows.length ? dueResult.rows : supplied;
  const instructions = [
    teacherInstructions(profile),
    'Crie uma revisão personalizada com seis exercícios variados.',
    'Não entregue o gabarito completo antes do aluno tentar.',
    'Inclua dicas curtas e use os erros enviados como prioridade.'
  ].join('\n');
  const input = `Erros e itens para revisar:\n${JSON.stringify(mistakes,null,2)}`;
  const result = await callOpenAI({
    instructions,
    input,
    temperature: 0.45,
    maxOutputTokens: 1200,
    mode: 'review'
  });
  res.json({ ok: true, mode: result.fallback ? 'fallback' : 'real_ai', review: result.text, model: result.model });
}));

app.get('/api/ai/history', authRequired, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT c.id,c.mode,c.title,c.scenario,c.updated_at,
            (SELECT content FROM ai_messages WHERE conversation_id=c.id AND role='assistant'
             ORDER BY created_at DESC LIMIT 1) AS last_answer
     FROM ai_conversations c WHERE c.user_id=$1
     ORDER BY c.updated_at DESC LIMIT 30`,
    [req.user.sub]
  );
  res.json({ ok: true, conversations: result.rows });
}));

const publicPath = path.join(__dirname,'public');
app.use(express.static(publicPath));
app.get('*',(req,res,next)=>{
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(publicPath,'index.html'));
});

app.use((req,res)=>res.status(404).json({ ok:false,error:'Rota não encontrada.' }));
app.use((error,req,res,next)=>{
  console.error(error);
  const status = Number(error.status || 500);
  res.status(status).json({
    ok:false,
    error: status >= 500 ? 'Erro interno do servidor.' : error.message,
    details: NODE_ENV === 'development' ? error.message : undefined
  });
});

async function start() {
  const client = await pool.connect();
  try { await client.query('SELECT NOW()'); }
  finally { client.release(); }
  app.listen(PORT,()=>{
    console.log(`PUTIRUSU v14: http://localhost:${PORT}`);
    console.log('Banco PostgreSQL conectado.');
    console.log(`IA: ${OPENAI_API_KEY ? 'real configurada' : 'fallback local'}`);
  });
}

start().catch(error=>{
  console.error('Falha ao iniciar:',error);
  process.exit(1);
});
