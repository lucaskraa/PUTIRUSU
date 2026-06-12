require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL ausente no .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedCourse(client, curriculum) {
  const course = curriculum.course;
  const courseResult = await client.query(`
    INSERT INTO courses (slug, name, description, language, source_language, estimated_hours, published)
    VALUES ($1,$2,$3,$4,$5,$6,TRUE)
    ON CONFLICT (slug) DO UPDATE SET
      name=EXCLUDED.name,
      description=EXCLUDED.description,
      language=EXCLUDED.language,
      source_language=EXCLUDED.source_language,
      estimated_hours=EXCLUDED.estimated_hours,
      published=TRUE
    RETURNING id
  `,[course.slug,course.name,course.description,course.language,course.sourceLanguage,course.estimatedHours]);
  const courseId = courseResult.rows[0].id;

  for (const level of curriculum.levels) {
    const levelResult = await client.query(`
      INSERT INTO course_levels (course_id,code,name,description,position)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (course_id,code) DO UPDATE SET
        name=EXCLUDED.name,
        description=EXCLUDED.description,
        position=EXCLUDED.position
      RETURNING id
    `,[courseId,level.code,level.name,level.description,level.position]);
    const levelId = levelResult.rows[0].id;

    for (const lesson of level.units) {
      const lessonResult = await client.query(`
        INSERT INTO lessons (
          level_id,external_id,title,subtitle,position,estimated_minutes,xp,is_exam,
          grammar,objectives,dialogue,examples,review_tips,published
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,TRUE)
        ON CONFLICT (external_id) DO UPDATE SET
          level_id=EXCLUDED.level_id,
          title=EXCLUDED.title,
          subtitle=EXCLUDED.subtitle,
          position=EXCLUDED.position,
          estimated_minutes=EXCLUDED.estimated_minutes,
          xp=EXCLUDED.xp,
          is_exam=EXCLUDED.is_exam,
          grammar=EXCLUDED.grammar,
          objectives=EXCLUDED.objectives,
          dialogue=EXCLUDED.dialogue,
          examples=EXCLUDED.examples,
          review_tips=EXCLUDED.review_tips,
          published=TRUE
        RETURNING id
      `,[
        levelId,lesson.id,lesson.title,lesson.subtitle,lesson.position,
        lesson.estimatedMinutes,lesson.xp,lesson.isExam,lesson.grammar,
        JSON.stringify(lesson.objectives),JSON.stringify(lesson.dialogue),
        JSON.stringify(lesson.examples),JSON.stringify(lesson.reviewTips)
      ]);
      const lessonId = lessonResult.rows[0].id;

      await client.query('DELETE FROM vocabulary WHERE lesson_id=$1',[lessonId]);
      await client.query('DELETE FROM exercises WHERE lesson_id=$1',[lessonId]);

      for (let i=0;i<lesson.vocabulary.length;i++) {
        const word=lesson.vocabulary[i];
        await client.query(`
          INSERT INTO vocabulary (
            lesson_id,russian,pronunciation,portuguese,example_russian,example_portuguese,position
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,[lessonId,word.ru,word.pronunciation,word.pt,word.exampleRu,word.examplePt,i+1]);
      }

      for (let i=0;i<lesson.exercises.length;i++) {
        const exercise=lesson.exercises[i];
        await client.query(`
          INSERT INTO exercises (
            lesson_id,type,prompt,options,answer,accepted_answers,explanation,position,points
          ) VALUES ($1,$2,$3,$4::jsonb,$5,$6::jsonb,$7,$8,$9)
        `,[
          lessonId,exercise.type,exercise.prompt,JSON.stringify(exercise.options||[]),
          exercise.answer,JSON.stringify(exercise.accepted||[]),exercise.explanation,i+1,exercise.points||10
        ]);
      }
    }
  }
}

async function seedAchievements(client) {
  const items=[
    ['FIRST_LESSON','Primeiro passo','Conclua sua primeira aula','🚀',25],
    ['TEN_LESSONS','Ritmo de estudo','Conclua dez aulas','📚',100],
    ['FIRST_AI_CHAT','Conversa inteligente','Use a IA professora','🤖',20],
    ['FIRST_SPEAKING','Primeira fala','Complete um treino de fala','🎙️',30],
    ['A1_COMPLETE','Iniciante completo','Conclua o A1','🇷🇺',250],
    ['A2_COMPLETE','Básico completo','Conclua o A2','🥈',350],
    ['B1_COMPLETE','Intermediário','Conclua o B1','🥇',500],
    ['B2_COMPLETE','Intermediário alto','Conclua o B2','🏅',700],
    ['C1_COMPLETE','Russo avançado','Conclua o C1','👑',1000],
    ['STREAK_7','Uma semana','Estude sete dias seguidos','🔥',150]
  ];
  for (const item of items) {
    await client.query(`
      INSERT INTO achievements (code,name,description,icon,xp_reward)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (code) DO UPDATE SET
        name=EXCLUDED.name,
        description=EXCLUDED.description,
        icon=EXCLUDED.icon,
        xp_reward=EXCLUDED.xp_reward
    `,item);
  }
}

async function seedDemoUser(client) {
  const hash=await bcrypt.hash('putirusu123',12);
  await client.query(`
    INSERT INTO users (name,email,password_hash,current_level,goal,avatar)
    VALUES ('Aluno Demonstração','demo@putirusu.com',$1,'A1','Aprender russo do zero ao avançado','🇷🇺')
    ON CONFLICT (email) DO UPDATE SET
      name=EXCLUDED.name,
      password_hash=EXCLUDED.password_hash,
      goal=EXCLUDED.goal
  `,[hash]);
}

async function main() {
  const curriculum=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','curriculum.json'),'utf8'));
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await seedCourse(client,curriculum);
    await seedAchievements(client);
    await seedDemoUser(client);
    await client.query('COMMIT');
    console.log('Seed concluído: 60 aulas, conquistas e usuário demo.');
    console.log('Login: demo@putirusu.com');
    console.log('Senha: putirusu123');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main().catch(error=>{
  console.error('Erro no seed:',error);
  process.exitCode=1;
}).finally(()=>pool.end());
