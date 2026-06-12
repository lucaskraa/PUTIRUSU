(function () {
  'use strict';

  const P = window.PUTIRUSU = window.PUTIRUSU || {};
  const DATA = window.PUTIRUSU_DATA || {
    alphabet: [],
    dictionary: [],
    writingChallenges: [],
    scenarios: []
  };

  P.DATA = DATA;
  P.TOKEN_KEY = 'putirusu_access_token';

  P.state = {
    user: null,
    dashboard: null,
    levels: [],
    activeLevel: 'A1',
    currentLesson: null,
    currentLessonStep: 0,
    currentExerciseIndex: 0,
    lessonStartedAt: null,
    lessonCorrectAnswers: 0,
    lessonAttemptedExercises: new Set(),
    selectedAnswers: new Map(),
    courseWords: [],
    reviews: [],
    aiMode: 'checking',
    currentWriting: null,
    currentSpeaking: null,
    currentGame: null,
    scenarioStarted: false,
    scenarioHistory: [],
    dictionaryQuery: '',
    booted: false
  };

  P.screenText = {
    home: ['Início', 'Seu painel de estudos salvo no PostgreSQL.'],
    course: ['Curso', '60 aulas reais do A1 ao C1.'],
    alphabet: ['Alfabeto', '33 letras com som, exemplo e treino.'],
    teacher: ['IA Professora', 'Explicações e correções personalizadas.'],
    chat: ['Conversa Real', 'Situações práticas com IA.'],
    writing: ['Escrita', 'Produção e correção em russo.'],
    speaking: ['Fala', 'Escuta, pronúncia e microfone.'],
    review: ['Revisão', 'Erros reais e repetição espaçada.'],
    games: ['Jogos', 'Fixação de vocabulário.'],
    dictionary: ['Dicionário', 'Vocabulário das aulas e busca.'],
    profile: ['Perfil', 'Metas e preferências do aluno.']
  };

  P.$ = selector => document.querySelector(selector);
  P.$$ = selector => Array.from(document.querySelectorAll(selector));

  P.escapeHtml = function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  P.normalize = function normalize(value) {
    return String(value ?? '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:"'«»()[\]{}]/g, '')
      .replace(/\s+/g, ' ');
  };

  P.randomItem = function randomItem(items) {
    if (!Array.isArray(items) || !items.length) return null;
    return items[Math.floor(Math.random() * items.length)];
  };

  P.shuffle = function shuffle(items) {
    const copy = Array.isArray(items) ? [...items] : [];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  P.clamp = function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, number));
  };

  P.toast = function toast(message, duration = 2600) {
    const element = P.$('#toast');
    if (!element) return;
    element.textContent = String(message || '');
    element.classList.add('show');
    clearTimeout(P.toast.timer);
    P.toast.timer = setTimeout(() => element.classList.remove('show'), duration);
  };

  P.setFeedback = function setFeedback(element, message, type = '') {
    if (!element) return;
    element.className = `feedback ${type}`.trim();
    element.textContent = message || '';
  };

  P.addMessage = function addMessage(container, role, text, meta = '') {
    if (!container) return null;
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}`;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text || '';
    wrapper.appendChild(content);

    if (meta) {
      const small = document.createElement('small');
      small.className = 'message-meta';
      small.textContent = meta;
      wrapper.appendChild(small);
    }

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
  };

  P.updateMessage = function updateMessage(messageElement, text, meta = '') {
    if (!messageElement) return;
    const content = messageElement.querySelector('.message-content');
    if (content) content.textContent = text || '';
    let small = messageElement.querySelector('.message-meta');
    if (meta) {
      if (!small) {
        small = document.createElement('small');
        small.className = 'message-meta';
        messageElement.appendChild(small);
      }
      small.textContent = meta;
    } else if (small) {
      small.remove();
    }
  };

  P.showAuth = function showAuth() {
    P.$('#welcome')?.classList.remove('hidden');
    P.$('#app')?.classList.add('hidden');
  };

  P.showApp = function showApp() {
    P.$('#welcome')?.classList.add('hidden');
    P.$('#app')?.classList.remove('hidden');
  };

  P.showScreen = async function showScreen(id) {
    P.$$('.screen').forEach(screen => {
      screen.classList.toggle('active', screen.id === id);
    });

    P.$$('nav [data-screen]').forEach(button => {
      button.classList.toggle('active', button.dataset.screen === id);
    });

    P.$('#sidebar')?.classList.remove('open');

    const [title, subtitle] = P.screenText[id] || P.screenText.home;
    if (P.$('#screenTitle')) P.$('#screenTitle').textContent = title;
    if (P.$('#screenSubtitle')) P.$('#screenSubtitle').textContent = subtitle;

    try {
      if (id === 'home' && P.dashboard?.load) await P.dashboard.load();
      if (id === 'course' && P.course?.render) P.course.render();
      if (id === 'alphabet' && P.alphabet?.render) P.alphabet.render();
      if (id === 'teacher' && P.ai?.initTeacher) P.ai.initTeacher();
      if (id === 'chat' && P.ai?.initScenario) P.ai.initScenario();
      if (id === 'writing' && P.practice?.renderWriting) P.practice.renderWriting();
      if (id === 'speaking' && P.practice?.renderSpeaking) P.practice.renderSpeaking();
      if (id === 'review' && P.practice?.loadReviews) await P.practice.loadReviews();
      if (id === 'games' && P.games?.render) P.games.render();
      if (id === 'dictionary' && P.dictionary?.render) P.dictionary.render();
      if (id === 'profile' && P.profile?.render) P.profile.render();
    } catch (error) {
      console.error(error);
      P.toast(error.message || 'Não foi possível abrir esta tela.');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  P.formatDate = function formatDate(value) {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch {
      return String(value);
    }
  };

  P.formatDuration = function formatDuration(seconds) {
    const safe = Math.max(0, Number(seconds || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    if (hours) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  P.getCurrentLevel = function getCurrentLevel() {
    return P.state.levels.find(level => level.code === P.state.activeLevel)
      || P.state.levels[0]
      || null;
  };

  P.getAllCourseLessons = function getAllCourseLessons() {
    return P.state.levels.flatMap(level => level.lessons.map(lesson => ({
      ...lesson,
      levelCode: level.code,
      levelName: level.name
    })));
  };

  P.getAllKnownWords = function getAllKnownWords() {
    const map = new Map();

    for (const word of P.state.courseWords || []) {
      const key = `${word.russian || word.ru}|${word.portuguese || word.pt}`;
      map.set(key, word);
    }

    for (const word of P.DATA.dictionary || []) {
      const key = `${word.ru}|${word.pt}`;
      if (!map.has(key)) {
        map.set(key, {
          russian: word.ru,
          pronunciation: word.pron,
          portuguese: word.pt,
          category: word.category || 'Geral'
        });
      }
    }

    return Array.from(map.values());
  };

  P.resetState = function resetState() {
    P.state.user = null;
    P.state.dashboard = null;
    P.state.levels = [];
    P.state.activeLevel = 'A1';
    P.state.currentLesson = null;
    P.state.currentLessonStep = 0;
    P.state.currentExerciseIndex = 0;
    P.state.lessonStartedAt = null;
    P.state.lessonCorrectAnswers = 0;
    P.state.lessonAttemptedExercises = new Set();
    P.state.selectedAnswers = new Map();
    P.state.courseWords = [];
    P.state.reviews = [];
    P.state.aiMode = 'checking';
    P.state.currentWriting = null;
    P.state.currentSpeaking = null;
    P.state.currentGame = null;
    P.state.scenarioStarted = false;
    P.state.scenarioHistory = [];
  };
})();
