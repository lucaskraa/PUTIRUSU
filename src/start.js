"use strict";

const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET é obrigatório em produção.");
}

if (!process.env.TOKEN_SECRET) {
  process.env.TOKEN_SECRET = `putirusu-dev-${crypto.randomBytes(32).toString("hex")}`;
}

const { app } = require("../server");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

app.set("trust proxy", 1);

const server = app.listen(PORT, HOST, () => {
  console.log(`PUTIRUSU rodando em http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando PUTIRUSU...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
