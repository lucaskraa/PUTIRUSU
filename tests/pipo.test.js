"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../server");

async function withServer(run) {
  const server = app.listen(0);
  await new Promise(resolve => server.once("listening", resolve));
  try { await run("http://127.0.0.1:" + server.address().port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test("Pipo and app health endpoints are accessible", async () => {
  await withServer(async url => {
    const health = await fetch(url + "/api/health");
    assert.equal(health.status, 200);
    assert.equal((await health.json()).app, "PUTIRUSU");
    const ai = await fetch(url + "/api/ai/health");
    assert.equal(ai.status, 200);
    const data = await ai.json();
    assert.equal(data.pipoBuild, "3A-bilingual-realtime");
    assert.equal(typeof data.pronunciationConfigured, "boolean");
  });
});

test("Server secrets and files outside allowlist stay private", async () => {
  await withServer(async url => {
    for (const path of ["/server.js", "/companion-server.js", "/data/db.json", "/database.sql", "/package.json"]) {
      const response = await fetch(url + path);
      assert.equal(response.status, 404, path + " must not be served");
    }
    const js = await fetch(url + "/companion.js");
    assert.equal(js.status, 200);
    assert.match(await js.text(), /function connectRealtime/);
  });
});

test("Pronunciation route requires a valid session", async () => {
  await withServer(async url => {
    const response = await fetch(url + "/api/ai/pronunciation?target=" + encodeURIComponent("привет"), {
      method: "POST", headers: { "Content-Type": "audio/wav" }, body: Buffer.alloc(51200)
    });
    assert.equal(response.status, 401);
  });
});
