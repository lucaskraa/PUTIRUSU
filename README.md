PUTIRUSU v14 — curso completo de russo
Aplicativo completo de estudos de russo com frontend, backend Node.js, PostgreSQL, progresso por usuário, microfone e IA real no servidor.
Conteúdo incluído
60 aulas do A1 ao C1.
5 níveis: A1, A2, B1, B2 e C1.
Vocabulário, diálogos, exemplos, exercícios e provas.
Cadastro e login.
Senha criptografada com bcrypt.
Sessão por JWT.
Progresso por aula salvo no PostgreSQL.
Tentativas e notas.
Revisão espaçada baseada nos erros.
Conquistas e XP.
IA professora real usando API no backend.
Conversa por cenários.
Correção de frases e textos.
Revisão gerada pela IA.
Microfone com reconhecimento de russo pelo navegador.
Leitura de palavras e frases em russo.
Jogos de tradução, digitação, escuta e memória.
Dicionário pesquisável.
Perfil, objetivo e meta diária.
Design branco, azul e vermelho inspirado na bandeira russa.
Animação de entrada com a logo PUTIRUSU.
Estrutura
```text
putirusu_curso_completo_v14/
├── server.js
├── package.json
├── database.sql
├── docker-compose.yml
├── .env.example
├── database/
│   ├── schema.sql
│   └── seed.sql
├── data/
│   └── curriculum.json
├── scripts/
│   ├── migrate.js
│   └── seed.js
└── public/
    ├── index.html
    ├── assets/
    │   └── logo-putirusu.svg
    ├── css/
    │   └── style.css
    └── js/
        ├── course-data.js
        ├── core.js
        ├── api.js
        ├── auth.js
        ├── dashboard.js
        ├── speech.js
        ├── course.js
        ├── alphabet.js
        ├── ai.js
        ├── practice.js
        ├── games.js
        ├── dictionary.js
        ├── profile.js
        └── app.js
```
Instalação rápida com PostgreSQL instalado
1. Crie o banco
```sql
CREATE DATABASE putirusu;
```
2. Copie o ambiente
No Windows:
```bat
copy .env.example .env
```
No Linux/macOS:
```bash
cp .env.example .env
```
3. Edite o `.env`
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/putirusu
JWT_SECRET=troque_por_uma_chave_grande_e_secreta
OPENAI_API_KEY=sua_chave_da_api
OPENAI_MODEL=gpt-5.4-mini
AI_MAX_OUTPUT_TOKENS=1000
CORS_ORIGIN=http://localhost:3000
```
A chave da IA fica apenas no servidor. Nunca coloque a chave dentro do HTML ou do JavaScript do navegador.
4. Instale as dependências
```bash
npm install
```
5. Crie as tabelas e insira o curso
```bash
npm run db:setup
```
6. Inicie
```bash
npm start
```
Abra:
```text
http://localhost:3000
```
Instalação rápida com Docker
Suba o PostgreSQL:
```bash
docker compose up -d
```
Depois:
```bash
cp .env.example .env
npm install
npm run db:seed
npm start
```
Conta de teste
Depois do seed:
```text
E-mail: demo@putirusu.com
Senha: putirusu123
```
IA real
A IA real usa a rota `/api/ai/*` no `server.js` e a Responses API no backend.
Configure:
```env
OPENAI_API_KEY=sua_chave
OPENAI_MODEL=gpt-5.4-mini
```
Sem chave, o aplicativo continua abrindo em modo fallback local, mas as respostas não terão a mesma capacidade da IA real.
Microfone
O reconhecimento de fala usa a API de voz do navegador.
Para maior compatibilidade, use Chrome ou Edge e abra o aplicativo por `http://localhost:3000`. Autorize o microfone quando o navegador solicitar.
Comandos
```bash
npm start
npm run dev
npm run check
npm run db:migrate
npm run db:seed
npm run db:setup
```
Banco de dados
Arquivos disponíveis:
`database.sql`: tabelas + conquistas.
`database/schema.sql`: estrutura completa.
`database/seed.sql`: conquistas fixas.
`scripts/seed.js`: insere as 60 aulas, vocabulário, exercícios e usuário demo a partir de `data/curriculum.json`.
O seed em Node é proposital: ele mantém os relacionamentos de UUID corretos e permite atualizar o curso sem repetir registros.
