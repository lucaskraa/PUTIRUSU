-- PUTIRUSU v14 — banco completo
-- Execute este arquivo para criar todas as tabelas e conquistas.
-- Depois execute: npm run db:seed para inserir as 60 aulas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin')),
  current_level VARCHAR(10) NOT NULL DEFAULT 'A1',
  goal TEXT NOT NULL DEFAULT 'Aprender russo',
  avatar VARCHAR(20) NOT NULL DEFAULT '🇷🇺',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 20 CHECK (daily_goal_minutes BETWEEN 5 AND 240),
  streak INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  language VARCHAR(20) NOT NULL DEFAULT 'ru',
  source_language VARCHAR(20) NOT NULL DEFAULT 'pt-BR',
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(course_id, code),
  UNIQUE(course_id, position)
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES course_levels(id) ON DELETE CASCADE,
  external_id VARCHAR(60) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  subtitle TEXT NOT NULL,
  position INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 25,
  xp INTEGER NOT NULL DEFAULT 40,
  is_exam BOOLEAN NOT NULL DEFAULT FALSE,
  grammar TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  dialogue JSONB NOT NULL DEFAULT '[]'::jsonb,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(level_id, position)
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  russian TEXT NOT NULL,
  pronunciation TEXT NOT NULL,
  portuguese TEXT NOT NULL,
  example_russian TEXT,
  example_portuguese TEXT,
  position INTEGER NOT NULL,
  UNIQUE(lesson_id, position)
);

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL CHECK (type IN ('multiple_choice','translation','writing','speaking','listening','essay')),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  answer TEXT NOT NULL,
  accepted_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  UNIQUE(lesson_id, position)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('available','started','completed')),
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  attempts INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'exercise',
  prompt TEXT NOT NULL,
  expected_answer TEXT,
  user_answer TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interval_days INTEGER NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 0,
  last_result BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(40) NOT NULL CHECK (mode IN ('teacher','scenario','correction','review','exam')),
  title VARCHAR(180) NOT NULL,
  scenario VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'openai',
  model VARCHAR(80),
  fallback BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT '🏆',
  xp_reward INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level_id, position);
CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON vocabulary(lesson_id, position);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id, position);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON exercise_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_due ON review_items(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_ai_user ON ai_conversations(user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS trg_progress_updated ON user_lesson_progress;
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON user_lesson_progress FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS trg_review_updated ON review_items;
CREATE TRIGGER trg_review_updated BEFORE UPDATE ON review_items FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- PUTIRUSU v14 — dados fixos de conquistas
-- O curso completo (60 aulas, vocabulário e exercícios) é inserido por:
-- npm run db:seed
-- Isso evita manter IDs de relacionamento fixos e permite atualizar o currículo sem duplicar dados.

INSERT INTO achievements (code, name, description, icon, xp_reward)
VALUES
  ('FIRST_LESSON', 'Primeiro passo', 'Conclua sua primeira aula', '🚀', 25),
  ('TEN_LESSONS', 'Ritmo de estudo', 'Conclua dez aulas', '📚', 100),
  ('FIRST_AI_CHAT', 'Conversa inteligente', 'Use a IA professora', '🤖', 20),
  ('FIRST_SPEAKING', 'Primeira fala', 'Complete um treino de fala', '🎙️', 30),
  ('A1_COMPLETE', 'Iniciante completo', 'Conclua o A1', '🇷🇺', 250),
  ('A2_COMPLETE', 'Básico completo', 'Conclua o A2', '🥈', 350),
  ('B1_COMPLETE', 'Intermediário', 'Conclua o B1', '🥇', 500),
  ('B2_COMPLETE', 'Intermediário alto', 'Conclua o B2', '🏅', 700),
  ('C1_COMPLETE', 'Russo avançado', 'Conclua o C1', '👑', 1000),
  ('STREAK_7', 'Uma semana', 'Estude sete dias seguidos', '🔥', 150)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  xp_reward = EXCLUDED.xp_reward;
