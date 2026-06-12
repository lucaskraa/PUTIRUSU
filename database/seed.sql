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
