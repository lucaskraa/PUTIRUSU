"use strict";

const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

const allowEphemeralToken = process.env.ALLOW_EPHEMERAL_TOKEN === "true";

if (isProduction && !process.env.TOKEN_SECRET && !allowEphemeralToken) {
  throw new Error("TOKEN_SECRET é obrigatório em produção.");
}

if (!process.env.TOKEN_SECRET) {
  process.env.TOKEN_SECRET = `putirusu-ephemeral-${crypto.randomBytes(32).toString("hex")}`;
  console.warn("PUTIRUSU usando TOKEN_SECRET efêmero. Sessões serão invalidadas ao reiniciar o serviço.");
}

const { app, companionRuntime } = require("../server");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

app.set("trust proxy", 1);

const server = app.listen(PORT, HOST, () => {
  console.log(`PUTIRUSU rodando em http://${HOST}:${PORT}`);
});

if (companionRuntime && typeof companionRuntime.attachWebSocketServer === "function") {
  companionRuntime.attachWebSocketServer(server);
}

function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando PUTIRUSU...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
