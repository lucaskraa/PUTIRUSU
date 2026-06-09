
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "putirus-data.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { users: [], progress: [], chats: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
        return { users: [], progress: [], chats: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/health", (req, res) => {
    res.json({ ok: true, app: "PUTIRUS", version: "1.0.0" });
});

app.post("/api/users", (req, res) => {
    const data = readData();
    const { name, goal, minutes } = req.body;
    if (!name) return res.status(400).json({ error: "Nome obrigatório" });
    const user = { id: Date.now().toString(), name, goal: goal || "Aprender do zero", minutes: Number(minutes) || 20, createdAt: new Date().toISOString() };
    data.users.push(user);
    writeData(data);
    res.status(201).json(user);
});

app.get("/api/users", (req, res) => {
    res.json(readData().users);
});

app.post("/api/progress", (req, res) => {
    const data = readData();
    const item = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
    data.progress.push(item);
    writeData(data);
    res.status(201).json(item);
});

app.get("/api/progress", (req, res) => {
    res.json(readData().progress);
});

app.post("/api/chat", (req, res) => {
    const data = readData();
    const message = String(req.body.message || "").toLowerCase();
    let answer = "Vamos treinar russo. Escreva uma frase curta e eu ajudo com tradução, pronúncia ou correção.";
    if (message.includes("olá") || message.includes("oi")) answer = "Привет! Significa olá. Para formal, use Здравствуйте.";
    if (message.includes("obrigado")) answer = "Obrigado em russo é Спасибо. Pronúncia aproximada: spa-si-ba.";
    if (message.includes("restaurante")) answer = "No restaurante diga: Я хочу борщ, пожалуйста. Eu quero borscht, por favor.";
    if (message.includes("corrija") || message.includes("я есть студент")) answer = "O natural é Я студент, sem есть no presente.";
    const chat = { id: Date.now().toString(), message: req.body.message || "", answer, createdAt: new Date().toISOString() };
    data.chats.push(chat);
    writeData(data);
    res.json(chat);
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`PUTIRUS rodando em http://localhost:${PORT}`);
});
