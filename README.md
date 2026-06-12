PUTIRUSU — arquivos separados com IA real
Este projeto tem o app separado por arquivos e uma IA mais funcional no backend.
Como rodar
No terminal, dentro da pasta:
```bash
npm install
npm start
```
Abra:
```text
http://localhost:3000
```
Como ligar a IA real
Copie o arquivo `.env.example`
Renomeie a cópia para `.env`
Coloque sua chave:
```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
```
Reinicie o servidor:
```bash
npm start
```
Importante
A chave da API fica só no `server.js`, pelo `.env`.
Nunca coloque chave no `app.js`, porque arquivo do front aparece para qualquer pessoa no navegador.
Arquivos
`server.js` — servidor, banco local e rotas da IA real.
`.env.example` — modelo para configurar a chave.
`package.json` — dependências.
`public/index.html` — todas as telas.
`public/css/style.css` — design completo no estilo da bandeira russa.
`public/js/course-data.js` — aulas, alfabeto, frases, cenários e dicionário.
`public/js/app.js` — funcionamento do app.
`public/assets/logo-putirusu.svg` — logo inicial.
`data/db.json` — criado automaticamente ao rodar.
IA real
Rotas principais:
`POST /api/ai/teacher`
`POST /api/ai/chat`
`POST /api/ai/correct`
`POST /api/ai/review`
Se a chave não estiver configurada, o app usa fallback offline para não quebrar.
