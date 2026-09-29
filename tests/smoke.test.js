"use strict";

const assert = require("node:assert/strict");
const { once } = require("node:events");

process.env.NODE_ENV = "test";
process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || "putirusu-test-secret-only";

const { app } = require("../server");

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_) {
    body = text;
  }
  return { response, body };
}

async function run() {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const health = await request(baseUrl, "/api/health");
    assert.equal(health.response.status, 200);
    assert.equal(health.body.ok, true);
    assert.equal(health.body.app, "PUTIRUSU");

    const invalidRegister = await request(baseUrl, "/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "email-invalido",
        password: "1"
      })
    });
    assert.equal(invalidRegister.response.status, 400);

    const login = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "aluno@putirusu.com",
        password: "123456"
      })
    });
    assert.equal(login.response.status, 200);
    assert.ok(login.body.token);
    assert.equal(login.body.user.email, "aluno@putirusu.com");

    const me = await request(baseUrl, "/api/me", {
      headers: { authorization: `Bearer ${login.body.token}` }
    });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.email, "aluno@putirusu.com");

    const missing = await request(baseUrl, "/api/rota-que-nao-existe");
    assert.equal(missing.response.status, 404);

    console.log("✓ smoke tests: health, validação, login, sessão e 404");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
