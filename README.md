# PUTIRUSU V15 — Escrita Cirílica e Cursiva

O PUTIRUSU V15 é um curso de russo em sete arquivos. Esta versão mantém o aplicativo anterior e amplia o módulo de escrita para ensinar as 33 letras do alfabeto cirílico em letra de forma e cursiva.

## Arquivos

- `index.html` — telas e banco semântico offline do currículo.
- `style.css` — interface responsiva, impressão e sistema de utilidades.
- `script.js` — curso, escrita no canvas, áudio, microfone, revisão, jogos e progresso.
- `server.js` — servidor Express, autenticação, progresso, tentativas e professor.
- `database.sql` — esquema PostgreSQL e currículo completo.
- `package.json` — dependências e comandos.
- `README.md` — instalação e documentação.

## Conteúdo de escrita

O currículo de caligrafia possui 1.056 exercícios reais:

- 33 letras cirílicas.
- letra de forma e letra cursiva.
- 16 etapas para cada modo.
- níveis A1, A2, B1, B2 e C1.
- palavras e traduções.
- treino de maiúsculas e minúsculas.
- ligações com `а`, `о`, `и` e `м`.
- sílabas, palavras, frases, ditado, fluência e produção livre.

## Funções principais

- Cadastro e login.
- Conta de demonstração.
- Curso do A1 ao C2.
- Alfabeto com som e exemplos.
- Comparação entre forma e cursiva.
- Canvas para desenhar com mouse, caneta ou dedo.
- espessura do lápis ajustável.
- guia com opacidade ajustável.
- linhas de caderno.
- modo para canhotos.
- limpar e desfazer traços.
- avaliação aproximada do treino.
- progresso por letra.
- caderno de cópia imprimível.
- teclado cirílico na tela.
- síntese de voz em russo.
- reconhecimento de fala quando o navegador oferece suporte.
- revisão de erros.
- provas e jogos.
- dicionário e cultura.
- exportação do progresso.
- API de currículo com filtros e paginação.

## Requisitos

- Node.js 18 ou superior.
- npm.
- Navegador moderno.
- PostgreSQL é opcional; o servidor também funciona com banco JSON local.

## Instalação

No terminal, entre na pasta do projeto e execute:

```bash
npm install
npm start
```

Abra:

```text
http://localhost:3000
```

## Conta de teste

```text
E-mail: aluno@putirusu.com
Senha: 123456
```

O arquivo `data/db.json` é criado automaticamente na primeira inicialização. Ele não precisa ser criado manualmente.

## Banco PostgreSQL

Crie um banco e execute:

```bash
psql -U postgres -d putirusu -f database.sql
```

O SQL cria tabelas para usuários, progresso, alfabeto, currículo, tentativas de escrita, aulas, vocabulário, revisões, provas e conversas.

## Professor com IA opcional

O app funciona sem chave, usando o professor local. Para ativar um modelo externo, configure as variáveis antes de iniciar o servidor.

Linux ou macOS:

```bash
export OPENAI_API_KEY="sua_chave"
export OPENAI_MODEL="nome_do_modelo_disponivel_na_sua_conta"
npm start
```

Windows PowerShell:

```powershell
$env:OPENAI_API_KEY="sua_chave"
$env:OPENAI_MODEL="nome_do_modelo_disponivel_na_sua_conta"
npm start
```

A chave fica somente no servidor. Nunca coloque a chave no `index.html` ou no `script.js`.

## API

### Saúde

```http
GET /api/health
```

### Cadastro

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Lucas",
  "email": "lucas@email.com",
  "password": "senha_segura"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "aluno@putirusu.com",
  "password": "123456"
}
```

### Currículo de escrita

```http
GET /api/content/writing?letter=ж&mode=cursive&level=A1&limit=50
```

Filtros aceitos:

- `letter`
- `mode`
- `level`
- `stage`
- `offset`
- `limit`

O total filtrado aparece no cabeçalho `X-Total-Count`.

### Tentativa de escrita

```http
POST /api/writing/attempts
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "letter": "ж",
  "mode": "cursive",
  "score": 82,
  "strokes": 4
}
```

### Professor

```http
POST /api/chat
Content-Type: application/json

{
  "scenario": "writing",
  "message": "Ensine a escrever Ж em cursiva"
}
```

## Verificação

```bash
npm run check
```

Esse comando verifica a sintaxe de `server.js` e `script.js`.

## Observações sobre cursiva

A aparência exata da cursiva varia conforme escola, pessoa e fonte instalada. O PUTIRUSU ensina movimento, proporção, ligação e legibilidade. Para uma caligrafia escolar específica, compare também com um caderno de caligrafia produzido por um professor ou editora russa.

## Segurança

- Troque `TOKEN_SECRET` em produção.
- Use HTTPS em produção.
- Não publique chaves de API.
- Use um banco PostgreSQL real em produção.
- Restrinja CORS ao domínio do aplicativo.
- Faça backup dos dados dos alunos.

## Licença

MIT.
