-- ============================================================
-- PUTIRUSU
-- Banco de dados PostgreSQL
-- Versão 17
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

BEGIN;

-- ============================================================
-- FUNÇÕES AUXILIARES
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_text(value TEXT)
RETURNS TEXT AS $$
BEGIN
RETURN LOWER(TRIM(COALESCE(value, '')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- USUÁRIOS E AUTENTICAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(120) NOT NULL,
email CITEXT NOT NULL UNIQUE,
password_hash TEXT NOT NULL,
avatar_url TEXT,
role VARCHAR(30) NOT NULL DEFAULT 'student'
CHECK (role IN ('student', 'teacher', 'admin')),
account_status VARCHAR(30) NOT NULL DEFAULT 'active'
CHECK (account_status IN ('active', 'blocked', 'deleted')),
email_verified BOOLEAN NOT NULL DEFAULT FALSE,
onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
last_login_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
token_hash TEXT NOT NULL UNIQUE,
device_name VARCHAR(150),
ip_address INET,
expires_at TIMESTAMPTZ NOT NULL,
revoked_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user
ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires
ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
token_hash TEXT NOT NULL UNIQUE,
expires_at TIMESTAMPTZ NOT NULL,
used_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PERFIL E ONBOARDING
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
reason_to_learn VARCHAR(100),
current_level VARCHAR(10) NOT NULL DEFAULT 'A1',
daily_goal_minutes INTEGER NOT NULL DEFAULT 15
CHECK (daily_goal_minutes BETWEEN 5 AND 240),
preferred_study_time TIME,
native_language VARCHAR(50) NOT NULL DEFAULT 'Português',
knows_cyrillic BOOLEAN NOT NULL DEFAULT FALSE,
primary_focus VARCHAR(50) NOT NULL DEFAULT 'general',
interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
timezone VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo',
biography TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
music_enabled BOOLEAN NOT NULL DEFAULT TRUE,
microphone_enabled BOOLEAN NOT NULL DEFAULT TRUE,
notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
daily_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
left_handed_mode BOOLEAN NOT NULL DEFAULT FALSE,
transliteration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
auto_play_audio BOOLEAN NOT NULL DEFAULT FALSE,
interface_language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
speech_rate NUMERIC(3,2) NOT NULL DEFAULT 0.90,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
total_xp INTEGER NOT NULL DEFAULT 0,
current_streak INTEGER NOT NULL DEFAULT 0,
longest_streak INTEGER NOT NULL DEFAULT 0,
activities_completed INTEGER NOT NULL DEFAULT 0,
units_completed INTEGER NOT NULL DEFAULT 0,
lessons_completed INTEGER NOT NULL DEFAULT 0,
exams_completed INTEGER NOT NULL DEFAULT 0,
games_played INTEGER NOT NULL DEFAULT 0,
words_learned INTEGER NOT NULL DEFAULT 0,
letters_learned INTEGER NOT NULL DEFAULT 0,
minutes_studied INTEGER NOT NULL DEFAULT 0,
last_study_date DATE,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CURSO
-- ============================================================

CREATE TABLE IF NOT EXISTS course_levels (
id SERIAL PRIMARY KEY,
code VARCHAR(10) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
description TEXT,
display_order INTEGER NOT NULL UNIQUE,
required_xp INTEGER NOT NULL DEFAULT 0,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_units (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
level_id INTEGER NOT NULL REFERENCES course_levels(id),
title VARCHAR(180) NOT NULL,
subtitle VARCHAR(240),
description TEXT,
icon VARCHAR(80),
display_order INTEGER NOT NULL,
required_previous_unit_id UUID REFERENCES course_units(id),
minimum_activities_to_complete INTEGER NOT NULL DEFAULT 8,
xp_reward INTEGER NOT NULL DEFAULT 100,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(level_id, display_order)
);

CREATE TABLE IF NOT EXISTS course_lessons (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
title VARCHAR(180) NOT NULL,
description TEXT,
lesson_type VARCHAR(40) NOT NULL DEFAULT 'mixed'
CHECK (
lesson_type IN (
'mixed',
'vocabulary',
'grammar',
'listening',
'speaking',
'reading',
'writing',
'cursive',
'culture'
)
),
display_order INTEGER NOT NULL,
xp_reward INTEGER NOT NULL DEFAULT 30,
estimated_minutes INTEGER NOT NULL DEFAULT 10,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(unit_id, display_order)
);

CREATE TABLE IF NOT EXISTS activities (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
activity_type VARCHAR(50) NOT NULL
CHECK (
activity_type IN (
'listen_select',
'listen_write',
'speak',
'write',
'translate_pt_ru',
'translate_ru_pt',
'multiple_choice',
'complete_sentence',
'order_words',
'order_dialogue',
'match',
'cursive_recognition',
'cursive_writing',
'reading',
'free_response'
)
),
instruction TEXT NOT NULL,
question TEXT,
russian_text TEXT,
portuguese_text TEXT,
transliteration TEXT,
expected_answer TEXT,
accepted_answers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
audio_text TEXT,
audio_url TEXT,
image_url TEXT,
explanation TEXT,
difficulty INTEGER NOT NULL DEFAULT 1
CHECK (difficulty BETWEEN 1 AND 10),
xp_reward INTEGER NOT NULL DEFAULT 10,
display_order INTEGER NOT NULL,
metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(lesson_id, display_order)
);

CREATE TABLE IF NOT EXISTS activity_options (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
option_text TEXT NOT NULL,
option_audio_text TEXT,
option_image_url TEXT,
is_correct BOOLEAN NOT NULL DEFAULT FALSE,
display_order INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_course_units_level
ON course_units(level_id, display_order);

CREATE INDEX IF NOT EXISTS idx_lessons_unit
ON course_lessons(unit_id, display_order);

CREATE INDEX IF NOT EXISTS idx_activities_lesson
ON activities(lesson_id, display_order);

CREATE INDEX IF NOT EXISTS idx_activity_options_activity
ON activity_options(activity_id);

-- ============================================================
-- PROGRESSO
-- ============================================================

CREATE TABLE IF NOT EXISTS user_unit_progress (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
status VARCHAR(30) NOT NULL DEFAULT 'locked'
CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
activities_completed INTEGER NOT NULL DEFAULT 0,
lessons_completed INTEGER NOT NULL DEFAULT 0,
progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
total_xp_earned INTEGER NOT NULL DEFAULT 0,
started_at TIMESTAMPTZ,
completed_at TIMESTAMPTZ,
last_accessed_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, unit_id)
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
status VARCHAR(30) NOT NULL DEFAULT 'locked'
CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
activities_completed INTEGER NOT NULL DEFAULT 0,
progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
total_xp_earned INTEGER NOT NULL DEFAULT 0,
started_at TIMESTAMPTZ,
completed_at TIMESTAMPTZ,
last_accessed_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_activity_progress (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
status VARCHAR(30) NOT NULL DEFAULT 'available'
CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
attempts INTEGER NOT NULL DEFAULT 0,
best_score NUMERIC(5,2) NOT NULL DEFAULT 0,
last_score NUMERIC(5,2) NOT NULL DEFAULT 0,
completed BOOLEAN NOT NULL DEFAULT FALSE,
xp_earned INTEGER NOT NULL DEFAULT 0,
first_attempt_at TIMESTAMPTZ,
completed_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS activity_attempts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
submitted_answer TEXT,
submitted_audio_url TEXT,
submitted_drawing JSONB,
is_correct BOOLEAN NOT NULL DEFAULT FALSE,
score NUMERIC(5,2) NOT NULL DEFAULT 0,
pronunciation_score NUMERIC(5,2),
feedback TEXT,
time_spent_seconds INTEGER NOT NULL DEFAULT 0,
xp_earned INTEGER NOT NULL DEFAULT 0,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_unit_progress_user
ON user_unit_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user
ON user_lesson_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_progress_user
ON user_activity_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_attempts_user
ON activity_attempts(user_id, created_at DESC);

-- ============================================================
-- ALFABETO CIRÍLICO E CURSIVA
-- ============================================================

CREATE TABLE IF NOT EXISTS alphabet_letters (
id SERIAL PRIMARY KEY,
display_order INTEGER NOT NULL UNIQUE,
uppercase_print VARCHAR(4) NOT NULL,
lowercase_print VARCHAR(4) NOT NULL,
uppercase_cursive VARCHAR(10),
lowercase_cursive VARCHAR(10),
letter_name VARCHAR(80),
transliteration VARCHAR(50),
sound_description TEXT,
pronunciation_hint TEXT,
example_russian VARCHAR(120),
example_portuguese VARCHAR(180),
example_transliteration VARCHAR(180),
audio_text VARCHAR(120),
stroke_data JSONB NOT NULL DEFAULT '{}'::JSONB,
difficulty INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cursive_examples (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title VARCHAR(180) NOT NULL,
russian_text TEXT NOT NULL,
portuguese_text TEXT,
transliteration TEXT,
cursive_style VARCHAR(50) NOT NULL DEFAULT 'school',
difficulty INTEGER NOT NULL DEFAULT 1,
category VARCHAR(80),
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS writing_attempts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
letter_id INTEGER REFERENCES alphabet_letters(id) ON DELETE SET NULL,
activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
reference_text TEXT,
written_text TEXT,
drawing_data JSONB,
score NUMERIC(5,2) NOT NULL DEFAULT 0,
feedback TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pronunciation_attempts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
expected_text TEXT NOT NULL,
recognized_text TEXT,
audio_url TEXT,
pronunciation_score NUMERIC(5,2) NOT NULL DEFAULT 0,
accuracy_score NUMERIC(5,2) NOT NULL DEFAULT 0,
fluency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
feedback TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROVAS
-- ============================================================

CREATE TABLE IF NOT EXISTS exams (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
level_id INTEGER REFERENCES course_levels(id),
unit_id UUID REFERENCES course_units(id),
title VARCHAR(180) NOT NULL,
description TEXT,
minimum_activities_required INTEGER NOT NULL DEFAULT 20,
passing_score NUMERIC(5,2) NOT NULL DEFAULT 70,
time_limit_minutes INTEGER NOT NULL DEFAULT 30,
xp_reward INTEGER NOT NULL DEFAULT 250,
maximum_attempts INTEGER,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_questions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
question_type VARCHAR(50) NOT NULL,
instruction TEXT NOT NULL,
question TEXT,
russian_text TEXT,
portuguese_text TEXT,
transliteration TEXT,
expected_answer TEXT,
accepted_answers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
audio_text TEXT,
explanation TEXT,
points NUMERIC(6,2) NOT NULL DEFAULT 10,
display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_question_options (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
option_text TEXT NOT NULL,
is_correct BOOLEAN NOT NULL DEFAULT FALSE,
display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_exam_attempts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
attempt_number INTEGER NOT NULL DEFAULT 1,
score NUMERIC(5,2) NOT NULL DEFAULT 0,
passed BOOLEAN NOT NULL DEFAULT FALSE,
started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
completed_at TIMESTAMPTZ,
time_spent_seconds INTEGER NOT NULL DEFAULT 0,
xp_earned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_exam_answers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
attempt_id UUID NOT NULL REFERENCES user_exam_attempts(id) ON DELETE CASCADE,
question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
submitted_answer TEXT,
submitted_audio_url TEXT,
is_correct BOOLEAN NOT NULL DEFAULT FALSE,
score NUMERIC(6,2) NOT NULL DEFAULT 0,
feedback TEXT
);

-- ============================================================
-- DICIONÁRIO
-- ============================================================

CREATE TABLE IF NOT EXISTS dictionary_categories (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
slug VARCHAR(100) NOT NULL UNIQUE,
icon VARCHAR(80),
display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dictionary_entries (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
category_id INTEGER REFERENCES dictionary_categories(id),
russian_word TEXT NOT NULL,
portuguese_translation TEXT NOT NULL,
transliteration TEXT,
part_of_speech VARCHAR(60),
grammatical_gender VARCHAR(30),
plural_form TEXT,
formal_level VARCHAR(30) DEFAULT 'neutral',
pronunciation_hint TEXT,
audio_text TEXT,
definition TEXT,
difficulty VARCHAR(10) NOT NULL DEFAULT 'A1',
tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
search_text TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dictionary_examples (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
entry_id UUID NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
russian_sentence TEXT NOT NULL,
portuguese_sentence TEXT NOT NULL,
transliteration TEXT,
explanation TEXT,
audio_text TEXT
);

CREATE TABLE IF NOT EXISTS dictionary_favorites (
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
entry_id UUID NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(user_id, entry_id)
);

CREATE TABLE IF NOT EXISTS dictionary_history (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
entry_id UUID REFERENCES dictionary_entries(id) ON DELETE SET NULL,
searched_term TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dictionary_search
ON dictionary_entries USING GIN (
to_tsvector(
'simple',
COALESCE(russian_word, '') || ' ' ||
COALESCE(portuguese_translation, '') || ' ' ||
COALESCE(transliteration, '')
)
);

-- ============================================================
-- CULTURA
-- ============================================================

CREATE TABLE IF NOT EXISTS culture_categories (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
slug VARCHAR(100) NOT NULL UNIQUE,
icon VARCHAR(80),
description TEXT,
display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS culture_articles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
category_id INTEGER NOT NULL REFERENCES culture_categories(id),
title VARCHAR(220) NOT NULL,
subtitle VARCHAR(300),
summary TEXT,
full_content TEXT NOT NULL,
author_name VARCHAR(180),
historical_period VARCHAR(120),
image_url TEXT,
source_note TEXT,
russian_terms JSONB NOT NULL DEFAULT '[]'::JSONB,
related_people JSONB NOT NULL DEFAULT '[]'::JSONB,
related_works JSONB NOT NULL DEFAULT '[]'::JSONB,
difficulty VARCHAR(10) NOT NULL DEFAULT 'A1',
reading_minutes INTEGER NOT NULL DEFAULT 5,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÚSICAS
-- ============================================================

CREATE TABLE IF NOT EXISTS music_artists (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(180) NOT NULL UNIQUE,
russian_name VARCHAR(180),
description TEXT,
image_url TEXT,
genres TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
country VARCHAR(80) NOT NULL DEFAULT 'Rússia'
);

CREATE TABLE IF NOT EXISTS music_tracks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
artist_id UUID NOT NULL REFERENCES music_artists(id) ON DELETE CASCADE,
title VARCHAR(220) NOT NULL,
russian_title VARCHAR(220),
description TEXT,
difficulty VARCHAR(10) NOT NULL DEFAULT 'A2',
vocabulary JSONB NOT NULL DEFAULT '[]'::JSONB,
study_notes TEXT,
external_url TEXT,
cover_url TEXT,
is_recommended BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_music_history (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
track_id UUID NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
completed BOOLEAN NOT NULL DEFAULT FALSE,
rating INTEGER CHECK (rating BETWEEN 1 AND 5),
listened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- JOGOS
-- ============================================================

CREATE TABLE IF NOT EXISTS games (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
slug VARCHAR(100) NOT NULL UNIQUE,
title VARCHAR(160) NOT NULL,
description TEXT,
game_type VARCHAR(60) NOT NULL,
icon VARCHAR(80),
minimum_level VARCHAR(10) NOT NULL DEFAULT 'A1',
xp_reward INTEGER NOT NULL DEFAULT 15,
time_limit_seconds INTEGER,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
settings JSONB NOT NULL DEFAULT '{}'::JSONB,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
score INTEGER NOT NULL DEFAULT 0,
correct_answers INTEGER NOT NULL DEFAULT 0,
wrong_answers INTEGER NOT NULL DEFAULT 0,
duration_seconds INTEGER NOT NULL DEFAULT 0,
xp_earned INTEGER NOT NULL DEFAULT 0,
details JSONB NOT NULL DEFAULT '{}'::JSONB,
played_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_records (
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
best_score INTEGER NOT NULL DEFAULT 0,
total_plays INTEGER NOT NULL DEFAULT 0,
total_xp INTEGER NOT NULL DEFAULT 0,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(user_id, game_id)
);

-- ============================================================
-- PROFESSOR IA
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
title VARCHAR(180) NOT NULL DEFAULT 'Nova conversa',
conversation_mode VARCHAR(40) NOT NULL DEFAULT 'general'
CHECK (
conversation_mode IN (
'general',
'translate',
'correct',
'explain',
'exercise',
'dialogue',
'pronunciation'
)
),
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
conversation_id UUID NOT NULL
REFERENCES ai_conversations(id) ON DELETE CASCADE,
sender VARCHAR(20) NOT NULL
CHECK (sender IN ('user', 'assistant', 'system')),
content TEXT NOT NULL,
correction_data JSONB,
tokens_used INTEGER NOT NULL DEFAULT 0,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
ON ai_messages(conversation_id, created_at);

-- ============================================================
-- MISSÕES DIÁRIAS
-- ============================================================

CREATE TABLE IF NOT EXISTS mission_templates (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
mission_type VARCHAR(50) NOT NULL,
title VARCHAR(180) NOT NULL,
description TEXT NOT NULL,
target_amount INTEGER NOT NULL DEFAULT 1,
xp_reward INTEGER NOT NULL DEFAULT 25,
minimum_level VARCHAR(10) NOT NULL DEFAULT 'A1',
settings JSONB NOT NULL DEFAULT '{}'::JSONB,
is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_daily_missions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
mission_template_id UUID REFERENCES mission_templates(id),
mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
title VARCHAR(180) NOT NULL,
description TEXT NOT NULL,
target_amount INTEGER NOT NULL DEFAULT 1,
current_amount INTEGER NOT NULL DEFAULT 0,
completed BOOLEAN NOT NULL DEFAULT FALSE,
xp_reward INTEGER NOT NULL DEFAULT 25,
completed_at TIMESTAMPTZ,
UNIQUE(user_id, mission_date, title)
);

-- ============================================================
-- CONQUISTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
slug VARCHAR(100) NOT NULL UNIQUE,
title VARCHAR(160) NOT NULL,
description TEXT NOT NULL,
icon VARCHAR(80),
requirement_type VARCHAR(60) NOT NULL,
requirement_value INTEGER NOT NULL DEFAULT 1,
xp_reward INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_achievements (
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(user_id, achievement_id)
);

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
title VARCHAR(180) NOT NULL,
message TEXT NOT NULL,
notification_type VARCHAR(50) NOT NULL DEFAULT 'general',
action_url TEXT,
read_at TIMESTAMPTZ,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id, created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_units_updated_at ON course_units;
CREATE TRIGGER trg_course_units_updated_at
BEFORE UPDATE ON course_units
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER trg_course_lessons_updated_at
BEFORE UPDATE ON course_lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dictionary_entries_updated_at ON dictionary_entries;
CREATE TRIGGER trg_dictionary_entries_updated_at
BEFORE UPDATE ON dictionary_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_culture_articles_updated_at ON culture_articles;
CREATE TRIGGER trg_culture_articles_updated_at
BEFORE UPDATE ON culture_articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- NÍVEIS
-- ============================================================

INSERT INTO course_levels (
code,
name,
description,
display_order,
required_xp
)
VALUES
('A1', 'Iniciante', 'Primeiros passos no idioma russo.', 1, 0),
('A2', 'Básico', 'Situações simples do cotidiano.', 2, 1200),
('B1', 'Intermediário', 'Conversas e textos mais completos.', 3, 3500),
('B2', 'Intermediário avançado', 'Comunicação independente.', 4, 7000),
('C1', 'Avançado', 'Uso complexo e natural do idioma.', 5, 12000),
('C2', 'Fluente', 'Domínio amplo da língua russa.', 6, 20000)
ON CONFLICT (code) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
display_order = EXCLUDED.display_order,
required_xp = EXCLUDED.required_xp;

-- ============================================================
-- UNIDADES INICIAIS
-- ============================================================

INSERT INTO course_units (
level_id,
title,
subtitle,
description,
icon,
display_order,
minimum_activities_to_complete,
xp_reward
)
SELECT
id,
'Alfabeto cirílico',
'Conheça as 33 letras russas',
'Aprenda o formato, o som, a transliteração e a escrita das letras.',
'alphabet',
1,
12,
150
FROM course_levels
WHERE code = 'A1'
ON CONFLICT (level_id, display_order) DO NOTHING;

INSERT INTO course_units (
level_id,
title,
subtitle,
description,
icon,
display_order,
minimum_activities_to_complete,
xp_reward
)
SELECT
id,
'Apresentações',
'Cumprimentos e informações pessoais',
'Aprenda a cumprimentar, dizer seu nome e conhecer outras pessoas.',
'handshake',
2,
12,
180
FROM course_levels
WHERE code = 'A1'
ON CONFLICT (level_id, display_order) DO NOTHING;

INSERT INTO course_units (
level_id,
title,
subtitle,
description,
icon,
display_order,
minimum_activities_to_complete,
xp_reward
)
SELECT
id,
'Família e amigos',
'Pessoas próximas',
'Vocabulário para falar sobre parentes, amigos e relações pessoais.',
'users',
3,
14,
200
FROM course_levels
WHERE code = 'A1'
ON CONFLICT (level_id, display_order) DO NOTHING;

INSERT INTO course_units (
level_id,
title,
subtitle,
description,
icon,
display_order,
minimum_activities_to_complete,
xp_reward
)
SELECT
id,
'Comida e restaurante',
'Pedir, escolher e agradecer',
'Aprenda nomes de alimentos e frases para usar em restaurantes.',
'utensils',
4,
15,
220
FROM course_levels
WHERE code = 'A1'
ON CONFLICT (level_id, display_order) DO NOTHING;

-- ============================================================
-- ALFABETO CIRÍLICO
-- ============================================================

INSERT INTO alphabet_letters (
display_order,
uppercase_print,
lowercase_print,
uppercase_cursive,
lowercase_cursive,
letter_name,
transliteration,
sound_description,
pronunciation_hint,
example_russian,
example_portuguese,
example_transliteration,
audio_text,
difficulty
)
VALUES
(1,  'А', 'а', 'А', 'а', 'а', 'a', 'Som de A', 'Como o a de casa', 'арбуз', 'melancia', 'arbuz', 'а, арбуз', 1),
(2,  'Б', 'б', 'Б', 'б', 'бэ', 'b', 'Som de B', 'Como o b de bola', 'брат', 'irmão', 'brat', 'бэ, брат', 1),
(3,  'В', 'в', 'В', 'в', 'вэ', 'v', 'Som de V', 'Como o v de vida', 'вода', 'água', 'voda', 'вэ, вода', 1),
(4,  'Г', 'г', 'Г', 'г', 'гэ', 'g', 'Som de G', 'Como o g de gato', 'город', 'cidade', 'gorod', 'гэ, город', 1),
(5,  'Д', 'д', 'Д', 'д', 'дэ', 'd', 'Som de D', 'Como o d de dado', 'дом', 'casa', 'dom', 'дэ, дом', 2),
(6,  'Е', 'е', 'Е', 'е', 'е', 'ye/e', 'Som de IÊ ou E', 'Pode soar como iê', 'еда', 'comida', 'yeda', 'е, еда', 2),
(7,  'Ё', 'ё', 'Ё', 'ё', 'ё', 'yo', 'Som de IÔ', 'Como iô', 'ёлка', 'árvore de Natal', 'yolka', 'ё, ёлка', 2),
(8,  'Ж', 'ж', 'Ж', 'ж', 'жэ', 'zh', 'Som semelhante ao J', 'Como o j de janela', 'жизнь', 'vida', 'zhizn', 'жэ, жизнь', 3),
(9,  'З', 'з', 'З', 'з', 'зэ', 'z', 'Som de Z', 'Como o z de zebra', 'зима', 'inverno', 'zima', 'зэ, зима', 2),
(10, 'И', 'и', 'И', 'и', 'и', 'i', 'Som de I', 'Como o i de vida', 'игра', 'jogo', 'igra', 'и, игра', 1),
(11, 'Й', 'й', 'Й', 'й', 'и краткое', 'y/j', 'Som curto de I', 'Semelhante ao i em pai', 'йога', 'ioga', 'yoga', 'и краткое, йога', 2),
(12, 'К', 'к', 'К', 'к', 'ка', 'k', 'Som de K', 'Como c em casa', 'кот', 'gato', 'kot', 'ка, кот', 1),
(13, 'Л', 'л', 'Л', 'л', 'эль', 'l', 'Som de L', 'Como o l de lua', 'луна', 'lua', 'luna', 'эль, луна', 2),
(14, 'М', 'м', 'М', 'м', 'эм', 'm', 'Som de M', 'Como o m de mãe', 'мама', 'mãe', 'mama', 'эм, мама', 1),
(15, 'Н', 'н', 'Н', 'н', 'эн', 'n', 'Som de N', 'Apesar do formato, tem som de N', 'нос', 'nariz', 'nos', 'эн, нос', 1),
(16, 'О', 'о', 'О', 'о', 'о', 'o', 'Som de O', 'Pode ficar parecido com A sem acento', 'окно', 'janela', 'okno', 'о, окно', 2),
(17, 'П', 'п', 'П', 'п', 'пэ', 'p', 'Som de P', 'Como o p de pai', 'папа', 'pai', 'papa', 'пэ, папа', 1),
(18, 'Р', 'р', 'Р', 'р', 'эр', 'r', 'Som vibrante de R', 'Apesar do formato, tem som de R', 'рука', 'mão', 'ruka', 'эр, рука', 2),
(19, 'С', 'с', 'С', 'с', 'эс', 's', 'Som de S', 'Apesar do formato, tem som de S', 'сок', 'suco', 'sok', 'эс, сок', 1),
(20, 'Т', 'т', 'Т', 'т', 'тэ', 't', 'Som de T', 'Como o t de teto', 'торт', 'bolo', 'tort', 'тэ, торт', 1),
(21, 'У', 'у', 'У', 'у', 'у', 'u', 'Som de U', 'Como o u de tudo', 'утро', 'manhã', 'utro', 'у, утро', 1),
(22, 'Ф', 'ф', 'Ф', 'ф', 'эф', 'f', 'Som de F', 'Como o f de faca', 'фото', 'foto', 'foto', 'эф, фото', 2),
(23, 'Х', 'х', 'Х', 'х', 'ха', 'kh', 'Som aspirado', 'Parecido com o j espanhol', 'хлеб', 'pão', 'khleb', 'ха, хлеб', 3),
(24, 'Ц', 'ц', 'Ц', 'ц', 'цэ', 'ts', 'Som de TS', 'Como em tsunami', 'цвет', 'cor', 'tsvet', 'цэ, цвет', 3),
(25, 'Ч', 'ч', 'Ч', 'ч', 'чэ', 'ch', 'Som de TCH', 'Como em tchau', 'чай', 'chá', 'chai', 'чэ, чай', 2),
(26, 'Ш', 'ш', 'Ш', 'ш', 'ша', 'sh', 'Som de SH', 'Como em show', 'школа', 'escola', 'shkola', 'ша, школа', 3),
(27, 'Щ', 'щ', 'Щ', 'щ', 'ща', 'shch', 'Som prolongado e suave', 'Parecido com shch', 'щука', 'lúcio', 'shchuka', 'ща, щука', 4),
(28, 'Ъ', 'ъ', 'Ъ', 'ъ', 'твёрдый знак', '', 'Sinal duro', 'Não possui som próprio', 'объект', 'objeto', 'obyekt', 'твёрдый знак', 4),
(29, 'Ы', 'ы', 'Ы', 'ы', 'ы', 'y', 'Vogal profunda', 'Som sem equivalente direto em português', 'сыр', 'queijo', 'syr', 'ы, сыр', 4),
(30, 'Ь', 'ь', 'Ь', 'ь', 'мягкий знак', '', 'Sinal brando', 'Suaviza a consoante anterior', 'день', 'dia', 'den', 'мягкий знак', 4),
(31, 'Э', 'э', 'Э', 'э', 'э', 'e', 'Som aberto de E', 'Como o é de café', 'это', 'isto', 'eto', 'э, это', 2),
(32, 'Ю', 'ю', 'Ю', 'ю', 'ю', 'yu', 'Som de IU', 'Como iu', 'юг', 'sul', 'yug', 'ю, юг', 2),
(33, 'Я', 'я', 'Я', 'я', 'я', 'ya', 'Som de IA', 'Como ia', 'яблоко', 'maçã', 'yabloko', 'я, яблоко', 2)
ON CONFLICT (display_order) DO UPDATE SET
uppercase_print = EXCLUDED.uppercase_print,
lowercase_print = EXCLUDED.lowercase_print,
uppercase_cursive = EXCLUDED.uppercase_cursive,
lowercase_cursive = EXCLUDED.lowercase_cursive,
letter_name = EXCLUDED.letter_name,
transliteration = EXCLUDED.transliteration,
sound_description = EXCLUDED.sound_description,
pronunciation_hint = EXCLUDED.pronunciation_hint,
example_russian = EXCLUDED.example_russian,
example_portuguese = EXCLUDED.example_portuguese,
example_transliteration = EXCLUDED.example_transliteration,
audio_text = EXCLUDED.audio_text,
difficulty = EXCLUDED.difficulty;

-- ============================================================
-- CATEGORIAS DO DICIONÁRIO
-- ============================================================

INSERT INTO dictionary_categories (
name,
slug,
icon,
display_order
)
VALUES
('Cumprimentos', 'cumprimentos', 'hand', 1),
('Pessoas', 'pessoas', 'users', 2),
('Casa', 'casa', 'home', 3),
('Comida', 'comida', 'utensils', 4),
('Viagem', 'viagem', 'plane', 5),
('Escola', 'escola', 'book', 6),
('Conversação', 'conversacao', 'message-circle', 7),
('Emergência', 'emergencia', 'alert-triangle', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO dictionary_entries (
category_id,
russian_word,
portuguese_translation,
transliteration,
part_of_speech,
formal_level,
pronunciation_hint,
audio_text,
definition,
difficulty,
tags,
search_text
)
SELECT
id,
'Привет',
'Oi',
'Privet',
'interjeição',
'informal',
'Pri-viet',
'Привет',
'Cumprimento informal usado entre amigos e pessoas próximas.',
'A1',
ARRAY['saudação', 'conversa', 'informal'],
'привет oi privet cumprimento saudação'
FROM dictionary_categories
WHERE slug = 'cumprimentos'
AND NOT EXISTS (
SELECT 1
FROM dictionary_entries
WHERE russian_word = 'Привет'
);

INSERT INTO dictionary_entries (
category_id,
russian_word,
portuguese_translation,
transliteration,
part_of_speech,
formal_level,
pronunciation_hint,
audio_text,
definition,
difficulty,
tags,
search_text
)
SELECT
id,
'Здравствуйте',
'Olá',
'Zdravstvuyte',
'interjeição',
'formal',
'Zdrás-tvui-ti',
'Здравствуйте',
'Cumprimento educado e formal.',
'A1',
ARRAY['saudação', 'formal'],
'здравствуйте olá zdravstvuyte formal'
FROM dictionary_categories
WHERE slug = 'cumprimentos'
AND NOT EXISTS (
SELECT 1
FROM dictionary_entries
WHERE russian_word = 'Здравствуйте'
);

INSERT INTO dictionary_entries (
category_id,
russian_word,
portuguese_translation,
transliteration,
part_of_speech,
formal_level,
pronunciation_hint,
audio_text,
definition,
difficulty,
tags,
search_text
)
SELECT
id,
'Спасибо',
'Obrigado',
'Spasibo',
'interjeição',
'neutral',
'Spa-sí-ba',
'Спасибо',
'Palavra usada para agradecer.',
'A1',
ARRAY['agradecimento', 'conversa'],
'спасибо obrigado spasibo agradecimento'
FROM dictionary_categories
WHERE slug = 'conversacao'
AND NOT EXISTS (
SELECT 1
FROM dictionary_entries
WHERE russian_word = 'Спасибо'
);

INSERT INTO dictionary_entries (
category_id,
russian_word,
portuguese_translation,
transliteration,
part_of_speech,
formal_level,
pronunciation_hint,
audio_text,
definition,
difficulty,
tags,
search_text
)
SELECT
id,
'Пожалуйста',
'Por favor / de nada',
'Pozhaluysta',
'interjeição',
'neutral',
'Pa-já-lus-ta',
'Пожалуйста',
'Pode significar por favor ou de nada, dependendo da situação.',
'A1',
ARRAY['educação', 'conversa'],
'пожалуйста por favor de nada pozhaluysta'
FROM dictionary_categories
WHERE slug = 'conversacao'
AND NOT EXISTS (
SELECT 1
FROM dictionary_entries
WHERE russian_word = 'Пожалуйста'
);

INSERT INTO dictionary_entries (
category_id,
russian_word,
portuguese_translation,
transliteration,
part_of_speech,
grammatical_gender,
formal_level,
pronunciation_hint,
audio_text,
definition,
difficulty,
tags,
search_text
)
SELECT
id,
'Дом',
'Casa',
'Dom',
'substantivo',
'masculino',
'neutral',
'Dom',
'Дом',
'Lugar onde uma pessoa mora.',
'A1',
ARRAY['casa', 'moradia'],
'дом casa dom moradia'
FROM dictionary_categories
WHERE slug = 'casa'
AND NOT EXISTS (
SELECT 1
FROM dictionary_entries
WHERE russian_word = 'Дом'
);

-- ============================================================
-- EXEMPLOS DO DICIONÁRIO
-- ============================================================

INSERT INTO dictionary_examples (
entry_id,
russian_sentence,
portuguese_sentence,
transliteration,
explanation,
audio_text
)
SELECT
id,
'Привет! Как дела?',
'Oi! Como você está?',
'Privet! Kak dela?',
'Frase informal para iniciar uma conversa.',
'Привет! Как дела?'
FROM dictionary_entries
WHERE russian_word = 'Привет'
AND NOT EXISTS (
SELECT 1
FROM dictionary_examples
WHERE russian_sentence = 'Привет! Как дела?'
);

INSERT INTO dictionary_examples (
entry_id,
russian_sentence,
portuguese_sentence,
transliteration,
explanation,
audio_text
)
SELECT
id,
'Спасибо за помощь.',
'Obrigado pela ajuda.',
'Spasibo za pomoshch.',
'A preposição за é usada aqui no sentido de agradecer por algo.',
'Спасибо за помощь.'
FROM dictionary_entries
WHERE russian_word = 'Спасибо'
AND NOT EXISTS (
SELECT 1
FROM dictionary_examples
WHERE russian_sentence = 'Спасибо за помощь.'
);

-- ============================================================
-- CULTURA
-- ============================================================

INSERT INTO culture_categories (
name,
slug,
icon,
description,
display_order
)
VALUES
(
'Folclore',
'folclore',
'sparkles',
'Criaturas, lendas e tradições do folclore russo.',
1
),
(
'Contos',
'contos',
'book-open',
'Contos populares e histórias tradicionais russas.',
2
),
(
'Filosofia',
'filosofia',
'brain',
'Filósofos russos, ideias e obras.',
3
),
(
'Literatura',
'literatura',
'library',
'Escritores, romances, poemas e movimentos literários.',
4
),
(
'História',
'historia',
'landmark',
'Momentos e períodos da história russa.',
5
),
(
'Costumes',
'costumes',
'coffee',
'Hábitos, celebrações e aspectos da vida cotidiana.',
6
),
(
'Música',
'musica',
'music',
'Artistas, estilos e história da música russa.',
7
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO culture_articles (
category_id,
title,
subtitle,
summary,
full_content,
historical_period,
difficulty,
reading_minutes,
russian_terms
)
SELECT
id,
'Baba Yaga',
'A figura mais famosa do folclore eslavo',
'Conheça a misteriosa personagem que vive em uma cabana com pernas de galinha.',
'Baba Yaga é uma das figuras mais conhecidas do folclore eslavo. Ela costuma ser descrita como uma mulher idosa que vive em uma floresta, dentro de uma cabana apoiada em pernas de galinha. Em diferentes histórias, Baba Yaga pode ser perigosa, assustadora, sábia ou até mesmo ajudar o protagonista. Essa ambiguidade é uma das características mais interessantes da personagem. Ela não representa apenas o mal, mas também desafios, transformação e passagem para uma nova fase da vida.',
'Folclore tradicional',
'A2',
6,
'[{"russian":"Баба-яга","portuguese":"Baba Yaga"},{"russian":"лес","portuguese":"floresta"},{"russian":"избушка","portuguese":"cabana"}]'::JSONB
FROM culture_categories
WHERE slug = 'folclore'
AND NOT EXISTS (
SELECT 1
FROM culture_articles
WHERE title = 'Baba Yaga'
);

INSERT INTO culture_articles (
category_id,
title,
subtitle,
summary,
full_content,
author_name,
historical_period,
difficulty,
reading_minutes,
related_works
)
SELECT
id,
'Fiódor Dostoiévski',
'Liberdade, culpa e responsabilidade',
'Uma introdução às ideias presentes nas obras de Dostoiévski.',
'Fiódor Dostoiévski foi um escritor russo cujas obras exploram questões filosóficas e psicológicas. Seus personagens enfrentam conflitos envolvendo liberdade, culpa, fé, sofrimento, moralidade e responsabilidade. Em Crime e Castigo, por exemplo, o protagonista tenta justificar racionalmente um crime, mas passa a enfrentar as consequências psicológicas e morais de sua decisão. Em Os Irmãos Karamázov, Dostoiévski discute fé, dúvida, liberdade e a existência do mal.',
'Fiódor Dostoiévski',
'Século XIX',
'B1',
8,
'["Crime e Castigo","Os Irmãos Karamázov","O Idiota","Memórias do Subsolo"]'::JSONB
FROM culture_categories
WHERE slug = 'filosofia'
AND NOT EXISTS (
SELECT 1
FROM culture_articles
WHERE title = 'Fiódor Dostoiévski'
);

-- ============================================================
-- MÚSICAS RECOMENDADAS
-- ============================================================

INSERT INTO music_artists (
name,
russian_name,
description,
genres
)
VALUES
(
'DDT',
'ДДТ',
'Banda russa de rock conhecida por letras poéticas e sociais.',
ARRAY['rock russo', 'rock alternativo']
),
(
'Katya Lel',
'Катя Лель',
'Cantora pop russa conhecida por músicas marcantes dos anos 2000.',
ARRAY['pop russo', 'dance-pop']
),
(
'Mumiy Troll',
'Мумий Тролль',
'Banda russa de rock conhecida por seu estilo característico.',
ARRAY['rock russo', 'pop rock']
),
(
'Valery Meladze',
'Валерий Меладзе',
'Cantor conhecido por baladas e músicas pop emotivas.',
ARRAY['pop russo', 'balada']
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO music_tracks (
artist_id,
title,
russian_title,
description,
difficulty,
study_notes,
is_recommended
)
SELECT
id,
'Что такое осень',
'Что такое осень',
'Canção conhecida do DDT com vocabulário poético relacionado ao outono.',
'B1',
'Boa para estudar metáforas, estações do ano e linguagem poética.',
TRUE
FROM music_artists
WHERE name = 'DDT'
AND NOT EXISTS (
SELECT 1
FROM music_tracks
WHERE russian_title = 'Что такое осень'
);

INSERT INTO music_tracks (
artist_id,
title,
russian_title,
description,
difficulty,
study_notes,
is_recommended
)
SELECT
id,
'Мой мармеладный',
'Мой мармеладный',
'Música pop conhecida de Katya Lel.',
'A2',
'Boa para reconhecer repetições e expressões informais.',
TRUE
FROM music_artists
WHERE name = 'Katya Lel'
AND NOT EXISTS (
SELECT 1
FROM music_tracks
WHERE russian_title = 'Мой мармеладный'
);

INSERT INTO music_tracks (
artist_id,
title,
russian_title,
description,
difficulty,
study_notes,
is_recommended
)
SELECT
id,
'Утекай',
'Утекай',
'Canção conhecida do Mumiy Troll.',
'B1',
'Boa para treinar verbos no imperativo e escuta de rock russo.',
TRUE
FROM music_artists
WHERE name = 'Mumiy Troll'
AND NOT EXISTS (
SELECT 1
FROM music_tracks
WHERE russian_title = 'Утекай'
);

INSERT INTO music_tracks (
artist_id,
title,
russian_title,
description,
difficulty,
study_notes,
is_recommended
)
SELECT
id,
'Салют, Вера',
'Салют, Вера',
'Música pop emotiva de Valery Meladze.',
'A2',
'Útil para praticar nomes próprios, cumprimentos e vocabulário afetivo.',
TRUE
FROM music_artists
WHERE name = 'Valery Meladze'
AND NOT EXISTS (
SELECT 1
FROM music_tracks
WHERE russian_title = 'Салют, Вера'
);

-- ============================================================
-- JOGOS
-- ============================================================

INSERT INTO games (
slug,
title,
description,
game_type,
icon,
minimum_level,
xp_reward,
time_limit_seconds
)
VALUES
(
'memoria-sonora',
'Memória sonora',
'Encontre os pares entre áudio, palavra russa e tradução.',
'audio_memory',
'headphones',
'A1',
20,
120
),
(
'caca-palavras-cirilico',
'Caça-palavras cirílico',
'Encontre palavras russas escondidas no tabuleiro.',
'word_search',
'search',
'A1',
25,
180
),
(
'desafio-pronuncia',
'Desafio de pronúncia',
'Fale as palavras e tente alcançar a maior pontuação.',
'pronunciation',
'mic',
'A1',
25,
120
),
(
'corrida-traducao',
'Corrida de tradução',
'Traduza corretamente antes que o tempo termine.',
'translation_race',
'timer',
'A2',
30,
90
),
(
'detetive-cursivo',
'Detetive cursivo',
'Reconheça palavras escritas em letra cursiva russa.',
'cursive_recognition',
'pen-tool',
'A1',
25,
120
),
(
'teclado-cirilico',
'Teclado cirílico',
'Digite rapidamente palavras usando o alfabeto russo.',
'typing',
'keyboard',
'A1',
25,
120
),
(
'dialogo-rapido',
'Diálogo rápido',
'Escolha a melhor resposta para continuar a conversa.',
'dialogue',
'messages-square',
'A2',
30,
150
),
(
'palavra-secreta',
'Palavra secreta',
'Descubra a palavra russa usando pistas e letras.',
'secret_word',
'help-circle',
'A1',
25,
150
)
ON CONFLICT (slug) DO UPDATE SET
title = EXCLUDED.title,
description = EXCLUDED.description,
game_type = EXCLUDED.game_type,
icon = EXCLUDED.icon,
minimum_level = EXCLUDED.minimum_level,
xp_reward = EXCLUDED.xp_reward,
time_limit_seconds = EXCLUDED.time_limit_seconds;

-- ============================================================
-- MISSÕES
-- ============================================================

INSERT INTO mission_templates (
mission_type,
title,
description,
target_amount,
xp_reward,
minimum_level
)
VALUES
(
'complete_activities',
'Avance no curso',
'Conclua três atividades do curso.',
3,
30,
'A1'
),
(
'practice_speaking',
'Pratique sua fala',
'Complete duas atividades usando o microfone.',
2,
35,
'A1'
),
(
'practice_writing',
'Escreva em cirílico',
'Pratique a escrita de cinco palavras russas.',
5,
35,
'A1'
),
(
'listen_words',
'Treino de escuta',
'Escute e responda corretamente cinco exercícios.',
5,
30,
'A1'
),
(
'play_game',
'Momento de jogar',
'Complete uma partida em qualquer jogo.',
1,
20,
'A1'
);

-- ============================================================
-- CONQUISTAS
-- ============================================================

INSERT INTO achievements (
slug,
title,
description,
icon,
requirement_type,
requirement_value,
xp_reward
)
VALUES
(
'primeiro-passo',
'Primeiro passo',
'Conclua sua primeira atividade.',
'footprints',
'activities_completed',
1,
20
),
(
'alfabeto-completo',
'Mestre do alfabeto',
'Aprenda as 33 letras cirílicas.',
'languages',
'letters_learned',
33,
150
),
(
'sequencia-sete',
'Uma semana de russo',
'Estude durante sete dias seguidos.',
'flame',
'current_streak',
7,
100
),
(
'cem-atividades',
'Aluno dedicado',
'Conclua cem atividades.',
'graduation-cap',
'activities_completed',
100,
250
),
(
'primeira-prova',
'Primeira aprovação',
'Seja aprovado em sua primeira prova.',
'award',
'exams_completed',
1,
100
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- USUÁRIO DE TESTE
-- E-mail: [aluno@putirusu.com](mailto:aluno@putirusu.com)
-- Senha: 123456
-- ============================================================

INSERT INTO users (
name,
email,
password_hash,
role,
account_status,
email_verified,
onboarding_completed
)
VALUES (
'Aluno PUTIRUSU',
'[aluno@putirusu.com](mailto:aluno@putirusu.com)',
crypt('123456', gen_salt('bf')),
'student',
'active',
TRUE,
TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (
user_id,
reason_to_learn,
current_level,
daily_goal_minutes,
native_language,
knows_cyrillic,
primary_focus,
interests
)
SELECT
id,
'Aprender russo e conhecer a cultura',
'A1',
20,
'Português',
FALSE,
'general',
ARRAY['música', 'cultura', 'conversação', 'escrita']
FROM users
WHERE email = '[aluno@putirusu.com](mailto:aluno@putirusu.com)'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_preferences (
user_id,
sound_enabled,
music_enabled,
microphone_enabled,
notifications_enabled,
transliteration_enabled,
speech_rate
)
SELECT
id,
TRUE,
TRUE,
TRUE,
TRUE,
TRUE,
0.90
FROM users
WHERE email = '[aluno@putirusu.com](mailto:aluno@putirusu.com)'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_stats (user_id)
SELECT id
FROM users
WHERE email = '[aluno@putirusu.com](mailto:aluno@putirusu.com)'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- LIBERA A PRIMEIRA UNIDADE PARA O USUÁRIO DE TESTE
-- ============================================================

INSERT INTO user_unit_progress (
user_id,
unit_id,
status,
progress_percent,
last_accessed_at
)
SELECT
u.id,
cu.id,
CASE
WHEN cu.display_order = 1 THEN 'available'
ELSE 'locked'
END,
0,
CURRENT_TIMESTAMP
FROM users u
CROSS JOIN course_units cu
JOIN course_levels cl ON cl.id = cu.level_id
WHERE u.email = '[aluno@putirusu.com](mailto:aluno@putirusu.com)'
AND cl.code = 'A1'
ON CONFLICT (user_id, unit_id) DO NOTHING;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW user_course_dashboard AS
SELECT
u.id AS user_id,
u.name,
u.email,
COALESCE(us.total_xp, 0) AS total_xp,
COALESCE(us.current_streak, 0) AS current_streak,
COALESCE(us.activities_completed, 0) AS activities_completed,
cup.unit_id,
cu.title AS unit_title,
cl.code AS level_code,
cup.status AS unit_status,
cup.progress_percent,
cup.last_accessed_at
FROM users u
LEFT JOIN user_stats us
ON us.user_id = u.id
LEFT JOIN user_unit_progress cup
ON cup.user_id = u.id
LEFT JOIN course_units cu
ON cu.id = cup.unit_id
LEFT JOIN course_levels cl
ON cl.id = cu.level_id;

CREATE OR REPLACE VIEW exam_unlock_status AS
SELECT
u.id AS user_id,
e.id AS exam_id,
e.title,
e.minimum_activities_required,
COALESCE(us.activities_completed, 0) AS activities_completed,
GREATEST(
e.minimum_activities_required -
COALESCE(us.activities_completed, 0),
0
) AS activities_remaining,
CASE
WHEN COALESCE(us.activities_completed, 0) >=
e.minimum_activities_required
THEN TRUE
ELSE FALSE
END AS unlocked
FROM users u
CROSS JOIN exams e
LEFT JOIN user_stats us
ON us.user_id = u.id;

COMMIT;
