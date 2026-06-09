CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    goal VARCHAR(120) DEFAULT 'Aprender do zero',
    minutes_per_day INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    hearts INTEGER DEFAULT 5,
    streak INTEGER DEFAULT 0,
    daily_xp INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    russian TEXT NOT NULL,
    portuguese TEXT NOT NULL,
    category VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_message TEXT NOT NULL,
    ai_answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_type VARCHAR(80) NOT NULL,
    question TEXT,
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vocabulary (russian, portuguese, category) VALUES
('Привет', 'Olá', 'Básico'),
('Спасибо', 'Obrigado', 'Básico'),
('Пожалуйста', 'Por favor', 'Básico'),
('Я', 'Eu', 'Pronomes'),
('Ты', 'Você informal', 'Pronomes'),
('Мы', 'Nós', 'Pronomes'),
('Вода', 'Água', 'Comida'),
('Хлеб', 'Pão', 'Comida'),
('Красный', 'Vermelho', 'Cores'),
('Синий', 'Azul', 'Cores'),
('Белый', 'Branco', 'Cores'),
('Где метро?', 'Onde fica o metrô?', 'Viagem'),
('Сколько стоит?', 'Quanto custa?', 'Viagem'),
('Я люблю тебя', 'Eu te amo', 'Frases')
ON CONFLICT DO NOTHING;
