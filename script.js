const state = {
    xp: Number(localStorage.getItem("putirus_xp")) || 0,
    level: Number(localStorage.getItem("putirus_level")) || 1,
    hearts: Number(localStorage.getItem("putirus_hearts")) || 5,
    streak: Number(localStorage.getItem("putirus_streak")) || 0,
    dailyXP: Number(localStorage.getItem("putirus_daily_xp")) || 0,
    lastLogin: localStorage.getItem("putirus_last_login") || "",
    dailyGoal: 80,
    currentCategory: "Básico",
    pronIndex: 0,
    currentGame: "quiz",
    quizIndex: 0,
    writingIndex: 0,
    selectedMatch: null,
    flippedCards: []
};

const alphabet = [
    ["А", "a", "арбуз", "melancia"], ["Б", "b", "банк", "banco"], ["В", "v", "вода", "água"], ["Г", "g", "город", "cidade"], ["Д", "d", "дом", "casa"], ["Е", "ie", "еда", "comida"], ["Ё", "io", "ёлка", "árvore"], ["Ж", "j forte", "журнал", "revista"], ["З", "z", "зима", "inverno"], ["И", "i", "имя", "nome"], ["Й", "i curto", "йога", "yoga"], ["К", "k", "кот", "gato"], ["Л", "l", "лампа", "lâmpada"], ["М", "m", "мама", "mãe"], ["Н", "n", "нос", "nariz"], ["О", "o", "окно", "janela"], ["П", "p", "папа", "pai"], ["Р", "r", "Россия", "Rússia"], ["С", "s", "сок", "suco"], ["Т", "t", "такси", "táxi"], ["У", "u", "утро", "manhã"], ["Ф", "f", "фото", "foto"], ["Х", "kh", "хлеб", "pão"], ["Ц", "ts", "центр", "centro"], ["Ч", "tch", "чай", "chá"], ["Ш", "ch", "школа", "escola"], ["Щ", "chtch", "щи", "sopa"], ["Ъ", "sinal duro", "объект", "objeto"], ["Ы", "i fechado", "мы", "nós"], ["Ь", "sinal brando", "день", "dia"], ["Э", "é", "это", "isto"], ["Ю", "iu", "юг", "sul"], ["Я", "ia", "я", "eu"]
];

const vocabulary = [
    { ru: "Привет", pt: "Olá", category: "Básico" }, { ru: "Пока", pt: "Tchau", category: "Básico" }, { ru: "Спасибо", pt: "Obrigado", category: "Básico" }, { ru: "Пожалуйста", pt: "Por favor", category: "Básico" }, { ru: "Да", pt: "Sim", category: "Básico" }, { ru: "Нет", pt: "Não", category: "Básico" }, { ru: "Извините", pt: "Desculpe", category: "Básico" }, { ru: "Хорошо", pt: "Bem", category: "Básico" },
    { ru: "Я", pt: "Eu", category: "Pronomes" }, { ru: "Ты", pt: "Você informal", category: "Pronomes" }, { ru: "Он", pt: "Ele", category: "Pronomes" }, { ru: "Она", pt: "Ela", category: "Pronomes" }, { ru: "Мы", pt: "Nós", category: "Pronomes" }, { ru: "Вы", pt: "Você formal", category: "Pronomes" }, { ru: "Они", pt: "Eles", category: "Pronomes" },
    { ru: "Один", pt: "Um", category: "Números" }, { ru: "Два", pt: "Dois", category: "Números" }, { ru: "Три", pt: "Três", category: "Números" }, { ru: "Четыре", pt: "Quatro", category: "Números" }, { ru: "Пять", pt: "Cinco", category: "Números" }, { ru: "Десять", pt: "Dez", category: "Números" }, { ru: "Двадцать", pt: "Vinte", category: "Números" },
    { ru: "Мама", pt: "Mãe", category: "Família" }, { ru: "Папа", pt: "Pai", category: "Família" }, { ru: "Брат", pt: "Irmão", category: "Família" }, { ru: "Сестра", pt: "Irmã", category: "Família" }, { ru: "Друг", pt: "Amigo", category: "Família" }, { ru: "Семья", pt: "Família", category: "Família" },
    { ru: "Вода", pt: "Água", category: "Comida" }, { ru: "Хлеб", pt: "Pão", category: "Comida" }, { ru: "Яблоко", pt: "Maçã", category: "Comida" }, { ru: "Чай", pt: "Chá", category: "Comida" }, { ru: "Кофе", pt: "Café", category: "Comida" }, { ru: "Борщ", pt: "Sopa borscht", category: "Comida" },
    { ru: "Красный", pt: "Vermelho", category: "Cores" }, { ru: "Синий", pt: "Azul", category: "Cores" }, { ru: "Белый", pt: "Branco", category: "Cores" }, { ru: "Чёрный", pt: "Preto", category: "Cores" }, { ru: "Зелёный", pt: "Verde", category: "Cores" }, { ru: "Жёлтый", pt: "Amarelo", category: "Cores" },
    { ru: "Где метро?", pt: "Onde fica o metrô?", category: "Viagem" }, { ru: "Сколько стоит?", pt: "Quanto custa?", category: "Viagem" }, { ru: "Мне нужен билет", pt: "Preciso de uma passagem", category: "Viagem" }, { ru: "Аэропорт", pt: "Aeroporto", category: "Viagem" }, { ru: "Поезд", pt: "Trem", category: "Viagem" }, { ru: "Такси", pt: "Táxi", category: "Viagem" },
    { ru: "Я люблю тебя", pt: "Eu te amo", category: "Frases" }, { ru: "Я не понимаю", pt: "Eu não entendo", category: "Frases" }, { ru: "Говорите медленнее", pt: "Fale mais devagar", category: "Frases" }, { ru: "Меня зовут...", pt: "Meu nome é...", category: "Frases" }, { ru: "Я из Бразилии", pt: "Eu sou do Brasil", category: "Frases" }, { ru: "Очень приятно", pt: "Muito prazer", category: "Frases" }
];

const grammar = [
    ["Casos", "O russo muda a terminação das palavras conforme a função na frase. Os principais são nominativo, genitivo, dativo, acusativo, instrumental e preposicional."],
    ["Nominativo", "Usado para o sujeito. Exemplo: Кот спит. O gato dorme."],
    ["Genitivo", "Usado para posse, ausência e quantidade. Exemplo: У меня нет воды. Eu não tenho água."],
    ["Dativo", "Usado para destino indireto. Exemplo: Я даю книгу другу. Eu dou o livro ao amigo."],
    ["Acusativo", "Usado para objeto direto e direção. Exemplo: Я вижу дом. Eu vejo a casa."],
    ["Instrumental", "Usado para meio, companhia ou instrumento. Exemplo: Я пишу ручкой. Eu escrevo com caneta."],
    ["Preposicional", "Usado depois de algumas preposições. Exemplo: Я живу в Москве. Eu moro em Moscou."],
    ["Verbos", "No presente, verbos mudam por pessoa. Я говорю, ты говоришь, он говорит."],
    ["Passado", "O passado muda por gênero. Он говорил, она говорила, они говорили."],
    ["Ter", "A ideia de ter normalmente usa У меня есть. Exemplo: У меня есть книга. Eu tenho um livro."]
];

const culture = [
    ["Bandeira", "Branco, azul e vermelho representam a identidade visual usada neste app."],
    ["Moscou", "Capital da Rússia, conhecida pela Praça Vermelha, Kremlin e metrô histórico."],
    ["São Petersburgo", "Cidade famosa por museus, canais, arquitetura e o Hermitage."],
    ["Comida", "Borscht, pelmeni, blini, kvass e chá fazem parte da cultura gastronômica."],
    ["Música", "Kino, DDT, Tchaikovsky e Rachmaninoff são nomes conhecidos em estilos diferentes."],
    ["Tradições", "Banya, samovar, Matryoshka e celebrações de Ano Novo são símbolos populares."]
];

const quizQuestions = [
    { q: "Como se diz 'obrigado' em russo?", options: ["Пожалуйста", "Спасибо", "Привет", "Пока"], answer: "Спасибо" },
    { q: "Qual palavra significa 'água'?", options: ["Хлеб", "Вода", "Чай", "Дом"], answer: "Вода" },
    { q: "Como se diz 'eu'?", options: ["Ты", "Мы", "Я", "Они"], answer: "Я" },
    { q: "Qual cor é 'синий'?", options: ["Vermelho", "Azul", "Branco", "Verde"], answer: "Azul" },
    { q: "Como perguntar 'quanto custa?'", options: ["Где метро?", "Сколько стоит?", "Я не понимаю", "Меня зовут"], answer: "Сколько стоит?" },
    { q: "Qual é 'nós' em russo?", options: ["Мы", "Вы", "Они", "Он"], answer: "Мы" },
    { q: "Como dizer 'eu sou do Brasil'?", options: ["Я из Бразилии", "Я люблю тебя", "Я не знаю", "Я говорю"], answer: "Я из Бразилии" }
];

const aiKnowledge = [
    { keys: ["olá", "oi", "cumprimento", "cumprimentos"], answer: "Para cumprimentar em russo, use Привет para informal e Здравствуйте para formal. Exemplo: Привет, как дела? significa Olá, como vai?" },
    { keys: ["restaurante", "comida", "pedir"], answer: "No restaurante você pode dizer: Я хочу борщ, пожалуйста. Significa: Eu quero borscht, por favor. Para pedir a conta: Счёт, пожалуйста." },
    { keys: ["corrija", "corrigir", "я есть студент"], answer: "A frase Я есть студент soa errada para 'eu sou estudante'. O natural é: Я студент. Em russo, no presente, muitas vezes o verbo 'ser/estar' fica omitido." },
    { keys: ["nome", "chamo"], answer: "Para dizer seu nome: Меня зовут Animal. Para perguntar o nome: Как вас зовут?" },
    { keys: ["viagem", "metrô", "metro", "aeroporto"], answer: "Frases úteis: Где метро? Onde fica o metrô? Мне нужен билет. Preciso de uma passagem. Где аэропорт? Onde fica o aeroporto?" },
    { keys: ["amor", "amo", "gosto"], answer: "Я люблю тебя significa Eu te amo. Ты мне нравишься significa Eu gosto de você." },
    { keys: ["alfabeto", "letra", "cirílico"], answer: "O russo usa o alfabeto cirílico com 33 letras. Comece por А, К, М, О, Т, pois parecem sons fáceis para brasileiros." },
    { keys: ["gramática", "caso", "casos"], answer: "A parte mais importante da gramática russa são os casos. Eles mudam o fim das palavras para mostrar sujeito, posse, destino, objeto e localização." }
];

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function init() {
    checkStreak();
    bindEvents();
    renderAll();
    addMessage("ai", "Привет! Eu sou sua IA professora de russo. Me pergunte frases, traduções, pronúncia ou peça para simular uma conversa.");
}

function bindEvents() {
    document.getElementById("start-app-btn").addEventListener("click", startApp);
    document.getElementById("demo-audio-btn").addEventListener("click", () => speak("Привет! Добро пожаловать в PUTIRUS!"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.section)));
    document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.go)));
    document.getElementById("speak-current-btn").addEventListener("click", speakCurrentPron);
    document.getElementById("next-pron-btn").addEventListener("click", nextPron);
    document.getElementById("dictation-speak-btn").addEventListener("click", speakCurrentPron);
    document.getElementById("dictation-check-btn").addEventListener("click", checkDictation);
    document.getElementById("chat-form").addEventListener("submit", sendChat);
    document.querySelectorAll(".chat-tools button").forEach(btn => btn.addEventListener("click", () => quickPrompt(btn.dataset.prompt)));
    document.querySelectorAll(".lesson-tab").forEach(btn => btn.addEventListener("click", () => switchGame(btn.dataset.game)));
    document.getElementById("profile-form").addEventListener("submit", saveProfile);
    document.getElementById("reset-progress-btn").addEventListener("click", resetProgress);
}

function startApp() {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("app").classList.remove("hidden-app");
    showSection("home");
}

function showSection(id) {
    document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active-section"));
    document.getElementById(id).classList.add("active-section");
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.section === id));
    const title = document.querySelector(`[data-section="${id}"]`)?.textContent || "PUTIRUS";
    document.getElementById("page-title").textContent = title;
    if (id === "lessons") renderGame();
}

function renderAll() {
    updateStats();
    renderRoadmap();
    renderAlphabet();
    renderFilters();
    renderVocabulary();
    renderGrammar();
    renderPhrases();
    renderCulture();
    loadProfile();
    updatePronCard();
    renderGame();
}

function updateStats() {
    document.getElementById("xp").textContent = state.xp;
    document.getElementById("level").textContent = state.level;
    document.getElementById("streak").textContent = state.streak;
    document.getElementById("daily-xp").textContent = state.dailyXP;
    document.getElementById("hearts").textContent = "❤️".repeat(state.hearts) + "♡".repeat(5 - state.hearts);
    const needed = state.level * 120;
    document.getElementById("progress-fill").style.width = `${Math.min(100, Math.round((state.xp % needed) / needed * 100))}%`;
    document.getElementById("daily-message").textContent = state.dailyXP >= state.dailyGoal ? "Meta diária concluída. Отлично!" : "Continue treinando para bater a meta diária.";
    localStorage.setItem("putirus_xp", state.xp);
    localStorage.setItem("putirus_level", state.level);
    localStorage.setItem("putirus_hearts", state.hearts);
    localStorage.setItem("putirus_streak", state.streak);
    localStorage.setItem("putirus_daily_xp", state.dailyXP);
}

function checkStreak() {
    const today = todayKey();
    if (state.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        state.streak = state.lastLogin === y ? state.streak + 1 : 1;
        state.dailyXP = 0;
        state.lastLogin = today;
        localStorage.setItem("putirus_last_login", today);
    }
}

function addXP(amount) {
    state.xp += amount;
    state.dailyXP += amount;
    const needed = state.level * 120;
    if (state.xp >= needed) {
        state.level += 1;
        toast(`Você subiu para o nível ${state.level}!`);
    } else {
        toast(`+${amount} XP`);
    }
    updateStats();
}

function loseHeart() {
    state.hearts = Math.max(0, state.hearts - 1);
    updateStats();
    if (state.hearts === 0) toast("Sem corações. Use o perfil para resetar ou revise flashcards.");
}

function renderRoadmap() {
    const items = ["Alfabeto", "20 palavras", "Primeira conversa", "Ditado", "Gramática", "Viagem", "Restaurante", "Revisão geral"];
    document.getElementById("roadmap").innerHTML = items.map((item, i) => `<div class="road-step"><strong>${i + 1}. ${item}</strong><span>${state.xp > i * 80 ? "Concluído" : "Em andamento"}</span></div>`).join("");
}

function renderAlphabet() {
    document.getElementById("alphabet-grid").innerHTML = alphabet.map(item => `<article class="alphabet-card" data-speak="${item[0]}"><strong>${item[0]}</strong><span>${item[1]}</span><p>${item[2]} - ${item[3]}</p><button>Ouvir</button></article>`).join("");
    document.querySelectorAll(".alphabet-card").forEach(card => card.addEventListener("click", () => speak(card.dataset.speak)));
}

function renderFilters() {
    const categories = [...new Set(vocabulary.map(v => v.category))];
    document.getElementById("category-filters").innerHTML = categories.map(cat => `<button class="filter-btn ${cat === state.currentCategory ? "active" : ""}" data-cat="${cat}">${cat}</button>`).join("");
    document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
        state.currentCategory = btn.dataset.cat;
        renderFilters();
        renderVocabulary();
    }));
}

function renderVocabulary() {
    const cards = vocabulary.filter(v => v.category === state.currentCategory);
    document.getElementById("vocabulary-cards").innerHTML = cards.map(v => `<article class="flashcard"><div class="flashcard-word">${v.ru}</div><div class="flashcard-translation">${v.pt}</div><div class="flashcard-meta"><small>${v.category}</small><button data-speak="${v.ru}">Ouvir</button></div></article>`).join("");
    document.querySelectorAll("#vocabulary-cards button").forEach(btn => btn.addEventListener("click", e => {
        e.stopPropagation();
        speak(btn.dataset.speak);
        addXP(2);
    }));
}

function renderGrammar() {
    document.getElementById("grammar-grid").innerHTML = grammar.map(g => `<article class="grammar-card"><h3>${g[0]}</h3><p>${g[1]}</p></article>`).join("");
}

function renderPhrases() {
    const phrases = vocabulary.filter(v => v.category === "Frases" || v.category === "Viagem" || v.category === "Básico");
    document.getElementById("phrase-list").innerHTML = phrases.map(v => `<article class="phrase-item"><strong>${v.ru}</strong><span>${v.pt}</span><button data-speak="${v.ru}">Ouvir</button></article>`).join("");
    document.querySelectorAll("#phrase-list button").forEach(btn => btn.addEventListener("click", () => speak(btn.dataset.speak)));
}

function renderCulture() {
    document.getElementById("culture-grid").innerHTML = culture.map(c => `<article class="culture-card"><h3>${c[0]}</h3><p>${c[1]}</p></article>`).join("");
}

function speak(text) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ru-RU";
    utter.rate = Number(document.getElementById("voice-rate")?.value) || 0.8;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
}

function updatePronCard() {
    const item = vocabulary[state.pronIndex % vocabulary.length];
    document.getElementById("pron-russian").textContent = item.ru;
    document.getElementById("pron-translation").textContent = item.pt;
}

function speakCurrentPron() {
    const item = vocabulary[state.pronIndex % vocabulary.length];
    speak(item.ru);
}

function nextPron() {
    state.pronIndex = (state.pronIndex + 1) % vocabulary.length;
    updatePronCard();
}

function checkDictation() {
    const item = vocabulary[state.pronIndex % vocabulary.length];
    const value = document.getElementById("dictation-input").value.trim().toLowerCase();
    const result = document.getElementById("dictation-result");
    if (value === item.ru.toLowerCase()) {
        result.textContent = "Correto!";
        addXP(15);
        nextPron();
        document.getElementById("dictation-input").value = "";
    } else {
        result.textContent = `Quase. A resposta era: ${item.ru}`;
        loseHeart();
    }
}

function addMessage(type, text) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendChat(e) {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";
    setTimeout(() => addMessage("ai", getAiAnswer(text)), 300);
    addXP(5);
}

function quickPrompt(text) {
    document.getElementById("chat-input").value = text;
    document.getElementById("chat-form").dispatchEvent(new Event("submit"));
}

function getAiAnswer(text) {
    const clean = text.toLowerCase();
    const found = aiKnowledge.find(item => item.keys.some(key => clean.includes(key)));
    if (found) return found.answer;
    if (clean.includes("tradu")) return "Me mande a palavra ou frase e eu te ajudo. Exemplo: 'traduza bom dia'. Em russo, bom dia pode ser Доброе утро.";
    if (clean.includes("como se diz")) return "Boa pergunta. Para aprender rápido, tente escrever: Como se diz 'obrigado'? A resposta seria Спасибо.";
    return "Entendi. Vamos treinar assim: escreva uma frase curta em português ou russo. Eu posso traduzir, corrigir ou montar um diálogo. Uma frase útil agora: Я учу русский язык. Significa: Eu estudo a língua russa.";
}

function switchGame(game) {
    state.currentGame = game;
    document.querySelectorAll(".lesson-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.game === game));
    renderGame();
}

function renderGame() {
    if (state.currentGame === "quiz") renderQuiz();
    if (state.currentGame === "memory") renderMemory();
    if (state.currentGame === "matching") renderMatching();
    if (state.currentGame === "writing") renderWriting();
}

function renderQuiz() {
    const q = quizQuestions[state.quizIndex % quizQuestions.length];
    document.getElementById("game-area").innerHTML = `<div class="quiz-question"><h3>${q.q}</h3><div class="options-grid">${q.options.map(opt => `<button class="option-btn" data-answer="${opt}">${opt}</button>`).join("")}</div></div>`;
    document.querySelectorAll(".option-btn").forEach(btn => btn.addEventListener("click", () => {
        if (btn.dataset.answer === q.answer) {
            btn.classList.add("correct");
            addXP(12);
        } else {
            btn.classList.add("wrong");
            loseHeart();
        }
        state.quizIndex++;
        setTimeout(renderQuiz, 650);
    }));
}

function renderMemory() {
    const pairs = vocabulary.slice(0, 8);
    const cards = pairs.flatMap((v, i) => [{ id: i, text: v.ru }, { id: i, text: v.pt }]).sort(() => Math.random() - 0.5);
    state.flippedCards = [];
    document.getElementById("game-area").innerHTML = `<div class="memory-grid">${cards.map((card, i) => `<div class="memory-card" data-id="${card.id}" data-text="${card.text}" data-index="${i}">?</div>`).join("")}</div>`;
    document.querySelectorAll(".memory-card").forEach(card => card.addEventListener("click", () => flipMemory(card)));
}

function flipMemory(card) {
    if (card.classList.contains("matched") || card.classList.contains("flipped") || state.flippedCards.length >= 2) return;
    card.classList.add("flipped");
    card.textContent = card.dataset.text;
    state.flippedCards.push(card);
    if (state.flippedCards.length === 2) {
        setTimeout(() => {
            const [a, b] = state.flippedCards;
            if (a.dataset.id === b.dataset.id) {
                a.classList.add("matched");
                b.classList.add("matched");
                addXP(18);
            } else {
                a.classList.remove("flipped");
                b.classList.remove("flipped");
                a.textContent = "?";
                b.textContent = "?";
                loseHeart();
            }
            state.flippedCards = [];
        }, 700);
    }
}

function renderMatching() {
    const pairs = vocabulary.slice(8, 16);
    const cards = [...pairs.map(v => ({ type: "ru", ru: v.ru, pt: v.pt, text: v.ru })), ...pairs.map(v => ({ type: "pt", ru: v.ru, pt: v.pt, text: v.pt }))].sort(() => Math.random() - 0.5);
    state.selectedMatch = null;
    document.getElementById("game-area").innerHTML = `<div class="matching-grid">${cards.map(v => `<div class="matching-card" data-ru="${v.ru}" data-pt="${v.pt}" data-type="${v.type}">${v.text}</div>`).join("")}</div>`;
    document.querySelectorAll(".matching-card").forEach(card => card.addEventListener("click", () => clickMatch(card)));
}

function clickMatch(card) {
    if (card.classList.contains("matched")) return;
    if (!state.selectedMatch) {
        state.selectedMatch = card;
        card.classList.add("selected");
        return;
    }
    const first = state.selectedMatch;
    const ok = first !== card && first.dataset.ru === card.dataset.ru && first.dataset.pt === card.dataset.pt && first.dataset.type !== card.dataset.type;
    if (ok) {
        first.classList.add("matched");
        card.classList.add("matched");
        addXP(16);
    } else {
        first.classList.remove("selected");
        loseHeart();
    }
    state.selectedMatch = null;
}

function renderWriting() {
    const item = vocabulary[state.writingIndex % vocabulary.length];
    document.getElementById("game-area").innerHTML = `<div class="quiz-question"><h3>Escreva em russo: ${item.pt}</h3><input id="writing-input" type="text" placeholder="Digite em russo"><button id="writing-check">Verificar</button><p id="writing-result"></p></div>`;
    document.getElementById("writing-check").addEventListener("click", () => {
        const val = document.getElementById("writing-input").value.trim().toLowerCase();
        if (val === item.ru.toLowerCase()) {
            document.getElementById("writing-result").textContent = "Correto!";
            addXP(20);
            state.writingIndex++;
            setTimeout(renderWriting, 650);
        } else {
            document.getElementById("writing-result").textContent = `Resposta: ${item.ru}`;
            loseHeart();
        }
    });
}

function saveProfile(e) {
    e.preventDefault();
    const profile = {
        name: document.getElementById("profile-name").value,
        goal: document.getElementById("profile-goal").value,
        minutes: document.getElementById("profile-minutes").value
    };
    localStorage.setItem("putirus_profile", JSON.stringify(profile));
    toast("Perfil salvo");
}

function loadProfile() {
    const profile = JSON.parse(localStorage.getItem("putirus_profile") || "{}");
    if (profile.name) document.getElementById("profile-name").value = profile.name;
    if (profile.goal) document.getElementById("profile-goal").value = profile.goal;
    if (profile.minutes) document.getElementById("profile-minutes").value = profile.minutes;
}

function resetProgress() {
    ["putirus_xp", "putirus_level", "putirus_hearts", "putirus_streak", "putirus_daily_xp", "putirus_last_login"].forEach(k => localStorage.removeItem(k));
    state.xp = 0;
    state.level = 1;
    state.hearts = 5;
    state.streak = 1;
    state.dailyXP = 0;
    updateStats();
    toast("Progresso resetado");
}

function toast(text) {
    const el = document.getElementById("toast");
    el.textContent = text;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", init);
