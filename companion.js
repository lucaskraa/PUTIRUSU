"use strict";

(function () {
  const companion = {
    profile: null,
    recognition: null,
    wantsListening: false,
    listening: false,
    speaking: false,
    thinking: false,
    lessonMicBusy: false,
    lastAnswer: "",
    lastHeard: "",
    lastNudgeAt: 0,
    recentMistakes: 0,
    lastAppEvent: null,
    contextFingerprint: "",
    activityBrief: "",
    briefFingerprint: "",
    briefTimer: null,
    noticedActivityKey: "",
    lastUserAt: Date.now(),
    lastAutonomyAt: 0,
    autonomyTimer: null,
    contextSyncTimer: null,
    contextObserver: null,
    restartTimer: null,
    ttsWatch: null,
    idleTimer: null,
    realtimePc: null,
    realtimeDc: null,
    realtimeWs: null,
    realtimeStream: null,
    realtimeAudio: null,
    realtimeAudioContext: null,
    realtimeCaptureContext: null,
    realtimeCaptureSource: null,
    realtimeProcessor: null,
    realtimeOutputTime: 0,
    realtimeOutputSources: new Set(),
    realtimeMicEnabled: true,
    realtimeSpeechActive: false,
    realtimeSilenceMs: 0,
    realtimeNoiseFloor: 0.004,
    realtimeLastSpeechAt: 0,
    realtimeTurnEndedAt: 0,
    realtimeFirstAudioAt: 0,
    realtimeMetricsReported: false,
    realtimeInputTranscript: "",
    realtimeConnected: false,
    realtimeConnecting: false,
    realtimeReply: "",
    realtimeCleanRetry: false,
    realtimeSpeechStoppedAt: 0,
    realtimeResponseCreatedAt: 0,
    realtimeFirstResponseAt: 0,
    lastContextSentAt: 0,
    aiAvailable: null,
    realtimeAvailable: null,
    realtimeFailures: 0,
    neuralFallbackAudio: null,
    movementTimer: null,
    returnHomeTimer: null,
    gestureTimer: null,
    roaming: false,
    pointing: false,
    lastPresenceMoveAt: 0,
    history: [],
    initialized: false
  };

  state.companion = companion;

  const PUTIRUSU_REMOTE_API = "https://putirusu-dev.onrender.com/api";

  function rememberTurn(role, text) {
    const value = String(text || "").trim();
    if (!value) return;
    const normalizedRole = role === "assistant" ? "assistant" : "user";
    if (normalizedRole === "user") companion.lastUserAt = Date.now();
    companion.history.push({ role:normalizedRole, text:value });
    companion.history = companion.history.slice(-24);
    try {
      localStorage.setItem("pipoRecentConversation",JSON.stringify(companion.history.slice(-24)));
    } catch (_) {}
  }

  function restoreRecentConversation() {
    try {
      const data = JSON.parse(localStorage.getItem("pipoRecentConversation") || localStorage.getItem("ppRecentConversation") || "[]");
      if (Array.isArray(data)) {
        companion.history = data
          .filter(item => item && (item.role === "user" || item.role === "assistant") && item.text)
          .slice(-24)
          .map(item => ({ role:item.role, text:String(item.text).slice(0,1800) }));
      }
    } catch (_) {}
  }

  async function companionFetch(path, options) {
    const opts = Object.assign({}, options || {});
    opts.headers = Object.assign({}, opts.headers || {});
    const token = state.token && state.token !== "local-demo" ? state.token : "";
    if (token) opts.headers.Authorization = "Bearer " + token;

    const localUrl = (typeof API === "string" ? API : "/api") + path;
    const onRender = String(location.origin || "").includes("putirusu-dev.onrender.com");
    const candidates = [onRender ? localUrl : PUTIRUSU_REMOTE_API + path];

    let lastError = null;
    for (const url of candidates) {
      try {
        const response = await fetch(url, opts);
        if (!response.ok) {
          const message = await response.text().catch(()=>"");
          lastError = new Error(message || ("HTTP " + response.status));
          continue;
        }
        return response;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Servidor da IA indisponível.");
  }

  function compactText(value, max) {
    return String(value == null ? "" : value)
      .replace(/\s+/g," ")
      .trim()
      .slice(0, max || 1800);
  }

  function currentContext() {
    const activeScreen = document.querySelector(".screen.active");
    const lessonMode = document.body.classList.contains("lesson-mode");
    const context = {
      screen: activeScreen ? activeScreen.id.replace("screen-", "") : (lessonMode ? "course" : "unknown"),
      title: document.getElementById("screenTitle") ? compactText(document.getElementById("screenTitle").textContent,120) : "",
      lastEvent: companion.lastAppEvent || null,
      activityBrief: companion.activityBrief || ""
    };

    const session = state.lessonSession;
    if (session && lessonMode) {
      const step = session.steps && session.steps[session.stepIndex];
      context.courseId = session.course && session.course.id;
      context.level = session.course && session.course.level;
      context.unitTitle = session.course && session.course.title;
      context.lessonIndex = session.lessonIndex;
      context.lessonTitle = session.course && session.course.lessons ? session.course.lessons[session.lessonIndex] : "";
      context.stepIndex = session.stepIndex;
      context.stepTotal = session.steps ? session.steps.length : 0;
      context.stepType = step && step.type;
      context.attempted = Boolean(session.attempted);
      context.studentSelection = session.selected || "";
      context.studentArrangement = Array.isArray(session.arranged) ? session.arranged.slice(0,30) : [];
      context.speechCorrect = Boolean(session.speechCorrect);

      if (step) {
        context.activity = {
          type:step.type || "",
          title:compactText(step.title,220),
          objective:compactText(step.objective,420),
          prompt:compactText(step.prompt,700),
          target:compactText(step.target,500),
          translation:compactText(step.pt || step.translation,500),
          answer:compactText(step.answer,500),
          accepted:Array.isArray(step.accepted) ? step.accepted.slice(0,12) : [],
          options:Array.isArray(step.options) ? step.options.slice(0,12) : [],
          explain:compactText(step.explain || step.tip,700),
          item:step.item ? {
            glyph:compactText(step.item.glyph,120),
            example:compactText(step.item.example,240),
            meaning:compactText(step.item.meaning || step.item.pt,260),
            sound:compactText(step.item.sound || step.item.pron,180)
          } : null
        };
        context.focusText = context.activity.target || context.activity.prompt || (context.activity.item && (context.activity.item.glyph || context.activity.item.example)) || context.activity.title || context.activity.objective || "";
      }

      const typeInput = document.getElementById("lessonTypeInput");
      if (typeInput) context.typedAnswer = compactText(typeInput.value,500);
      const speechResult = document.getElementById("lessonSpeechResult");
      if (speechResult) context.pronunciationFeedback = compactText(speechResult.textContent,900);
      const feedback = document.getElementById("lessonFeedback");
      if (feedback) context.feedback = compactText(feedback.textContent,900);

      const recentMistakes = state.progress && Array.isArray(state.progress.lessonMistakes)
        ? state.progress.lessonMistakes
            .filter(item => !session.course || item.courseId === session.course.id)
            .slice(0,4)
            .map(item => ({
              type:item.type,
              prompt:compactText(item.prompt,400),
              expected:compactText(item.expected,300),
              received:compactText(item.received,300)
            }))
        : [];
      if (recentMistakes.length) context.recentMistakes = recentMistakes;

      const lessonView = document.getElementById("lessonView");
      if (lessonView) context.visibleActivityText = compactText(lessonView.innerText,2200);
    }

    if (context.screen === "handwriting") {
      const letter = ALPHABET[state.selectedLetter];
      if (letter) {
        context.focusText = letter.upper + " " + letter.lower;
        context.letter = letter.lower;
        context.writingMode = state.writingMode;
        context.writingScore = state.progress && state.progress.letters && state.progress.letters[letter.lower]
          ? state.progress.letters[letter.lower]
          : null;
      }
    }

    if (context.screen === "speaking" && state.speakingItem) {
      context.focusText = state.speakingItem.ru;
      context.translation = state.speakingItem.pt;
      context.pronunciationGuide = state.speakingItem.pron || "";
      const result = document.getElementById("speakResult");
      if (result) context.pronunciationFeedback = compactText(result.textContent,900);
    }

    if (context.screen === "audio" && state.audioItem) {
      context.focusText = state.audioItem.ru;
      context.translation = state.audioItem.pt;
      const feedback = document.getElementById("audioFeedback");
      if (feedback) context.feedback = compactText(feedback.textContent,700);
    }

    if (!lessonMode && activeScreen) {
      context.visibleScreenText = compactText(activeScreen.innerText,1600);
    }

    return context;
  }

  function createUi() {
    if (document.getElementById("putirusuCompanion")) return;

    const root = document.createElement("section");
    root.id = "putirusuCompanion";
    root.className = "puti-companion";
    root.dataset.state = "idle";
    root.dataset.mood = "curious";
    root.setAttribute("aria-live", "polite");
    root.innerHTML =
      '<button id="putiCompanionOrb" class="puti-companion-orb" type="button" aria-label="Abrir Pipo">' +
        '<span class="puti-orb-ring"></span>' +
        '<svg class="puti-avatar-svg" viewBox="0 0 96 142" aria-hidden="true">' +
          '<g class="pipo-head">' +
            '<path class="puti-helmet-shadow" d="M13 29 25 13 43 7 48 2l5 5 18 6 12 16-4 31-14 15H31L17 60Z"/>' +
            '<path class="puti-helmet" d="M16 30 27 16 43 11 48 5l5 6 16 5 11 14-4 28-13 13H33L20 58Z"/>' +
            '<path class="puti-crest" d="M45 11 48 3l5 8 2 43h-12Z"/>' +
            '<path class="puti-brow left" d="M24 28 42 24l-3 9-14 3Z"/>' +
            '<path class="puti-brow right" d="m72 28-18-4 3 9 14 3Z"/>' +
            '<path class="puti-eye left" d="M26 31 41 28l-3 9-11 2Z"/>' +
            '<path class="puti-eye right" d="m70 31-15-3 3 9 11 2Z"/>' +
            '<path class="puti-cheek left" d="m19 41 18 2-3 8-13-1Z"/>' +
            '<path class="puti-cheek right" d="m77 41-18 2 3 8 13-1Z"/>' +
            '<path class="puti-grill-shell" d="M29 49h38l-3 15-10 6H42l-10-6Z"/>' +
            '<g class="puti-grill-lines"><path d="M35 52v10M41 51v14M47 51v15M53 51v15M59 51v14M65 52v10"/></g>' +
            '<circle class="puti-cheek-dot left" cx="23" cy="47" r="2.2"/>' +
            '<circle class="puti-cheek-dot right" cx="73" cy="47" r="2.2"/>' +
          '</g>' +
          '<g class="pipo-body">' +
            '<path class="pipo-neck" d="M37 68h22l3 10-7 8H41l-7-8Z"/>' +
            '<path class="pipo-torso-shadow" d="M29 80 39 74h18l10 6 7 30-12 15H34l-12-15Z"/>' +
            '<path class="pipo-torso" d="M31 78 40 73h16l9 5 6 29-11 14H36l-11-14Z"/>' +
            '<path class="pipo-chest" d="M38 83h20l5 9-3 17H36l-3-17Z"/>' +
            '<path class="pipo-core" d="M43 88h10l4 6-3 8H42l-3-8Z"/>' +
            '<path class="pipo-waist" d="M36 112h24l-2 9H38Z"/>' +
            '<g class="pipo-arm left">' +
              '<circle class="pipo-joint" cx="27" cy="84" r="5"/>' +
              '<path class="pipo-upper-arm" d="M26 82 16 88l-4 15 7 2 7-12 5-5Z"/>' +
              '<path class="pipo-forearm" d="M14 101 7 111l5 5 10-9Z"/>' +
              '<path class="pipo-hand" d="M8 109 3 113l4 7 7-4 1-5Z"/>' +
            '</g>' +
            '<g class="pipo-arm right">' +
              '<circle class="pipo-joint" cx="69" cy="84" r="5"/>' +
              '<path class="pipo-upper-arm" d="M70 82 80 88l4 15-7 2-7-12-5-5Z"/>' +
              '<path class="pipo-forearm" d="M82 101 89 111l-5 5-10-9Z"/>' +
              '<path class="pipo-hand" d="M88 109 93 113l-4 7-7-4-1-5Z"/>' +
            '</g>' +
            '<g class="pipo-leg left">' +
              '<circle class="pipo-hip" cx="41" cy="120" r="4"/>' +
              '<path class="pipo-shin" d="M37 121h9l-1 13-9 1Z"/>' +
              '<path class="pipo-foot" d="M35 133h12l2 5H33Z"/>' +
            '</g>' +
            '<g class="pipo-leg right">' +
              '<circle class="pipo-hip" cx="55" cy="120" r="4"/>' +
              '<path class="pipo-shin" d="M51 121h9l1 14-9-1Z"/>' +
              '<path class="pipo-foot" d="M49 133h12l2 5H47Z"/>' +
            '</g>' +
          '</g>' +
        '</svg>' +
      '</button>' +
      '<span id="putiPointer" class="puti-pointer" aria-hidden="true"></span>' +
      '<div id="putiCompanionBubble" class="puti-companion-bubble hidden">' +
        '<div class="puti-companion-head">' +
          '<div class="puti-identity"><strong>Pipo</strong><span id="putiCompanionStatus">observando</span></div>' +
          '<div class="puti-wave" id="putiWave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
          '<button id="putiCompanionClose" type="button" aria-label="Fechar">×</button>' +
        '</div>' +
        '<div id="putiHeard" class="puti-heard hidden"></div>' +
        '<p id="putiCompanionText">Eu estou aqui.</p>' +
        '<div class="puti-companion-actions">' +
          '<button id="putiMicToggle" type="button">Ativar voz</button>' +
          '<button id="putiCompanionRepeat" class="ghost" type="button">Repete</button>' +
        '</div>' +
        '<small class="puti-privacy-note">Escuta ativa só com sua permissão. O áudio bruto não é salvo.</small>' +
      '</div>' +
    '</section>';

    const onboarding = document.createElement("div");
    onboarding.id = "putiOnboarding";
    onboarding.className = "puti-onboarding hidden";
    onboarding.innerHTML =
      '<div class="puti-onboarding-card">' +
        '<div class="puti-onboarding-mark"><span>П</span><i></i><i></i></div>' +
        '<span class="puti-onboarding-kicker">EU JÁ ESTOU AQUI</span>' +
        '<h1>Você não precisa abrir outra IA. Eu vivo aqui no curso.</h1>' +
        '<p>Eu acompanho o que aparece na tela, noto seus erros e consigo conversar enquanto você estuda. Se você falar comigo, eu uso o que está acontecendo agora para entender a referência.</p>' +
        '<div class="puti-onboarding-points">' +
          '<div><b>Eu observo</b><span>Aula, exercício, letra, acertos, erros e progresso.</span></div>' +
          '<div><b>Eu escuto</b><span>Se você permitir o microfone, respondo ao que você disser enquanto o site estiver aberto.</span></div>' +
          '<div><b>Eu lembro — só de você</b><span>A memória pedagógica fica ligada à sua conta e pode ser apagada no Perfil.</span></div>' +
        '</div>' +
        '<div class="puti-onboarding-actions">' +
          '<button id="putiOnboardingVoice" type="button">Pode me ouvir</button>' +
          '<button id="putiOnboardingSkip" class="ghost" type="button">Agora não</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);
    document.body.appendChild(onboarding);

    document.getElementById("putiCompanionOrb").addEventListener("click", function () {
      document.getElementById("putiCompanionBubble").classList.toggle("hidden");
      pipoGesture("wave",1200);
    });
    document.getElementById("putiCompanionClose").addEventListener("click", function () {
      document.getElementById("putiCompanionBubble").classList.add("hidden");
    });
    document.getElementById("putiMicToggle").addEventListener("click", function () {
      if (companion.wantsListening || companion.listening) disableAmbientListening();
      else enableAmbientListening(true);
    });
    document.getElementById("putiCompanionRepeat").addEventListener("click", function () {
      if (companion.realtimeConnected) {
        sendRealtimeText("Repita sua última fala, com o mesmo sentido, de forma natural e breve.");
      } else if (companion.lastAnswer) {
        speakCompanion(companion.lastAnswer);
      }
    });
    document.getElementById("putiOnboardingVoice").addEventListener("click", function () {
      completeOnboarding(true);
    });
    document.getElementById("putiOnboardingSkip").addEventListener("click", function () {
      completeOnboarding(false);
    });
  }

  function pipoGesture(name, duration) {
    const root = document.getElementById("putirusuCompanion");
    if (!root) return;
    const classes = ["is-wave","is-cheer","is-nod","is-curious"];
    classes.forEach(cls => root.classList.remove(cls));
    if (companion.gestureTimer) clearTimeout(companion.gestureTimer);
    if (!name) return;
    const cls = "is-" + name;
    root.classList.add(cls);
    companion.gestureTimer = setTimeout(() => {
      root.classList.remove(cls);
      companion.gestureTimer = null;
    },Math.max(500,Number(duration)||1400));
  }

  function visibleElement(selectors) {
    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        if (style.display !== "none" && style.visibility !== "hidden" && rect.width > 40 && rect.height > 24 &&
            rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth) return node;
      }
    }
    return null;
  }

  function currentPresenceTarget() {
    return visibleElement([
      "#lessonView:not(.hidden) .lesson-card",
      "#lessonView:not(.hidden) .lesson-run-card",
      "#lessonView:not(.hidden) [data-step]",
      "#lessonView:not(.hidden)",
      "#courseUnitView:not(.hidden) .lesson-row",
      "#courseUnitView:not(.hidden)",
      "#screen-speaking.active .panel",
      "#screen-handwriting.active .trace-panel",
      "#screen-audio.active .panel",
      "#screen-review.active .panel",
      "#screen-exam.active .panel",
      ".continue-card",
      ".hero-card"
    ]);
  }

  function clearPresencePointing() {
    const root = document.getElementById("putirusuCompanion");
    if (!root) return;
    root.classList.remove("is-pointing");
    delete root.dataset.pointSide;
    root.style.removeProperty("--pipo-pointer-angle");
    root.style.removeProperty("--pipo-pointer-length");
    companion.pointing = false;
    document.querySelectorAll(".pipo-focus-target").forEach(el => el.classList.remove("pipo-focus-target"));
  }

  function returnPipoHome(delay) {
    if (companion.returnHomeTimer) clearTimeout(companion.returnHomeTimer);
    companion.returnHomeTimer = setTimeout(() => {
      const root = document.getElementById("putirusuCompanion");
      if (!root) return;
      clearPresencePointing();
      root.classList.add("is-travelling");
      root.classList.remove("is-roaming");
      root.style.removeProperty("left");
      root.style.removeProperty("top");
      root.style.removeProperty("right");
      root.style.removeProperty("bottom");
      companion.roaming = false;
      setTimeout(() => root.classList.remove("is-travelling"),900);
    },Math.max(0,Number(delay)||0));
  }

  function movePipoNear(target, options) {
    if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const root = document.getElementById("putirusuCompanion");
    if (!root) return false;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    const opts = options || {};
    const margin = 14;
    const avatarW = 64;
    const avatarH = 98;
    const desiredLeft = rect.right + avatarW + 24 < innerWidth
      ? rect.right + 16
      : Math.max(margin, rect.left - avatarW - 18);
    const desiredTop = Math.min(innerHeight - avatarH - margin, Math.max(62, rect.top + Math.min(88,rect.height * .32)));

    if (companion.returnHomeTimer) clearTimeout(companion.returnHomeTimer);
    clearPresencePointing();
    root.classList.add("is-roaming","is-travelling");
    root.style.right = "auto";
    root.style.bottom = "auto";
    root.style.left = Math.round(desiredLeft) + "px";
    root.style.top = Math.round(desiredTop) + "px";
    companion.roaming = true;
    companion.lastPresenceMoveAt = Date.now();

    setTimeout(() => {
      root.classList.remove("is-travelling");
      if (opts.point !== false) {
        target.classList.add("pipo-focus-target");
        const rootRect = root.getBoundingClientRect();
        const fromX = rootRect.left + rootRect.width * .5;
        const fromY = rootRect.top + 58;
        const toX = desiredLeft > rect.right ? rect.right : rect.left;
        const toY = Math.min(rect.bottom - 12, Math.max(rect.top + 12, fromY));
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.min(130,Math.max(28,Math.hypot(dx,dy)));
        const angle = Math.atan2(dy,dx) * 180 / Math.PI;
        root.style.setProperty("--pipo-pointer-angle",angle + "deg");
        root.style.setProperty("--pipo-pointer-length",len + "px");
        root.dataset.pointSide = desiredLeft > rect.right ? "left" : "right";
        root.classList.add("is-pointing");
        pipoGesture("nod",900);
        companion.pointing = true;
      }
    },720);

    returnPipoHome(opts.stay || 5200);
    return true;
  }

  function presenceReact(type, details) {
    const now = Date.now();
    if (now - companion.lastPresenceMoveAt < 2200) return;
    const target = currentPresenceTarget();
    if (!target) return;

    if (type === "lesson_mistake") {
      setMood("focused");
      pipoGesture("curious",1300);
      movePipoNear(target,{ point:true, stay:6500 });
    } else if (type === "lesson_complete") {
      setMood("pleased");
      pipoGesture("cheer",1700);
      movePipoNear(target,{ point:false, stay:3600 });
    } else if (type === "lesson_answer" && details && details.correct) {
      setMood("pleased");
      pipoGesture("cheer",1100);
      if (Math.random() > .45) movePipoNear(target,{ point:false, stay:2600 });
    } else if (type === "writing_score" && Number(details && details.score) < 70) {
      setMood("focused");
      movePipoNear(target,{ point:true, stay:5200 });
    }
  }

  function maybeWanderPipo() {
    if (companion.speaking || companion.thinking || companion.realtimeSpeechActive || companion.roaming) return;
    if (Date.now() - companion.lastUserAt < 7000) return;
    const target = currentPresenceTarget();
    if (!target) return;
    if (Math.random() < .34) movePipoNear(target,{ point:Math.random() > .35, stay:3000 + Math.random()*2600 });
  }

  function setMood(mood) {
    const root = document.getElementById("putirusuCompanion");
    if (root) root.dataset.mood = mood || "curious";
  }

  function inferMood(text) {
    const m = String(text || "").toLowerCase();
    if (/[!?]{2,}/.test(text) || m.includes("haha") || m.includes("kkkk")) return "amused";
    if (m.includes("cuidado") || m.includes("erro") || m.includes("atenção") || m.includes("atencao")) return "focused";
    if (m.includes("boa") || m.includes("ótimo") || m.includes("otimo") || m.includes("acert")) return "pleased";
    return "curious";
  }

  function setStatus(mode, label) {
    const root = document.getElementById("putirusuCompanion");
    const status = document.getElementById("putiCompanionStatus");
    if (root) root.dataset.state = mode || "idle";
    if (status) status.textContent = label || "observando";
    const mic = document.getElementById("putiMicToggle");
    if (mic) mic.textContent = companion.wantsListening || companion.listening ? "Silenciar" : "Ativar voz";
  }

  function showBubble(text, open, heard) {
    const bubble = document.getElementById("putiCompanionBubble");
    const body = document.getElementById("putiCompanionText");
    const heardBox = document.getElementById("putiHeard");
    if (!bubble || !body) return;

    body.textContent = text;
    setMood(inferMood(text));

    if (heardBox) {
      if (heard) {
        heardBox.textContent = "você: " + heard;
        heardBox.classList.remove("hidden");
      } else {
        heardBox.classList.add("hidden");
      }
    }

    if (open !== false) bubble.classList.remove("hidden");
  }

  async function savePrivacy(patch) {
    if (!state.token || state.token === "local-demo") {
      companion.profile = Object.assign({}, companion.profile || {}, patch);
      return;
    }
    try {
      const saved = await request("/ai/privacy", { method:"PUT", body:JSON.stringify(patch) });
      companion.profile = Object.assign({}, companion.profile || {}, saved);
      refreshPrivacyControls();
    } catch (_) {}
  }

  async function track(type, details) {
    if (!state.token || state.token === "local-demo") return;
    if (companion.profile && companion.profile.memoryEnabled === false) return;
    try {
      await request("/ai/event", { method:"POST", body:JSON.stringify({ type, details:details || {} }) });
    } catch (_) {}
  }

  async function probeAiCapability() {
    try {
      const response = await companionFetch("/ai/health",{ method:"GET" });
      const data = await response.json();
      companion.aiAvailable = Boolean(data && (data.aiConfigured || data.geminiConfigured || data.openaiConfigured));
      companion.realtimeAvailable = Boolean(data && data.openaiConfigured && data.realtimeModel);
      return data || {};
    } catch (_) {
      companion.aiAvailable = false;
      companion.realtimeAvailable = false;
      return {};
    }
  }

  function reportLiveIssue(stage, error, extra) {
    const payload = {
      stage:String(stage || "unknown").slice(0,80),
      message:String(error && error.message || error || "").slice(0,500),
      extra:extra || {},
      ua:String(navigator.userAgent || "").slice(0,240),
      at:new Date().toISOString()
    };
    companionFetch("/ai/live/client-log",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(payload)
    }).catch(()=>{});
  }

  function setRealtimeMicEnabled(enabled) {
    companion.realtimeMicEnabled = Boolean(enabled);
    if (!companion.realtimeStream) return;
    companion.realtimeStream.getAudioTracks().forEach(track => { track.enabled = Boolean(enabled); });
  }

  function stopGeminiPlayback() {
    if (companion.realtimeAudio) {
      try { companion.realtimeAudio.pause(); } catch (_) {}
    }
    companion.speaking = false;
  }

  function closeRealtime() {
    companion.realtimeConnected = false;
    companion.realtimeConnecting = false;
    companion.realtimeMicEnabled = true;
    stopGeminiPlayback();

    if (companion.realtimeDc) {
      try { companion.realtimeDc.onopen = null; companion.realtimeDc.onmessage = null; companion.realtimeDc.onclose = null; companion.realtimeDc.close(); } catch (_) {}
      companion.realtimeDc = null;
    }
    if (companion.realtimePc) {
      try { companion.realtimePc.ontrack = null; companion.realtimePc.onconnectionstatechange = null; companion.realtimePc.close(); } catch (_) {}
      companion.realtimePc = null;
    }
    if (companion.realtimeStream) {
      companion.realtimeStream.getTracks().forEach(track => track.stop());
      companion.realtimeStream = null;
    }
    if (companion.realtimeAudio) {
      try { companion.realtimeAudio.srcObject = null; companion.realtimeAudio.remove(); } catch (_) {}
      companion.realtimeAudio = null;
    }
  }

  function logRealtime(role, text) {
    if (!text || !state.token || state.token === "local-demo") return;
    request("/ai/realtime/log", {
      method:"POST",
      body:JSON.stringify({ role, text:String(text).slice(0,1600) })
    }).catch(()=>{});
  }

  function sendRealtimeEvent(event) {
    const dc = companion.realtimeDc;
    if (!dc || dc.readyState !== "open") return false;
    try {
      dc.send(JSON.stringify(event));
      return true;
    } catch (_) {
      return false;
    }
  }

  function sendGeminiClientContent(text, turnComplete, role) {
    const value = String(text || "").trim();
    if (!value || !companion.realtimeConnected) return false;
    const created = sendRealtimeEvent({
      type:"conversation.item.create",
      item:{
        type:"message",
        role:role === "system" ? "system" : "user",
        content:[{ type:"input_text", text:value }]
      }
    });
    if (created && turnComplete) sendRealtimeEvent({ type:"response.create" });
    return created;
  }

  function autonomousPrompt(type, details) {
    if (type === "lesson_mistake") {
      return "O aluno acabou de errar a atividade visível. Reaja por iniciativa própria em uma frase curta, natural e específica ao erro. Explique o ponto central sem soar como notificação do sistema.";
    }
    if (type === "lesson_complete") {
      return "O aluno acabou de concluir a aula. Faça uma reação curta e espontânea sobre o desempenho, citando algo concreto do contexto se houver.";
    }
    if (type === "writing_score" && Number(details && details.score) < 70) {
      return "Você acabou de ver uma tentativa de escrita fraca. Dê uma observação curta e específica do que vale ajustar agora.";
    }
    return "";
  }

  function maybeReactAutonomously(type, details) {
    const prompt = autonomousPrompt(type,details);
    if (!prompt || !companion.wantsListening || companion.speaking || companion.thinking) return;
    const now = Date.now();
    if (now - companion.lastAutonomyAt < 6500) return;
    companion.lastAutonomyAt = now;

    if (companion.autonomyTimer) clearTimeout(companion.autonomyTimer);
    companion.autonomyTimer = setTimeout(() => {
      if (companion.speaking || companion.thinking || !companion.wantsListening) return;
      if (companion.realtimeConnected) {
        sendGeminiClientContent(
          "[AUTONOMOUS_REACTION]\n" + prompt + "\n[APP_CONTEXT]\n" + JSON.stringify(currentContext()),
          true
        );
      } else if (companion.aiAvailable !== false) {
        respondTo(prompt + "\nUse esta atividade: " + JSON.stringify(currentContext()), { silentUi:true });
      }
    },180);
  }

  function pushRealtimeAppEvent(type, details) {
    companion.lastAppEvent = { type, details:details || {}, at:new Date().toISOString() };
    presenceReact(type,details || {});
    maybeReactAutonomously(type,details || {});
    if (!companion.realtimeConnected) return;
    sendGeminiClientContent("[APP_EVENT] " + JSON.stringify(companion.lastAppEvent), false, "system");
  }

  function pushRealtimeContext() {
    if (!companion.realtimeConnected) return;
    sendGeminiClientContent("[APP_CONTEXT] " + JSON.stringify(currentContext()), false, "system");
  }

  function activityKey(context) {
    if (!context || !context.activity) return "";
    return [
      context.courseId || "",
      context.lessonIndex == null ? "" : context.lessonIndex,
      context.stepIndex == null ? "" : context.stepIndex,
      context.activity.type || "",
      context.activity.prompt || "",
      context.activity.target || "",
      context.attempted ? "attempted" : "fresh",
      context.feedback || ""
    ].join("|").slice(0,1800);
  }

  async function preAnalyzeActivity(context, key) {
    // A análise antecipada é opcional. Não bloqueia a conversa nem o microfone.
    if (key !== companion.briefFingerprint) return;
    companion.activityBrief = "";
    scheduleAliveObservation(context,key);
  }

  function scheduleActivityPreAnalysis(context) {
    const key = activityKey(context);
    if (!key) {
      companion.activityBrief = "";
      companion.briefFingerprint = "";
      return;
    }
    if (key === companion.briefFingerprint) return;
    companion.briefFingerprint = key;
    companion.activityBrief = "";
    if (companion.briefTimer) clearTimeout(companion.briefTimer);
    companion.briefTimer = setTimeout(() => preAnalyzeActivity(context,key),120);
  }

  function scheduleAliveObservation(context,key) {
    if (!key || companion.noticedActivityKey === key) return;
    companion.noticedActivityKey = key;
    setTimeout(() => {
      if (!companion.wantsListening || companion.speaking || companion.thinking) return;
      if (Date.now() - companion.lastUserAt < 5000) return;
      if (companion.briefFingerprint !== key) return;
      const fresh = currentContext();
      if (!fresh.activity) return;
      const prompt =
        "Você percebeu silenciosamente uma nova atividade. Faça UMA observação curta e espontânea sobre algo concreto dela, ou uma pergunta curta que ajude o aluno a começar. " +
        "Não dê a resposta pronta e não diga que recebeu contexto do aplicativo. Soe como alguém ao lado dele que acabou de olhar a tela.";
      if (companion.realtimeConnected) {
        sendGeminiClientContent("[AUTONOMOUS_REACTION]\n" + prompt + "\n[APP_CONTEXT]\n" + JSON.stringify(fresh),true);
      } else if (companion.aiAvailable !== false) {
        respondTo(prompt,{ silentUi:true });
      }
    },6500);
  }

  function syncRealtimeContext(force) {
    const context = currentContext();
    const fingerprint = JSON.stringify(context);
    if (!force && fingerprint === companion.contextFingerprint) return;
    companion.contextFingerprint = fingerprint;
    scheduleActivityPreAnalysis(context);

    if (companion.realtimeConnected) {
      const now = Date.now();
      if (!force && now - companion.lastContextSentAt < 800) return;
      companion.lastContextSentAt = now;
      sendGeminiClientContent("[APP_CONTEXT] " + fingerprint,false,"system");
    }
  }

  function scheduleContextSync() {
    if (companion.contextSyncTimer) clearTimeout(companion.contextSyncTimer);
    companion.contextSyncTimer = setTimeout(() => syncRealtimeContext(false),260);
  }

  function startContextObserver() {
    if (companion.contextObserver || !document.body || !window.MutationObserver) return;
    companion.contextObserver = new MutationObserver(scheduleContextSync);
    companion.contextObserver.observe(document.body,{
      subtree:true,
      childList:true,
      characterData:true,
      attributes:true,
      attributeFilter:["class","value","disabled","data-mode"]
    });
    document.addEventListener("input",scheduleContextSync,true);
    document.addEventListener("change",scheduleContextSync,true);
    document.addEventListener("click",scheduleContextSync,true);
    syncRealtimeContext(true);
  }

  function sendRealtimeText(text) {
    if (!companion.realtimeConnected || !text) return false;
    const payload =
      "[APP_CONTEXT] " + JSON.stringify(currentContext()) +
      "\n[INSTRUCAO_DE_TURNO] Responda ao conteúdo real do que o aluno disse, mesmo que seja só uma palavra, frase incompleta ou mudança brusca de assunto. Resolva 'essa', 'isso', 'aqui' e referências parecidas pela tela e conversa recentes. Não peça para repetir só porque a frase ficou imperfeita; tente inferir pelo contexto primeiro." +
      "\n[FALA_USUARIO] " + String(text).slice(0,1200);
    return sendGeminiClientContent(payload,true);
  }

  function containsBlockedLanguage(text) {
    return /\b(porra|caralho|cacete|merda|foder|foda|fodido|fodida|puta|buceta|pqp|desgraça|desgraçado|desgraçada)\b/i.test(String(text || ""));
  }

  function retryRealtimeClean() {
    if (companion.realtimeCleanRetry) return;
    companion.realtimeCleanRetry = true;
    sendRealtimeEvent({ type:"response.cancel" });
    sendRealtimeText("Refaça sua resposta anterior imediatamente, mantendo a personalidade, mas sem qualquer palavrão, obscenidade ou xingamento. Não mencione esta correção.");
  }

  function mergeTranscript(current, incoming) {
    const a = String(current || "").trim();
    const b = String(incoming || "").trim();
    if (!a) return b;
    if (!b) return a;
    if (b.startsWith(a)) return b;
    if (a.endsWith(b)) return a;
    return (a + " " + b).replace(/\s+/g," ").trim();
  }

  function finalizeRealtimeTurn() {
    const heard = String(companion.realtimeInputTranscript || "").trim();
    const answer = String(companion.realtimeReply || "").trim();

    if (heard) {
      companion.lastHeard = heard;
      companion.lastUserAt = Date.now();
      rememberTurn("user",heard);
      logRealtime("user",heard);
      const heardBox = document.getElementById("putiHeard");
      if (heardBox) {
        heardBox.textContent = "você: " + heard;
        heardBox.classList.remove("hidden");
      }
    }
    if (answer) {
      companion.lastAnswer = answer;
      rememberTurn("assistant",answer);
      logRealtime("assistant",answer);
      showBubble(answer,true,heard || companion.lastHeard);
    }
    companion.realtimeInputTranscript = "";
    companion.realtimeReply = "";
    companion.realtimeCleanRetry = false;
    companion.thinking = false;
    if (!companion.speaking) setStatus("listening","ouvindo");
  }

  function handleRealtimeEvent(event) {
    if (!event || !event.type) return;

    if (event.type === "input_audio_buffer.speech_started") {
      companion.realtimeSpeechActive = true;
      companion.lastUserAt = Date.now();
      if (window.speechSynthesis && speechSynthesis.speaking) speechSynthesis.cancel();
      companion.speaking = false;
      setStatus("listening","te ouvindo");
      return;
    }
    if (event.type === "input_audio_buffer.speech_stopped") {
      companion.realtimeSpeechActive = false;
      companion.realtimeSpeechStoppedAt = performance.now();
      companion.realtimeResponseCreatedAt = 0;
      companion.realtimeFirstResponseAt = 0;
      setStatus("thinking","já peguei");
      return;
    }

    if (event.type === "conversation.item.input_audio_transcription.delta" && event.delta) {
      companion.realtimeInputTranscript = mergeTranscript(companion.realtimeInputTranscript,event.delta);
    }
    if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
      companion.realtimeInputTranscript = String(event.transcript).trim();
      const heardBox = document.getElementById("putiHeard");
      if (heardBox && companion.realtimeInputTranscript) {
        heardBox.textContent = "você: " + companion.realtimeInputTranscript;
        heardBox.classList.remove("hidden");
      }
    }

    if (event.type === "response.output_audio.delta") {
      companion.speaking = true;
      companion.thinking = false;
      setStatus("speaking","falando");
    }
    if (event.type === "response.output_audio.done") {
      companion.speaking = false;
    }

    if ((event.type === "response.output_audio_transcript.delta" || event.type === "response.audio_transcript.delta") && event.delta) {
      if (!companion.realtimeFirstResponseAt) {
        companion.realtimeFirstResponseAt = performance.now();
        const latency = companion.realtimeSpeechStoppedAt
          ? Math.round(companion.realtimeFirstResponseAt - companion.realtimeSpeechStoppedAt)
          : 0;
        if (latency) console.debug("[Pipo 2A] fala->primeira resposta:",latency + "ms");
      }
      companion.speaking = true;
      companion.thinking = false;
      setStatus("speaking","falando");
      companion.realtimeReply += String(event.delta);
      const text = companion.realtimeReply.trim();
      if (text) showBubble(text,true,companion.lastHeard);
    }
    if ((event.type === "response.output_audio_transcript.done" || event.type === "response.audio_transcript.done") && event.transcript) {
      companion.realtimeReply = String(event.transcript).trim();
    }

    if (event.type === "response.created") {
      companion.realtimeResponseCreatedAt = performance.now();
      companion.thinking = true;
      setStatus("thinking","já respondo");
    }
    if (event.type === "response.done") {
      companion.speaking = false;
      if (containsBlockedLanguage(companion.realtimeReply)) {
        retryRealtimeClean();
        return;
      }
      finalizeRealtimeTurn();
    }
    if (event.type === "error") {
      console.warn("Pipo Realtime:",event.error || event);
    }
  }

  async function connectRealtime() {
    if (companion.realtimeConnected) return true;
    if (companion.realtimeConnecting) return false;
    if (!window.RTCPeerConnection || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;

    closeRealtime();
    companion.realtimeConnecting = true;
    setStatus("thinking","conectando");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:{
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true,
          channelCount:1,
          latency:0.01
        }
      });
      companion.realtimeStream = stream;

      const pc = new RTCPeerConnection();
      companion.realtimePc = pc;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.playsInline = true;
      audio.style.display = "none";
      document.body.appendChild(audio);
      companion.realtimeAudio = audio;

      pc.ontrack = event => {
        if (event.streams && event.streams[0]) audio.srcObject = event.streams[0];
        audio.play().catch(()=>{});
      };

      stream.getTracks().forEach(track => pc.addTrack(track,stream));

      const dc = pc.createDataChannel("oai-events");
      companion.realtimeDc = dc;

      dc.onmessage = message => {
        try { handleRealtimeEvent(JSON.parse(message.data)); }
        catch (_) {}
      };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === "connected") {
          companion.realtimeConnected = true;
          companion.realtimeConnecting = false;
          companion.realtimeFailures = 0;
          companion.realtimeAvailable = true;
          setStatus("listening","ao vivo");
        } else if ((st === "failed" || st === "disconnected" || st === "closed") && companion.realtimeConnected) {
          companion.realtimeConnected = false;
          companion.realtimeConnecting = false;
          companion.realtimeFailures += 1;
          if (companion.wantsListening && !companion.recognition) {
            setStatus("listening","ouvindo");
            startRecognitionLoop(false);
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const authenticated = Boolean(state.token && state.token !== "local-demo");
      const endpoint = authenticated ? "/ai/realtime/session" : "/ai/realtime/guest-session";
      const response = await companionFetch(endpoint,{
        method:"POST",
        headers:{ "Content-Type":"application/sdp" },
        body:offer.sdp
      });
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type:"answer", sdp:answerSdp });

      await new Promise((resolve,reject) => {
        if (dc.readyState === "open") return resolve();
        const timer = setTimeout(() => reject(new Error("Pipo Realtime demorou para conectar.")),4500);
        dc.onopen = () => { clearTimeout(timer); resolve(); };
        dc.onerror = () => { clearTimeout(timer); reject(new Error("Falha no canal Realtime do Pipo.")); };
      });

      companion.realtimeConnected = true;
      companion.realtimeConnecting = false;
      companion.realtimeFailures = 0;
      companion.realtimeAvailable = true;
      companion.realtimeInputTranscript = "";
      companion.realtimeReply = "";
      setStatus("listening","ao vivo");
      syncRealtimeContext(true);

      const recent = companion.history.slice(-10);
      if (recent.length) sendGeminiClientContent("[RECENT_CONVERSATION] " + JSON.stringify(recent),false,"system");
      return true;
    } catch (error) {
      console.warn("Pipo Realtime indisponível:",error.message);
      closeRealtime();
      companion.realtimeConnecting = false;
      companion.realtimeFailures += 1;
      if (companion.realtimeFailures >= 2) companion.realtimeAvailable = false;
      return false;
    }
  }

  function recognitionLanguage() {
    const context = currentContext();
    if (context.stepType === "speak" || context.screen === "speaking") return "ru-RU";
    return "pt-BR";
  }

  function clearRestart() {
    if (companion.restartTimer) clearTimeout(companion.restartTimer);
    companion.restartTimer = null;
  }

  function stopRecognition(keepWanted) {
    clearRestart();
    if (!keepWanted) companion.wantsListening = false;
    if (companion.recognition) {
      try {
        companion.recognition.onend = null;
        companion.recognition.stop();
      } catch (_) {}
      companion.recognition = null;
    }
    companion.listening = false;
    if (!companion.speaking && !companion.thinking) {
      setStatus("idle", companion.wantsListening ? "voz pausada" : "observando");
    }
  }

  function scheduleRecognitionRestart(delay) {
    clearRestart();
    if (!companion.wantsListening || companion.speaking || companion.thinking || companion.lessonMicBusy) return;
    companion.restartTimer = setTimeout(function () {
      startRecognitionLoop(false);
    }, delay || 180);
  }

  function startRecognitionLoop(fromUserGesture) {
    if (!companion.wantsListening || companion.speaking || companion.thinking || companion.lessonMicBusy) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      companion.wantsListening = false;
      setStatus("idle", "sem reconhecimento de voz");
      showBubble("Seu navegador não me dá reconhecimento contínuo de voz. Eu continuo vendo as atividades, mas para conversar por voz use um navegador compatível.");
      return;
    }

    stopRecognition(true);

    const rec = new Recognition();
    companion.recognition = rec;
    rec.lang = recognitionLanguage();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    let interimCommitTimer = null;
    let lastInterimCandidate = "";
    function clearInterimCommit() {
      if (interimCommitTimer) clearTimeout(interimCommitTimer);
      interimCommitTimer = null;
    }
    function scheduleInterimCommit(candidate) {
      const value = String(candidate || "").trim();
      if (value.length < 2) return;
      clearInterimCommit();
      lastInterimCandidate = value;
      const lastWord = value.toLowerCase().split(/\s+/).pop();
      const unfinished = new Set(["e","mas","que","porque","tipo","pra","para","com","de","do","da","um","uma","então","entao"]);
      const delay = unfinished.has(lastWord) ? 720 : 360;
      interimCommitTimer = setTimeout(() => {
        if (!lastInterimCandidate || companion.speaking || companion.thinking || companion.recognition !== rec) return;
        const heard = lastInterimCandidate;
        lastInterimCandidate = "";
        stopRecognition(true);
        handleHeard(heard);
      },delay);
    }

    rec.onstart = function () {
      companion.listening = true;
      setStatus("listening", "ouvindo");
    };

    rec.onresult = function (event) {
      if (companion.speaking || companion.thinking) return;

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const alternatives = Array.from(event.results[i] || []);
        alternatives.sort((a,b) => Number(b.confidence || 0) - Number(a.confidence || 0));
        const text = String((alternatives[0] && alternatives[0].transcript) || "").trim();
        if (!text) continue;
        if (event.results[i].isFinal) {
          clearInterimCommit();
          lastInterimCandidate = "";
          handleHeard(text);
        } else {
          interim += (interim ? " " : "") + text;
        }
      }

      if (interim) {
        scheduleInterimCommit(interim);
        const heardBox = document.getElementById("putiHeard");
        if (heardBox) {
          heardBox.textContent = "ouvindo: " + interim;
          heardBox.classList.remove("hidden");
        }
      }
    };

    rec.onerror = function (event) {
      clearInterimCommit();
      companion.listening = false;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        companion.wantsListening = false;
        if (companion.profile) companion.profile.ambientListening = false;
        setStatus("idle", "microfone bloqueado");
        showBubble("Você fechou a porta do microfone. Justo. Quando quiser, abre de novo pelo meu símbolo.");
        savePrivacy({ ambientListening:false });
        return;
      }

      if (event.error !== "no-speech" && fromUserGesture) {
        showBubble("O microfone tropeçou. Já estou tentando de novo.");
      }
    };

    rec.onend = function () {
      clearInterimCommit();
      companion.listening = false;
      companion.recognition = null;
      if (companion.wantsListening) scheduleRecognitionRestart(90);
    };

    try {
      rec.start();
    } catch (_) {
      scheduleRecognitionRestart(300);
    }
  }

  async function enableAmbientListening(fromUserGesture) {
    companion.wantsListening = true;
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = true;
    companion.profile.voiceEnabled = true;
    await savePrivacy({ ambientListening:true, voiceEnabled:true });

    if (companion.realtimeAvailable == null) await probeAiCapability();

    if (companion.realtimeAvailable !== false) {
      setStatus("thinking","conectando");
      const neural = await connectRealtime();
      if (neural) {
        showBubble("Tô ouvindo.",true);
        return;
      }
    }

    setStatus("listening","ouvindo");
    startRecognitionLoop(Boolean(fromUserGesture));
  }

  async function disableAmbientListening() {
    stopRecognition(false);
    closeRealtime();
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = false;
    await savePrivacy({ ambientListening:false });
    setStatus("idle","observando");
    showBubble("Beleza. Sem microfone.",true);
  }

  function stopNeuralFallbackAudio() {
    if (!companion.neuralFallbackAudio) return;
    try {
      companion.neuralFallbackAudio.pause();
      if (companion.neuralFallbackAudio.src) URL.revokeObjectURL(companion.neuralFallbackAudio.src);
    } catch (_) {}
    companion.neuralFallbackAudio = null;
  }

  async function speakNeuralFallback(text) {
    if (!text || companion.realtimeConnected) return false;
    const authenticated = Boolean(state.token && state.token !== "local-demo");
    const body = JSON.stringify({ text:String(text).slice(0,1400) });

    async function requestAudio() {
      if (authenticated) {
        try {
          return await companionFetch("/ai/tts",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body
          });
        } catch (_) {}
      }
      return companionFetch("/ai/guest/tts",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body
      });
    }

    try {
      const response = await requestAudio();
      const blob = await response.blob();
      if (!blob || !blob.size) return false;

      stopNeuralFallbackAudio();
      if (window.speechSynthesis) speechSynthesis.cancel();
      stopRecognition(true);

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      companion.neuralFallbackAudio = audio;
      companion.speaking = true;
      setStatus("speaking","falando");

      await new Promise((resolve,reject)=>{
        audio.onended = resolve;
        audio.onerror = () => reject(new Error("Falha ao tocar voz neural."));
        const play = audio.play();
        if (play && typeof play.catch === "function") play.catch(reject);
      });

      if (companion.neuralFallbackAudio === audio) companion.neuralFallbackAudio = null;
      try { URL.revokeObjectURL(url); } catch (_) {}
      companion.speaking = false;
      setStatus("idle",companion.wantsListening ? "ouvindo" : "observando");
      if (companion.wantsListening) scheduleRecognitionRestart(220);
      return true;
    } catch (error) {
      reportLiveIssue("neural_tts_fallback",error);
      stopNeuralFallbackAudio();
      companion.speaking = false;
      return false;
    }
  }

  function voiceFor(lang) {
    if (!window.speechSynthesis) return null;
    const voices = speechSynthesis.getVoices();
    const lower = String(lang).toLowerCase();

    if (lower.startsWith("ru")) {
      const preferred = ["irina","pavel","yuri","milena","russian","рус"];
      for (const key of preferred) {
        const hit = voices.find(v => String(v.lang || "").toLowerCase().startsWith("ru") && String(v.name || "").toLowerCase().includes(key));
        if (hit) return hit;
      }
      return voices.find(v => String(v.lang || "").toLowerCase().startsWith("ru")) || null;
    }

    const pt = voices.filter(v => String(v.lang || "").toLowerCase().startsWith("pt"));
    const preferred = ["francisca","luciana","maria","natural","online","google português","google portugues","microsoft"];
    for (const key of preferred) {
      const hit = pt.find(v => String(v.name || "").toLowerCase().includes(key));
      if (hit) return hit;
    }
    return pt.find(v => String(v.lang || "").toLowerCase().startsWith("pt-br")) || pt[0] || null;
  }

  function speechSegments(text) {
    const pieces = String(text || "").split(/(?<=[.!?])\s+|\n+/).map(x => x.trim()).filter(Boolean);
    return pieces.map(piece => {
      const cyr = (piece.match(/[А-Яа-яЁё]/g) || []).length;
      const letters = (piece.match(/[A-Za-zÀ-ÿА-Яа-яЁё]/g) || []).length || 1;
      return { text:piece, lang:cyr / letters > 0.22 ? "ru-RU" : "pt-BR" };
    });
  }

  async function speakCompanion(text) {
    if (!text) return;
    if (companion.profile && companion.profile.voiceEnabled === false) return;
    if (companion.realtimeConnected) return;

    // Fora do Realtime, use somente a voz neural do servidor.
    // Se ela falhar, o Pipo continua em texto em vez de cair na voz ruim do navegador.
    if (companion.aiAvailable !== false) {
      const neural = await speakNeuralFallback(text);
      if (neural) return;
    }

    companion.speaking = false;
    setStatus("idle", companion.wantsListening ? "ouvindo" : "observando");
    if (companion.wantsListening) scheduleRecognitionRestart(120);
  }

  function waitForSpeechEnd() {
    if (companion.ttsWatch) clearInterval(companion.ttsWatch);
    companion.ttsWatch = setInterval(function () {
      if (!window.speechSynthesis || speechSynthesis.speaking || speechSynthesis.pending) return;
      clearInterval(companion.ttsWatch);
      companion.ttsWatch = null;
      if (companion.realtimeConnected) {
        setRealtimeMicEnabled(true);
        setStatus("listening","ouvindo");
        return;
      }
      if (!companion.speaking && companion.wantsListening && !companion.lessonMicBusy) {
        scheduleRecognitionRestart(380);
      }
    }, 160);
  }

  function localBrain(message) {
    const raw = String(message || "").trim();
    const m = raw.toLowerCase();
    const context = currentContext();
    const focus = context.focusText || "";

    if (/^(pipo)(\s+pipo){0,5}[!. ]*$/.test(m)) return "Oi.";
    if (/^(oi|olá|ola|eae|e aí|ei|opa|salve|привет)[!. ]*$/.test(m)) {
      const lines = [
        "Oi.",
        "Tô aqui.",
        "E aí."
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
    if (m.includes("quem é você") || m.includes("quem e voce")) return "Eu sou o Pipo. Fico aqui com você no curso.";
    if (m.includes("repete") || m.includes("repita") || m.includes("de novo")) return focus ? "De novo: " + focus : (companion.lastAnswer || "Você precisa me dar algo para repetir.");
    if (m.includes("devagar")) return focus ? "Certo. Bem devagar: " + focus : "Certo. Desacelerando.";
    if (m.includes("não entendi") || m.includes("nao entendi")) return focus ? "Beleza. Vamos por partes nessa aqui: “" + focus + "”." : "Qual parte?";
    if (m.includes("obrigad")) return "De nada.";
    if (m.includes("tchau") || m.includes("falou")) return "Falou.";

    if (/^[\p{L}\p{N}][\p{L}\p{N}\-]{0,28}$/u.test(raw)) {
      return raw + "?";
    }

    if (typeof localTeacher === "function") {
      const answer = localTeacher(raw, "professor");
      if (answer && !answer.startsWith("Vamos estudar.")) return answer;
    }

    return focus
      ? "Tô vendo “" + focus + "”."
      : "Tô aqui.";
  }

  function cleanCompanionSpeech(text) {
    let value = String(text || "").trim();
    const replacements = [
      [/\bfilho\s+da\s+puta\b/gi, "chato"],
      [/\bputa\s+que\s+pariu\b/gi, "poxa vida"],
      [/\bvai\s+se\s+foder\b/gi, "melhor parar por aí"],
      [/\bporra\b/gi, "poxa"],
      [/\bcaralho\b/gi, "caramba"],
      [/\bcacete\b/gi, "caramba"],
      [/\bmerda\b/gi, "droga"],
      [/\bfod(?:a|ido|ida|er|eu|endo)\b/gi, "complicado"],
      [/\bpqp\b/gi, "poxa"],
      [/\bdesgraçad[oa]\b/gi, "complicado"],
      [/\bdesgraça\b/gi, "problema"],
      [/\bputa\b/gi, "poxa"],
      [/\bbuceta\b/gi, "isso"]
    ];
    for (const [pattern, replacement] of replacements) value = value.replace(pattern, replacement);
    return value;
  }

  function instantConversationalReply(message) {
    const raw = String(message || "").trim();
    const m = raw.toLowerCase().replace(/[!?.,]+$/g,"").replace(/\s+/g," ").trim();
    if (!m) return "";

    const words = m.split(" ");
    const greetings = new Set(["oi","olá","ola","eae","ei","opa","salve","alô","alo"]);
    if (words.length <= 6 && words.every(word => greetings.has(word))) return "Oi.";
    if (/^(pipo)( pipo){0,5}$/.test(m)) return "Oi.";
    if (/^(ei pipo|oi pipo|olá pipo|ola pipo|eae pipo|alô pipo|alo pipo)$/.test(m)) return "Oi.";
    if (/^(bora|vamos|vamo|vambora|bora estudar|vamos estudar)$/.test(m)) return "Bora.";
    if (/^(sim|aham|uhum|isso|isso mesmo|exato|beleza|blz|ok|okay)$/.test(m)) return "Tô acompanhando.";
    if (/^(tá me ouvindo|ta me ouvindo|me ouve|você me ouve|voce me ouve)$/.test(m)) return "Tô.";
    if (/^(não|nao|nada a ver|errado)$/.test(m)) return "Tá. Peguei errado.";
    if (/^(repete|repita|de novo)$/.test(m) && companion.lastAnswer) return companion.lastAnswer;
    return "";
  }

  function casualMessage(message) {
    const m = String(message || "").trim();
    if (!m) return true;
    if (/[?]/.test(m) && m.split(/\s+/).length > 5) return false;
    return m.split(/\s+/).length <= 6;
  }

  function enforceNaturalReply(message, answer) {
    let value = String(answer || "").trim();
    if (!value) return value;

    const theatrical = /\b(câmbio|central|alto e claro|radar|código secreto|codigo secreto|meus circuitos|circuitos|milagre tecnológico|milagre tecnologico)\b/i;
    if (theatrical.test(value)) {
      return instantConversationalReply(message) || localBrain(message);
    }

    value = value.replace(/\s{2,}/g," ").trim();

    if (casualMessage(message) && value.length > 72) {
      const instant = instantConversationalReply(message);
      if (instant) return instant;
      const first = value.split(/(?<=[.!?])\s+/)[0].trim();
      if (first && first.length <= 72) return first;
      return localBrain(message);
    }
    return value || localBrain(message);
  }

  function brainContext() {
    const c = currentContext();
    return {
      screen:c.screen || "",
      lessonTitle:c.lessonTitle || "",
      stepType:c.stepType || "",
      focusText:compactText(c.focusText,320),
      feedback:compactText(c.feedback || c.pronunciationFeedback,360),
      activity:c.activity ? {
        type:c.activity.type || "",
        prompt:compactText(c.activity.prompt,360),
        target:compactText(c.activity.target,260),
        translation:compactText(c.activity.translation,220),
        answer:compactText(c.activity.answer,220),
        options:Array.isArray(c.activity.options) ? c.activity.options.slice(0,8) : []
      } : null,
      lastEvent:c.lastEvent || null
    };
  }

  async function callBrain(message) {
    if (companion.aiAvailable === false) {
      return { answer:localBrain(message), provider:"local" };
    }

    const authenticated = Boolean(state.token && state.token !== "local-demo");
    const body = JSON.stringify({
      message:String(message).slice(0,1600),
      context:brainContext(),
      history:companion.history.slice(-4)
    });

    if (authenticated) {
      try {
        const response = await companionFetch("/ai/respond", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body
        });
        return response.json();
      } catch (_) {}
    }

    const response = await companionFetch("/ai/guest/respond", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body
    });
    return response.json();
  }

  async function respondTo(message, options) {
    if (!message || companion.thinking || companion.speaking) return;

    if (companion.realtimeConnected) {
      sendRealtimeText(message);
      return;
    }

    companion.thinking = true;
    stopRecognition(true);
    setStatus("thinking", "já peguei");
    setMood("focused");

    if (!(options && options.silentUi)) {
      const bubble = document.getElementById("putiCompanionBubble");
      const heardBox = document.getElementById("putiHeard");
      if (bubble) bubble.classList.remove("hidden");
      if (heardBox && options && options.heard) {
        heardBox.textContent = "você: " + options.heard;
        heardBox.classList.remove("hidden");
      }
    }

    try {
      const instant = instantConversationalReply(message);
      const data = instant ? { answer:instant, provider:"instant" } : await callBrain(message);
      const answer = cleanCompanionSpeech(enforceNaturalReply(message, String(data && data.answer || "").trim() || localBrain(message)));

      rememberTurn("user", message);
      rememberTurn("assistant", answer);
      companion.lastAnswer = answer;
      companion.thinking = false;
      showBubble(answer, true, options && options.heard ? options.heard : "");
      speakCompanion(answer);
    } catch (_) {
      companion.thinking = false;
      const fallback = cleanCompanionSpeech(localBrain(message));
      rememberTurn("user", message);
      rememberTurn("assistant", fallback);
      companion.lastAnswer = fallback;
      showBubble(fallback, true, options && options.heard ? options.heard : "");
      speakCompanion(fallback);
    }
  }

  function handleHeard(heard) {
    if (!heard || companion.speaking || companion.thinking) return;
    companion.lastHeard = heard;
    showBubble("…", true, heard);
    respondTo(heard, { heard });
  }

  async function maybeNudge(reason) {
    const now = Date.now();
    if (now - companion.lastNudgeAt < 90000) return;
    companion.lastNudgeAt = now;
    pushRealtimeContext();
    await respondTo(
      "Você percebeu que eu errei repetidamente agora. Intervenha espontaneamente com uma observação curta, viva e específica, sem entregar a resposta.",
      { context:{ source:"automatic_intervention", trigger:reason || "repeated_mistake" } }
    );
  }

  function scheduleIdleLife() {
    if (companion.idleTimer) clearTimeout(companion.idleTimer);
    companion.idleTimer = setTimeout(function pulse() {
      if (!companion.speaking && !companion.thinking) {
        const status = document.getElementById("putiCompanionStatus");
        const context = currentContext();
        const labels = context.lessonTitle
          ? ["observando a aula","de olho nos seus erros","acompanhando","quieta. por enquanto."]
          : ["observando","acordada","de olho","calculando coisas desnecessárias"];
        if (status) status.textContent = labels[Math.floor(Math.random() * labels.length)];
        setMood(Math.random() > .72 ? "amused" : "curious");
        maybeWanderPipo();
      }
      companion.idleTimer = setTimeout(pulse, 11000 + Math.random() * 9000);
    }, 14000);
  }

  async function completeOnboarding(withVoice) {
    const overlay = document.getElementById("putiOnboarding");
    if (overlay) overlay.classList.add("hidden");

    if (state.token && state.token !== "local-demo") {
      try {
        await request("/ai/onboarding/complete", {
          method:"POST",
          body:JSON.stringify({ voiceEnabled:Boolean(withVoice), ambientListening:Boolean(withVoice) })
        });
      } catch (_) {}
    }

    if (!companion.profile) companion.profile = {};
    companion.profile.onboarded = true;
    companion.profile.voiceEnabled = Boolean(withVoice);
    companion.profile.ambientListening = Boolean(withVoice);

    const name = state.user && state.user.name ? state.user.name.split(" ")[0] : "";
    const intro = (name ? name + ". " : "") + "Eu sou o Pipo. Eu fico por aqui, observo o que você está fazendo e aprendo o seu jeito de estudar. Pode falar comigo normal.";

    companion.lastAnswer = intro;
    pipoGesture("wave",1400);
    showBubble(intro, true);

    if (withVoice) {
      companion.wantsListening = true;
      if (companion.realtimeAvailable == null) await probeAiCapability();
      const neural = companion.realtimeAvailable !== false ? await connectRealtime() : false;
      if (!neural) speakCompanion(intro);
    }
  }

  function refreshPrivacyControls() {
    const p = companion.profile || {};
    const memory = document.getElementById("putiMemorySetting");
    const transcripts = document.getElementById("putiTranscriptSetting");
    const voice = document.getElementById("putiVoiceSetting");
    const ambient = document.getElementById("putiAmbientSetting");
    if (memory) memory.checked = p.memoryEnabled !== false;
    if (transcripts) transcripts.checked = p.storeTranscripts !== false;
    if (voice) voice.checked = p.voiceEnabled !== false;
    if (ambient) ambient.checked = Boolean(p.ambientListening);
  }

  function renderPrivacyPanel() {
    const layout = document.querySelector("#screen-profile .profile-layout");
    if (!layout) return;

    let panel = document.getElementById("putiPrivacyPanel");
    if (!panel) {
      panel = document.createElement("article");
      panel.id = "putiPrivacyPanel";
      panel.className = "panel puti-privacy-panel";
      panel.innerHTML =
        '<p class="tag">Pipo • PRIVACIDADE</p>' +
        '<h2>Memória e voz</h2>' +
        '<p class="puti-privacy-copy">A memória autenticada é separada por conta. O áudio bruto não é salvo.</p>' +
        '<label class="puti-setting"><span><b>Memória pedagógica</b><small>Guarda dificuldades e eventos de estudo.</small></span><input id="putiMemorySetting" type="checkbox"></label>' +
        '<label class="puti-setting"><span><b>Guardar transcrições</b><small>Lembra conversas. Desligar impede novas transcrições persistentes.</small></span><input id="putiTranscriptSetting" type="checkbox"></label>' +
        '<label class="puti-setting"><span><b>Responder por voz</b><small>Fala as respostas em voz alta.</small></span><input id="putiVoiceSetting" type="checkbox"></label>' +
        '<label class="puti-setting"><span><b>Escuta enquanto o site está aberto</b><small>Requer permissão do microfone.</small></span><input id="putiAmbientSetting" type="checkbox"></label>' +
        '<button id="putiClearMemory" class="ghost danger-outline" type="button">Apagar memória da IA</button>';

      layout.appendChild(panel);

      document.getElementById("putiMemorySetting").addEventListener("change", e => {
        companion.profile = Object.assign({}, companion.profile || {}, { memoryEnabled:e.target.checked });
        savePrivacy({ memoryEnabled:e.target.checked });
      });
      document.getElementById("putiTranscriptSetting").addEventListener("change", e => {
        companion.profile = Object.assign({}, companion.profile || {}, { storeTranscripts:e.target.checked });
        savePrivacy({ storeTranscripts:e.target.checked });
      });
      document.getElementById("putiVoiceSetting").addEventListener("change", e => {
        companion.profile = Object.assign({}, companion.profile || {}, { voiceEnabled:e.target.checked });
        savePrivacy({ voiceEnabled:e.target.checked });
      });
      document.getElementById("putiAmbientSetting").addEventListener("change", e => {
        if (e.target.checked) enableAmbientListening(true);
        else disableAmbientListening();
      });
      document.getElementById("putiClearMemory").addEventListener("click", async function () {
        if (!confirm("Apagar a memória pedagógica e as conversas do Pipo desta conta? Seu progresso normal será mantido.")) return;
        if (!state.token || state.token === "local-demo") {
          toast("Esta sessão temporária não possui memória persistente.");
          return;
        }
        try {
          await request("/ai/memory", { method:"DELETE" });
          companion.recentMistakes = 0;
          showBubble("Apaguei minha memória pedagógica desta conta. O progresso do curso ficou intacto.");
          toast("Memória da IA apagada.");
        } catch (error) {
          toast(error.message || "Não foi possível apagar a memória.", "bad");
        }
      });
    }

    refreshPrivacyControls();
  }

  function installHooks() {
    const oldShowScreen = showScreen;
    showScreen = function (name) {
      const result = oldShowScreen.apply(this, arguments);
      track("screen_view", { screen:name });
      if (name === "profile") setTimeout(renderPrivacyPanel, 30);
      setTimeout(pushRealtimeContext,40);
      return result;
    };

    const oldOpenCourse = openCourse;
    openCourse = function (id, lessonIndex) {
      const result = oldOpenCourse.apply(this, arguments);
      const session = state.lessonSession;
      if (session) {
        companion.recentMistakes = 0;
        setTimeout(pushRealtimeContext,40);
        track("lesson_open", {
          courseId:session.course.id,
          level:session.course.level,
          unit:session.course.title,
          lessonIndex:session.lessonIndex,
          lesson:session.course.lessons[session.lessonIndex]
        });
      }
      return result;
    };

    const oldRenderLesson = renderLessonActivity;
    renderLessonActivity = function () {
      const result = oldRenderLesson.apply(this, arguments);
      const session = state.lessonSession;
      if (session && session.steps && session.steps[session.stepIndex]) {
        setTimeout(pushRealtimeContext,30);
        const step = session.steps[session.stepIndex];
        track("lesson_step", {
          courseId:session.course.id,
          lesson:session.course.lessons[session.lessonIndex],
          stepIndex:session.stepIndex,
          stepType:step.type,
          focus:step.target || step.prompt || (step.item && (step.item.glyph || step.item.example)) || step.title || step.objective || ""
        });
      }
      return result;
    };

    const oldHandlePrimary = handleLessonPrimary;
    handleLessonPrimary = function () {
      const session = state.lessonSession;
      const primary = document.getElementById("lessonPrimary");
      const modeBefore = primary ? primary.dataset.mode : "";
      const step = session && session.steps ? session.steps[session.stepIndex] : null;
      const received = step && step.type === "type" && document.getElementById("lessonTypeInput")
        ? document.getElementById("lessonTypeInput").value
        : (session && session.selected ? session.selected : (session && session.arranged ? session.arranged.join(" ") : ""));

      const result = oldHandlePrimary.apply(this, arguments);

      if (session && step && modeBefore.indexOf("check-") === 0) {
        const footer = document.getElementById("lessonRunFooter");
        const eventDetails = {
          courseId:session.course.id,
          lesson:session.course.lessons[session.lessonIndex],
          stepType:step.type,
          prompt:step.prompt || step.target || "",
          expected:step.answer || step.target || "",
          received,
          correct:Boolean(footer && footer.classList.contains("is-correct"))
        };
        track("lesson_answer", eventDetails);
        pushRealtimeAppEvent("lesson_answer", eventDetails);
      }
      return result;
    };

    const oldMistake = recordLessonMistake;
    recordLessonMistake = function (session, step, expected, received) {
      const result = oldMistake.apply(this, arguments);
      companion.recentMistakes += 1;
      const mistakeDetails = {
        courseId:session.course.id,
        lesson:session.course.lessons[session.lessonIndex],
        stepType:step.type,
        prompt:step.prompt || step.target || step.title || "",
        expected,
        received:received || ""
      };
      track("lesson_mistake", mistakeDetails);
      pushRealtimeAppEvent("lesson_mistake", mistakeDetails);
      if (companion.recentMistakes >= 2) maybeNudge("repeated_lesson_error");
      return result;
    };

    const oldFinishLesson = finishLessonSession;
    finishLessonSession = function () {
      const session = state.lessonSession;
      if (session) {
        const score = session.graded ? Math.round((session.correct / session.graded) * 100) : 100;
        const completeDetails = {
          courseId:session.course.id,
          lesson:session.course.lessons[session.lessonIndex],
          score,
          correct:session.correct,
          graded:session.graded
        };
        track("lesson_complete", completeDetails);
        pushRealtimeAppEvent("lesson_complete", completeDetails);
      }
      return oldFinishLesson.apply(this, arguments);
    };

    const oldScoreTrace = scoreTrace;
    scoreTrace = function () {
      const letter = ALPHABET[state.selectedLetter];
      const result = oldScoreTrace.apply(this, arguments);
      if (letter && state.progress.letters && state.progress.letters[letter.lower]) {
        const info = state.progress.letters[letter.lower];
        const writingDetails = { letter:letter.lower, mode:state.writingMode, score:info.score, attempts:info.attempts };
        track("writing_score", writingDetails);
        pushRealtimeAppEvent("writing_score", writingDetails);
      }
      return result;
    };

    const oldCheckCopy = checkCopy;
    checkCopy = function () {
      const typed = normalize(document.getElementById("copyInput").value);
      const target = normalize(state.copyItem);
      const result = oldCheckCopy.apply(this, arguments);
      const copyDetails = { target:state.copyItem, received:typed, correct:typed === target };
      track("copy_answer", copyDetails);
      pushRealtimeAppEvent("copy_answer", copyDetails);
      return result;
    };

    const oldFinishExam = finishExam;
    finishExam = function () {
      let score = 0;
      state.exam.forEach(question => {
        const chosen = document.querySelector('input[name="q' + question.id + '"]:checked');
        if (chosen && chosen.value === question.answer) score += 1;
      });
      const total = state.exam.length || 1;
      const result = oldFinishExam.apply(this, arguments);
      const examDetails = { score, total:state.exam.length, percent:Math.round(score / total * 100) };
      track("exam_complete", examDetails);
      pushRealtimeAppEvent("exam_complete", examDetails);
      return result;
    };

    const oldRateReview = rateReview;
    rateReview = function (ok) {
      track("review_result", { correct:Boolean(ok), index:state.reviewIndex });
      return oldRateReview.apply(this, arguments);
    };

    const oldSpeak = speak;
    speak = function () {
      if (companion.realtimeConnected) setRealtimeMicEnabled(false);
      if (companion.wantsListening && !companion.realtimeConnected) stopRecognition(true);
      const result = oldSpeak.apply(this, arguments);
      waitForSpeechEnd();
      return result;
    };

    const oldSpeakingRecognition = startRecognition;
    startRecognition = function () {
      const liveWasConnected = companion.realtimeConnected;
      companion.lessonMicBusy = true;
      if (!liveWasConnected) stopRecognition(true);
      pushRealtimeAppEvent("pronunciation_attempt_started", currentContext());
      const result = oldSpeakingRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.realtimeConnected) {
          setRealtimeMicEnabled(true);
          scheduleContextSync();
        } else if (companion.wantsListening) scheduleRecognitionRestart(180);
      }, 9000);
      return result;
    };

    const oldLessonRecognition = startLessonRecognition;
    startLessonRecognition = function () {
      const liveWasConnected = companion.realtimeConnected;
      companion.lessonMicBusy = true;
      if (!liveWasConnected) stopRecognition(true);
      pushRealtimeAppEvent("lesson_pronunciation_attempt_started", currentContext());
      const result = oldLessonRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.realtimeConnected) {
          setRealtimeMicEnabled(true);
          scheduleContextSync();
        } else if (companion.wantsListening) scheduleRecognitionRestart(180);
      }, 9000);
      return result;
    };

    document.addEventListener("click", function (event) {
      const answer = event.target.closest && event.target.closest("[data-audio-answer]");
      if (answer && state.audioItem) {
        track("lesson_answer", {
          area:"audio",
          prompt:state.audioItem.ru,
          expected:state.audioItem.pt,
          received:answer.dataset.audioAnswer,
          correct:answer.dataset.audioAnswer === state.audioItem.pt
        });
      }
    }, true);
  }

  function warmCompanionBackend() {
    companionFetch("/health",{ method:"GET" }).catch(()=>{});
  }

  async function init() {
    if (companion.initialized) return;
    companion.initialized = true;
    restoreRecentConversation();
    createUi();
    installHooks();
    startContextObserver();
    scheduleIdleLife();
    warmCompanionBackend();
    probeAiCapability();

    companion.profile = {
      onboarded:false,
      memoryEnabled:true,
      storeTranscripts:true,
      voiceEnabled:true,
      ambientListening:false
    };

    if (state.token && state.token !== "local-demo") {
      try {
        const data = await request("/ai/state");
        companion.profile = Object.assign(companion.profile, data.profile || {});
      } catch (_) {}
    }

    renderPrivacyPanel();

    const localIntroSeen = localStorage.getItem("pipoCompanionIntroSeen") === "1" || localStorage.getItem("putirusuCompanionIntroSeen") === "1";
    if (!companion.profile.onboarded && !localIntroSeen) {
      setTimeout(function () {
        const onboarding = document.getElementById("putiOnboarding");
        if (onboarding) onboarding.classList.remove("hidden");
      }, 550);
    } else if (companion.profile.ambientListening) {
      companion.wantsListening = true;
      setTimeout(async function () {
        if (companion.realtimeAvailable == null) await probeAiCapability();
        const ok = companion.realtimeAvailable !== false ? await connectRealtime() : false;
        if (!ok) startRecognitionLoop(false);
      },500);
    } else {
      setStatus("idle", "observando");
    }
  }

  const oldEnterApp = enterApp;
  enterApp = function () {
    const result = oldEnterApp.apply(this, arguments);
    setTimeout(init, 60);
    return result;
  };

  const oldComplete = completeOnboarding;
  completeOnboarding = async function (withVoice) {
    localStorage.setItem("pipoCompanionIntroSeen", "1");
    return oldComplete(withVoice);
  };

  document.addEventListener("DOMContentLoaded", function () {
    const app = document.getElementById("app");
    if (app && !app.classList.contains("hidden")) setTimeout(init, 60);
  });

  const ppApi = {
    ask:message => respondTo(message, { heard:message }),
    listen:() => enableAmbientListening(true),
    silence:disableAmbientListening,
    context:currentContext,
    point:() => movePipoNear(currentPresenceTarget(),{ point:true, stay:5200 }),
    wave:() => pipoGesture("wave",1200),
    cheer:() => pipoGesture("cheer",1400),
    home:() => returnPipoHome(0)
  };
  window.PUTIRUSU_COMPANION = ppApi;
  window.PIPO_COMPANION = ppApi;
  window.PP_COMPANION = ppApi;
})();
