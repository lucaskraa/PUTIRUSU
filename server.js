const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "putirusu-data.json");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

function baseData() {
    return { users: [], progress: [], notes: [], reviews: [], exams: [], speaking: [], writing: [] };
}

function readData() {
    if (!fs.existsSync(DATA_FILE)) return baseData();
    try { return { ...baseData(), ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) }; } catch { return baseData(); }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

app.get("/api/health", (req, res) => {
    res.json({ success: true, app: "PUTIRUSU", version: "11.0.0" });
});

app.post("/api/profile", (req, res) => {
    const data = readData();
    const profile = { id: req.body.id || id(), name: req.body.name || "", goal: req.body.goal || "viagem", level: req.body.level || "iniciante", xp: Number(req.body.xp || 0), updatedAt: new Date().toISOString() };
    const index = data.users.findIndex(user => user.id === profile.id);
    if (index >= 0) data.users[index] = profile; else data.users.push(profile);
    writeData(data);
    res.json({ success: true, profile });
});

app.get("/api/profile/:id", (req, res) => {
    const data = readData();
    const profile = data.users.find(user => user.id === req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: "Perfil não encontrado" });
    res.json({ success: true, profile });
});

app.post("/api/progress", (req, res) => {
    const data = readData();
    const progress = { id: id(), userId: req.body.userId || "local", lesson: req.body.lesson || "", level: req.body.level || "", xp: Number(req.body.xp || 0), completed: Boolean(req.body.completed), createdAt: new Date().toISOString() };
    data.progress.push(progress);
    writeData(data);
    res.json({ success: true, progress });
});

app.get("/api/progress/:userId", (req, res) => {
    const data = readData();
    res.json({ success: true, progress: data.progress.filter(item => item.userId === req.params.userId) });
});

app.post("/api/review", (req, res) => {
    const data = readData();
    const review = { id: id(), userId: req.body.userId || "local", ru: req.body.ru || "", pt: req.body.pt || "", pron: req.body.pron || "", reason: req.body.reason || "revisão", createdAt: new Date().toISOString() };
    data.reviews.push(review);
    writeData(data);
    res.json({ success: true, review });
});

app.get("/api/review/:userId", (req, res) => {
    const data = readData();
    res.json({ success: true, reviews: data.reviews.filter(item => item.userId === req.params.userId) });
});

app.post("/api/exam", (req, res) => {
    const data = readData();
    const exam = { id: id(), userId: req.body.userId || "local", level: req.body.level || "A1", score: Number(req.body.score || 0), total: Number(req.body.total || 0), createdAt: new Date().toISOString() };
    data.exams.push(exam);
    writeData(data);
    res.json({ success: true, exam });
});



const V12_SERVER_LESSONS = [
  {
    "id": "server-v12-1",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-2",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-3",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-4",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-5",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-6",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-7",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-8",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-9",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-10",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-11",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-12",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-13",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-14",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-15",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-16",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-17",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-18",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-19",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-20",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-21",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-22",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-23",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-24",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-25",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-26",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-27",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-28",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-29",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-30",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-31",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-32",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-33",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-34",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-35",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-36",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-37",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-38",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-39",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-40",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-41",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-42",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-43",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-44",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-45",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-46",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-47",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-48",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-49",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-50",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-51",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-52",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-53",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-54",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-55",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-56",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-57",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-58",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-59",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-60",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-61",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-62",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-63",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-64",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-65",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-66",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-67",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-68",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-69",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-70",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-71",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-72",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-73",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-74",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-75",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-76",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-77",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-78",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-79",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-80",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-81",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-82",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-83",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-84",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-85",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-86",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-87",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-88",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-89",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-90",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-91",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-92",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-93",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-94",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-95",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-96",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-97",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-98",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-99",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-100",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-101",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-102",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-103",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-104",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-105",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-106",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-107",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-108",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-109",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-110",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-111",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-112",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-113",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-114",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-115",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-116",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-117",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-118",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-119",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-120",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-121",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-122",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-123",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-124",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-125",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-126",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-127",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-128",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-129",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-130",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-131",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-132",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-133",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-134",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-135",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-136",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-137",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-138",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-139",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-140",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-141",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-142",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-143",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-144",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-145",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-146",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-147",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-148",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-149",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-150",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-151",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-152",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-153",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-154",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-155",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-156",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-157",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-158",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-159",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-160",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-161",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-162",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-163",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-164",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-165",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-166",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-167",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-168",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-169",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-170",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-171",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-172",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-173",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-174",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-175",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-176",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-177",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-178",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-179",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-180",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-181",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-182",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-183",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-184",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-185",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-186",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-187",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-188",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-189",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-190",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-191",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-192",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-193",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-194",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-195",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-196",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-197",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-198",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-199",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-200",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-201",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-202",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-203",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-204",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-205",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-206",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-207",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-208",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-209",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-210",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-211",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-212",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-213",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-214",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-215",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-216",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-217",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-218",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-219",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-220",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-221",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-222",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-223",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-224",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-225",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-226",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-227",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-228",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-229",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-230",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-231",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-232",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-233",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-234",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-235",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-236",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-237",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-238",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-239",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-240",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-241",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-242",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-243",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-244",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-245",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-246",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-247",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-248",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-249",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-250",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-251",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-252",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-253",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-254",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-255",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-256",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-257",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-258",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-259",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-260",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-261",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-262",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-263",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-264",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-265",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-266",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-267",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-268",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-269",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-270",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-271",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-272",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-273",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-274",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-275",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-276",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-277",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-278",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-279",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-280",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-281",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-282",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-283",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-284",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-285",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-286",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-287",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-288",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-289",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-290",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-291",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-292",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-293",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-294",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-295",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-296",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-297",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-298",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-299",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-300",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-301",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-302",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-303",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-304",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-305",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-306",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-307",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-308",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-309",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-310",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-311",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-312",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-313",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-314",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-315",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-316",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-317",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-318",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-319",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-320",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-321",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-322",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-323",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-324",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-325",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-326",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-327",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-328",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-329",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-330",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-331",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-332",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-333",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-334",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-335",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-336",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-337",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-338",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-339",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-340",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-341",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-342",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-343",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-344",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-345",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-346",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-347",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-348",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-349",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-350",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-351",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-352",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-353",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-354",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-355",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-356",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-357",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-358",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-359",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-360",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-361",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-362",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-363",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-364",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-365",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-366",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-367",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-368",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-369",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-370",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-371",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-372",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-373",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-374",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-375",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-376",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-377",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-378",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-379",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-380",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-381",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-382",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-383",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-384",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-385",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-386",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-387",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-388",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-389",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-390",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-391",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-392",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-393",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-394",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-395",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-396",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-397",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-398",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-399",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-400",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-401",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-402",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-403",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-404",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-405",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-406",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-407",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-408",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-409",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-410",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-411",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-412",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-413",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-414",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-415",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-416",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-417",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-418",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-419",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-420",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-421",
    "level": "A2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-422",
    "level": "B1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-423",
    "level": "B2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-424",
    "level": "C1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-425",
    "level": "C2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-426",
    "level": "A1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-427",
    "level": "A2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-428",
    "level": "B1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-429",
    "level": "B2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-430",
    "level": "C1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-431",
    "level": "C2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-432",
    "level": "A1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-433",
    "level": "A2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-434",
    "level": "B1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-435",
    "level": "B2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-436",
    "level": "C1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-437",
    "level": "C2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-438",
    "level": "A1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-439",
    "level": "A2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-440",
    "level": "B1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-441",
    "level": "B2",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-442",
    "level": "C1",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-443",
    "level": "C2",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-444",
    "level": "A1",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-445",
    "level": "A2",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  },
  {
    "id": "server-v12-446",
    "level": "B1",
    "ru": "Спасибо",
    "pt": "obrigado",
    "pron": "spasibo",
    "cat": "educação"
  },
  {
    "id": "server-v12-447",
    "level": "B2",
    "ru": "Я учу русский язык.",
    "pt": "Eu estudo a língua russa.",
    "pron": "ya uchu russkiy yazyk",
    "cat": "estudo"
  },
  {
    "id": "server-v12-448",
    "level": "C1",
    "ru": "Где метро?",
    "pt": "Onde fica o metrô?",
    "pron": "gde metro",
    "cat": "viagem"
  },
  {
    "id": "server-v12-449",
    "level": "C2",
    "ru": "Мне нужна помощь.",
    "pt": "Eu preciso de ajuda.",
    "pron": "mne nuzhna pomoshch",
    "cat": "emergência"
  },
  {
    "id": "server-v12-450",
    "level": "A1",
    "ru": "Привет",
    "pt": "olá",
    "pron": "privet",
    "cat": "saudação"
  }
];

app.get("/api/v12/lessons", (req, res) => {
    res.json({ success: true, lessons: V12_SERVER_LESSONS });
});

app.get("/api/v12/lessons/:level", (req, res) => {
    res.json({ success: true, lessons: V12_SERVER_LESSONS.filter(item => item.level === req.params.level) });
});

app.listen(PORT, () => {
    console.log(`PUTIRUSU rodando em http://localhost:${PORT}`);
});
