# PUTIRUSU — Parte 1: Fundação

Esta etapa prepara o projeto para crescer sem destruir a versão atual.

## Objetivo

O PUTIRUSU será simples na interface e profundo no aprendizado. A fundação precisa suportar:

- curso e apostilas;
- progresso individual;
- exercícios multimodais;
- escrita cirílica/cursiva;
- fala e pronúncia;
- professor IA contextual;
- memória de aprendizagem;
- revisão adaptativa.

## Decisões desta etapa

### 1. Compatibilidade primeiro

A aplicação V15 continua sendo servida pelo `server.js` atual. O novo `src/start.js`
vira o ponto de entrada de produção e pode receber a arquitetura nova gradualmente.

### 2. Produção sem segredo padrão

Em produção, o app não inicia sem `TOKEN_SECRET`. Em desenvolvimento é criado um
segredo temporário automaticamente.

### 3. Testes reais

`npm test` não verifica apenas sintaxe. Ele sobe o Express em uma porta temporária e
testa saúde, validação, login, sessão autenticada e rota inexistente.

### 4. CI

O GitHub Actions executa os testes a cada push e pull request.

### 5. Supabase

O arquivo `supabase/migrations/20260929_001_foundation.sql` cria a fundação de dados:

- `profiles`;
- `learner_progress`;
- `skill_mastery`;
- `exercise_attempts`;
- `learning_events`;
- `ai_memories`.

Todas as tabelas ficam com Row Level Security ativado. Cada aluno só acessa os próprios
dados.

O projeto Supabase atual conectado à conta se chama `safe life` e não será reutilizado
para evitar misturar projetos. Um Supabase exclusivo do PUTIRUSU deve ser criado antes
de aplicar esta migration.

## Próximos passos dentro da Parte 1

1. Criar o projeto Supabase PUTIRUSU.
2. Aplicar a migration e rodar os advisors de segurança.
3. Ligar Auth e persistência ao backend.
4. Substituir gradualmente `data/db.json`.
5. Separar o backend monolítico em módulos sem alterar a experiência do usuário.
6. Promover a branch para `main` somente depois dos testes.

## Critério de conclusão

A Parte 1 termina quando:

- Render sobe sem erro;
- CI passa;
- autenticação usa Supabase;
- progresso persiste no PostgreSQL;
- nenhum dado de aluno depende de arquivo local;
- estrutura nova está pronta para receber o currículo da Parte 2.
