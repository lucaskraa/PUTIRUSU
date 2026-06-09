# PUTIRUSUPUTIRUS - Russo com IA
PUTIRUS é um protótipo completo de app para aprender russo com tela de boas-vindas, cores inspiradas na bandeira da Rússia, áudio, flashcards, alfabeto cirílico, frases comuns, jogos, XP, corações, streak, perfil local e conversa com IA simulada.
Arquivos
`index.html`: estrutura do app
`style.css`: visual completo e responsivo
`script.js`: lógica do app, áudio, IA, jogos e progresso
`server.js`: backend Node.js com Express
`database.sql`: modelo SQL para PostgreSQL
`package.json`: dependências do projeto
Como rodar só o front-end
Abra o arquivo `index.html` no navegador.
Como rodar com servidor
Instale o Node.js e rode:
```bash
npm install
npm start
```
Depois abra:
```bash
http://localhost:3000
```
Banco de dados
O arquivo `database.sql` está preparado para PostgreSQL. Ele cria tabelas para usuários, progresso, vocabulário, histórico de conversa e tentativas de lições.
A versão atual do `server.js` salva dados em um arquivo local `putirus-data.json`, então o app funciona sem configurar banco. Para usar PostgreSQL real, conecte o backend ao banco usando a biblioteca `pg` e use as tabelas do `database.sql`.
Funções principais
Tela de boas-vindas
Identidade visual branco, azul e vermelho
Áudio em russo via Web Speech API
Controle de velocidade da voz
Flashcards por categoria
Alfabeto cirílico completo
IA professora simulada
Quiz
Jogo da memória
Combinação de palavras
Ditado e escrita
Gramática básica
Cultura russa
Perfil do aluno
XP, nível, corações, streak e meta diária
