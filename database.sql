BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  level VARCHAR(2) NOT NULL DEFAULT 'A1',
  daily_minutes INTEGER NOT NULL DEFAULT 20 CHECK (daily_minutes BETWEEN 5 AND 180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS alphabet_letters (
  id SERIAL PRIMARY KEY,
  position SMALLINT NOT NULL UNIQUE,
  upper_letter VARCHAR(2) NOT NULL,
  lower_letter VARCHAR(2) NOT NULL,
  sound VARCHAR(40) NOT NULL,
  sound_hint TEXT NOT NULL,
  print_instruction TEXT NOT NULL,
  cursive_instruction TEXT NOT NULL,
  common_mistake TEXT,
  example_word VARCHAR(100) NOT NULL,
  example_translation VARCHAR(160) NOT NULL
);
CREATE TABLE IF NOT EXISTS writing_exercises (
  id BIGSERIAL PRIMARY KEY,
  external_id INTEGER UNIQUE,
  letter VARCHAR(2) NOT NULL,
  mode VARCHAR(16) NOT NULL CHECK (mode IN ('print','cursive')),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 6),
  prompt TEXT NOT NULL,
  expected_text TEXT NOT NULL,
  translation TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS writing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id BIGINT REFERENCES writing_exercises(id) ON DELETE SET NULL,
  letter VARCHAR(2) NOT NULL,
  mode VARCHAR(16) NOT NULL CHECK (mode IN ('print','cursive')),
  score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  stroke_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  drawing_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS letter_mastery (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  letter VARCHAR(2) NOT NULL,
  print_best_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  cursive_best_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  next_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, letter)
);
CREATE TABLE IF NOT EXISTS course_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL UNIQUE,
  cefr_level VARCHAR(2) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 20
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  russian TEXT NOT NULL,
  portuguese TEXT NOT NULL,
  pronunciation TEXT,
  category VARCHAR(80),
  cefr_level VARCHAR(2) DEFAULT 'A1',
  example_sentence TEXT
);
CREATE TABLE IF NOT EXISTS review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(30) NOT NULL,
  item_key VARCHAR(180) NOT NULL,
  result VARCHAR(12) NOT NULL CHECK (result IN ('correct','wrong','easy','hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cefr_level VARCHAR(2) NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario VARCHAR(40) NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_writing_attempts_user_created ON writing_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_writing_attempts_letter ON writing_attempts(letter, mode);
CREATE INDEX IF NOT EXISTS idx_writing_exercises_letter_level ON writing_exercises(letter, level);
CREATE INDEX IF NOT EXISTS idx_review_user_created ON review_events(user_id, created_at DESC);

INSERT INTO users (name,email,password_hash,level,daily_minutes)
VALUES ('Aluno','aluno@putirusu.com',crypt('123456',gen_salt('bf')),'A1',20)
ON CONFLICT (email) DO NOTHING;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (1,'А','а','a','a de casa','Comece no alto, desça em diagonal, volte ao alto e cruze no meio.','Comece no alto, desça em diagonal, volte ao alto e cruze no meio.','Evite deformar а.','арбуз','melancia') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (2,'Б','б','b','b de bola','Faça a haste principal e depois a barriga arredondada sem levantar demais a mão.','Faça a haste principal e depois a barriga arredondada sem levantar demais a mão.','Evite deformar б.','банк','banco') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (3,'В','в','v','v de vaso','Na cursiva minúscula, faça um laço pequeno e continue para a próxima letra.','Na cursiva minúscula, faça um laço pequeno e continue para a próxima letra.','Evite deformar в.','вода','água') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (4,'Г','г','g','g de gato','Maiúscula com canto superior; minúscula cursiva parece um pequeno arco ligado.','Maiúscula com canto superior; minúscula cursiva parece um pequeno arco ligado.','Evite deformar г.','город','cidade') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (5,'Д','д','d','d de dado','A forma cursiva pode lembrar um d latino; mantenha a base alongada.','A forma cursiva pode lembrar um d latino; mantenha a base alongada.','Evite deformar д.','дом','casa') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (6,'Е','е','iê','ie de iéti','Faça um laço curto, parecido com e cursivo, mantendo a ligação.','Faça um laço curto, parecido com e cursivo, mantendo a ligação.','Evite deformar е.','еда','comida') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (7,'Ё','ё','iô','io de ioga','Escreva como Е e acrescente dois pontos bem visíveis.','Escreva como Е e acrescente dois pontos bem visíveis.','Evite deformar ё.','ёлка','árvore de Natal') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (8,'Ж','ж','j','j francês em déjà','Construa o centro e abra dois braços simétricos; na cursiva use movimentos contínuos.','Construa o centro e abra dois braços simétricos; na cursiva use movimentos contínuos.','Evite deformar ж.','жизнь','vida') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (9,'З','з','z','z de zebra','Duas curvas ligadas; evite confundir com o número 3 no contexto.','Duas curvas ligadas; evite confundir com o número 3 no contexto.','Evite deformar з.','зима','inverno') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (10,'И','и','i','i de ilha','Na cursiva parece um u latino; duas subidas suaves.','Na cursiva parece um u latino; duas subidas suaves.','Evite deformar и.','игра','jogo') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (11,'Й','й','i curto','i breve','Escreva И e acrescente a breve acima.','Escreva И e acrescente a breve acima.','Evite deformar й.','йога','ioga') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (12,'К','к','k','k de kiwi','Haste e dois braços; na cursiva mantenha o encontro no meio.','Haste e dois braços; na cursiva mantenha o encontro no meio.','Evite deformar к.','кот','gato') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (13,'Л','л','l','l de lua','Na cursiva minúscula lembra um pequeno pico, começando pela linha de base.','Na cursiva minúscula lembra um pequeno pico, começando pela linha de base.','Evite deformar л.','лампа','lâmpada') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (14,'М','м','m','m de mão','Na cursiva começa com subida e forma dois arcos; cuide para não parecer И.','Na cursiva começa com subida e forma dois arcos; cuide para não parecer И.','Evite deformar м.','мама','mamãe') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (15,'Н','н','n','n de navio','Na cursiva se aproxima de n latino; uma ponte clara.','Na cursiva se aproxima de n latino; uma ponte clara.','Evite deformar н.','нос','nariz') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (16,'О','о','o','o de ovo','Oval fechado, inclinado levemente e pronto para ligar à próxima letra.','Oval fechado, inclinado levemente e pronto para ligar à próxima letra.','Evite deformar о.','окно','janela') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (17,'П','п','p','p de pato','Na cursiva minúscula parece n latino; duas hastes com ponte.','Na cursiva minúscula parece n latino; duas hastes com ponte.','Evite deformar п.','папа','papai') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (18,'Р','р','r','r vibrante','Na cursiva minúscula parece p latino, descendo abaixo da linha.','Na cursiva minúscula parece p latino, descendo abaixo da linha.','Evite deformar р.','рыба','peixe') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (19,'С','с','s','s de sapo','Curva aberta semelhante ao c latino.','Curva aberta semelhante ao c latino.','Evite deformar с.','сок','suco') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (20,'Т','т','t','t de tatu','Na cursiva escolar pode parecer m latino; três hastes curtas e ligadas.','Na cursiva escolar pode parecer m latino; três hastes curtas e ligadas.','Evite deformar т.','торт','bolo') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (21,'У','у','u','u de urso','Na cursiva lembra y latino e desce abaixo da linha.','Na cursiva lembra y latino e desce abaixo da linha.','Evite deformar у.','утро','manhã') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (22,'Ф','ф','f','f de faca','Oval central atravessado por haste; minúscula pode descer e subir.','Oval central atravessado por haste; minúscula pode descer e subir.','Evite deformar ф.','фото','foto') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (23,'Х','х','kh','rr forte','Duas diagonais cruzadas; em cursiva faça o cruzamento fluido.','Duas diagonais cruzadas; em cursiva faça o cruzamento fluido.','Evite deformar х.','хлеб','pão') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (24,'Ц','ц','ts','ts de tsunami','Parece И com pequena cauda abaixo da linha.','Parece И com pequena cauda abaixo da linha.','Evite deformar ц.','цирк','circo') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (25,'Ч','ч','tch','tch de tchau','Na cursiva minúscula lembra r latino ou um arco com entrada.','Na cursiva minúscula lembra r latino ou um arco com entrada.','Evite deformar ч.','чай','chá') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (26,'Ш','ш','sh','x de xale','Três hastes ligadas; mantenha altura uniforme.','Três hastes ligadas; mantenha altura uniforme.','Evite deformar ш.','школа','escola') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (27,'Щ','щ','shch','sh + tch','Como Ш com pequena cauda descendo no final.','Como Ш com pequena cauda descendo no final.','Evite deformar щ.','щука','lúcio') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (28,'Ъ','ъ','sinal duro','sem som próprio','Haste com curva; não recebe som próprio, mas separa a pronúncia.','Haste com curva; não recebe som próprio, mas separa a pronúncia.','Evite deformar ъ.','объект','objeto') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (29,'Ы','ы','y fechado','som entre i e u','Combine Ь com uma haste curta; treine o ritmo entre as duas partes.','Combine Ь com uma haste curta; treine o ritmo entre as duas partes.','Evite deformar ы.','мы','nós') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (30,'Ь','ь','sinal brando','sem som próprio','Haste curta com barriga; suaviza a consoante anterior.','Haste curta com barriga; suaviza a consoante anterior.','Evite deformar ь.','день','dia') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (31,'Э','э','é','é aberto','Curva aberta para a esquerda com pequeno traço central.','Curva aberta para a esquerda com pequeno traço central.','Evite deformar э.','это','isto') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (32,'Ю','ю','iu','iu de iuri','Haste ligada a um oval; preserve o espaço interno.','Haste ligada a um oval; preserve o espaço interno.','Evite deformar ю.','юг','sul') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;
INSERT INTO alphabet_letters (position,upper_letter,lower_letter,sound,sound_hint,print_instruction,cursive_instruction,common_mistake,example_word,example_translation) VALUES (33,'Я','я','ia','ia de iate','Na cursiva minúscula faça laço inicial e uma perna descendente suave.','Na cursiva minúscula faça laço inicial e uma perna descendente suave.','Evite deformar я.','яблоко','maçã') ON CONFLICT (position) DO UPDATE SET upper_letter=EXCLUDED.upper_letter, lower_letter=EXCLUDED.lower_letter;

CREATE TABLE IF NOT EXISTS writing_curriculum (
  id INTEGER PRIMARY KEY,
  letter_position SMALLINT NOT NULL CHECK (letter_position BETWEEN 1 AND 33),
  upper_letter VARCHAR(2) NOT NULL,
  lower_letter VARCHAR(2) NOT NULL,
  mode VARCHAR(16) NOT NULL CHECK (mode IN ('print','cursive')),
  stage_number SMALLINT NOT NULL CHECK (stage_number BETWEEN 1 AND 16),
  stage_code VARCHAR(40) NOT NULL,
  stage_title VARCHAR(120) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL,
  target_text TEXT NOT NULL,
  example_word TEXT NOT NULL,
  translation TEXT NOT NULL,
  sound_hint TEXT NOT NULL,
  prompt TEXT NOT NULL,
  objective TEXT NOT NULL,
  rubric TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (letter_position, mode, stage_number)
);
CREATE INDEX IF NOT EXISTS idx_writing_curriculum_letter_mode ON writing_curriculum(lower_letter, mode);
CREATE INDEX IF NOT EXISTS idx_writing_curriculum_level_stage ON writing_curriculum(cefr_level, stage_code);

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1, 1, 'А', 'а', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Observar proporções: pratique А а em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  2, 1, 'А', 'а', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Desenhar no ar: pratique А а em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  3, 1, 'А', 'а', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ААААА', 'арбуз',
  'melancia', 'a', 'Traçar maiúscula: pratique А а em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  4, 1, 'А', 'а', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Traçar minúscula: pratique А а em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  5, 1, 'А', 'а', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Copiar isoladamente: pratique А а em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  6, 1, 'А', 'а', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'аааа аааа аааа', 'арбуз',
  'melancia', 'a', 'Criar ritmo: pratique А а em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  7, 1, 'А', 'а', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'аа аа', 'арбуз',
  'melancia', 'a', 'Ligar com а: pratique А а em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  8, 1, 'А', 'а', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ао оа', 'арбуз',
  'melancia', 'a', 'Ligar com о: pratique А а em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  9, 1, 'А', 'а', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'аи иа', 'арбуз',
  'melancia', 'a', 'Ligar com и: pratique А а em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  10, 1, 'А', 'а', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ам ма', 'арбуз',
  'melancia', 'a', 'Ligar com м: pratique А а em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  11, 1, 'А', 'а', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'аа ао ау аи', 'арбуз',
  'melancia', 'a', 'Copiar sílabas: pratique А а em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  12, 1, 'А', 'а', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'арбуз', 'арбуз',
  'melancia', 'a', 'Copiar palavra: pratique А а em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  13, 1, 'А', 'а', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «арбуз».', 'арбуз',
  'melancia', 'a', 'Copiar frase: pratique А а em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  14, 1, 'А', 'а', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'арбуз', 'арбуз',
  'melancia', 'a', 'Escrever por ditado: pratique А а em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  15, 1, 'А', 'а', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'арбуз', 'арбуз',
  'melancia', 'a', 'Treino de fluência: pratique А а em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  16, 1, 'А', 'а', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «арбуз».', 'арбуз',
  'melancia', 'a', 'Produção livre: pratique А а em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  17, 1, 'А', 'а', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Observar proporções: pratique А а em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  18, 1, 'А', 'а', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Desenhar no ar: pratique А а em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  19, 1, 'А', 'а', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ААААА', 'арбуз',
  'melancia', 'a', 'Traçar maiúscula: pratique А а em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  20, 1, 'А', 'а', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Traçar minúscula: pratique А а em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  21, 1, 'А', 'а', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ааааа', 'арбуз',
  'melancia', 'a', 'Copiar isoladamente: pratique А а em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  22, 1, 'А', 'а', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'аааа аааа аааа', 'арбуз',
  'melancia', 'a', 'Criar ritmo: pratique А а em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  23, 1, 'А', 'а', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'аа аа', 'арбуз',
  'melancia', 'a', 'Ligar com а: pratique А а em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  24, 1, 'А', 'а', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ао оа', 'арбуз',
  'melancia', 'a', 'Ligar com о: pratique А а em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  25, 1, 'А', 'а', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'аи иа', 'арбуз',
  'melancia', 'a', 'Ligar com и: pratique А а em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  26, 1, 'А', 'а', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ам ма', 'арбуз',
  'melancia', 'a', 'Ligar com м: pratique А а em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  27, 1, 'А', 'а', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'аа ао ау аи', 'арбуз',
  'melancia', 'a', 'Copiar sílabas: pratique А а em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  28, 1, 'А', 'а', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'арбуз', 'арбуз',
  'melancia', 'a', 'Copiar palavra: pratique А а em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  29, 1, 'А', 'а', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «арбуз».', 'арбуз',
  'melancia', 'a', 'Copiar frase: pratique А а em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  30, 1, 'А', 'а', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'арбуз', 'арбуз',
  'melancia', 'a', 'Escrever por ditado: pratique А а em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  31, 1, 'А', 'а', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'арбуз', 'арбуз',
  'melancia', 'a', 'Treino de fluência: pratique А а em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  32, 1, 'А', 'а', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «арбуз».', 'арбуз',
  'melancia', 'a', 'Produção livre: pratique А а em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  33, 2, 'Б', 'б', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Observar proporções: pratique Б б em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  34, 2, 'Б', 'б', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Desenhar no ar: pratique Б б em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  35, 2, 'Б', 'б', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'БББББ', 'банк',
  'banco', 'b', 'Traçar maiúscula: pratique Б б em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  36, 2, 'Б', 'б', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Traçar minúscula: pratique Б б em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  37, 2, 'Б', 'б', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Copiar isoladamente: pratique Б б em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  38, 2, 'Б', 'б', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'бббб бббб бббб', 'банк',
  'banco', 'b', 'Criar ritmo: pratique Б б em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  39, 2, 'Б', 'б', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ба аб', 'банк',
  'banco', 'b', 'Ligar com а: pratique Б б em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  40, 2, 'Б', 'б', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'бо об', 'банк',
  'banco', 'b', 'Ligar com о: pratique Б б em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  41, 2, 'Б', 'б', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'би иб', 'банк',
  'banco', 'b', 'Ligar com и: pratique Б б em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  42, 2, 'Б', 'б', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'бм мб', 'банк',
  'banco', 'b', 'Ligar com м: pratique Б б em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  43, 2, 'Б', 'б', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ба бо бу би', 'банк',
  'banco', 'b', 'Copiar sílabas: pratique Б б em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  44, 2, 'Б', 'б', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'банк', 'банк',
  'banco', 'b', 'Copiar palavra: pratique Б б em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  45, 2, 'Б', 'б', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «банк».', 'банк',
  'banco', 'b', 'Copiar frase: pratique Б б em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  46, 2, 'Б', 'б', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'банк', 'банк',
  'banco', 'b', 'Escrever por ditado: pratique Б б em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  47, 2, 'Б', 'б', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'банк', 'банк',
  'banco', 'b', 'Treino de fluência: pratique Б б em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  48, 2, 'Б', 'б', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «банк».', 'банк',
  'banco', 'b', 'Produção livre: pratique Б б em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  49, 2, 'Б', 'б', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Observar proporções: pratique Б б em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  50, 2, 'Б', 'б', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Desenhar no ar: pratique Б б em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  51, 2, 'Б', 'б', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'БББББ', 'банк',
  'banco', 'b', 'Traçar maiúscula: pratique Б б em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  52, 2, 'Б', 'б', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Traçar minúscula: pratique Б б em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  53, 2, 'Б', 'б', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ббббб', 'банк',
  'banco', 'b', 'Copiar isoladamente: pratique Б б em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  54, 2, 'Б', 'б', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'бббб бббб бббб', 'банк',
  'banco', 'b', 'Criar ritmo: pratique Б б em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  55, 2, 'Б', 'б', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ба аб', 'банк',
  'banco', 'b', 'Ligar com а: pratique Б б em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  56, 2, 'Б', 'б', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'бо об', 'банк',
  'banco', 'b', 'Ligar com о: pratique Б б em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  57, 2, 'Б', 'б', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'би иб', 'банк',
  'banco', 'b', 'Ligar com и: pratique Б б em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  58, 2, 'Б', 'б', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'бм мб', 'банк',
  'banco', 'b', 'Ligar com м: pratique Б б em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  59, 2, 'Б', 'б', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ба бо бу би', 'банк',
  'banco', 'b', 'Copiar sílabas: pratique Б б em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  60, 2, 'Б', 'б', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'банк', 'банк',
  'banco', 'b', 'Copiar palavra: pratique Б б em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  61, 2, 'Б', 'б', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «банк».', 'банк',
  'banco', 'b', 'Copiar frase: pratique Б б em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  62, 2, 'Б', 'б', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'банк', 'банк',
  'banco', 'b', 'Escrever por ditado: pratique Б б em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  63, 2, 'Б', 'б', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'банк', 'банк',
  'banco', 'b', 'Treino de fluência: pratique Б б em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  64, 2, 'Б', 'б', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «банк».', 'банк',
  'banco', 'b', 'Produção livre: pratique Б б em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  65, 3, 'В', 'в', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Observar proporções: pratique В в em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  66, 3, 'В', 'в', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Desenhar no ar: pratique В в em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  67, 3, 'В', 'в', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ВВВВВ', 'вода',
  'água', 'v', 'Traçar maiúscula: pratique В в em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  68, 3, 'В', 'в', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Traçar minúscula: pratique В в em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  69, 3, 'В', 'в', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Copiar isoladamente: pratique В в em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  70, 3, 'В', 'в', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'вввв вввв вввв', 'вода',
  'água', 'v', 'Criar ritmo: pratique В в em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  71, 3, 'В', 'в', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ва ав', 'вода',
  'água', 'v', 'Ligar com а: pratique В в em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  72, 3, 'В', 'в', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'во ов', 'вода',
  'água', 'v', 'Ligar com о: pratique В в em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  73, 3, 'В', 'в', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ви ив', 'вода',
  'água', 'v', 'Ligar com и: pratique В в em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  74, 3, 'В', 'в', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'вм мв', 'вода',
  'água', 'v', 'Ligar com м: pratique В в em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  75, 3, 'В', 'в', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ва во ву ви', 'вода',
  'água', 'v', 'Copiar sílabas: pratique В в em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  76, 3, 'В', 'в', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'вода', 'вода',
  'água', 'v', 'Copiar palavra: pratique В в em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  77, 3, 'В', 'в', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «вода».', 'вода',
  'água', 'v', 'Copiar frase: pratique В в em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  78, 3, 'В', 'в', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'вода', 'вода',
  'água', 'v', 'Escrever por ditado: pratique В в em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  79, 3, 'В', 'в', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'вода', 'вода',
  'água', 'v', 'Treino de fluência: pratique В в em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  80, 3, 'В', 'в', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «вода».', 'вода',
  'água', 'v', 'Produção livre: pratique В в em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  81, 3, 'В', 'в', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Observar proporções: pratique В в em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  82, 3, 'В', 'в', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Desenhar no ar: pratique В в em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  83, 3, 'В', 'в', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ВВВВВ', 'вода',
  'água', 'v', 'Traçar maiúscula: pratique В в em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  84, 3, 'В', 'в', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Traçar minúscula: pratique В в em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  85, 3, 'В', 'в', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ввввв', 'вода',
  'água', 'v', 'Copiar isoladamente: pratique В в em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  86, 3, 'В', 'в', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'вввв вввв вввв', 'вода',
  'água', 'v', 'Criar ritmo: pratique В в em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  87, 3, 'В', 'в', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ва ав', 'вода',
  'água', 'v', 'Ligar com а: pratique В в em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  88, 3, 'В', 'в', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'во ов', 'вода',
  'água', 'v', 'Ligar com о: pratique В в em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  89, 3, 'В', 'в', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ви ив', 'вода',
  'água', 'v', 'Ligar com и: pratique В в em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  90, 3, 'В', 'в', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'вм мв', 'вода',
  'água', 'v', 'Ligar com м: pratique В в em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  91, 3, 'В', 'в', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ва во ву ви', 'вода',
  'água', 'v', 'Copiar sílabas: pratique В в em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  92, 3, 'В', 'в', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'вода', 'вода',
  'água', 'v', 'Copiar palavra: pratique В в em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  93, 3, 'В', 'в', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «вода».', 'вода',
  'água', 'v', 'Copiar frase: pratique В в em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  94, 3, 'В', 'в', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'вода', 'вода',
  'água', 'v', 'Escrever por ditado: pratique В в em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  95, 3, 'В', 'в', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'вода', 'вода',
  'água', 'v', 'Treino de fluência: pratique В в em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  96, 3, 'В', 'в', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «вода».', 'вода',
  'água', 'v', 'Produção livre: pratique В в em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  97, 4, 'Г', 'г', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Observar proporções: pratique Г г em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  98, 4, 'Г', 'г', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Desenhar no ar: pratique Г г em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  99, 4, 'Г', 'г', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ГГГГГ', 'город',
  'cidade', 'g', 'Traçar maiúscula: pratique Г г em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  100, 4, 'Г', 'г', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Traçar minúscula: pratique Г г em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  101, 4, 'Г', 'г', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Copiar isoladamente: pratique Г г em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  102, 4, 'Г', 'г', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'гггг гггг гггг', 'город',
  'cidade', 'g', 'Criar ritmo: pratique Г г em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  103, 4, 'Г', 'г', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'га аг', 'город',
  'cidade', 'g', 'Ligar com а: pratique Г г em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  104, 4, 'Г', 'г', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'го ог', 'город',
  'cidade', 'g', 'Ligar com о: pratique Г г em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  105, 4, 'Г', 'г', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ги иг', 'город',
  'cidade', 'g', 'Ligar com и: pratique Г г em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  106, 4, 'Г', 'г', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'гм мг', 'город',
  'cidade', 'g', 'Ligar com м: pratique Г г em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  107, 4, 'Г', 'г', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'га го гу ги', 'город',
  'cidade', 'g', 'Copiar sílabas: pratique Г г em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  108, 4, 'Г', 'г', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'город', 'город',
  'cidade', 'g', 'Copiar palavra: pratique Г г em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  109, 4, 'Г', 'г', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «город».', 'город',
  'cidade', 'g', 'Copiar frase: pratique Г г em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  110, 4, 'Г', 'г', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'город', 'город',
  'cidade', 'g', 'Escrever por ditado: pratique Г г em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  111, 4, 'Г', 'г', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'город', 'город',
  'cidade', 'g', 'Treino de fluência: pratique Г г em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  112, 4, 'Г', 'г', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «город».', 'город',
  'cidade', 'g', 'Produção livre: pratique Г г em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  113, 4, 'Г', 'г', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Observar proporções: pratique Г г em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  114, 4, 'Г', 'г', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Desenhar no ar: pratique Г г em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  115, 4, 'Г', 'г', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ГГГГГ', 'город',
  'cidade', 'g', 'Traçar maiúscula: pratique Г г em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  116, 4, 'Г', 'г', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Traçar minúscula: pratique Г г em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  117, 4, 'Г', 'г', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ггггг', 'город',
  'cidade', 'g', 'Copiar isoladamente: pratique Г г em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  118, 4, 'Г', 'г', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'гггг гггг гггг', 'город',
  'cidade', 'g', 'Criar ritmo: pratique Г г em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  119, 4, 'Г', 'г', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'га аг', 'город',
  'cidade', 'g', 'Ligar com а: pratique Г г em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  120, 4, 'Г', 'г', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'го ог', 'город',
  'cidade', 'g', 'Ligar com о: pratique Г г em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  121, 4, 'Г', 'г', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ги иг', 'город',
  'cidade', 'g', 'Ligar com и: pratique Г г em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  122, 4, 'Г', 'г', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'гм мг', 'город',
  'cidade', 'g', 'Ligar com м: pratique Г г em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  123, 4, 'Г', 'г', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'га го гу ги', 'город',
  'cidade', 'g', 'Copiar sílabas: pratique Г г em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  124, 4, 'Г', 'г', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'город', 'город',
  'cidade', 'g', 'Copiar palavra: pratique Г г em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  125, 4, 'Г', 'г', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «город».', 'город',
  'cidade', 'g', 'Copiar frase: pratique Г г em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  126, 4, 'Г', 'г', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'город', 'город',
  'cidade', 'g', 'Escrever por ditado: pratique Г г em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  127, 4, 'Г', 'г', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'город', 'город',
  'cidade', 'g', 'Treino de fluência: pratique Г г em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  128, 4, 'Г', 'г', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «город».', 'город',
  'cidade', 'g', 'Produção livre: pratique Г г em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  129, 5, 'Д', 'д', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Observar proporções: pratique Д д em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  130, 5, 'Д', 'д', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Desenhar no ar: pratique Д д em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  131, 5, 'Д', 'д', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ДДДДД', 'дом',
  'casa', 'd', 'Traçar maiúscula: pratique Д д em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  132, 5, 'Д', 'д', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Traçar minúscula: pratique Д д em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  133, 5, 'Д', 'д', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Copiar isoladamente: pratique Д д em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  134, 5, 'Д', 'д', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'дддд дддд дддд', 'дом',
  'casa', 'd', 'Criar ritmo: pratique Д д em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  135, 5, 'Д', 'д', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'да ад', 'дом',
  'casa', 'd', 'Ligar com а: pratique Д д em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  136, 5, 'Д', 'д', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'до од', 'дом',
  'casa', 'd', 'Ligar com о: pratique Д д em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  137, 5, 'Д', 'д', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ди ид', 'дом',
  'casa', 'd', 'Ligar com и: pratique Д д em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  138, 5, 'Д', 'д', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'дм мд', 'дом',
  'casa', 'd', 'Ligar com м: pratique Д д em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  139, 5, 'Д', 'д', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'да до ду ди', 'дом',
  'casa', 'd', 'Copiar sílabas: pratique Д д em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  140, 5, 'Д', 'д', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'дом', 'дом',
  'casa', 'd', 'Copiar palavra: pratique Д д em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  141, 5, 'Д', 'д', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «дом».', 'дом',
  'casa', 'd', 'Copiar frase: pratique Д д em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  142, 5, 'Д', 'д', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'дом', 'дом',
  'casa', 'd', 'Escrever por ditado: pratique Д д em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  143, 5, 'Д', 'д', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'дом', 'дом',
  'casa', 'd', 'Treino de fluência: pratique Д д em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  144, 5, 'Д', 'д', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «дом».', 'дом',
  'casa', 'd', 'Produção livre: pratique Д д em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  145, 5, 'Д', 'д', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Observar proporções: pratique Д д em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  146, 5, 'Д', 'д', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Desenhar no ar: pratique Д д em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  147, 5, 'Д', 'д', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ДДДДД', 'дом',
  'casa', 'd', 'Traçar maiúscula: pratique Д д em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  148, 5, 'Д', 'д', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Traçar minúscula: pratique Д д em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  149, 5, 'Д', 'д', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ддддд', 'дом',
  'casa', 'd', 'Copiar isoladamente: pratique Д д em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  150, 5, 'Д', 'д', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'дддд дддд дддд', 'дом',
  'casa', 'd', 'Criar ritmo: pratique Д д em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  151, 5, 'Д', 'д', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'да ад', 'дом',
  'casa', 'd', 'Ligar com а: pratique Д д em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  152, 5, 'Д', 'д', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'до од', 'дом',
  'casa', 'd', 'Ligar com о: pratique Д д em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  153, 5, 'Д', 'д', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ди ид', 'дом',
  'casa', 'd', 'Ligar com и: pratique Д д em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  154, 5, 'Д', 'д', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'дм мд', 'дом',
  'casa', 'd', 'Ligar com м: pratique Д д em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  155, 5, 'Д', 'д', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'да до ду ди', 'дом',
  'casa', 'd', 'Copiar sílabas: pratique Д д em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  156, 5, 'Д', 'д', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'дом', 'дом',
  'casa', 'd', 'Copiar palavra: pratique Д д em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  157, 5, 'Д', 'д', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «дом».', 'дом',
  'casa', 'd', 'Copiar frase: pratique Д д em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  158, 5, 'Д', 'д', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'дом', 'дом',
  'casa', 'd', 'Escrever por ditado: pratique Д д em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  159, 5, 'Д', 'д', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'дом', 'дом',
  'casa', 'd', 'Treino de fluência: pratique Д д em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  160, 5, 'Д', 'д', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «дом».', 'дом',
  'casa', 'd', 'Produção livre: pratique Д д em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  161, 6, 'Е', 'е', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Observar proporções: pratique Е е em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  162, 6, 'Е', 'е', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Desenhar no ar: pratique Е е em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  163, 6, 'Е', 'е', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЕЕЕЕЕ', 'еда',
  'comida', 'iê', 'Traçar maiúscula: pratique Е е em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  164, 6, 'Е', 'е', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Traçar minúscula: pratique Е е em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  165, 6, 'Е', 'е', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Copiar isoladamente: pratique Е е em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  166, 6, 'Е', 'е', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ееее ееее ееее', 'еда',
  'comida', 'iê', 'Criar ritmo: pratique Е е em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  167, 6, 'Е', 'е', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'еа ае', 'еда',
  'comida', 'iê', 'Ligar com а: pratique Е е em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  168, 6, 'Е', 'е', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ео ое', 'еда',
  'comida', 'iê', 'Ligar com о: pratique Е е em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  169, 6, 'Е', 'е', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'еи ие', 'еда',
  'comida', 'iê', 'Ligar com и: pratique Е е em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  170, 6, 'Е', 'е', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ем ме', 'еда',
  'comida', 'iê', 'Ligar com м: pratique Е е em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  171, 6, 'Е', 'е', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'еа ео еу еи', 'еда',
  'comida', 'iê', 'Copiar sílabas: pratique Е е em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  172, 6, 'Е', 'е', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'еда', 'еда',
  'comida', 'iê', 'Copiar palavra: pratique Е е em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  173, 6, 'Е', 'е', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «еда».', 'еда',
  'comida', 'iê', 'Copiar frase: pratique Е е em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  174, 6, 'Е', 'е', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'еда', 'еда',
  'comida', 'iê', 'Escrever por ditado: pratique Е е em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  175, 6, 'Е', 'е', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'еда', 'еда',
  'comida', 'iê', 'Treino de fluência: pratique Е е em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  176, 6, 'Е', 'е', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «еда».', 'еда',
  'comida', 'iê', 'Produção livre: pratique Е е em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  177, 6, 'Е', 'е', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Observar proporções: pratique Е е em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  178, 6, 'Е', 'е', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Desenhar no ar: pratique Е е em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  179, 6, 'Е', 'е', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЕЕЕЕЕ', 'еда',
  'comida', 'iê', 'Traçar maiúscula: pratique Е е em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  180, 6, 'Е', 'е', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Traçar minúscula: pratique Е е em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  181, 6, 'Е', 'е', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'еееее', 'еда',
  'comida', 'iê', 'Copiar isoladamente: pratique Е е em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  182, 6, 'Е', 'е', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ееее ееее ееее', 'еда',
  'comida', 'iê', 'Criar ritmo: pratique Е е em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  183, 6, 'Е', 'е', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'еа ае', 'еда',
  'comida', 'iê', 'Ligar com а: pratique Е е em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  184, 6, 'Е', 'е', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ео ое', 'еда',
  'comida', 'iê', 'Ligar com о: pratique Е е em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  185, 6, 'Е', 'е', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'еи ие', 'еда',
  'comida', 'iê', 'Ligar com и: pratique Е е em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  186, 6, 'Е', 'е', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ем ме', 'еда',
  'comida', 'iê', 'Ligar com м: pratique Е е em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  187, 6, 'Е', 'е', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'еа ео еу еи', 'еда',
  'comida', 'iê', 'Copiar sílabas: pratique Е е em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  188, 6, 'Е', 'е', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'еда', 'еда',
  'comida', 'iê', 'Copiar palavra: pratique Е е em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  189, 6, 'Е', 'е', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «еда».', 'еда',
  'comida', 'iê', 'Copiar frase: pratique Е е em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  190, 6, 'Е', 'е', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'еда', 'еда',
  'comida', 'iê', 'Escrever por ditado: pratique Е е em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  191, 6, 'Е', 'е', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'еда', 'еда',
  'comida', 'iê', 'Treino de fluência: pratique Е е em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  192, 6, 'Е', 'е', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «еда».', 'еда',
  'comida', 'iê', 'Produção livre: pratique Е е em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  193, 7, 'Ё', 'ё', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Observar proporções: pratique Ё ё em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  194, 7, 'Ё', 'ё', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Desenhar no ar: pratique Ё ё em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  195, 7, 'Ё', 'ё', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЁЁЁЁЁ', 'ёлка',
  'árvore de Natal', 'iô', 'Traçar maiúscula: pratique Ё ё em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  196, 7, 'Ё', 'ё', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Traçar minúscula: pratique Ё ё em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  197, 7, 'Ё', 'ё', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar isoladamente: pratique Ё ё em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  198, 7, 'Ё', 'ё', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ёёёё ёёёё ёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Criar ritmo: pratique Ё ё em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  199, 7, 'Ё', 'ё', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ёа аё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com а: pratique Ё ё em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  200, 7, 'Ё', 'ё', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ёо оё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com о: pratique Ё ё em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  201, 7, 'Ё', 'ё', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ёи иё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com и: pratique Ё ё em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  202, 7, 'Ё', 'ё', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ём мё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com м: pratique Ё ё em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  203, 7, 'Ё', 'ё', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ёа ёо ёу ёи', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar sílabas: pratique Ё ё em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  204, 7, 'Ё', 'ё', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar palavra: pratique Ё ё em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  205, 7, 'Ё', 'ё', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «ёлка».', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar frase: pratique Ё ё em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  206, 7, 'Ё', 'ё', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Escrever por ditado: pratique Ё ё em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  207, 7, 'Ё', 'ё', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Treino de fluência: pratique Ё ё em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  208, 7, 'Ё', 'ё', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «ёлка».', 'ёлка',
  'árvore de Natal', 'iô', 'Produção livre: pratique Ё ё em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  209, 7, 'Ё', 'ё', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Observar proporções: pratique Ё ё em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  210, 7, 'Ё', 'ё', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Desenhar no ar: pratique Ё ё em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  211, 7, 'Ё', 'ё', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЁЁЁЁЁ', 'ёлка',
  'árvore de Natal', 'iô', 'Traçar maiúscula: pratique Ё ё em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  212, 7, 'Ё', 'ё', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Traçar minúscula: pratique Ё ё em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  213, 7, 'Ё', 'ё', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ёёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar isoladamente: pratique Ё ё em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  214, 7, 'Ё', 'ё', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ёёёё ёёёё ёёёё', 'ёлка',
  'árvore de Natal', 'iô', 'Criar ritmo: pratique Ё ё em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  215, 7, 'Ё', 'ё', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ёа аё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com а: pratique Ё ё em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  216, 7, 'Ё', 'ё', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ёо оё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com о: pratique Ё ё em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  217, 7, 'Ё', 'ё', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ёи иё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com и: pratique Ё ё em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  218, 7, 'Ё', 'ё', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ём мё', 'ёлка',
  'árvore de Natal', 'iô', 'Ligar com м: pratique Ё ё em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  219, 7, 'Ё', 'ё', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ёа ёо ёу ёи', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar sílabas: pratique Ё ё em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  220, 7, 'Ё', 'ё', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar palavra: pratique Ё ё em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  221, 7, 'Ё', 'ё', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «ёлка».', 'ёлка',
  'árvore de Natal', 'iô', 'Copiar frase: pratique Ё ё em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  222, 7, 'Ё', 'ё', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Escrever por ditado: pratique Ё ё em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  223, 7, 'Ё', 'ё', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'ёлка', 'ёлка',
  'árvore de Natal', 'iô', 'Treino de fluência: pratique Ё ё em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  224, 7, 'Ё', 'ё', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «ёлка».', 'ёлка',
  'árvore de Natal', 'iô', 'Produção livre: pratique Ё ё em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  225, 8, 'Ж', 'ж', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Observar proporções: pratique Ж ж em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  226, 8, 'Ж', 'ж', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Desenhar no ar: pratique Ж ж em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  227, 8, 'Ж', 'ж', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЖЖЖЖЖ', 'жизнь',
  'vida', 'j sonoro', 'Traçar maiúscula: pratique Ж ж em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  228, 8, 'Ж', 'ж', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Traçar minúscula: pratique Ж ж em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  229, 8, 'Ж', 'ж', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Copiar isoladamente: pratique Ж ж em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  230, 8, 'Ж', 'ж', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'жжжж жжжж жжжж', 'жизнь',
  'vida', 'j sonoro', 'Criar ritmo: pratique Ж ж em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  231, 8, 'Ж', 'ж', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'жа аж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com а: pratique Ж ж em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  232, 8, 'Ж', 'ж', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'жо ож', 'жизнь',
  'vida', 'j sonoro', 'Ligar com о: pratique Ж ж em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  233, 8, 'Ж', 'ж', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'жи иж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com и: pratique Ж ж em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  234, 8, 'Ж', 'ж', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'жм мж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com м: pratique Ж ж em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  235, 8, 'Ж', 'ж', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'жа жо жу жи', 'жизнь',
  'vida', 'j sonoro', 'Copiar sílabas: pratique Ж ж em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  236, 8, 'Ж', 'ж', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Copiar palavra: pratique Ж ж em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  237, 8, 'Ж', 'ж', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «жизнь».', 'жизнь',
  'vida', 'j sonoro', 'Copiar frase: pratique Ж ж em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  238, 8, 'Ж', 'ж', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Escrever por ditado: pratique Ж ж em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  239, 8, 'Ж', 'ж', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Treino de fluência: pratique Ж ж em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  240, 8, 'Ж', 'ж', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «жизнь».', 'жизнь',
  'vida', 'j sonoro', 'Produção livre: pratique Ж ж em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  241, 8, 'Ж', 'ж', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Observar proporções: pratique Ж ж em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  242, 8, 'Ж', 'ж', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Desenhar no ar: pratique Ж ж em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  243, 8, 'Ж', 'ж', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЖЖЖЖЖ', 'жизнь',
  'vida', 'j sonoro', 'Traçar maiúscula: pratique Ж ж em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  244, 8, 'Ж', 'ж', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Traçar minúscula: pratique Ж ж em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  245, 8, 'Ж', 'ж', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'жжжжж', 'жизнь',
  'vida', 'j sonoro', 'Copiar isoladamente: pratique Ж ж em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  246, 8, 'Ж', 'ж', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'жжжж жжжж жжжж', 'жизнь',
  'vida', 'j sonoro', 'Criar ritmo: pratique Ж ж em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  247, 8, 'Ж', 'ж', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'жа аж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com а: pratique Ж ж em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  248, 8, 'Ж', 'ж', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'жо ож', 'жизнь',
  'vida', 'j sonoro', 'Ligar com о: pratique Ж ж em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  249, 8, 'Ж', 'ж', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'жи иж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com и: pratique Ж ж em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  250, 8, 'Ж', 'ж', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'жм мж', 'жизнь',
  'vida', 'j sonoro', 'Ligar com м: pratique Ж ж em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  251, 8, 'Ж', 'ж', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'жа жо жу жи', 'жизнь',
  'vida', 'j sonoro', 'Copiar sílabas: pratique Ж ж em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  252, 8, 'Ж', 'ж', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Copiar palavra: pratique Ж ж em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  253, 8, 'Ж', 'ж', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «жизнь».', 'жизнь',
  'vida', 'j sonoro', 'Copiar frase: pratique Ж ж em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  254, 8, 'Ж', 'ж', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Escrever por ditado: pratique Ж ж em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  255, 8, 'Ж', 'ж', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'жизнь', 'жизнь',
  'vida', 'j sonoro', 'Treino de fluência: pratique Ж ж em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  256, 8, 'Ж', 'ж', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «жизнь».', 'жизнь',
  'vida', 'j sonoro', 'Produção livre: pratique Ж ж em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  257, 9, 'З', 'з', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Observar proporções: pratique З з em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  258, 9, 'З', 'з', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Desenhar no ar: pratique З з em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  259, 9, 'З', 'з', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЗЗЗЗЗ', 'зима',
  'inverno', 'z', 'Traçar maiúscula: pratique З з em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  260, 9, 'З', 'з', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Traçar minúscula: pratique З з em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  261, 9, 'З', 'з', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Copiar isoladamente: pratique З з em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  262, 9, 'З', 'з', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'зззз зззз зззз', 'зима',
  'inverno', 'z', 'Criar ritmo: pratique З з em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  263, 9, 'З', 'з', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'за аз', 'зима',
  'inverno', 'z', 'Ligar com а: pratique З з em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  264, 9, 'З', 'з', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'зо оз', 'зима',
  'inverno', 'z', 'Ligar com о: pratique З з em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  265, 9, 'З', 'з', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'зи из', 'зима',
  'inverno', 'z', 'Ligar com и: pratique З з em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  266, 9, 'З', 'з', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'зм мз', 'зима',
  'inverno', 'z', 'Ligar com м: pratique З з em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  267, 9, 'З', 'з', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'за зо зу зи', 'зима',
  'inverno', 'z', 'Copiar sílabas: pratique З з em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  268, 9, 'З', 'з', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'зима', 'зима',
  'inverno', 'z', 'Copiar palavra: pratique З з em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  269, 9, 'З', 'з', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «зима».', 'зима',
  'inverno', 'z', 'Copiar frase: pratique З з em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  270, 9, 'З', 'з', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'зима', 'зима',
  'inverno', 'z', 'Escrever por ditado: pratique З з em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  271, 9, 'З', 'з', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'зима', 'зима',
  'inverno', 'z', 'Treino de fluência: pratique З з em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  272, 9, 'З', 'з', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «зима».', 'зима',
  'inverno', 'z', 'Produção livre: pratique З з em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  273, 9, 'З', 'з', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Observar proporções: pratique З з em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  274, 9, 'З', 'з', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Desenhar no ar: pratique З з em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  275, 9, 'З', 'з', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЗЗЗЗЗ', 'зима',
  'inverno', 'z', 'Traçar maiúscula: pratique З з em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  276, 9, 'З', 'з', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Traçar minúscula: pratique З з em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  277, 9, 'З', 'з', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ззззз', 'зима',
  'inverno', 'z', 'Copiar isoladamente: pratique З з em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  278, 9, 'З', 'з', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'зззз зззз зззз', 'зима',
  'inverno', 'z', 'Criar ritmo: pratique З з em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  279, 9, 'З', 'з', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'за аз', 'зима',
  'inverno', 'z', 'Ligar com а: pratique З з em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  280, 9, 'З', 'з', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'зо оз', 'зима',
  'inverno', 'z', 'Ligar com о: pratique З з em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  281, 9, 'З', 'з', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'зи из', 'зима',
  'inverno', 'z', 'Ligar com и: pratique З з em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  282, 9, 'З', 'з', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'зм мз', 'зима',
  'inverno', 'z', 'Ligar com м: pratique З з em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  283, 9, 'З', 'з', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'за зо зу зи', 'зима',
  'inverno', 'z', 'Copiar sílabas: pratique З з em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  284, 9, 'З', 'з', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'зима', 'зима',
  'inverno', 'z', 'Copiar palavra: pratique З з em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  285, 9, 'З', 'з', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «зима».', 'зима',
  'inverno', 'z', 'Copiar frase: pratique З з em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  286, 9, 'З', 'з', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'зима', 'зима',
  'inverno', 'z', 'Escrever por ditado: pratique З з em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  287, 9, 'З', 'з', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'зима', 'зима',
  'inverno', 'z', 'Treino de fluência: pratique З з em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  288, 9, 'З', 'з', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «зима».', 'зима',
  'inverno', 'z', 'Produção livre: pratique З з em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  289, 10, 'И', 'и', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Observar proporções: pratique И и em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  290, 10, 'И', 'и', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Desenhar no ar: pratique И и em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  291, 10, 'И', 'и', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ИИИИИ', 'имя',
  'nome', 'i', 'Traçar maiúscula: pratique И и em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  292, 10, 'И', 'и', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Traçar minúscula: pratique И и em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  293, 10, 'И', 'и', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Copiar isoladamente: pratique И и em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  294, 10, 'И', 'и', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ииии ииии ииии', 'имя',
  'nome', 'i', 'Criar ritmo: pratique И и em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  295, 10, 'И', 'и', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'иа аи', 'имя',
  'nome', 'i', 'Ligar com а: pratique И и em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  296, 10, 'И', 'и', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ио ои', 'имя',
  'nome', 'i', 'Ligar com о: pratique И и em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  297, 10, 'И', 'и', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ии ии', 'имя',
  'nome', 'i', 'Ligar com и: pratique И и em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  298, 10, 'И', 'и', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'им ми', 'имя',
  'nome', 'i', 'Ligar com м: pratique И и em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  299, 10, 'И', 'и', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'иа ио иу ии', 'имя',
  'nome', 'i', 'Copiar sílabas: pratique И и em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  300, 10, 'И', 'и', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'имя', 'имя',
  'nome', 'i', 'Copiar palavra: pratique И и em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  301, 10, 'И', 'и', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «имя».', 'имя',
  'nome', 'i', 'Copiar frase: pratique И и em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  302, 10, 'И', 'и', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'имя', 'имя',
  'nome', 'i', 'Escrever por ditado: pratique И и em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  303, 10, 'И', 'и', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'имя', 'имя',
  'nome', 'i', 'Treino de fluência: pratique И и em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  304, 10, 'И', 'и', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «имя».', 'имя',
  'nome', 'i', 'Produção livre: pratique И и em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  305, 10, 'И', 'и', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Observar proporções: pratique И и em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  306, 10, 'И', 'и', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Desenhar no ar: pratique И и em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  307, 10, 'И', 'и', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ИИИИИ', 'имя',
  'nome', 'i', 'Traçar maiúscula: pratique И и em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  308, 10, 'И', 'и', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Traçar minúscula: pratique И и em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  309, 10, 'И', 'и', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'иииии', 'имя',
  'nome', 'i', 'Copiar isoladamente: pratique И и em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  310, 10, 'И', 'и', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ииии ииии ииии', 'имя',
  'nome', 'i', 'Criar ritmo: pratique И и em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  311, 10, 'И', 'и', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'иа аи', 'имя',
  'nome', 'i', 'Ligar com а: pratique И и em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  312, 10, 'И', 'и', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ио ои', 'имя',
  'nome', 'i', 'Ligar com о: pratique И и em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  313, 10, 'И', 'и', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ии ии', 'имя',
  'nome', 'i', 'Ligar com и: pratique И и em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  314, 10, 'И', 'и', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'им ми', 'имя',
  'nome', 'i', 'Ligar com м: pratique И и em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  315, 10, 'И', 'и', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'иа ио иу ии', 'имя',
  'nome', 'i', 'Copiar sílabas: pratique И и em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  316, 10, 'И', 'и', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'имя', 'имя',
  'nome', 'i', 'Copiar palavra: pratique И и em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  317, 10, 'И', 'и', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «имя».', 'имя',
  'nome', 'i', 'Copiar frase: pratique И и em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  318, 10, 'И', 'и', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'имя', 'имя',
  'nome', 'i', 'Escrever por ditado: pratique И и em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  319, 10, 'И', 'и', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'имя', 'имя',
  'nome', 'i', 'Treino de fluência: pratique И и em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  320, 10, 'И', 'и', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «имя».', 'имя',
  'nome', 'i', 'Produção livre: pratique И и em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  321, 11, 'Й', 'й', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Observar proporções: pratique Й й em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  322, 11, 'Й', 'й', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Desenhar no ar: pratique Й й em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  323, 11, 'Й', 'й', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЙЙЙЙЙ', 'йога',
  'ioga', 'i breve', 'Traçar maiúscula: pratique Й й em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  324, 11, 'Й', 'й', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Traçar minúscula: pratique Й й em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  325, 11, 'Й', 'й', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Copiar isoladamente: pratique Й й em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  326, 11, 'Й', 'й', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'йййй йййй йййй', 'йога',
  'ioga', 'i breve', 'Criar ritmo: pratique Й й em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  327, 11, 'Й', 'й', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'йа ай', 'йога',
  'ioga', 'i breve', 'Ligar com а: pratique Й й em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  328, 11, 'Й', 'й', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'йо ой', 'йога',
  'ioga', 'i breve', 'Ligar com о: pratique Й й em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  329, 11, 'Й', 'й', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'йи ий', 'йога',
  'ioga', 'i breve', 'Ligar com и: pratique Й й em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  330, 11, 'Й', 'й', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'йм мй', 'йога',
  'ioga', 'i breve', 'Ligar com м: pratique Й й em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  331, 11, 'Й', 'й', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'йа йо йу йи', 'йога',
  'ioga', 'i breve', 'Copiar sílabas: pratique Й й em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  332, 11, 'Й', 'й', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'йога', 'йога',
  'ioga', 'i breve', 'Copiar palavra: pratique Й й em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  333, 11, 'Й', 'й', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «йога».', 'йога',
  'ioga', 'i breve', 'Copiar frase: pratique Й й em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  334, 11, 'Й', 'й', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'йога', 'йога',
  'ioga', 'i breve', 'Escrever por ditado: pratique Й й em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  335, 11, 'Й', 'й', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'йога', 'йога',
  'ioga', 'i breve', 'Treino de fluência: pratique Й й em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  336, 11, 'Й', 'й', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «йога».', 'йога',
  'ioga', 'i breve', 'Produção livre: pratique Й й em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  337, 11, 'Й', 'й', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Observar proporções: pratique Й й em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  338, 11, 'Й', 'й', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Desenhar no ar: pratique Й й em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  339, 11, 'Й', 'й', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЙЙЙЙЙ', 'йога',
  'ioga', 'i breve', 'Traçar maiúscula: pratique Й й em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  340, 11, 'Й', 'й', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Traçar minúscula: pratique Й й em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  341, 11, 'Й', 'й', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ййййй', 'йога',
  'ioga', 'i breve', 'Copiar isoladamente: pratique Й й em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  342, 11, 'Й', 'й', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'йййй йййй йййй', 'йога',
  'ioga', 'i breve', 'Criar ritmo: pratique Й й em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  343, 11, 'Й', 'й', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'йа ай', 'йога',
  'ioga', 'i breve', 'Ligar com а: pratique Й й em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  344, 11, 'Й', 'й', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'йо ой', 'йога',
  'ioga', 'i breve', 'Ligar com о: pratique Й й em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  345, 11, 'Й', 'й', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'йи ий', 'йога',
  'ioga', 'i breve', 'Ligar com и: pratique Й й em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  346, 11, 'Й', 'й', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'йм мй', 'йога',
  'ioga', 'i breve', 'Ligar com м: pratique Й й em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  347, 11, 'Й', 'й', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'йа йо йу йи', 'йога',
  'ioga', 'i breve', 'Copiar sílabas: pratique Й й em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  348, 11, 'Й', 'й', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'йога', 'йога',
  'ioga', 'i breve', 'Copiar palavra: pratique Й й em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  349, 11, 'Й', 'й', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «йога».', 'йога',
  'ioga', 'i breve', 'Copiar frase: pratique Й й em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  350, 11, 'Й', 'й', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'йога', 'йога',
  'ioga', 'i breve', 'Escrever por ditado: pratique Й й em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  351, 11, 'Й', 'й', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'йога', 'йога',
  'ioga', 'i breve', 'Treino de fluência: pratique Й й em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  352, 11, 'Й', 'й', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «йога».', 'йога',
  'ioga', 'i breve', 'Produção livre: pratique Й й em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  353, 12, 'К', 'к', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Observar proporções: pratique К к em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  354, 12, 'К', 'к', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Desenhar no ar: pratique К к em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  355, 12, 'К', 'к', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ККККК', 'книга',
  'livro', 'k', 'Traçar maiúscula: pratique К к em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  356, 12, 'К', 'к', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Traçar minúscula: pratique К к em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  357, 12, 'К', 'к', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Copiar isoladamente: pratique К к em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  358, 12, 'К', 'к', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'кккк кккк кккк', 'книга',
  'livro', 'k', 'Criar ritmo: pratique К к em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  359, 12, 'К', 'к', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ка ак', 'книга',
  'livro', 'k', 'Ligar com а: pratique К к em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  360, 12, 'К', 'к', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ко ок', 'книга',
  'livro', 'k', 'Ligar com о: pratique К к em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  361, 12, 'К', 'к', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ки ик', 'книга',
  'livro', 'k', 'Ligar com и: pratique К к em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  362, 12, 'К', 'к', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'км мк', 'книга',
  'livro', 'k', 'Ligar com м: pratique К к em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  363, 12, 'К', 'к', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ка ко ку ки', 'книга',
  'livro', 'k', 'Copiar sílabas: pratique К к em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  364, 12, 'К', 'к', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'книга', 'книга',
  'livro', 'k', 'Copiar palavra: pratique К к em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  365, 12, 'К', 'к', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «книга».', 'книга',
  'livro', 'k', 'Copiar frase: pratique К к em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  366, 12, 'К', 'к', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'книга', 'книга',
  'livro', 'k', 'Escrever por ditado: pratique К к em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  367, 12, 'К', 'к', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'книга', 'книга',
  'livro', 'k', 'Treino de fluência: pratique К к em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  368, 12, 'К', 'к', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «книга».', 'книга',
  'livro', 'k', 'Produção livre: pratique К к em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  369, 12, 'К', 'к', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Observar proporções: pratique К к em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  370, 12, 'К', 'к', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Desenhar no ar: pratique К к em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  371, 12, 'К', 'к', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ККККК', 'книга',
  'livro', 'k', 'Traçar maiúscula: pratique К к em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  372, 12, 'К', 'к', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Traçar minúscula: pratique К к em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  373, 12, 'К', 'к', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ккккк', 'книга',
  'livro', 'k', 'Copiar isoladamente: pratique К к em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  374, 12, 'К', 'к', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'кккк кккк кккк', 'книга',
  'livro', 'k', 'Criar ritmo: pratique К к em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  375, 12, 'К', 'к', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ка ак', 'книга',
  'livro', 'k', 'Ligar com а: pratique К к em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  376, 12, 'К', 'к', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ко ок', 'книга',
  'livro', 'k', 'Ligar com о: pratique К к em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  377, 12, 'К', 'к', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ки ик', 'книга',
  'livro', 'k', 'Ligar com и: pratique К к em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  378, 12, 'К', 'к', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'км мк', 'книга',
  'livro', 'k', 'Ligar com м: pratique К к em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  379, 12, 'К', 'к', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ка ко ку ки', 'книга',
  'livro', 'k', 'Copiar sílabas: pratique К к em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  380, 12, 'К', 'к', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'книга', 'книга',
  'livro', 'k', 'Copiar palavra: pratique К к em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  381, 12, 'К', 'к', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «книга».', 'книга',
  'livro', 'k', 'Copiar frase: pratique К к em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  382, 12, 'К', 'к', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'книга', 'книга',
  'livro', 'k', 'Escrever por ditado: pratique К к em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  383, 12, 'К', 'к', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'книга', 'книга',
  'livro', 'k', 'Treino de fluência: pratique К к em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  384, 12, 'К', 'к', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «книга».', 'книга',
  'livro', 'k', 'Produção livre: pratique К к em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  385, 13, 'Л', 'л', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Observar proporções: pratique Л л em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  386, 13, 'Л', 'л', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Desenhar no ar: pratique Л л em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  387, 13, 'Л', 'л', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЛЛЛЛЛ', 'лампа',
  'lâmpada', 'l', 'Traçar maiúscula: pratique Л л em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  388, 13, 'Л', 'л', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Traçar minúscula: pratique Л л em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  389, 13, 'Л', 'л', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Copiar isoladamente: pratique Л л em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  390, 13, 'Л', 'л', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'лллл лллл лллл', 'лампа',
  'lâmpada', 'l', 'Criar ritmo: pratique Л л em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  391, 13, 'Л', 'л', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ла ал', 'лампа',
  'lâmpada', 'l', 'Ligar com а: pratique Л л em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  392, 13, 'Л', 'л', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ло ол', 'лампа',
  'lâmpada', 'l', 'Ligar com о: pratique Л л em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  393, 13, 'Л', 'л', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ли ил', 'лампа',
  'lâmpada', 'l', 'Ligar com и: pratique Л л em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  394, 13, 'Л', 'л', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'лм мл', 'лампа',
  'lâmpada', 'l', 'Ligar com м: pratique Л л em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  395, 13, 'Л', 'л', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ла ло лу ли', 'лампа',
  'lâmpada', 'l', 'Copiar sílabas: pratique Л л em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  396, 13, 'Л', 'л', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'лампа', 'лампа',
  'lâmpada', 'l', 'Copiar palavra: pratique Л л em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  397, 13, 'Л', 'л', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «лампа».', 'лампа',
  'lâmpada', 'l', 'Copiar frase: pratique Л л em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  398, 13, 'Л', 'л', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'лампа', 'лампа',
  'lâmpada', 'l', 'Escrever por ditado: pratique Л л em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  399, 13, 'Л', 'л', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'лампа', 'лампа',
  'lâmpada', 'l', 'Treino de fluência: pratique Л л em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  400, 13, 'Л', 'л', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «лампа».', 'лампа',
  'lâmpada', 'l', 'Produção livre: pratique Л л em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  401, 13, 'Л', 'л', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Observar proporções: pratique Л л em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  402, 13, 'Л', 'л', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Desenhar no ar: pratique Л л em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  403, 13, 'Л', 'л', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЛЛЛЛЛ', 'лампа',
  'lâmpada', 'l', 'Traçar maiúscula: pratique Л л em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  404, 13, 'Л', 'л', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Traçar minúscula: pratique Л л em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  405, 13, 'Л', 'л', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ллллл', 'лампа',
  'lâmpada', 'l', 'Copiar isoladamente: pratique Л л em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  406, 13, 'Л', 'л', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'лллл лллл лллл', 'лампа',
  'lâmpada', 'l', 'Criar ritmo: pratique Л л em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  407, 13, 'Л', 'л', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ла ал', 'лампа',
  'lâmpada', 'l', 'Ligar com а: pratique Л л em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  408, 13, 'Л', 'л', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ло ол', 'лампа',
  'lâmpada', 'l', 'Ligar com о: pratique Л л em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  409, 13, 'Л', 'л', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ли ил', 'лампа',
  'lâmpada', 'l', 'Ligar com и: pratique Л л em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  410, 13, 'Л', 'л', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'лм мл', 'лампа',
  'lâmpada', 'l', 'Ligar com м: pratique Л л em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  411, 13, 'Л', 'л', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ла ло лу ли', 'лампа',
  'lâmpada', 'l', 'Copiar sílabas: pratique Л л em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  412, 13, 'Л', 'л', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'лампа', 'лампа',
  'lâmpada', 'l', 'Copiar palavra: pratique Л л em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  413, 13, 'Л', 'л', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «лампа».', 'лампа',
  'lâmpada', 'l', 'Copiar frase: pratique Л л em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  414, 13, 'Л', 'л', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'лампа', 'лампа',
  'lâmpada', 'l', 'Escrever por ditado: pratique Л л em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  415, 13, 'Л', 'л', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'лампа', 'лампа',
  'lâmpada', 'l', 'Treino de fluência: pratique Л л em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  416, 13, 'Л', 'л', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «лампа».', 'лампа',
  'lâmpada', 'l', 'Produção livre: pratique Л л em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  417, 14, 'М', 'м', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Observar proporções: pratique М м em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  418, 14, 'М', 'м', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Desenhar no ar: pratique М м em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  419, 14, 'М', 'м', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'МММММ', 'мама',
  'mamãe', 'm', 'Traçar maiúscula: pratique М м em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  420, 14, 'М', 'м', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Traçar minúscula: pratique М м em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  421, 14, 'М', 'м', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Copiar isoladamente: pratique М м em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  422, 14, 'М', 'м', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'мммм мммм мммм', 'мама',
  'mamãe', 'm', 'Criar ritmo: pratique М м em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  423, 14, 'М', 'м', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ма ам', 'мама',
  'mamãe', 'm', 'Ligar com а: pratique М м em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  424, 14, 'М', 'м', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'мо ом', 'мама',
  'mamãe', 'm', 'Ligar com о: pratique М м em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  425, 14, 'М', 'м', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ми им', 'мама',
  'mamãe', 'm', 'Ligar com и: pratique М м em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  426, 14, 'М', 'м', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'мм мм', 'мама',
  'mamãe', 'm', 'Ligar com м: pratique М м em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  427, 14, 'М', 'м', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ма мо му ми', 'мама',
  'mamãe', 'm', 'Copiar sílabas: pratique М м em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  428, 14, 'М', 'м', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'мама', 'мама',
  'mamãe', 'm', 'Copiar palavra: pratique М м em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  429, 14, 'М', 'м', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «мама».', 'мама',
  'mamãe', 'm', 'Copiar frase: pratique М м em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  430, 14, 'М', 'м', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'мама', 'мама',
  'mamãe', 'm', 'Escrever por ditado: pratique М м em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  431, 14, 'М', 'м', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'мама', 'мама',
  'mamãe', 'm', 'Treino de fluência: pratique М м em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  432, 14, 'М', 'м', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «мама».', 'мама',
  'mamãe', 'm', 'Produção livre: pratique М м em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  433, 14, 'М', 'м', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Observar proporções: pratique М м em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  434, 14, 'М', 'м', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Desenhar no ar: pratique М м em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  435, 14, 'М', 'м', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'МММММ', 'мама',
  'mamãe', 'm', 'Traçar maiúscula: pratique М м em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  436, 14, 'М', 'м', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Traçar minúscula: pratique М м em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  437, 14, 'М', 'м', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ммммм', 'мама',
  'mamãe', 'm', 'Copiar isoladamente: pratique М м em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  438, 14, 'М', 'м', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'мммм мммм мммм', 'мама',
  'mamãe', 'm', 'Criar ritmo: pratique М м em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  439, 14, 'М', 'м', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ма ам', 'мама',
  'mamãe', 'm', 'Ligar com а: pratique М м em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  440, 14, 'М', 'м', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'мо ом', 'мама',
  'mamãe', 'm', 'Ligar com о: pratique М м em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  441, 14, 'М', 'м', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ми им', 'мама',
  'mamãe', 'm', 'Ligar com и: pratique М м em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  442, 14, 'М', 'м', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'мм мм', 'мама',
  'mamãe', 'm', 'Ligar com м: pratique М м em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  443, 14, 'М', 'м', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ма мо му ми', 'мама',
  'mamãe', 'm', 'Copiar sílabas: pratique М м em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  444, 14, 'М', 'м', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'мама', 'мама',
  'mamãe', 'm', 'Copiar palavra: pratique М м em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  445, 14, 'М', 'м', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «мама».', 'мама',
  'mamãe', 'm', 'Copiar frase: pratique М м em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  446, 14, 'М', 'м', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'мама', 'мама',
  'mamãe', 'm', 'Escrever por ditado: pratique М м em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  447, 14, 'М', 'м', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'мама', 'мама',
  'mamãe', 'm', 'Treino de fluência: pratique М м em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  448, 14, 'М', 'м', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «мама».', 'мама',
  'mamãe', 'm', 'Produção livre: pratique М м em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  449, 15, 'Н', 'н', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Observar proporções: pratique Н н em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  450, 15, 'Н', 'н', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Desenhar no ar: pratique Н н em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  451, 15, 'Н', 'н', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ННННН', 'ночь',
  'noite', 'n', 'Traçar maiúscula: pratique Н н em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  452, 15, 'Н', 'н', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Traçar minúscula: pratique Н н em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  453, 15, 'Н', 'н', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Copiar isoladamente: pratique Н н em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  454, 15, 'Н', 'н', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'нннн нннн нннн', 'ночь',
  'noite', 'n', 'Criar ritmo: pratique Н н em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  455, 15, 'Н', 'н', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'на ан', 'ночь',
  'noite', 'n', 'Ligar com а: pratique Н н em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  456, 15, 'Н', 'н', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'но он', 'ночь',
  'noite', 'n', 'Ligar com о: pratique Н н em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  457, 15, 'Н', 'н', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ни ин', 'ночь',
  'noite', 'n', 'Ligar com и: pratique Н н em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  458, 15, 'Н', 'н', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'нм мн', 'ночь',
  'noite', 'n', 'Ligar com м: pratique Н н em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  459, 15, 'Н', 'н', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'на но ну ни', 'ночь',
  'noite', 'n', 'Copiar sílabas: pratique Н н em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  460, 15, 'Н', 'н', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'ночь', 'ночь',
  'noite', 'n', 'Copiar palavra: pratique Н н em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  461, 15, 'Н', 'н', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «ночь».', 'ночь',
  'noite', 'n', 'Copiar frase: pratique Н н em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  462, 15, 'Н', 'н', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'ночь', 'ночь',
  'noite', 'n', 'Escrever por ditado: pratique Н н em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  463, 15, 'Н', 'н', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'ночь', 'ночь',
  'noite', 'n', 'Treino de fluência: pratique Н н em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  464, 15, 'Н', 'н', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «ночь».', 'ночь',
  'noite', 'n', 'Produção livre: pratique Н н em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  465, 15, 'Н', 'н', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Observar proporções: pratique Н н em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  466, 15, 'Н', 'н', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Desenhar no ar: pratique Н н em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  467, 15, 'Н', 'н', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ННННН', 'ночь',
  'noite', 'n', 'Traçar maiúscula: pratique Н н em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  468, 15, 'Н', 'н', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Traçar minúscula: pratique Н н em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  469, 15, 'Н', 'н', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ннннн', 'ночь',
  'noite', 'n', 'Copiar isoladamente: pratique Н н em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  470, 15, 'Н', 'н', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'нннн нннн нннн', 'ночь',
  'noite', 'n', 'Criar ritmo: pratique Н н em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  471, 15, 'Н', 'н', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'на ан', 'ночь',
  'noite', 'n', 'Ligar com а: pratique Н н em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  472, 15, 'Н', 'н', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'но он', 'ночь',
  'noite', 'n', 'Ligar com о: pratique Н н em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  473, 15, 'Н', 'н', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ни ин', 'ночь',
  'noite', 'n', 'Ligar com и: pratique Н н em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  474, 15, 'Н', 'н', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'нм мн', 'ночь',
  'noite', 'n', 'Ligar com м: pratique Н н em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  475, 15, 'Н', 'н', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'на но ну ни', 'ночь',
  'noite', 'n', 'Copiar sílabas: pratique Н н em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  476, 15, 'Н', 'н', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'ночь', 'ночь',
  'noite', 'n', 'Copiar palavra: pratique Н н em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  477, 15, 'Н', 'н', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «ночь».', 'ночь',
  'noite', 'n', 'Copiar frase: pratique Н н em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  478, 15, 'Н', 'н', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'ночь', 'ночь',
  'noite', 'n', 'Escrever por ditado: pratique Н н em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  479, 15, 'Н', 'н', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'ночь', 'ночь',
  'noite', 'n', 'Treino de fluência: pratique Н н em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  480, 15, 'Н', 'н', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «ночь».', 'ночь',
  'noite', 'n', 'Produção livre: pratique Н н em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  481, 16, 'О', 'о', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Observar proporções: pratique О о em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  482, 16, 'О', 'о', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Desenhar no ar: pratique О о em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  483, 16, 'О', 'о', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ООООО', 'окно',
  'janela', 'o', 'Traçar maiúscula: pratique О о em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  484, 16, 'О', 'о', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Traçar minúscula: pratique О о em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  485, 16, 'О', 'о', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Copiar isoladamente: pratique О о em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  486, 16, 'О', 'о', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'оооо оооо оооо', 'окно',
  'janela', 'o', 'Criar ritmo: pratique О о em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  487, 16, 'О', 'о', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'оа ао', 'окно',
  'janela', 'o', 'Ligar com а: pratique О о em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  488, 16, 'О', 'о', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'оо оо', 'окно',
  'janela', 'o', 'Ligar com о: pratique О о em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  489, 16, 'О', 'о', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ои ио', 'окно',
  'janela', 'o', 'Ligar com и: pratique О о em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  490, 16, 'О', 'о', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ом мо', 'окно',
  'janela', 'o', 'Ligar com м: pratique О о em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  491, 16, 'О', 'о', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'оа оо оу ои', 'окно',
  'janela', 'o', 'Copiar sílabas: pratique О о em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  492, 16, 'О', 'о', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'окно', 'окно',
  'janela', 'o', 'Copiar palavra: pratique О о em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  493, 16, 'О', 'о', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «окно».', 'окно',
  'janela', 'o', 'Copiar frase: pratique О о em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  494, 16, 'О', 'о', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'окно', 'окно',
  'janela', 'o', 'Escrever por ditado: pratique О о em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  495, 16, 'О', 'о', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'окно', 'окно',
  'janela', 'o', 'Treino de fluência: pratique О о em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  496, 16, 'О', 'о', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «окно».', 'окно',
  'janela', 'o', 'Produção livre: pratique О о em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  497, 16, 'О', 'о', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Observar proporções: pratique О о em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  498, 16, 'О', 'о', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Desenhar no ar: pratique О о em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  499, 16, 'О', 'о', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ООООО', 'окно',
  'janela', 'o', 'Traçar maiúscula: pratique О о em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  500, 16, 'О', 'о', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Traçar minúscula: pratique О о em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  501, 16, 'О', 'о', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ооооо', 'окно',
  'janela', 'o', 'Copiar isoladamente: pratique О о em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  502, 16, 'О', 'о', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'оооо оооо оооо', 'окно',
  'janela', 'o', 'Criar ritmo: pratique О о em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  503, 16, 'О', 'о', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'оа ао', 'окно',
  'janela', 'o', 'Ligar com а: pratique О о em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  504, 16, 'О', 'о', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'оо оо', 'окно',
  'janela', 'o', 'Ligar com о: pratique О о em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  505, 16, 'О', 'о', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ои ио', 'окно',
  'janela', 'o', 'Ligar com и: pratique О о em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  506, 16, 'О', 'о', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ом мо', 'окно',
  'janela', 'o', 'Ligar com м: pratique О о em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  507, 16, 'О', 'о', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'оа оо оу ои', 'окно',
  'janela', 'o', 'Copiar sílabas: pratique О о em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  508, 16, 'О', 'о', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'окно', 'окно',
  'janela', 'o', 'Copiar palavra: pratique О о em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  509, 16, 'О', 'о', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «окно».', 'окно',
  'janela', 'o', 'Copiar frase: pratique О о em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  510, 16, 'О', 'о', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'окно', 'окно',
  'janela', 'o', 'Escrever por ditado: pratique О о em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  511, 16, 'О', 'о', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'окно', 'окно',
  'janela', 'o', 'Treino de fluência: pratique О о em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  512, 16, 'О', 'о', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «окно».', 'окно',
  'janela', 'o', 'Produção livre: pratique О о em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  513, 17, 'П', 'п', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Observar proporções: pratique П п em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  514, 17, 'П', 'п', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Desenhar no ar: pratique П п em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  515, 17, 'П', 'п', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ППППП', 'папа',
  'papai', 'p', 'Traçar maiúscula: pratique П п em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  516, 17, 'П', 'п', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Traçar minúscula: pratique П п em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  517, 17, 'П', 'п', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Copiar isoladamente: pratique П п em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  518, 17, 'П', 'п', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'пппп пппп пппп', 'папа',
  'papai', 'p', 'Criar ritmo: pratique П п em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  519, 17, 'П', 'п', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'па ап', 'папа',
  'papai', 'p', 'Ligar com а: pratique П п em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  520, 17, 'П', 'п', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'по оп', 'папа',
  'papai', 'p', 'Ligar com о: pratique П п em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  521, 17, 'П', 'п', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'пи ип', 'папа',
  'papai', 'p', 'Ligar com и: pratique П п em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  522, 17, 'П', 'п', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'пм мп', 'папа',
  'papai', 'p', 'Ligar com м: pratique П п em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  523, 17, 'П', 'п', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'па по пу пи', 'папа',
  'papai', 'p', 'Copiar sílabas: pratique П п em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  524, 17, 'П', 'п', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'папа', 'папа',
  'papai', 'p', 'Copiar palavra: pratique П п em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  525, 17, 'П', 'п', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «папа».', 'папа',
  'papai', 'p', 'Copiar frase: pratique П п em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  526, 17, 'П', 'п', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'папа', 'папа',
  'papai', 'p', 'Escrever por ditado: pratique П п em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  527, 17, 'П', 'п', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'папа', 'папа',
  'papai', 'p', 'Treino de fluência: pratique П п em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  528, 17, 'П', 'п', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «папа».', 'папа',
  'papai', 'p', 'Produção livre: pratique П п em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  529, 17, 'П', 'п', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Observar proporções: pratique П п em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  530, 17, 'П', 'п', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Desenhar no ar: pratique П п em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  531, 17, 'П', 'п', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ППППП', 'папа',
  'papai', 'p', 'Traçar maiúscula: pratique П п em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  532, 17, 'П', 'п', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Traçar minúscula: pratique П п em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  533, 17, 'П', 'п', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ппппп', 'папа',
  'papai', 'p', 'Copiar isoladamente: pratique П п em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  534, 17, 'П', 'п', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'пппп пппп пппп', 'папа',
  'papai', 'p', 'Criar ritmo: pratique П п em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  535, 17, 'П', 'п', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'па ап', 'папа',
  'papai', 'p', 'Ligar com а: pratique П п em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  536, 17, 'П', 'п', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'по оп', 'папа',
  'papai', 'p', 'Ligar com о: pratique П п em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  537, 17, 'П', 'п', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'пи ип', 'папа',
  'papai', 'p', 'Ligar com и: pratique П п em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  538, 17, 'П', 'п', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'пм мп', 'папа',
  'papai', 'p', 'Ligar com м: pratique П п em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  539, 17, 'П', 'п', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'па по пу пи', 'папа',
  'papai', 'p', 'Copiar sílabas: pratique П п em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  540, 17, 'П', 'п', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'папа', 'папа',
  'papai', 'p', 'Copiar palavra: pratique П п em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  541, 17, 'П', 'п', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «папа».', 'папа',
  'papai', 'p', 'Copiar frase: pratique П п em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  542, 17, 'П', 'п', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'папа', 'папа',
  'papai', 'p', 'Escrever por ditado: pratique П п em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  543, 17, 'П', 'п', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'папа', 'папа',
  'papai', 'p', 'Treino de fluência: pratique П п em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  544, 17, 'П', 'п', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «папа».', 'папа',
  'papai', 'p', 'Produção livre: pratique П п em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  545, 18, 'Р', 'р', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Observar proporções: pratique Р р em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  546, 18, 'Р', 'р', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Desenhar no ar: pratique Р р em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  547, 18, 'Р', 'р', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'РРРРР', 'Россия',
  'Rússia', 'r vibrante', 'Traçar maiúscula: pratique Р р em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  548, 18, 'Р', 'р', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Traçar minúscula: pratique Р р em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  549, 18, 'Р', 'р', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Copiar isoladamente: pratique Р р em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  550, 18, 'Р', 'р', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'рррр рррр рррр', 'Россия',
  'Rússia', 'r vibrante', 'Criar ritmo: pratique Р р em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  551, 18, 'Р', 'р', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ра ар', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com а: pratique Р р em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  552, 18, 'Р', 'р', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ро ор', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com о: pratique Р р em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  553, 18, 'Р', 'р', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ри ир', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com и: pratique Р р em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  554, 18, 'Р', 'р', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'рм мр', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com м: pratique Р р em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  555, 18, 'Р', 'р', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ра ро ру ри', 'Россия',
  'Rússia', 'r vibrante', 'Copiar sílabas: pratique Р р em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  556, 18, 'Р', 'р', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Copiar palavra: pratique Р р em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  557, 18, 'Р', 'р', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «Россия».', 'Россия',
  'Rússia', 'r vibrante', 'Copiar frase: pratique Р р em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  558, 18, 'Р', 'р', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Escrever por ditado: pratique Р р em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  559, 18, 'Р', 'р', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Treino de fluência: pratique Р р em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  560, 18, 'Р', 'р', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «Россия».', 'Россия',
  'Rússia', 'r vibrante', 'Produção livre: pratique Р р em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  561, 18, 'Р', 'р', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Observar proporções: pratique Р р em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  562, 18, 'Р', 'р', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Desenhar no ar: pratique Р р em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  563, 18, 'Р', 'р', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'РРРРР', 'Россия',
  'Rússia', 'r vibrante', 'Traçar maiúscula: pratique Р р em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  564, 18, 'Р', 'р', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Traçar minúscula: pratique Р р em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  565, 18, 'Р', 'р', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ррррр', 'Россия',
  'Rússia', 'r vibrante', 'Copiar isoladamente: pratique Р р em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  566, 18, 'Р', 'р', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'рррр рррр рррр', 'Россия',
  'Rússia', 'r vibrante', 'Criar ritmo: pratique Р р em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  567, 18, 'Р', 'р', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ра ар', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com а: pratique Р р em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  568, 18, 'Р', 'р', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ро ор', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com о: pratique Р р em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  569, 18, 'Р', 'р', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ри ир', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com и: pratique Р р em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  570, 18, 'Р', 'р', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'рм мр', 'Россия',
  'Rússia', 'r vibrante', 'Ligar com м: pratique Р р em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  571, 18, 'Р', 'р', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ра ро ру ри', 'Россия',
  'Rússia', 'r vibrante', 'Copiar sílabas: pratique Р р em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  572, 18, 'Р', 'р', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Copiar palavra: pratique Р р em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  573, 18, 'Р', 'р', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «Россия».', 'Россия',
  'Rússia', 'r vibrante', 'Copiar frase: pratique Р р em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  574, 18, 'Р', 'р', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Escrever por ditado: pratique Р р em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  575, 18, 'Р', 'р', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'Россия', 'Россия',
  'Rússia', 'r vibrante', 'Treino de fluência: pratique Р р em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  576, 18, 'Р', 'р', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «Россия».', 'Россия',
  'Rússia', 'r vibrante', 'Produção livre: pratique Р р em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  577, 19, 'С', 'с', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Observar proporções: pratique С с em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  578, 19, 'С', 'с', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Desenhar no ar: pratique С с em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  579, 19, 'С', 'с', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ССССС', 'собака',
  'cachorro', 's', 'Traçar maiúscula: pratique С с em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  580, 19, 'С', 'с', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Traçar minúscula: pratique С с em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  581, 19, 'С', 'с', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Copiar isoladamente: pratique С с em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  582, 19, 'С', 'с', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'сссс сссс сссс', 'собака',
  'cachorro', 's', 'Criar ritmo: pratique С с em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  583, 19, 'С', 'с', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'са ас', 'собака',
  'cachorro', 's', 'Ligar com а: pratique С с em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  584, 19, 'С', 'с', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'со ос', 'собака',
  'cachorro', 's', 'Ligar com о: pratique С с em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  585, 19, 'С', 'с', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'си ис', 'собака',
  'cachorro', 's', 'Ligar com и: pratique С с em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  586, 19, 'С', 'с', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'см мс', 'собака',
  'cachorro', 's', 'Ligar com м: pratique С с em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  587, 19, 'С', 'с', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'са со су си', 'собака',
  'cachorro', 's', 'Copiar sílabas: pratique С с em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  588, 19, 'С', 'с', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'собака', 'собака',
  'cachorro', 's', 'Copiar palavra: pratique С с em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  589, 19, 'С', 'с', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «собака».', 'собака',
  'cachorro', 's', 'Copiar frase: pratique С с em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  590, 19, 'С', 'с', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'собака', 'собака',
  'cachorro', 's', 'Escrever por ditado: pratique С с em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  591, 19, 'С', 'с', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'собака', 'собака',
  'cachorro', 's', 'Treino de fluência: pratique С с em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  592, 19, 'С', 'с', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «собака».', 'собака',
  'cachorro', 's', 'Produção livre: pratique С с em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  593, 19, 'С', 'с', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Observar proporções: pratique С с em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  594, 19, 'С', 'с', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Desenhar no ar: pratique С с em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  595, 19, 'С', 'с', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ССССС', 'собака',
  'cachorro', 's', 'Traçar maiúscula: pratique С с em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  596, 19, 'С', 'с', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Traçar minúscula: pratique С с em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  597, 19, 'С', 'с', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ссссс', 'собака',
  'cachorro', 's', 'Copiar isoladamente: pratique С с em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  598, 19, 'С', 'с', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'сссс сссс сссс', 'собака',
  'cachorro', 's', 'Criar ritmo: pratique С с em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  599, 19, 'С', 'с', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'са ас', 'собака',
  'cachorro', 's', 'Ligar com а: pratique С с em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  600, 19, 'С', 'с', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'со ос', 'собака',
  'cachorro', 's', 'Ligar com о: pratique С с em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  601, 19, 'С', 'с', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'си ис', 'собака',
  'cachorro', 's', 'Ligar com и: pratique С с em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  602, 19, 'С', 'с', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'см мс', 'собака',
  'cachorro', 's', 'Ligar com м: pratique С с em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  603, 19, 'С', 'с', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'са со су си', 'собака',
  'cachorro', 's', 'Copiar sílabas: pratique С с em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  604, 19, 'С', 'с', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'собака', 'собака',
  'cachorro', 's', 'Copiar palavra: pratique С с em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  605, 19, 'С', 'с', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «собака».', 'собака',
  'cachorro', 's', 'Copiar frase: pratique С с em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  606, 19, 'С', 'с', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'собака', 'собака',
  'cachorro', 's', 'Escrever por ditado: pratique С с em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  607, 19, 'С', 'с', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'собака', 'собака',
  'cachorro', 's', 'Treino de fluência: pratique С с em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  608, 19, 'С', 'с', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «собака».', 'собака',
  'cachorro', 's', 'Produção livre: pratique С с em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  609, 20, 'Т', 'т', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Observar proporções: pratique Т т em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  610, 20, 'Т', 'т', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Desenhar no ar: pratique Т т em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  611, 20, 'Т', 'т', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ТТТТТ', 'театр',
  'teatro', 't', 'Traçar maiúscula: pratique Т т em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  612, 20, 'Т', 'т', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Traçar minúscula: pratique Т т em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  613, 20, 'Т', 'т', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Copiar isoladamente: pratique Т т em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  614, 20, 'Т', 'т', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'тттт тттт тттт', 'театр',
  'teatro', 't', 'Criar ritmo: pratique Т т em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  615, 20, 'Т', 'т', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'та ат', 'театр',
  'teatro', 't', 'Ligar com а: pratique Т т em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  616, 20, 'Т', 'т', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'то от', 'театр',
  'teatro', 't', 'Ligar com о: pratique Т т em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  617, 20, 'Т', 'т', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ти ит', 'театр',
  'teatro', 't', 'Ligar com и: pratique Т т em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  618, 20, 'Т', 'т', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'тм мт', 'театр',
  'teatro', 't', 'Ligar com м: pratique Т т em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  619, 20, 'Т', 'т', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'та то ту ти', 'театр',
  'teatro', 't', 'Copiar sílabas: pratique Т т em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  620, 20, 'Т', 'т', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'театр', 'театр',
  'teatro', 't', 'Copiar palavra: pratique Т т em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  621, 20, 'Т', 'т', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «театр».', 'театр',
  'teatro', 't', 'Copiar frase: pratique Т т em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  622, 20, 'Т', 'т', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'театр', 'театр',
  'teatro', 't', 'Escrever por ditado: pratique Т т em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  623, 20, 'Т', 'т', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'театр', 'театр',
  'teatro', 't', 'Treino de fluência: pratique Т т em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  624, 20, 'Т', 'т', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «театр».', 'театр',
  'teatro', 't', 'Produção livre: pratique Т т em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  625, 20, 'Т', 'т', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Observar proporções: pratique Т т em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  626, 20, 'Т', 'т', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Desenhar no ar: pratique Т т em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  627, 20, 'Т', 'т', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ТТТТТ', 'театр',
  'teatro', 't', 'Traçar maiúscula: pratique Т т em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  628, 20, 'Т', 'т', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Traçar minúscula: pratique Т т em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  629, 20, 'Т', 'т', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ттттт', 'театр',
  'teatro', 't', 'Copiar isoladamente: pratique Т т em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  630, 20, 'Т', 'т', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'тттт тттт тттт', 'театр',
  'teatro', 't', 'Criar ritmo: pratique Т т em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  631, 20, 'Т', 'т', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'та ат', 'театр',
  'teatro', 't', 'Ligar com а: pratique Т т em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  632, 20, 'Т', 'т', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'то от', 'театр',
  'teatro', 't', 'Ligar com о: pratique Т т em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  633, 20, 'Т', 'т', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ти ит', 'театр',
  'teatro', 't', 'Ligar com и: pratique Т т em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  634, 20, 'Т', 'т', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'тм мт', 'театр',
  'teatro', 't', 'Ligar com м: pratique Т т em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  635, 20, 'Т', 'т', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'та то ту ти', 'театр',
  'teatro', 't', 'Copiar sílabas: pratique Т т em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  636, 20, 'Т', 'т', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'театр', 'театр',
  'teatro', 't', 'Copiar palavra: pratique Т т em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  637, 20, 'Т', 'т', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «театр».', 'театр',
  'teatro', 't', 'Copiar frase: pratique Т т em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  638, 20, 'Т', 'т', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'театр', 'театр',
  'teatro', 't', 'Escrever por ditado: pratique Т т em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  639, 20, 'Т', 'т', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'театр', 'театр',
  'teatro', 't', 'Treino de fluência: pratique Т т em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  640, 20, 'Т', 'т', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «театр».', 'театр',
  'teatro', 't', 'Produção livre: pratique Т т em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  641, 21, 'У', 'у', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Observar proporções: pratique У у em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  642, 21, 'У', 'у', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Desenhar no ar: pratique У у em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  643, 21, 'У', 'у', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'УУУУУ', 'утро',
  'manhã', 'u', 'Traçar maiúscula: pratique У у em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  644, 21, 'У', 'у', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Traçar minúscula: pratique У у em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  645, 21, 'У', 'у', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Copiar isoladamente: pratique У у em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  646, 21, 'У', 'у', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'уууу уууу уууу', 'утро',
  'manhã', 'u', 'Criar ritmo: pratique У у em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  647, 21, 'У', 'у', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'уа ау', 'утро',
  'manhã', 'u', 'Ligar com а: pratique У у em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  648, 21, 'У', 'у', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'уо оу', 'утро',
  'manhã', 'u', 'Ligar com о: pratique У у em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  649, 21, 'У', 'у', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'уи иу', 'утро',
  'manhã', 'u', 'Ligar com и: pratique У у em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  650, 21, 'У', 'у', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ум му', 'утро',
  'manhã', 'u', 'Ligar com м: pratique У у em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  651, 21, 'У', 'у', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'уа уо уу уи', 'утро',
  'manhã', 'u', 'Copiar sílabas: pratique У у em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  652, 21, 'У', 'у', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'утро', 'утро',
  'manhã', 'u', 'Copiar palavra: pratique У у em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  653, 21, 'У', 'у', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «утро».', 'утро',
  'manhã', 'u', 'Copiar frase: pratique У у em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  654, 21, 'У', 'у', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'утро', 'утро',
  'manhã', 'u', 'Escrever por ditado: pratique У у em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  655, 21, 'У', 'у', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'утро', 'утро',
  'manhã', 'u', 'Treino de fluência: pratique У у em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  656, 21, 'У', 'у', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «утро».', 'утро',
  'manhã', 'u', 'Produção livre: pratique У у em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  657, 21, 'У', 'у', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Observar proporções: pratique У у em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  658, 21, 'У', 'у', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Desenhar no ar: pratique У у em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  659, 21, 'У', 'у', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'УУУУУ', 'утро',
  'manhã', 'u', 'Traçar maiúscula: pratique У у em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  660, 21, 'У', 'у', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Traçar minúscula: pratique У у em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  661, 21, 'У', 'у', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ууууу', 'утро',
  'manhã', 'u', 'Copiar isoladamente: pratique У у em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  662, 21, 'У', 'у', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'уууу уууу уууу', 'утро',
  'manhã', 'u', 'Criar ritmo: pratique У у em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  663, 21, 'У', 'у', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'уа ау', 'утро',
  'manhã', 'u', 'Ligar com а: pratique У у em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  664, 21, 'У', 'у', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'уо оу', 'утро',
  'manhã', 'u', 'Ligar com о: pratique У у em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  665, 21, 'У', 'у', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'уи иу', 'утро',
  'manhã', 'u', 'Ligar com и: pratique У у em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  666, 21, 'У', 'у', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ум му', 'утро',
  'manhã', 'u', 'Ligar com м: pratique У у em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  667, 21, 'У', 'у', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'уа уо уу уи', 'утро',
  'manhã', 'u', 'Copiar sílabas: pratique У у em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  668, 21, 'У', 'у', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'утро', 'утро',
  'manhã', 'u', 'Copiar palavra: pratique У у em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  669, 21, 'У', 'у', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «утро».', 'утро',
  'manhã', 'u', 'Copiar frase: pratique У у em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  670, 21, 'У', 'у', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'утро', 'утро',
  'manhã', 'u', 'Escrever por ditado: pratique У у em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  671, 21, 'У', 'у', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'утро', 'утро',
  'manhã', 'u', 'Treino de fluência: pratique У у em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  672, 21, 'У', 'у', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «утро».', 'утро',
  'manhã', 'u', 'Produção livre: pratique У у em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  673, 22, 'Ф', 'ф', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Observar proporções: pratique Ф ф em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  674, 22, 'Ф', 'ф', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Desenhar no ar: pratique Ф ф em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  675, 22, 'Ф', 'ф', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ФФФФФ', 'фото',
  'foto', 'f', 'Traçar maiúscula: pratique Ф ф em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  676, 22, 'Ф', 'ф', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Traçar minúscula: pratique Ф ф em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  677, 22, 'Ф', 'ф', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Copiar isoladamente: pratique Ф ф em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  678, 22, 'Ф', 'ф', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'фффф фффф фффф', 'фото',
  'foto', 'f', 'Criar ritmo: pratique Ф ф em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  679, 22, 'Ф', 'ф', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'фа аф', 'фото',
  'foto', 'f', 'Ligar com а: pratique Ф ф em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  680, 22, 'Ф', 'ф', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'фо оф', 'фото',
  'foto', 'f', 'Ligar com о: pratique Ф ф em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  681, 22, 'Ф', 'ф', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'фи иф', 'фото',
  'foto', 'f', 'Ligar com и: pratique Ф ф em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  682, 22, 'Ф', 'ф', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'фм мф', 'фото',
  'foto', 'f', 'Ligar com м: pratique Ф ф em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  683, 22, 'Ф', 'ф', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'фа фо фу фи', 'фото',
  'foto', 'f', 'Copiar sílabas: pratique Ф ф em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  684, 22, 'Ф', 'ф', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'фото', 'фото',
  'foto', 'f', 'Copiar palavra: pratique Ф ф em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  685, 22, 'Ф', 'ф', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «фото».', 'фото',
  'foto', 'f', 'Copiar frase: pratique Ф ф em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  686, 22, 'Ф', 'ф', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'фото', 'фото',
  'foto', 'f', 'Escrever por ditado: pratique Ф ф em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  687, 22, 'Ф', 'ф', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'фото', 'фото',
  'foto', 'f', 'Treino de fluência: pratique Ф ф em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  688, 22, 'Ф', 'ф', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «фото».', 'фото',
  'foto', 'f', 'Produção livre: pratique Ф ф em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  689, 22, 'Ф', 'ф', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Observar proporções: pratique Ф ф em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  690, 22, 'Ф', 'ф', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Desenhar no ar: pratique Ф ф em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  691, 22, 'Ф', 'ф', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ФФФФФ', 'фото',
  'foto', 'f', 'Traçar maiúscula: pratique Ф ф em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  692, 22, 'Ф', 'ф', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Traçar minúscula: pratique Ф ф em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  693, 22, 'Ф', 'ф', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ффффф', 'фото',
  'foto', 'f', 'Copiar isoladamente: pratique Ф ф em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  694, 22, 'Ф', 'ф', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'фффф фффф фффф', 'фото',
  'foto', 'f', 'Criar ritmo: pratique Ф ф em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  695, 22, 'Ф', 'ф', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'фа аф', 'фото',
  'foto', 'f', 'Ligar com а: pratique Ф ф em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  696, 22, 'Ф', 'ф', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'фо оф', 'фото',
  'foto', 'f', 'Ligar com о: pratique Ф ф em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  697, 22, 'Ф', 'ф', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'фи иф', 'фото',
  'foto', 'f', 'Ligar com и: pratique Ф ф em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  698, 22, 'Ф', 'ф', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'фм мф', 'фото',
  'foto', 'f', 'Ligar com м: pratique Ф ф em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  699, 22, 'Ф', 'ф', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'фа фо фу фи', 'фото',
  'foto', 'f', 'Copiar sílabas: pratique Ф ф em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  700, 22, 'Ф', 'ф', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'фото', 'фото',
  'foto', 'f', 'Copiar palavra: pratique Ф ф em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  701, 22, 'Ф', 'ф', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «фото».', 'фото',
  'foto', 'f', 'Copiar frase: pratique Ф ф em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  702, 22, 'Ф', 'ф', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'фото', 'фото',
  'foto', 'f', 'Escrever por ditado: pratique Ф ф em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  703, 22, 'Ф', 'ф', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'фото', 'фото',
  'foto', 'f', 'Treino de fluência: pratique Ф ф em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  704, 22, 'Ф', 'ф', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «фото».', 'фото',
  'foto', 'f', 'Produção livre: pratique Ф ф em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  705, 23, 'Х', 'х', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Observar proporções: pratique Х х em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  706, 23, 'Х', 'х', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Desenhar no ar: pratique Х х em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  707, 23, 'Х', 'х', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ХХХХХ', 'хлеб',
  'pão', 'kh', 'Traçar maiúscula: pratique Х х em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  708, 23, 'Х', 'х', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Traçar minúscula: pratique Х х em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  709, 23, 'Х', 'х', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Copiar isoladamente: pratique Х х em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  710, 23, 'Х', 'х', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'хххх хххх хххх', 'хлеб',
  'pão', 'kh', 'Criar ritmo: pratique Х х em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  711, 23, 'Х', 'х', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ха ах', 'хлеб',
  'pão', 'kh', 'Ligar com а: pratique Х х em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  712, 23, 'Х', 'х', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'хо ох', 'хлеб',
  'pão', 'kh', 'Ligar com о: pratique Х х em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  713, 23, 'Х', 'х', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'хи их', 'хлеб',
  'pão', 'kh', 'Ligar com и: pratique Х х em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  714, 23, 'Х', 'х', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'хм мх', 'хлеб',
  'pão', 'kh', 'Ligar com м: pratique Х х em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  715, 23, 'Х', 'х', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ха хо ху хи', 'хлеб',
  'pão', 'kh', 'Copiar sílabas: pratique Х х em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  716, 23, 'Х', 'х', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'хлеб', 'хлеб',
  'pão', 'kh', 'Copiar palavra: pratique Х х em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  717, 23, 'Х', 'х', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «хлеб».', 'хлеб',
  'pão', 'kh', 'Copiar frase: pratique Х х em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  718, 23, 'Х', 'х', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'хлеб', 'хлеб',
  'pão', 'kh', 'Escrever por ditado: pratique Х х em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  719, 23, 'Х', 'х', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'хлеб', 'хлеб',
  'pão', 'kh', 'Treino de fluência: pratique Х х em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  720, 23, 'Х', 'х', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «хлеб».', 'хлеб',
  'pão', 'kh', 'Produção livre: pratique Х х em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  721, 23, 'Х', 'х', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Observar proporções: pratique Х х em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  722, 23, 'Х', 'х', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Desenhar no ar: pratique Х х em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  723, 23, 'Х', 'х', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ХХХХХ', 'хлеб',
  'pão', 'kh', 'Traçar maiúscula: pratique Х х em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  724, 23, 'Х', 'х', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Traçar minúscula: pratique Х х em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  725, 23, 'Х', 'х', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ххххх', 'хлеб',
  'pão', 'kh', 'Copiar isoladamente: pratique Х х em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  726, 23, 'Х', 'х', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'хххх хххх хххх', 'хлеб',
  'pão', 'kh', 'Criar ritmo: pratique Х х em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  727, 23, 'Х', 'х', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ха ах', 'хлеб',
  'pão', 'kh', 'Ligar com а: pratique Х х em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  728, 23, 'Х', 'х', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'хо ох', 'хлеб',
  'pão', 'kh', 'Ligar com о: pratique Х х em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  729, 23, 'Х', 'х', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'хи их', 'хлеб',
  'pão', 'kh', 'Ligar com и: pratique Х х em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  730, 23, 'Х', 'х', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'хм мх', 'хлеб',
  'pão', 'kh', 'Ligar com м: pratique Х х em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  731, 23, 'Х', 'х', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ха хо ху хи', 'хлеб',
  'pão', 'kh', 'Copiar sílabas: pratique Х х em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  732, 23, 'Х', 'х', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'хлеб', 'хлеб',
  'pão', 'kh', 'Copiar palavra: pratique Х х em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  733, 23, 'Х', 'х', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «хлеб».', 'хлеб',
  'pão', 'kh', 'Copiar frase: pratique Х х em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  734, 23, 'Х', 'х', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'хлеб', 'хлеб',
  'pão', 'kh', 'Escrever por ditado: pratique Х х em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  735, 23, 'Х', 'х', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'хлеб', 'хлеб',
  'pão', 'kh', 'Treino de fluência: pratique Х х em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  736, 23, 'Х', 'х', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «хлеб».', 'хлеб',
  'pão', 'kh', 'Produção livre: pratique Х х em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  737, 24, 'Ц', 'ц', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Observar proporções: pratique Ц ц em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  738, 24, 'Ц', 'ц', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Desenhar no ar: pratique Ц ц em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  739, 24, 'Ц', 'ц', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЦЦЦЦЦ', 'цирк',
  'circo', 'ts', 'Traçar maiúscula: pratique Ц ц em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  740, 24, 'Ц', 'ц', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Traçar minúscula: pratique Ц ц em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  741, 24, 'Ц', 'ц', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Copiar isoladamente: pratique Ц ц em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  742, 24, 'Ц', 'ц', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'цццц цццц цццц', 'цирк',
  'circo', 'ts', 'Criar ritmo: pratique Ц ц em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  743, 24, 'Ц', 'ц', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ца ац', 'цирк',
  'circo', 'ts', 'Ligar com а: pratique Ц ц em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  744, 24, 'Ц', 'ц', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'цо оц', 'цирк',
  'circo', 'ts', 'Ligar com о: pratique Ц ц em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  745, 24, 'Ц', 'ц', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ци иц', 'цирк',
  'circo', 'ts', 'Ligar com и: pratique Ц ц em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  746, 24, 'Ц', 'ц', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'цм мц', 'цирк',
  'circo', 'ts', 'Ligar com м: pratique Ц ц em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  747, 24, 'Ц', 'ц', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ца цо цу ци', 'цирк',
  'circo', 'ts', 'Copiar sílabas: pratique Ц ц em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  748, 24, 'Ц', 'ц', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'цирк', 'цирк',
  'circo', 'ts', 'Copiar palavra: pratique Ц ц em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  749, 24, 'Ц', 'ц', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «цирк».', 'цирк',
  'circo', 'ts', 'Copiar frase: pratique Ц ц em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  750, 24, 'Ц', 'ц', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'цирк', 'цирк',
  'circo', 'ts', 'Escrever por ditado: pratique Ц ц em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  751, 24, 'Ц', 'ц', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'цирк', 'цирк',
  'circo', 'ts', 'Treino de fluência: pratique Ц ц em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  752, 24, 'Ц', 'ц', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «цирк».', 'цирк',
  'circo', 'ts', 'Produção livre: pratique Ц ц em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  753, 24, 'Ц', 'ц', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Observar proporções: pratique Ц ц em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  754, 24, 'Ц', 'ц', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Desenhar no ar: pratique Ц ц em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  755, 24, 'Ц', 'ц', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЦЦЦЦЦ', 'цирк',
  'circo', 'ts', 'Traçar maiúscula: pratique Ц ц em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  756, 24, 'Ц', 'ц', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Traçar minúscula: pratique Ц ц em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  757, 24, 'Ц', 'ц', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ццццц', 'цирк',
  'circo', 'ts', 'Copiar isoladamente: pratique Ц ц em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  758, 24, 'Ц', 'ц', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'цццц цццц цццц', 'цирк',
  'circo', 'ts', 'Criar ritmo: pratique Ц ц em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  759, 24, 'Ц', 'ц', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ца ац', 'цирк',
  'circo', 'ts', 'Ligar com а: pratique Ц ц em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  760, 24, 'Ц', 'ц', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'цо оц', 'цирк',
  'circo', 'ts', 'Ligar com о: pratique Ц ц em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  761, 24, 'Ц', 'ц', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ци иц', 'цирк',
  'circo', 'ts', 'Ligar com и: pratique Ц ц em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  762, 24, 'Ц', 'ц', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'цм мц', 'цирк',
  'circo', 'ts', 'Ligar com м: pratique Ц ц em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  763, 24, 'Ц', 'ц', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ца цо цу ци', 'цирк',
  'circo', 'ts', 'Copiar sílabas: pratique Ц ц em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  764, 24, 'Ц', 'ц', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'цирк', 'цирк',
  'circo', 'ts', 'Copiar palavra: pratique Ц ц em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  765, 24, 'Ц', 'ц', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «цирк».', 'цирк',
  'circo', 'ts', 'Copiar frase: pratique Ц ц em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  766, 24, 'Ц', 'ц', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'цирк', 'цирк',
  'circo', 'ts', 'Escrever por ditado: pratique Ц ц em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  767, 24, 'Ц', 'ц', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'цирк', 'цирк',
  'circo', 'ts', 'Treino de fluência: pratique Ц ц em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  768, 24, 'Ц', 'ц', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «цирк».', 'цирк',
  'circo', 'ts', 'Produção livre: pratique Ц ц em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  769, 25, 'Ч', 'ч', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Observar proporções: pratique Ч ч em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  770, 25, 'Ч', 'ч', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Desenhar no ar: pratique Ч ч em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  771, 25, 'Ч', 'ч', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЧЧЧЧЧ', 'чай',
  'chá', 'tch', 'Traçar maiúscula: pratique Ч ч em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  772, 25, 'Ч', 'ч', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Traçar minúscula: pratique Ч ч em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  773, 25, 'Ч', 'ч', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Copiar isoladamente: pratique Ч ч em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  774, 25, 'Ч', 'ч', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'чччч чччч чччч', 'чай',
  'chá', 'tch', 'Criar ritmo: pratique Ч ч em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  775, 25, 'Ч', 'ч', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ча ач', 'чай',
  'chá', 'tch', 'Ligar com а: pratique Ч ч em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  776, 25, 'Ч', 'ч', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'чо оч', 'чай',
  'chá', 'tch', 'Ligar com о: pratique Ч ч em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  777, 25, 'Ч', 'ч', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'чи ич', 'чай',
  'chá', 'tch', 'Ligar com и: pratique Ч ч em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  778, 25, 'Ч', 'ч', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'чм мч', 'чай',
  'chá', 'tch', 'Ligar com м: pratique Ч ч em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  779, 25, 'Ч', 'ч', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ча чо чу чи', 'чай',
  'chá', 'tch', 'Copiar sílabas: pratique Ч ч em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  780, 25, 'Ч', 'ч', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'чай', 'чай',
  'chá', 'tch', 'Copiar palavra: pratique Ч ч em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  781, 25, 'Ч', 'ч', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «чай».', 'чай',
  'chá', 'tch', 'Copiar frase: pratique Ч ч em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  782, 25, 'Ч', 'ч', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'чай', 'чай',
  'chá', 'tch', 'Escrever por ditado: pratique Ч ч em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  783, 25, 'Ч', 'ч', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'чай', 'чай',
  'chá', 'tch', 'Treino de fluência: pratique Ч ч em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  784, 25, 'Ч', 'ч', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «чай».', 'чай',
  'chá', 'tch', 'Produção livre: pratique Ч ч em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  785, 25, 'Ч', 'ч', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Observar proporções: pratique Ч ч em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  786, 25, 'Ч', 'ч', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Desenhar no ar: pratique Ч ч em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  787, 25, 'Ч', 'ч', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЧЧЧЧЧ', 'чай',
  'chá', 'tch', 'Traçar maiúscula: pratique Ч ч em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  788, 25, 'Ч', 'ч', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Traçar minúscula: pratique Ч ч em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  789, 25, 'Ч', 'ч', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ччччч', 'чай',
  'chá', 'tch', 'Copiar isoladamente: pratique Ч ч em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  790, 25, 'Ч', 'ч', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'чччч чччч чччч', 'чай',
  'chá', 'tch', 'Criar ritmo: pratique Ч ч em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  791, 25, 'Ч', 'ч', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ча ач', 'чай',
  'chá', 'tch', 'Ligar com а: pratique Ч ч em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  792, 25, 'Ч', 'ч', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'чо оч', 'чай',
  'chá', 'tch', 'Ligar com о: pratique Ч ч em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  793, 25, 'Ч', 'ч', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'чи ич', 'чай',
  'chá', 'tch', 'Ligar com и: pratique Ч ч em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  794, 25, 'Ч', 'ч', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'чм мч', 'чай',
  'chá', 'tch', 'Ligar com м: pratique Ч ч em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  795, 25, 'Ч', 'ч', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ча чо чу чи', 'чай',
  'chá', 'tch', 'Copiar sílabas: pratique Ч ч em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  796, 25, 'Ч', 'ч', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'чай', 'чай',
  'chá', 'tch', 'Copiar palavra: pratique Ч ч em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  797, 25, 'Ч', 'ч', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «чай».', 'чай',
  'chá', 'tch', 'Copiar frase: pratique Ч ч em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  798, 25, 'Ч', 'ч', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'чай', 'чай',
  'chá', 'tch', 'Escrever por ditado: pratique Ч ч em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  799, 25, 'Ч', 'ч', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'чай', 'чай',
  'chá', 'tch', 'Treino de fluência: pratique Ч ч em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  800, 25, 'Ч', 'ч', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «чай».', 'чай',
  'chá', 'tch', 'Produção livre: pratique Ч ч em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  801, 26, 'Ш', 'ш', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Observar proporções: pratique Ш ш em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  802, 26, 'Ш', 'ш', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Desenhar no ar: pratique Ш ш em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  803, 26, 'Ш', 'ш', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ШШШШШ', 'школа',
  'escola', 'sh', 'Traçar maiúscula: pratique Ш ш em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  804, 26, 'Ш', 'ш', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Traçar minúscula: pratique Ш ш em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  805, 26, 'Ш', 'ш', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Copiar isoladamente: pratique Ш ш em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  806, 26, 'Ш', 'ш', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'шшшш шшшш шшшш', 'школа',
  'escola', 'sh', 'Criar ritmo: pratique Ш ш em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  807, 26, 'Ш', 'ш', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ша аш', 'школа',
  'escola', 'sh', 'Ligar com а: pratique Ш ш em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  808, 26, 'Ш', 'ш', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'шо ош', 'школа',
  'escola', 'sh', 'Ligar com о: pratique Ш ш em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  809, 26, 'Ш', 'ш', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ши иш', 'школа',
  'escola', 'sh', 'Ligar com и: pratique Ш ш em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  810, 26, 'Ш', 'ш', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'шм мш', 'школа',
  'escola', 'sh', 'Ligar com м: pratique Ш ш em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  811, 26, 'Ш', 'ш', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ша шо шу ши', 'школа',
  'escola', 'sh', 'Copiar sílabas: pratique Ш ш em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  812, 26, 'Ш', 'ш', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'школа', 'школа',
  'escola', 'sh', 'Copiar palavra: pratique Ш ш em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  813, 26, 'Ш', 'ш', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «школа».', 'школа',
  'escola', 'sh', 'Copiar frase: pratique Ш ш em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  814, 26, 'Ш', 'ш', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'школа', 'школа',
  'escola', 'sh', 'Escrever por ditado: pratique Ш ш em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  815, 26, 'Ш', 'ш', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'школа', 'школа',
  'escola', 'sh', 'Treino de fluência: pratique Ш ш em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  816, 26, 'Ш', 'ш', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «школа».', 'школа',
  'escola', 'sh', 'Produção livre: pratique Ш ш em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  817, 26, 'Ш', 'ш', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Observar proporções: pratique Ш ш em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  818, 26, 'Ш', 'ш', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Desenhar no ar: pratique Ш ш em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  819, 26, 'Ш', 'ш', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ШШШШШ', 'школа',
  'escola', 'sh', 'Traçar maiúscula: pratique Ш ш em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  820, 26, 'Ш', 'ш', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Traçar minúscula: pratique Ш ш em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  821, 26, 'Ш', 'ш', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'шшшшш', 'школа',
  'escola', 'sh', 'Copiar isoladamente: pratique Ш ш em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  822, 26, 'Ш', 'ш', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'шшшш шшшш шшшш', 'школа',
  'escola', 'sh', 'Criar ritmo: pratique Ш ш em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  823, 26, 'Ш', 'ш', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ша аш', 'школа',
  'escola', 'sh', 'Ligar com а: pratique Ш ш em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  824, 26, 'Ш', 'ш', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'шо ош', 'школа',
  'escola', 'sh', 'Ligar com о: pratique Ш ш em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  825, 26, 'Ш', 'ш', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ши иш', 'школа',
  'escola', 'sh', 'Ligar com и: pratique Ш ш em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  826, 26, 'Ш', 'ш', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'шм мш', 'школа',
  'escola', 'sh', 'Ligar com м: pratique Ш ш em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  827, 26, 'Ш', 'ш', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ша шо шу ши', 'школа',
  'escola', 'sh', 'Copiar sílabas: pratique Ш ш em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  828, 26, 'Ш', 'ш', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'школа', 'школа',
  'escola', 'sh', 'Copiar palavra: pratique Ш ш em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  829, 26, 'Ш', 'ш', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «школа».', 'школа',
  'escola', 'sh', 'Copiar frase: pratique Ш ш em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  830, 26, 'Ш', 'ш', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'школа', 'школа',
  'escola', 'sh', 'Escrever por ditado: pratique Ш ш em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  831, 26, 'Ш', 'ш', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'школа', 'школа',
  'escola', 'sh', 'Treino de fluência: pratique Ш ш em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  832, 26, 'Ш', 'ш', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «школа».', 'школа',
  'escola', 'sh', 'Produção livre: pratique Ш ш em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  833, 27, 'Щ', 'щ', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Observar proporções: pratique Щ щ em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  834, 27, 'Щ', 'щ', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Desenhar no ar: pratique Щ щ em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  835, 27, 'Щ', 'щ', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЩЩЩЩЩ', 'щука',
  'lúcio', 'shch', 'Traçar maiúscula: pratique Щ щ em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  836, 27, 'Щ', 'щ', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Traçar minúscula: pratique Щ щ em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  837, 27, 'Щ', 'щ', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Copiar isoladamente: pratique Щ щ em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  838, 27, 'Щ', 'щ', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'щщщщ щщщщ щщщщ', 'щука',
  'lúcio', 'shch', 'Criar ritmo: pratique Щ щ em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  839, 27, 'Щ', 'щ', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ща ащ', 'щука',
  'lúcio', 'shch', 'Ligar com а: pratique Щ щ em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  840, 27, 'Щ', 'щ', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'що ощ', 'щука',
  'lúcio', 'shch', 'Ligar com о: pratique Щ щ em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  841, 27, 'Щ', 'щ', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'щи ищ', 'щука',
  'lúcio', 'shch', 'Ligar com и: pratique Щ щ em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  842, 27, 'Щ', 'щ', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'щм мщ', 'щука',
  'lúcio', 'shch', 'Ligar com м: pratique Щ щ em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  843, 27, 'Щ', 'щ', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ща що щу щи', 'щука',
  'lúcio', 'shch', 'Copiar sílabas: pratique Щ щ em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  844, 27, 'Щ', 'щ', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'щука', 'щука',
  'lúcio', 'shch', 'Copiar palavra: pratique Щ щ em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  845, 27, 'Щ', 'щ', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «щука».', 'щука',
  'lúcio', 'shch', 'Copiar frase: pratique Щ щ em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  846, 27, 'Щ', 'щ', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'щука', 'щука',
  'lúcio', 'shch', 'Escrever por ditado: pratique Щ щ em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  847, 27, 'Щ', 'щ', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'щука', 'щука',
  'lúcio', 'shch', 'Treino de fluência: pratique Щ щ em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  848, 27, 'Щ', 'щ', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «щука».', 'щука',
  'lúcio', 'shch', 'Produção livre: pratique Щ щ em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  849, 27, 'Щ', 'щ', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Observar proporções: pratique Щ щ em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  850, 27, 'Щ', 'щ', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Desenhar no ar: pratique Щ щ em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  851, 27, 'Щ', 'щ', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЩЩЩЩЩ', 'щука',
  'lúcio', 'shch', 'Traçar maiúscula: pratique Щ щ em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  852, 27, 'Щ', 'щ', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Traçar minúscula: pratique Щ щ em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  853, 27, 'Щ', 'щ', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'щщщщщ', 'щука',
  'lúcio', 'shch', 'Copiar isoladamente: pratique Щ щ em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  854, 27, 'Щ', 'щ', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'щщщщ щщщщ щщщщ', 'щука',
  'lúcio', 'shch', 'Criar ritmo: pratique Щ щ em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  855, 27, 'Щ', 'щ', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ща ащ', 'щука',
  'lúcio', 'shch', 'Ligar com а: pratique Щ щ em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  856, 27, 'Щ', 'щ', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'що ощ', 'щука',
  'lúcio', 'shch', 'Ligar com о: pratique Щ щ em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  857, 27, 'Щ', 'щ', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'щи ищ', 'щука',
  'lúcio', 'shch', 'Ligar com и: pratique Щ щ em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  858, 27, 'Щ', 'щ', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'щм мщ', 'щука',
  'lúcio', 'shch', 'Ligar com м: pratique Щ щ em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  859, 27, 'Щ', 'щ', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ща що щу щи', 'щука',
  'lúcio', 'shch', 'Copiar sílabas: pratique Щ щ em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  860, 27, 'Щ', 'щ', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'щука', 'щука',
  'lúcio', 'shch', 'Copiar palavra: pratique Щ щ em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  861, 27, 'Щ', 'щ', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «щука».', 'щука',
  'lúcio', 'shch', 'Copiar frase: pratique Щ щ em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  862, 27, 'Щ', 'щ', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'щука', 'щука',
  'lúcio', 'shch', 'Escrever por ditado: pratique Щ щ em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  863, 27, 'Щ', 'щ', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'щука', 'щука',
  'lúcio', 'shch', 'Treino de fluência: pratique Щ щ em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  864, 27, 'Щ', 'щ', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «щука».', 'щука',
  'lúcio', 'shch', 'Produção livre: pratique Щ щ em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  865, 28, 'Ъ', 'ъ', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Observar proporções: pratique Ъ ъ em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  866, 28, 'Ъ', 'ъ', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Desenhar no ar: pratique Ъ ъ em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  867, 28, 'Ъ', 'ъ', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЪЪЪЪЪ', 'объект',
  'objeto', 'sinal duro', 'Traçar maiúscula: pratique Ъ ъ em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  868, 28, 'Ъ', 'ъ', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Traçar minúscula: pratique Ъ ъ em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  869, 28, 'Ъ', 'ъ', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Copiar isoladamente: pratique Ъ ъ em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  870, 28, 'Ъ', 'ъ', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ъъъъ ъъъъ ъъъъ', 'объект',
  'objeto', 'sinal duro', 'Criar ritmo: pratique Ъ ъ em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  871, 28, 'Ъ', 'ъ', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ъа аъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com а: pratique Ъ ъ em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  872, 28, 'Ъ', 'ъ', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ъо оъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com о: pratique Ъ ъ em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  873, 28, 'Ъ', 'ъ', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ъи иъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com и: pratique Ъ ъ em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  874, 28, 'Ъ', 'ъ', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ъм мъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com м: pratique Ъ ъ em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  875, 28, 'Ъ', 'ъ', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ъа ъо ъу ъи', 'объект',
  'objeto', 'sinal duro', 'Copiar sílabas: pratique Ъ ъ em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  876, 28, 'Ъ', 'ъ', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'объект', 'объект',
  'objeto', 'sinal duro', 'Copiar palavra: pratique Ъ ъ em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  877, 28, 'Ъ', 'ъ', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «объект».', 'объект',
  'objeto', 'sinal duro', 'Copiar frase: pratique Ъ ъ em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  878, 28, 'Ъ', 'ъ', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'объект', 'объект',
  'objeto', 'sinal duro', 'Escrever por ditado: pratique Ъ ъ em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  879, 28, 'Ъ', 'ъ', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'объект', 'объект',
  'objeto', 'sinal duro', 'Treino de fluência: pratique Ъ ъ em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  880, 28, 'Ъ', 'ъ', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «объект».', 'объект',
  'objeto', 'sinal duro', 'Produção livre: pratique Ъ ъ em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  881, 28, 'Ъ', 'ъ', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Observar proporções: pratique Ъ ъ em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  882, 28, 'Ъ', 'ъ', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Desenhar no ar: pratique Ъ ъ em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  883, 28, 'Ъ', 'ъ', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЪЪЪЪЪ', 'объект',
  'objeto', 'sinal duro', 'Traçar maiúscula: pratique Ъ ъ em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  884, 28, 'Ъ', 'ъ', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Traçar minúscula: pratique Ъ ъ em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  885, 28, 'Ъ', 'ъ', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ъъъъъ', 'объект',
  'objeto', 'sinal duro', 'Copiar isoladamente: pratique Ъ ъ em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  886, 28, 'Ъ', 'ъ', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ъъъъ ъъъъ ъъъъ', 'объект',
  'objeto', 'sinal duro', 'Criar ritmo: pratique Ъ ъ em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  887, 28, 'Ъ', 'ъ', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ъа аъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com а: pratique Ъ ъ em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  888, 28, 'Ъ', 'ъ', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ъо оъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com о: pratique Ъ ъ em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  889, 28, 'Ъ', 'ъ', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ъи иъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com и: pratique Ъ ъ em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  890, 28, 'Ъ', 'ъ', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ъм мъ', 'объект',
  'objeto', 'sinal duro', 'Ligar com м: pratique Ъ ъ em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  891, 28, 'Ъ', 'ъ', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ъа ъо ъу ъи', 'объект',
  'objeto', 'sinal duro', 'Copiar sílabas: pratique Ъ ъ em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  892, 28, 'Ъ', 'ъ', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'объект', 'объект',
  'objeto', 'sinal duro', 'Copiar palavra: pratique Ъ ъ em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  893, 28, 'Ъ', 'ъ', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «объект».', 'объект',
  'objeto', 'sinal duro', 'Copiar frase: pratique Ъ ъ em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  894, 28, 'Ъ', 'ъ', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'объект', 'объект',
  'objeto', 'sinal duro', 'Escrever por ditado: pratique Ъ ъ em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  895, 28, 'Ъ', 'ъ', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'объект', 'объект',
  'objeto', 'sinal duro', 'Treino de fluência: pratique Ъ ъ em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  896, 28, 'Ъ', 'ъ', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «объект».', 'объект',
  'objeto', 'sinal duro', 'Produção livre: pratique Ъ ъ em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  897, 29, 'Ы', 'ы', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Observar proporções: pratique Ы ы em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  898, 29, 'Ы', 'ы', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Desenhar no ar: pratique Ы ы em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  899, 29, 'Ы', 'ы', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЫЫЫЫЫ', 'мы',
  'nós', 'y fechado', 'Traçar maiúscula: pratique Ы ы em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  900, 29, 'Ы', 'ы', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Traçar minúscula: pratique Ы ы em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  901, 29, 'Ы', 'ы', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Copiar isoladamente: pratique Ы ы em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  902, 29, 'Ы', 'ы', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ыыыы ыыыы ыыыы', 'мы',
  'nós', 'y fechado', 'Criar ritmo: pratique Ы ы em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  903, 29, 'Ы', 'ы', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ыа аы', 'мы',
  'nós', 'y fechado', 'Ligar com а: pratique Ы ы em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  904, 29, 'Ы', 'ы', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ыо оы', 'мы',
  'nós', 'y fechado', 'Ligar com о: pratique Ы ы em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  905, 29, 'Ы', 'ы', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ыи иы', 'мы',
  'nós', 'y fechado', 'Ligar com и: pratique Ы ы em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  906, 29, 'Ы', 'ы', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ым мы', 'мы',
  'nós', 'y fechado', 'Ligar com м: pratique Ы ы em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  907, 29, 'Ы', 'ы', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ыа ыо ыу ыи', 'мы',
  'nós', 'y fechado', 'Copiar sílabas: pratique Ы ы em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  908, 29, 'Ы', 'ы', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'мы', 'мы',
  'nós', 'y fechado', 'Copiar palavra: pratique Ы ы em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  909, 29, 'Ы', 'ы', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «мы».', 'мы',
  'nós', 'y fechado', 'Copiar frase: pratique Ы ы em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  910, 29, 'Ы', 'ы', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'мы', 'мы',
  'nós', 'y fechado', 'Escrever por ditado: pratique Ы ы em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  911, 29, 'Ы', 'ы', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'мы', 'мы',
  'nós', 'y fechado', 'Treino de fluência: pratique Ы ы em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  912, 29, 'Ы', 'ы', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «мы».', 'мы',
  'nós', 'y fechado', 'Produção livre: pratique Ы ы em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  913, 29, 'Ы', 'ы', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Observar proporções: pratique Ы ы em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  914, 29, 'Ы', 'ы', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Desenhar no ar: pratique Ы ы em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  915, 29, 'Ы', 'ы', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЫЫЫЫЫ', 'мы',
  'nós', 'y fechado', 'Traçar maiúscula: pratique Ы ы em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  916, 29, 'Ы', 'ы', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Traçar minúscula: pratique Ы ы em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  917, 29, 'Ы', 'ы', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ыыыыы', 'мы',
  'nós', 'y fechado', 'Copiar isoladamente: pratique Ы ы em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  918, 29, 'Ы', 'ы', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ыыыы ыыыы ыыыы', 'мы',
  'nós', 'y fechado', 'Criar ritmo: pratique Ы ы em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  919, 29, 'Ы', 'ы', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ыа аы', 'мы',
  'nós', 'y fechado', 'Ligar com а: pratique Ы ы em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  920, 29, 'Ы', 'ы', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ыо оы', 'мы',
  'nós', 'y fechado', 'Ligar com о: pratique Ы ы em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  921, 29, 'Ы', 'ы', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ыи иы', 'мы',
  'nós', 'y fechado', 'Ligar com и: pratique Ы ы em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  922, 29, 'Ы', 'ы', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ым мы', 'мы',
  'nós', 'y fechado', 'Ligar com м: pratique Ы ы em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  923, 29, 'Ы', 'ы', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ыа ыо ыу ыи', 'мы',
  'nós', 'y fechado', 'Copiar sílabas: pratique Ы ы em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  924, 29, 'Ы', 'ы', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'мы', 'мы',
  'nós', 'y fechado', 'Copiar palavra: pratique Ы ы em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  925, 29, 'Ы', 'ы', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «мы».', 'мы',
  'nós', 'y fechado', 'Copiar frase: pratique Ы ы em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  926, 29, 'Ы', 'ы', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'мы', 'мы',
  'nós', 'y fechado', 'Escrever por ditado: pratique Ы ы em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  927, 29, 'Ы', 'ы', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'мы', 'мы',
  'nós', 'y fechado', 'Treino de fluência: pratique Ы ы em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  928, 29, 'Ы', 'ы', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «мы».', 'мы',
  'nós', 'y fechado', 'Produção livre: pratique Ы ы em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  929, 30, 'Ь', 'ь', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Observar proporções: pratique Ь ь em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  930, 30, 'Ь', 'ь', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Desenhar no ar: pratique Ь ь em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  931, 30, 'Ь', 'ь', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЬЬЬЬЬ', 'день',
  'dia', 'sinal brando', 'Traçar maiúscula: pratique Ь ь em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  932, 30, 'Ь', 'ь', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Traçar minúscula: pratique Ь ь em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  933, 30, 'Ь', 'ь', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Copiar isoladamente: pratique Ь ь em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  934, 30, 'Ь', 'ь', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ьььь ьььь ьььь', 'день',
  'dia', 'sinal brando', 'Criar ritmo: pratique Ь ь em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  935, 30, 'Ь', 'ь', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ьа аь', 'день',
  'dia', 'sinal brando', 'Ligar com а: pratique Ь ь em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  936, 30, 'Ь', 'ь', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ьо оь', 'день',
  'dia', 'sinal brando', 'Ligar com о: pratique Ь ь em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  937, 30, 'Ь', 'ь', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ьи иь', 'день',
  'dia', 'sinal brando', 'Ligar com и: pratique Ь ь em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  938, 30, 'Ь', 'ь', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ьм мь', 'день',
  'dia', 'sinal brando', 'Ligar com м: pratique Ь ь em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  939, 30, 'Ь', 'ь', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ьа ьо ьу ьи', 'день',
  'dia', 'sinal brando', 'Copiar sílabas: pratique Ь ь em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  940, 30, 'Ь', 'ь', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'день', 'день',
  'dia', 'sinal brando', 'Copiar palavra: pratique Ь ь em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  941, 30, 'Ь', 'ь', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «день».', 'день',
  'dia', 'sinal brando', 'Copiar frase: pratique Ь ь em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  942, 30, 'Ь', 'ь', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'день', 'день',
  'dia', 'sinal brando', 'Escrever por ditado: pratique Ь ь em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  943, 30, 'Ь', 'ь', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'день', 'день',
  'dia', 'sinal brando', 'Treino de fluência: pratique Ь ь em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  944, 30, 'Ь', 'ь', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «день».', 'день',
  'dia', 'sinal brando', 'Produção livre: pratique Ь ь em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  945, 30, 'Ь', 'ь', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Observar proporções: pratique Ь ь em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  946, 30, 'Ь', 'ь', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Desenhar no ar: pratique Ь ь em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  947, 30, 'Ь', 'ь', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЬЬЬЬЬ', 'день',
  'dia', 'sinal brando', 'Traçar maiúscula: pratique Ь ь em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  948, 30, 'Ь', 'ь', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Traçar minúscula: pratique Ь ь em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  949, 30, 'Ь', 'ь', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ььььь', 'день',
  'dia', 'sinal brando', 'Copiar isoladamente: pratique Ь ь em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  950, 30, 'Ь', 'ь', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ьььь ьььь ьььь', 'день',
  'dia', 'sinal brando', 'Criar ritmo: pratique Ь ь em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  951, 30, 'Ь', 'ь', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'ьа аь', 'день',
  'dia', 'sinal brando', 'Ligar com а: pratique Ь ь em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  952, 30, 'Ь', 'ь', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'ьо оь', 'день',
  'dia', 'sinal brando', 'Ligar com о: pratique Ь ь em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  953, 30, 'Ь', 'ь', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'ьи иь', 'день',
  'dia', 'sinal brando', 'Ligar com и: pratique Ь ь em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  954, 30, 'Ь', 'ь', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ьм мь', 'день',
  'dia', 'sinal brando', 'Ligar com м: pratique Ь ь em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  955, 30, 'Ь', 'ь', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'ьа ьо ьу ьи', 'день',
  'dia', 'sinal brando', 'Copiar sílabas: pratique Ь ь em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  956, 30, 'Ь', 'ь', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'день', 'день',
  'dia', 'sinal brando', 'Copiar palavra: pratique Ь ь em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  957, 30, 'Ь', 'ь', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «день».', 'день',
  'dia', 'sinal brando', 'Copiar frase: pratique Ь ь em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  958, 30, 'Ь', 'ь', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'день', 'день',
  'dia', 'sinal brando', 'Escrever por ditado: pratique Ь ь em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  959, 30, 'Ь', 'ь', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'день', 'день',
  'dia', 'sinal brando', 'Treino de fluência: pratique Ь ь em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  960, 30, 'Ь', 'ь', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «день».', 'день',
  'dia', 'sinal brando', 'Produção livre: pratique Ь ь em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  961, 31, 'Э', 'э', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Observar proporções: pratique Э э em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  962, 31, 'Э', 'э', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Desenhar no ar: pratique Э э em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  963, 31, 'Э', 'э', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЭЭЭЭЭ', 'это',
  'isto', 'é aberto', 'Traçar maiúscula: pratique Э э em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  964, 31, 'Э', 'э', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Traçar minúscula: pratique Э э em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  965, 31, 'Э', 'э', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Copiar isoladamente: pratique Э э em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  966, 31, 'Э', 'э', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ээээ ээээ ээээ', 'это',
  'isto', 'é aberto', 'Criar ritmo: pratique Э э em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  967, 31, 'Э', 'э', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'эа аэ', 'это',
  'isto', 'é aberto', 'Ligar com а: pratique Э э em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  968, 31, 'Э', 'э', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'эо оэ', 'это',
  'isto', 'é aberto', 'Ligar com о: pratique Э э em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  969, 31, 'Э', 'э', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'эи иэ', 'это',
  'isto', 'é aberto', 'Ligar com и: pratique Э э em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  970, 31, 'Э', 'э', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'эм мэ', 'это',
  'isto', 'é aberto', 'Ligar com м: pratique Э э em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  971, 31, 'Э', 'э', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'эа эо эу эи', 'это',
  'isto', 'é aberto', 'Copiar sílabas: pratique Э э em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  972, 31, 'Э', 'э', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'это', 'это',
  'isto', 'é aberto', 'Copiar palavra: pratique Э э em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  973, 31, 'Э', 'э', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «это».', 'это',
  'isto', 'é aberto', 'Copiar frase: pratique Э э em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  974, 31, 'Э', 'э', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'это', 'это',
  'isto', 'é aberto', 'Escrever por ditado: pratique Э э em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  975, 31, 'Э', 'э', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'это', 'это',
  'isto', 'é aberto', 'Treino de fluência: pratique Э э em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  976, 31, 'Э', 'э', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «это».', 'это',
  'isto', 'é aberto', 'Produção livre: pratique Э э em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  977, 31, 'Э', 'э', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Observar proporções: pratique Э э em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  978, 31, 'Э', 'э', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Desenhar no ar: pratique Э э em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  979, 31, 'Э', 'э', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЭЭЭЭЭ', 'это',
  'isto', 'é aberto', 'Traçar maiúscula: pratique Э э em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  980, 31, 'Э', 'э', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Traçar minúscula: pratique Э э em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  981, 31, 'Э', 'э', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'эээээ', 'это',
  'isto', 'é aberto', 'Copiar isoladamente: pratique Э э em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  982, 31, 'Э', 'э', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'ээээ ээээ ээээ', 'это',
  'isto', 'é aberto', 'Criar ritmo: pratique Э э em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  983, 31, 'Э', 'э', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'эа аэ', 'это',
  'isto', 'é aberto', 'Ligar com а: pratique Э э em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  984, 31, 'Э', 'э', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'эо оэ', 'это',
  'isto', 'é aberto', 'Ligar com о: pratique Э э em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  985, 31, 'Э', 'э', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'эи иэ', 'это',
  'isto', 'é aberto', 'Ligar com и: pratique Э э em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  986, 31, 'Э', 'э', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'эм мэ', 'это',
  'isto', 'é aberto', 'Ligar com м: pratique Э э em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  987, 31, 'Э', 'э', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'эа эо эу эи', 'это',
  'isto', 'é aberto', 'Copiar sílabas: pratique Э э em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  988, 31, 'Э', 'э', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'это', 'это',
  'isto', 'é aberto', 'Copiar palavra: pratique Э э em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  989, 31, 'Э', 'э', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «это».', 'это',
  'isto', 'é aberto', 'Copiar frase: pratique Э э em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  990, 31, 'Э', 'э', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'это', 'это',
  'isto', 'é aberto', 'Escrever por ditado: pratique Э э em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  991, 31, 'Э', 'э', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'это', 'это',
  'isto', 'é aberto', 'Treino de fluência: pratique Э э em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  992, 31, 'Э', 'э', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «это».', 'это',
  'isto', 'é aberto', 'Produção livre: pratique Э э em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  993, 32, 'Ю', 'ю', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Observar proporções: pratique Ю ю em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  994, 32, 'Ю', 'ю', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Desenhar no ar: pratique Ю ю em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  995, 32, 'Ю', 'ю', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЮЮЮЮЮ', 'юг',
  'sul', 'iu', 'Traçar maiúscula: pratique Ю ю em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  996, 32, 'Ю', 'ю', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Traçar minúscula: pratique Ю ю em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  997, 32, 'Ю', 'ю', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Copiar isoladamente: pratique Ю ю em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  998, 32, 'Ю', 'ю', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'юююю юююю юююю', 'юг',
  'sul', 'iu', 'Criar ritmo: pratique Ю ю em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  999, 32, 'Ю', 'ю', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'юа аю', 'юг',
  'sul', 'iu', 'Ligar com а: pratique Ю ю em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1000, 32, 'Ю', 'ю', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'юо ою', 'юг',
  'sul', 'iu', 'Ligar com о: pratique Ю ю em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1001, 32, 'Ю', 'ю', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'юи ию', 'юг',
  'sul', 'iu', 'Ligar com и: pratique Ю ю em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1002, 32, 'Ю', 'ю', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'юм мю', 'юг',
  'sul', 'iu', 'Ligar com м: pratique Ю ю em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1003, 32, 'Ю', 'ю', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'юа юо юу юи', 'юг',
  'sul', 'iu', 'Copiar sílabas: pratique Ю ю em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1004, 32, 'Ю', 'ю', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'юг', 'юг',
  'sul', 'iu', 'Copiar palavra: pratique Ю ю em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1005, 32, 'Ю', 'ю', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «юг».', 'юг',
  'sul', 'iu', 'Copiar frase: pratique Ю ю em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1006, 32, 'Ю', 'ю', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'юг', 'юг',
  'sul', 'iu', 'Escrever por ditado: pratique Ю ю em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1007, 32, 'Ю', 'ю', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'юг', 'юг',
  'sul', 'iu', 'Treino de fluência: pratique Ю ю em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1008, 32, 'Ю', 'ю', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «юг».', 'юг',
  'sul', 'iu', 'Produção livre: pratique Ю ю em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1009, 32, 'Ю', 'ю', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Observar proporções: pratique Ю ю em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1010, 32, 'Ю', 'ю', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Desenhar no ar: pratique Ю ю em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1011, 32, 'Ю', 'ю', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЮЮЮЮЮ', 'юг',
  'sul', 'iu', 'Traçar maiúscula: pratique Ю ю em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1012, 32, 'Ю', 'ю', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Traçar minúscula: pratique Ю ю em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1013, 32, 'Ю', 'ю', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'ююююю', 'юг',
  'sul', 'iu', 'Copiar isoladamente: pratique Ю ю em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1014, 32, 'Ю', 'ю', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'юююю юююю юююю', 'юг',
  'sul', 'iu', 'Criar ritmo: pratique Ю ю em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1015, 32, 'Ю', 'ю', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'юа аю', 'юг',
  'sul', 'iu', 'Ligar com а: pratique Ю ю em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1016, 32, 'Ю', 'ю', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'юо ою', 'юг',
  'sul', 'iu', 'Ligar com о: pratique Ю ю em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1017, 32, 'Ю', 'ю', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'юи ию', 'юг',
  'sul', 'iu', 'Ligar com и: pratique Ю ю em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1018, 32, 'Ю', 'ю', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'юм мю', 'юг',
  'sul', 'iu', 'Ligar com м: pratique Ю ю em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1019, 32, 'Ю', 'ю', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'юа юо юу юи', 'юг',
  'sul', 'iu', 'Copiar sílabas: pratique Ю ю em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1020, 32, 'Ю', 'ю', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'юг', 'юг',
  'sul', 'iu', 'Copiar palavra: pratique Ю ю em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1021, 32, 'Ю', 'ю', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «юг».', 'юг',
  'sul', 'iu', 'Copiar frase: pratique Ю ю em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1022, 32, 'Ю', 'ю', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'юг', 'юг',
  'sul', 'iu', 'Escrever por ditado: pratique Ю ю em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1023, 32, 'Ю', 'ю', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'юг', 'юг',
  'sul', 'iu', 'Treino de fluência: pratique Ю ю em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1024, 32, 'Ю', 'ю', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «юг».', 'юг',
  'sul', 'iu', 'Produção livre: pratique Ю ю em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1025, 33, 'Я', 'я', 'print', 1,
  'observacao', 'Observar proporções', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Observar proporções: pratique Я я em letra de forma. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1026, 33, 'Я', 'я', 'print', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Desenhar no ar: pratique Я я em letra de forma. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1027, 33, 'Я', 'я', 'print', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЯЯЯЯЯ', 'яблоко',
  'maçã', 'ia', 'Traçar maiúscula: pratique Я я em letra de forma. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1028, 33, 'Я', 'я', 'print', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Traçar minúscula: pratique Я я em letra de forma. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1029, 33, 'Я', 'я', 'print', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Copiar isoladamente: pratique Я я em letra de forma. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1030, 33, 'Я', 'я', 'print', 6,
  'ritmo', 'Criar ritmo', 'A2', 'яяяя яяяя яяяя', 'яблоко',
  'maçã', 'ia', 'Criar ritmo: pratique Я я em letra de forma. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1031, 33, 'Я', 'я', 'print', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'яа ая', 'яблоко',
  'maçã', 'ia', 'Ligar com а: pratique Я я em letra de forma. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1032, 33, 'Я', 'я', 'print', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'яо оя', 'яблоко',
  'maçã', 'ia', 'Ligar com о: pratique Я я em letra de forma. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1033, 33, 'Я', 'я', 'print', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'яи ия', 'яблоко',
  'maçã', 'ia', 'Ligar com и: pratique Я я em letra de forma. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1034, 33, 'Я', 'я', 'print', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ям мя', 'яблоко',
  'maçã', 'ia', 'Ligar com м: pratique Я я em letra de forma. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1035, 33, 'Я', 'я', 'print', 11,
  'silaba', 'Copiar sílabas', 'A2', 'яа яо яу яи', 'яблоко',
  'maçã', 'ia', 'Copiar sílabas: pratique Я я em letra de forma. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1036, 33, 'Я', 'я', 'print', 12,
  'palavra', 'Copiar palavra', 'B1', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Copiar palavra: pratique Я я em letra de forma. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1037, 33, 'Я', 'я', 'print', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «яблоко».', 'яблоко',
  'maçã', 'ia', 'Copiar frase: pratique Я я em letra de forma. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1038, 33, 'Я', 'я', 'print', 14,
  'ditado', 'Escrever por ditado', 'B1', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Escrever por ditado: pratique Я я em letra de forma. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1039, 33, 'Я', 'я', 'print', 15,
  'fluencia', 'Treino de fluência', 'B2', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Treino de fluência: pratique Я я em letra de forma. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1040, 33, 'Я', 'я', 'print', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «яблоко».', 'яблоко',
  'maçã', 'ia', 'Produção livre: pratique Я я em letra de forma. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1041, 33, 'Я', 'я', 'cursive', 1,
  'observacao', 'Observar proporções', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Observar proporções: pratique Я я em letra cursiva. Compare altura, largura, inclinação e posição na linha.',
  'Reconhecer a forma antes de escrever.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1042, 33, 'Я', 'я', 'cursive', 2,
  'movimento_ar', 'Desenhar no ar', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Desenhar no ar: pratique Я я em letra cursiva. Faça o movimento amplo com o braço antes de usar o lápis.',
  'Memorizar a direção geral do traço.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1043, 33, 'Я', 'я', 'cursive', 3,
  'maiuscula_guiada', 'Traçar maiúscula', 'A1', 'ЯЯЯЯЯ', 'яблоко',
  'maçã', 'ia', 'Traçar maiúscula: pratique Я я em letra cursiva. Passe sobre o modelo maiúsculo sem acelerar.',
  'Controlar início, direção e encerramento.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1044, 33, 'Я', 'я', 'cursive', 4,
  'minuscula_guiada', 'Traçar minúscula', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Traçar minúscula: pratique Я я em letra cursiva. Passe sobre o modelo minúsculo mantendo a altura.',
  'Dominar a forma usada dentro das palavras.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1045, 33, 'Я', 'я', 'cursive', 5,
  'copia_isolada', 'Copiar isoladamente', 'A1', 'яяяяя', 'яблоко',
  'maçã', 'ia', 'Copiar isoladamente: pratique Я я em letra cursiva. Copie a letra cinco vezes ao lado do modelo.',
  'Manter tamanho e espaçamento consistentes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1046, 33, 'Я', 'я', 'cursive', 6,
  'ritmo', 'Criar ritmo', 'A2', 'яяяя яяяя яяяя', 'яблоко',
  'maçã', 'ia', 'Criar ritmo: pratique Я я em letra cursiva. Escreva uma linha contínua com intervalos regulares.',
  'Automatizar o movimento sem perder legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1047, 33, 'Я', 'я', 'cursive', 7,
  'ligacao_a', 'Ligar com а', 'A2', 'яа ая', 'яблоко',
  'maçã', 'ia', 'Ligar com а: pratique Я я em letra cursiva. Pratique a ligação de entrada e saída com а.',
  'Aprender uma conexão frequente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1048, 33, 'Я', 'я', 'cursive', 8,
  'ligacao_o', 'Ligar com о', 'A2', 'яо оя', 'яблоко',
  'maçã', 'ia', 'Ligar com о: pratique Я я em letra cursiva. Pratique a ligação de entrada e saída com о.',
  'Evitar que as letras se encostem demais.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1049, 33, 'Я', 'я', 'cursive', 9,
  'ligacao_i', 'Ligar com и', 'A2', 'яи ия', 'яблоко',
  'maçã', 'ia', 'Ligar com и: pratique Я я em letra cursiva. Pratique a ligação de entrada e saída com и.',
  'Manter o fluxo da cursiva.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1050, 33, 'Я', 'я', 'cursive', 10,
  'ligacao_m', 'Ligar com м', 'A2', 'ям мя', 'яблоко',
  'maçã', 'ia', 'Ligar com м: pratique Я я em letra cursiva. Pratique a ligação de entrada e saída com м.',
  'Diferenciar arcos e hastes semelhantes.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1051, 33, 'Я', 'я', 'cursive', 11,
  'silaba', 'Copiar sílabas', 'A2', 'яа яо яу яи', 'яблоко',
  'maçã', 'ia', 'Copiar sílabas: pratique Я я em letra cursiva. Copie sílabas curtas e leia em voz alta.',
  'Unir escrita, leitura e som.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1052, 33, 'Я', 'я', 'cursive', 12,
  'palavra', 'Copiar palavra', 'B1', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Copiar palavra: pratique Я я em letra cursiva. Copie a palavra-modelo e confira cada ligação.',
  'Aplicar a letra em vocabulário real.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1053, 33, 'Я', 'я', 'cursive', 13,
  'frase', 'Copiar frase', 'B1', 'Я пишу слово «яблоко».', 'яблоко',
  'maçã', 'ia', 'Copiar frase: pratique Я я em letra cursiva. Copie uma frase curta sem interromper o ritmo.',
  'Aplicar a letra em contexto.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1054, 33, 'Я', 'я', 'cursive', 14,
  'ditado', 'Escrever por ditado', 'B1', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Escrever por ditado: pratique Я я em letra cursiva. Ouça o modelo e escreva sem olhar; depois compare.',
  'Recuperar a grafia pela memória.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1055, 33, 'Я', 'я', 'cursive', 15,
  'fluencia', 'Treino de fluência', 'B2', 'яблоко', 'яблоко',
  'maçã', 'ia', 'Treino de fluência: pratique Я я em letra cursiva. Escreva com tempo controlado sem sacrificar clareza.',
  'Ganhar velocidade com legibilidade.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_curriculum (
  id, letter_position, upper_letter, lower_letter, mode, stage_number,
  stage_code, stage_title, cefr_level, target_text, example_word,
  translation, sound_hint, prompt, objective, rubric
) VALUES (
  1056, 33, 'Я', 'я', 'cursive', 16,
  'producao', 'Produção livre', 'C1', 'Я пишу слово «яблоко».', 'яблоко',
  'maçã', 'ia', 'Produção livre: pratique Я я em letra cursiva. Crie uma frase curta usando a palavra-modelo.',
  'Usar a escrita de maneira independente.', 'Observe proporção, linha de base, espaçamento, direção e legibilidade.'
)
ON CONFLICT (id) DO UPDATE SET
  target_text = EXCLUDED.target_text,
  prompt = EXCLUDED.prompt,
  objective = EXCLUDED.objective,
  rubric = EXCLUDED.rubric,
  active = TRUE;

INSERT INTO writing_exercises (external_id, letter, mode, level, prompt, expected_text, translation)
SELECT id, lower_letter, mode, LEAST(6, GREATEST(1, stage_number)), prompt, target_text, translation
FROM writing_curriculum
ON CONFLICT (external_id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  expected_text = EXCLUDED.expected_text,
  translation = EXCLUDED.translation,
  active = TRUE;

COMMIT;
