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
    return {
        users: [],
        progress: [],
        notes: [],
        reviews: [],
        exams: [],
        speaking: [],
        writing: []
    };
}

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return baseData();
    }
    try {
        return {
            ...baseData(),
            ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
        };
    } catch {
        return baseData();
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        app: "PUTIRUSU",
        version: "9.0.0"
    });
});

app.post("/api/profile", (req, res) => {
    const data = readData();
    const profile = {
        id: req.body.id || createId(),
        name: req.body.name || "",
        goal: req.body.goal || "viagem",
        level: req.body.level || "iniciante",
        xp: Number(req.body.xp || 0),
        updatedAt: new Date().toISOString()
    };
    const index = data.users.findIndex(user => user.id === profile.id);
    if (index >= 0) {
        data.users[index] = profile;
    } else {
        data.users.push(profile);
    }
    writeData(data);
    res.json({
        success: true,
        profile
    });
});

app.get("/api/profile/:id", (req, res) => {
    const data = readData();
    const profile = data.users.find(user => user.id === req.params.id);
    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Perfil não encontrado"
        });
    }
    res.json({
        success: true,
        profile
    });
});

app.post("/api/progress", (req, res) => {
    const data = readData();
    const progress = {
        id: createId(),
        userId: req.body.userId || "local",
        lesson: req.body.lesson || "",
        level: req.body.level || "",
        xp: Number(req.body.xp || 0),
        completed: Boolean(req.body.completed),
        createdAt: new Date().toISOString()
    };
    data.progress.push(progress);
    writeData(data);
    res.json({
        success: true,
        progress
    });
});

app.get("/api/progress/:userId", (req, res) => {
    const data = readData();
    res.json({
        success: true,
        progress: data.progress.filter(item => item.userId === req.params.userId)
    });
});

app.post("/api/review", (req, res) => {
    const data = readData();
    const review = {
        id: createId(),
        userId: req.body.userId || "local",
        ru: req.body.ru || "",
        pt: req.body.pt || "",
        pron: req.body.pron || "",
        reason: req.body.reason || "revisão",
        createdAt: new Date().toISOString()
    };
    data.reviews.push(review);
    writeData(data);
    res.json({
        success: true,
        review
    });
});

app.get("/api/review/:userId", (req, res) => {
    const data = readData();
    res.json({
        success: true,
        reviews: data.reviews.filter(item => item.userId === req.params.userId)
    });
});

app.post("/api/notes", (req, res) => {
    const data = readData();
    const note = {
        id: createId(),
        userId: req.body.userId || "local",
        title: req.body.title || "Anotação",
        body: req.body.body || "",
        createdAt: new Date().toISOString()
    };
    data.notes.unshift(note);
    writeData(data);
    res.json({
        success: true,
        note
    });
});

app.get("/api/notes/:userId", (req, res) => {
    const data = readData();
    res.json({
        success: true,
        notes: data.notes.filter(item => item.userId === req.params.userId)
    });
});

app.post("/api/exam", (req, res) => {
    const data = readData();
    const exam = {
        id: createId(),
        userId: req.body.userId || "local",
        level: req.body.level || "A1",
        score: Number(req.body.score || 0),
        total: Number(req.body.total || 0),
        answers: req.body.answers || [],
        createdAt: new Date().toISOString()
    };
    data.exams.push(exam);
    writeData(data);
    res.json({
        success: true,
        exam
    });
});

app.get("/api/exam/:userId", (req, res) => {
    const data = readData();
    res.json({
        success: true,
        exams: data.exams.filter(item => item.userId === req.params.userId)
    });
});

app.post("/api/writing", (req, res) => {
    const data = readData();
    const writing = {
        id: createId(),
        userId: req.body.userId || "local",
        text: req.body.text || "",
        feedback: req.body.feedback || "",
        createdAt: new Date().toISOString()
    };
    data.writing.unshift(writing);
    writeData(data);
    res.json({
        success: true,
        writing
    });
});

app.post("/api/speaking", (req, res) => {
    const data = readData();
    const speaking = {
        id: createId(),
        userId: req.body.userId || "local",
        expected: req.body.expected || "",
        spoken: req.body.spoken || "",
        result: req.body.result || "",
        createdAt: new Date().toISOString()
    };
    data.speaking.unshift(speaking);
    writeData(data);
    res.json({
        success: true,
        speaking
    });
});

app.listen(PORT, () => {
    console.log(`PUTIRUSU rodando em http://localhost:${PORT}`);
});


const COURSE_CATALOG = [
    {
        "id": 1,
        "level": "A1",
        "title": "Saudações",
        "theme": "Primeiras conversas",
        "items": [
            "Как дела?",
            "Меня зовут Анна.",
            "Я из Бразилии.",
            "Очень приятно.",
            "Я учу русский язык."
        ]
    },
    {
        "id": 2,
        "level": "A1",
        "title": "Apresentação",
        "theme": "Nome e origem",
        "items": [
            "Очень приятно.",
            "Я учу русский язык.",
            "Я немного говорю по-русски.",
            "Я не понимаю.",
            "Повторите, пожалуйста."
        ]
    },
    {
        "id": 3,
        "level": "A1",
        "title": "Viagem básica",
        "theme": "Metrô, hotel e ajuda",
        "items": [
            "Я не понимаю.",
            "Повторите, пожалуйста.",
            "Говорите медленнее, пожалуйста.",
            "Где метро?",
            "Где гостиница?"
        ]
    },
    {
        "id": 4,
        "level": "A1",
        "title": "Comida básica",
        "theme": "Água, chá e restaurante",
        "items": [
            "Где метро?",
            "Где гостиница?",
            "Сколько это стоит?",
            "Мне нужна помощь.",
            "Я хочу воды."
        ]
    },
    {
        "id": 5,
        "level": "A2",
        "title": "Rotina",
        "theme": "Dia a dia",
        "items": [
            "Мне нужна помощь.",
            "Я хочу воды.",
            "Можно меню?",
            "Мне нравится русская музыка.",
            "Я люблю русские фильмы."
        ]
    },
    {
        "id": 6,
        "level": "A2",
        "title": "Cidade",
        "theme": "Lugares e direção",
        "items": [
            "Мне нравится русская музыка.",
            "Я люблю русские фильмы.",
            "Я хочу посетить музей.",
            "Парк очень красивый.",
            "Река рядом с городом."
        ]
    },
    {
        "id": 7,
        "level": "A2",
        "title": "Família e pessoas",
        "theme": "Pessoas importantes",
        "items": [
            "Парк очень красивый.",
            "Река рядом с городом.",
            "Сегодня холодно.",
            "Завтра будет тепло.",
            "Я готов к уроку."
        ]
    },
    {
        "id": 8,
        "level": "A2",
        "title": "Estudo",
        "theme": "Frases para aprender",
        "items": [
            "Завтра будет тепло.",
            "Я готов к уроку.",
            "Мне нужно повторить.",
            "Я хочу сдать экзамен.",
            "Это мой первый урок."
        ]
    },
    {
        "id": 9,
        "level": "B1",
        "title": "Opiniões",
        "theme": "Gostos e preferências",
        "items": [
            "Я хочу сдать экзамен.",
            "Это мой первый урок.",
            "Я пишу по-русски.",
            "Я слушаю и повторяю.",
            "Я говорю медленно."
        ]
    },
    {
        "id": 10,
        "level": "B1",
        "title": "Cultura",
        "theme": "Música, filme e museu",
        "items": [
            "Я слушаю и повторяю.",
            "Я говорю медленно.",
            "Это полезная фраза.",
            "Я хочу узнать больше о России.",
            "Русская кухня очень интересная."
        ]
    },
    {
        "id": 11,
        "level": "B1",
        "title": "Trabalho",
        "theme": "Rotina profissional",
        "items": [
            "Я хочу узнать больше о России.",
            "Русская кухня очень интересная.",
            "Борщ — известный суп.",
            "Чай важен в русской культуре.",
            "Москва — столица России."
        ]
    },
    {
        "id": 12,
        "level": "B1",
        "title": "Provas",
        "theme": "Como revisar",
        "items": [
            "Чай важен в русской культуре.",
            "Москва — столица России.",
            "Санкт-Петербург известен музеями.",
            "Матрешка — традиционная кукла.",
            "Баба-яга живёт в сказках."
        ]
    },
    {
        "id": 13,
        "level": "B2",
        "title": "História",
        "theme": "Rússia em contexto",
        "items": [
            "Матрешка — традиционная кукла.",
            "Баба-яга живёт в сказках.",
            "Я читаю русскую книгу.",
            "Мне нравится этот город.",
            "Я работаю сегодня."
        ]
    },
    {
        "id": 14,
        "level": "B2",
        "title": "Folclore",
        "theme": "Contos e símbolos",
        "items": [
            "Мне нравится этот город.",
            "Я работаю сегодня.",
            "Мы идём в парк.",
            "Они живут в Москве.",
            "Я хочу чай без сахара."
        ]
    },
    {
        "id": 15,
        "level": "B2",
        "title": "Culinária",
        "theme": "Receitas e ingredientes",
        "items": [
            "Они живут в Москве.",
            "Я хочу чай без сахара.",
            "У меня есть вопрос.",
            "Можно говорить по-русски?",
            "Я понимаю эту фразу."
        ]
    },
    {
        "id": 16,
        "level": "B2",
        "title": "Conversas longas",
        "theme": "Explicar ideias",
        "items": [
            "Можно говорить по-русски?",
            "Я понимаю эту фразу.",
            "Мне трудно, но интересно.",
            "Я хочу практиковаться каждый день.",
            "Я учу русский."
        ]
    },
    {
        "id": 17,
        "level": "C1",
        "title": "Leitura avançada",
        "theme": "Textos curtos",
        "items": [
            "Я хочу практиковаться каждый день.",
            "Я учу русский.",
            "Я слушаю музыку.",
            "Я читаю книгу.",
            "Я пишу текст."
        ]
    },
    {
        "id": 18,
        "level": "C1",
        "title": "Gramática aplicada",
        "theme": "Casos em contexto",
        "items": [
            "Я читаю книгу.",
            "Я пишу текст.",
            "Я иду в музей.",
            "Я иду в парк.",
            "Я пью чай."
        ]
    },
    {
        "id": 19,
        "level": "C1",
        "title": "Argumentação",
        "theme": "Opinião e motivo",
        "items": [
            "Я иду в парк.",
            "Я пью чай.",
            "Мы учу русский.",
            "Мы слушаю музыку.",
            "Мы читаю книгу."
        ]
    },
    {
        "id": 20,
        "level": "C1",
        "title": "Cultura avançada",
        "theme": "Literatura e arte",
        "items": [
            "Мы слушаю музыку.",
            "Мы читаю книгу.",
            "Мы пишу текст.",
            "Мы иду в музей.",
            "Мы иду в парк."
        ]
    },
    {
        "id": 21,
        "level": "C2",
        "title": "Fluência",
        "theme": "Naturalidade",
        "items": [
            "Мы иду в музей.",
            "Мы иду в парк.",
            "Мы пью чай.",
            "Мы говорю медленно.",
            "Он учу русский."
        ]
    },
    {
        "id": 22,
        "level": "C2",
        "title": "Interpretação",
        "theme": "Nuances",
        "items": [
            "Мы говорю медленно.",
            "Он учу русский.",
            "Он слушаю музыку.",
            "Он читаю книгу.",
            "Он пишу текст."
        ]
    },
    {
        "id": 23,
        "level": "C2",
        "title": "Produção de texto",
        "theme": "Escrever melhor",
        "items": [
            "Он читаю книгу.",
            "Он пишу текст.",
            "Он иду в музей.",
            "Он иду в парк.",
            "Он пью чай."
        ]
    },
    {
        "id": 24,
        "level": "C2",
        "title": "Fala avançada",
        "theme": "Responder com confiança",
        "items": [
            "Он иду в парк.",
            "Он пью чай.",
            "Он говорю медленно.",
            "Она учу русский.",
            "Она слушаю музыку."
        ]
    }
];

app.get("/api/course", (req, res) => {
    res.json({
        success: true,
        course: COURSE_CATALOG
    });
});

app.get("/api/course/:level", (req, res) => {
    res.json({
        success: true,
        course: COURSE_CATALOG.filter(unit => unit.level === req.params.level)
    });
});


const V10_SERVER_COURSE_BANK = [
  {
    "id": "server-lesson-1",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-2",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-3",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-4",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-5",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-6",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-7",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-8",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-9",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-10",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-11",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-12",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-13",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-14",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-15",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-16",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-17",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-18",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-19",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-20",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-21",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-22",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-23",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-24",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-25",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-26",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-27",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-28",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-29",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-30",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-31",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-32",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-33",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-34",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-35",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-36",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-37",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-38",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-39",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-40",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-41",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-42",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-43",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-44",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-45",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-46",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-47",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-48",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-49",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-50",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-51",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-52",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-53",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-54",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-55",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-56",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-57",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-58",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-59",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-60",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-61",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-62",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-63",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-64",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-65",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-66",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-67",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-68",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-69",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-70",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-71",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-72",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-73",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-74",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-75",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-76",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-77",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-78",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-79",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-80",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-81",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-82",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-83",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-84",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-85",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-86",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-87",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-88",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-89",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-90",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-91",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-92",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-93",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-94",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-95",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-96",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-97",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-98",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-99",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-100",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-101",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-102",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-103",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-104",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-105",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-106",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-107",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-108",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-109",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-110",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-111",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-112",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-113",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-114",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-115",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-116",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-117",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-118",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-119",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-120",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-121",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-122",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-123",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-124",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-125",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-126",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-127",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-128",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-129",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-130",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-131",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-132",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-133",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-134",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-135",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-136",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-137",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-138",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-139",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-140",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-141",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-142",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-143",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-144",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-145",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-146",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-147",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-148",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-149",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-150",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-151",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-152",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-153",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-154",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-155",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-156",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-157",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-158",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-159",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-160",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-161",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-162",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-163",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-164",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-165",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-166",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-167",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-168",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-169",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-170",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-171",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-172",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-173",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-174",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-175",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-176",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-177",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-178",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-179",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-180",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-181",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-182",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-183",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-184",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-185",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-186",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-187",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-188",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-189",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-190",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-191",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-192",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-193",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-194",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-195",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-196",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-197",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-198",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-199",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-200",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-201",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-202",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-203",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-204",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-205",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-206",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-207",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-208",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-209",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-210",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-211",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-212",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-213",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-214",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-215",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-216",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-217",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-218",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-219",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-220",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-221",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-222",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-223",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-224",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-225",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-226",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-227",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-228",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-229",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-230",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-231",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-232",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-233",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-234",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-235",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-236",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-237",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-238",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-239",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-240",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-241",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-242",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-243",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-244",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-245",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-246",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-247",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-248",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-249",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-250",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-251",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-252",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-253",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-254",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-255",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-256",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-257",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-258",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-259",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-260",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-261",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-262",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-263",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-264",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-265",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-266",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-267",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-268",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-269",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-270",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-271",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-272",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-273",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-274",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-275",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-276",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-277",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-278",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-279",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-280",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-281",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-282",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-283",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-284",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-285",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-286",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-287",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-288",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-289",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-290",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-291",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-292",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-293",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-294",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-295",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-296",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-297",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-298",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-299",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-300",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-301",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-302",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-303",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-304",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-305",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-306",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-307",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-308",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-309",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-310",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-311",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-312",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-313",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-314",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-315",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-316",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-317",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-318",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-319",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-320",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-321",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-322",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-323",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-324",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-325",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-326",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-327",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-328",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-329",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-330",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-331",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-332",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-333",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-334",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-335",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-336",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-337",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-338",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-339",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-340",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-341",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-342",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-343",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-344",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-345",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-346",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-347",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-348",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-349",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-350",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-351",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-352",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-353",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-354",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-355",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-356",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-357",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-358",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-359",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-360",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-361",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-362",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-363",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-364",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-365",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-366",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-367",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-368",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-369",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-370",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-371",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-372",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-373",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-374",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-375",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-376",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-377",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-378",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-379",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-380",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-381",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-382",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-383",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-384",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-385",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-386",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-387",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-388",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-389",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-390",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-391",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-392",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-393",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-394",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-395",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-396",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-397",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-398",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-399",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-400",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-401",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-402",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-403",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-404",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-405",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-406",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-407",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-408",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-409",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-410",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-411",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-412",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-413",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-414",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-415",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-416",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-417",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-418",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-419",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-420",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-421",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-422",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-423",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-424",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-425",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-426",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-427",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-428",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-429",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-430",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-431",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-432",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-433",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-434",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-435",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-436",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-437",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-438",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-439",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-440",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-441",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-442",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-443",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-444",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-445",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-446",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-447",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-448",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-449",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-450",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-451",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-452",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-453",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-454",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-455",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-456",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-457",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-458",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-459",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-460",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-461",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-462",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-463",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-464",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-465",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-466",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-467",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-468",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-469",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-470",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-471",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-472",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-473",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-474",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-475",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-476",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-477",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-478",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-479",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-480",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-481",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-482",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-483",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-484",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-485",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-486",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-487",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-488",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-489",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-490",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-491",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-492",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-493",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-494",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-495",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-496",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-497",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-498",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-499",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-500",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-501",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-502",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-503",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-504",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-505",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-506",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-507",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-508",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-509",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-510",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-511",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-512",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-513",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-514",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-515",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-516",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-517",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-518",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-519",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-520",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-521",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-522",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-523",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-524",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-525",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-526",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-527",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-528",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-529",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-530",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-531",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-532",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-533",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-534",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-535",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-536",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-537",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-538",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-539",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-540",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-541",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-542",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-543",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-544",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-545",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-546",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-547",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-548",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-549",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-550",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-551",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-552",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-553",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-554",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-555",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-556",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-557",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-558",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-559",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-560",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-561",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-562",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-563",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-564",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-565",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-566",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-567",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-568",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-569",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-570",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-571",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-572",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-573",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-574",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-575",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-576",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-577",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-578",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-579",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-580",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-581",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-582",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-583",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-584",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-585",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-586",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-587",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-588",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-589",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-590",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-591",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-592",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-593",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-594",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-595",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-596",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-597",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-598",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-599",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-600",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-601",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-602",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-603",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-604",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-605",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-606",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-607",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-608",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-609",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-610",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-611",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-612",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-613",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-614",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-615",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-616",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-617",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-618",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-619",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-620",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-621",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-622",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-623",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-624",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-625",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-626",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-627",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-628",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-629",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-630",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-631",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-632",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-633",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-634",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-635",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-636",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-637",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-638",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-639",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-640",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-641",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-642",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-643",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-644",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-645",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-646",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-647",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-648",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-649",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-650",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-651",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-652",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-653",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-654",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-655",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-656",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-657",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-658",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-659",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-660",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-661",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-662",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-663",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-664",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-665",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-666",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-667",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-668",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-669",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-670",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-671",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-672",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-673",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-674",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-675",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-676",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-677",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-678",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-679",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-680",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-681",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-682",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-683",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-684",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-685",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-686",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-687",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-688",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-689",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-690",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-691",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-692",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-693",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-694",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-695",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-696",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-697",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-698",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-699",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-700",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-701",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-702",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-703",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-704",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-705",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-706",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-707",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-708",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-709",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-710",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-711",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-712",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-713",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-714",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-715",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-716",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-717",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-718",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-719",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-720",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-721",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-722",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-723",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-724",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-725",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-726",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-727",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-728",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-729",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-730",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-731",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-732",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-733",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-734",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-735",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-736",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-737",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-738",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-739",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-740",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-741",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-742",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-743",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-744",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-745",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-746",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-747",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-748",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-749",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-750",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-751",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-752",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-753",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-754",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-755",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-756",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-757",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-758",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-759",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-760",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-761",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-762",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-763",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-764",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-765",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-766",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-767",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-768",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-769",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-770",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-771",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-772",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-773",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-774",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-775",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-776",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-777",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-778",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-779",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-780",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-781",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-782",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-783",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-784",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-785",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-786",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-787",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-788",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-789",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-790",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-791",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-792",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-793",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-794",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-795",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-796",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-797",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-798",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-799",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-800",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-801",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-802",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-803",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-804",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-805",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-806",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-807",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-808",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-809",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-810",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-811",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-812",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-813",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-814",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-815",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-816",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-817",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-818",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-819",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-820",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-821",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-822",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-823",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-824",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-825",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-826",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-827",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-828",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-829",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-830",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-831",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-832",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-833",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-834",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-835",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-836",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-837",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-838",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-839",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-840",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-841",
    "level": "A2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-842",
    "level": "B1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-843",
    "level": "B2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-844",
    "level": "C1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-845",
    "level": "C2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-846",
    "level": "A1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-847",
    "level": "A2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-848",
    "level": "B1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-849",
    "level": "B2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-850",
    "level": "C1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-851",
    "level": "C2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-852",
    "level": "A1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-853",
    "level": "A2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-854",
    "level": "B1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-855",
    "level": "B2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-856",
    "level": "C1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-857",
    "level": "C2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-858",
    "level": "A1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-859",
    "level": "A2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-860",
    "level": "B1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-861",
    "level": "B2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-862",
    "level": "C1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-863",
    "level": "C2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-864",
    "level": "A1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-865",
    "level": "A2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-866",
    "level": "B1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-867",
    "level": "B2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-868",
    "level": "C1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-869",
    "level": "C2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-870",
    "level": "A1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-871",
    "level": "A2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-872",
    "level": "B1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-873",
    "level": "B2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-874",
    "level": "C1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-875",
    "level": "C2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-876",
    "level": "A1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-877",
    "level": "A2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-878",
    "level": "B1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-879",
    "level": "B2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-880",
    "level": "C1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-881",
    "level": "C2",
    "theme": "apresentação",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-882",
    "level": "A1",
    "theme": "viagem",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-883",
    "level": "A2",
    "theme": "restaurante",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-884",
    "level": "B1",
    "theme": "cidade",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-885",
    "level": "B2",
    "theme": "família",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-886",
    "level": "C1",
    "theme": "estudo",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-887",
    "level": "C2",
    "theme": "trabalho",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-888",
    "level": "A1",
    "theme": "cultura",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-889",
    "level": "A2",
    "theme": "história",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-890",
    "level": "B1",
    "theme": "folclore",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  },
  {
    "id": "server-lesson-891",
    "level": "B2",
    "theme": "culinária",
    "russian": "Спасибо",
    "translation": "obrigado",
    "pronunciation": "spasibo"
  },
  {
    "id": "server-lesson-892",
    "level": "C1",
    "theme": "música",
    "russian": "Я учу русский язык.",
    "translation": "Eu estudo a língua russa.",
    "pronunciation": "ya uchu russkiy yazyk"
  },
  {
    "id": "server-lesson-893",
    "level": "C2",
    "theme": "filmes",
    "russian": "Где метро?",
    "translation": "Onde fica o metrô?",
    "pronunciation": "gde metro"
  },
  {
    "id": "server-lesson-894",
    "level": "A1",
    "theme": "provas",
    "russian": "Мне нужна помощь.",
    "translation": "Eu preciso de ajuda.",
    "pronunciation": "mne nuzhna pomoshch"
  },
  {
    "id": "server-lesson-895",
    "level": "A2",
    "theme": "revisão",
    "russian": "Я пишу по-русски.",
    "translation": "Eu escrevo em russo.",
    "pronunciation": "ya pishu po-russki"
  },
  {
    "id": "server-lesson-896",
    "level": "B1",
    "theme": "escrita",
    "russian": "Я говорю медленно.",
    "translation": "Eu falo devagar.",
    "pronunciation": "ya govoryu medlenno"
  },
  {
    "id": "server-lesson-897",
    "level": "B2",
    "theme": "fala",
    "russian": "Мне нравится русская музыка.",
    "translation": "Eu gosto de música russa.",
    "pronunciation": "mne nravitsya russkaya muzyka"
  },
  {
    "id": "server-lesson-898",
    "level": "C1",
    "theme": "gramática",
    "russian": "Борщ — известный суп.",
    "translation": "Borscht é uma sopa famosa.",
    "pronunciation": "borshch izvestnyy sup"
  },
  {
    "id": "server-lesson-899",
    "level": "C2",
    "theme": "leitura",
    "russian": "Баба-яга живёт в сказках.",
    "translation": "Baba Yaga vive nos contos.",
    "pronunciation": "Baba-yaga zhivyot v skazkakh"
  },
  {
    "id": "server-lesson-900",
    "level": "A1",
    "theme": "saudações",
    "russian": "Привет",
    "translation": "olá",
    "pronunciation": "privet"
  }
];

app.get("/api/v10/course-bank", (req, res) => {
    res.json({
        success: true,
        total: V10_SERVER_COURSE_BANK.length,
        lessons: V10_SERVER_COURSE_BANK
    });
});

app.get("/api/v10/course-bank/level/:level", (req, res) => {
    res.json({
        success: true,
        lessons: V10_SERVER_COURSE_BANK.filter(item => item.level === req.params.level)
    });
});

app.get("/api/v10/course-bank/theme/:theme", (req, res) => {
    const theme = String(req.params.theme || "").toLowerCase();
    res.json({
        success: true,
        lessons: V10_SERVER_COURSE_BANK.filter(item => String(item.theme).toLowerCase().includes(theme))
    });
});

app.post("/api/v10/teacher", (req, res) => {
    const query = String(req.body.query || "").toLowerCase();
    const found = V10_SERVER_COURSE_BANK.find(item =>
        String(item.russian).toLowerCase().includes(query) ||
        String(item.translation).toLowerCase().includes(query) ||
        String(item.theme).toLowerCase().includes(query)
    ) || V10_SERVER_COURSE_BANK[0];
    res.json({
        success: true,
        answer: {
            russian: found.russian,
            translation: found.translation,
            pronunciation: found.pronunciation,
            explanation: "Primeiro entenda a tradução, depois ouça, repita, escreva e responda.",
            questions: [
                "Qual é a tradução?",
                "Como se pronuncia?",
                "Copie em russo."
            ]
        }
    });
});
