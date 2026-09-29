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
    restartTimer: null,
    ttsWatch: null,
    idleTimer: null,
    initialized: false
  };

  state.companion = companion;

  function currentContext() {
    const activeScreen = document.querySelector(".screen.active");
    const context = {
      screen: activeScreen ? activeScreen.id.replace("screen-", "") : (document.body.classList.contains("lesson-mode") ? "course" : "unknown"),
      title: document.getElementById("screenTitle") ? document.getElementById("screenTitle").textContent : ""
    };

    const session = state.lessonSession;
    if (session && document.body.classList.contains("lesson-mode")) {
      const step = session.steps && session.steps[session.stepIndex];
      context.courseId = session.course && session.course.id;
      context.level = session.course && session.course.level;
      context.unitTitle = session.course && session.course.title;
      context.lessonIndex = session.lessonIndex;
      context.lessonTitle = session.course && session.course.lessons ? session.course.lessons[session.lessonIndex] : "";
      context.stepIndex = session.stepIndex;
      context.stepTotal = session.steps ? session.steps.length : 0;
      context.stepType = step && step.type;
      context.focusText = step
        ? (step.target || step.prompt || (step.item && (step.item.glyph || step.item.example)) || step.title || step.objective || "")
        : "";
    }

    if (context.screen === "handwriting") {
      const letter = ALPHABET[state.selectedLetter];
      if (letter) {
        context.focusText = letter.upper + " " + letter.lower;
        context.letter = letter.lower;
        context.writingMode = state.writingMode;
      }
    }

    if (context.screen === "speaking" && state.speakingItem) {
      context.focusText = state.speakingItem.ru;
      context.translation = state.speakingItem.pt;
    }

    if (context.screen === "audio" && state.audioItem) {
      context.focusText = state.audioItem.ru;
      context.translation = state.audioItem.pt;
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
      '<button id="putiCompanionOrb" class="puti-companion-orb" type="button" aria-label="Abrir PUTIRUSU">' +
        '<span class="puti-orb-ring"></span>' +
        '<span class="puti-face" aria-hidden="true"><i class="eye left"></i><i class="eye right"></i><b class="mouth"></b></span>' +
        '<span class="puti-orb-core">П</span>' +
      '</button>' +
      '<div id="putiCompanionBubble" class="puti-companion-bubble hidden">' +
        '<div class="puti-companion-head">' +
          '<div class="puti-identity"><strong>PUTIRUSU</strong><span id="putiCompanionStatus">observando</span></div>' +
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
        '<h1>Você não precisa abrir uma IA. Eu vivo no PUTIRUSU.</h1>' +
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
    });
    document.getElementById("putiCompanionClose").addEventListener("click", function () {
      document.getElementById("putiCompanionBubble").classList.add("hidden");
    });
    document.getElementById("putiMicToggle").addEventListener("click", function () {
      if (companion.wantsListening || companion.listening) disableAmbientListening();
      else enableAmbientListening(true);
    });
    document.getElementById("putiCompanionRepeat").addEventListener("click", function () {
      if (companion.lastAnswer) speakCompanion(companion.lastAnswer);
    });
    document.getElementById("putiOnboardingVoice").addEventListener("click", function () {
      completeOnboarding(true);
    });
    document.getElementById("putiOnboardingSkip").addEventListener("click", function () {
      completeOnboarding(false);
    });
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
    }, delay || 550);
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
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = function () {
      companion.listening = true;
      setStatus("listening", "ouvindo");
    };

    rec.onresult = function (event) {
      if (companion.speaking || companion.thinking) return;

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = String(event.results[i][0].transcript || "").trim();
        if (!text) continue;
        if (event.results[i].isFinal) {
          handleHeard(text);
        } else {
          interim += (interim ? " " : "") + text;
        }
      }

      if (interim) {
        const heardBox = document.getElementById("putiHeard");
        if (heardBox) {
          heardBox.textContent = "ouvindo: " + interim;
          heardBox.classList.remove("hidden");
        }
      }
    };

    rec.onerror = function (event) {
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
      companion.listening = false;
      companion.recognition = null;
      if (companion.wantsListening) scheduleRecognitionRestart(600);
    };

    try {
      rec.start();
    } catch (_) {
      scheduleRecognitionRestart(900);
    }
  }

  async function enableAmbientListening(fromUserGesture) {
    companion.wantsListening = true;
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = true;
    companion.profile.voiceEnabled = true;
    await savePrivacy({ ambientListening:true, voiceEnabled:true });
    setStatus("listening", "ligando o ouvido");
    startRecognitionLoop(Boolean(fromUserGesture));
  }

  async function disableAmbientListening() {
    stopRecognition(false);
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = false;
    await savePrivacy({ ambientListening:false });
    setStatus("idle", "observando");
    showBubble("Tá. Fico só olhando a aula por enquanto.", true);
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

    return voices.find(v => String(v.lang || "").toLowerCase().startsWith("pt-br"))
      || voices.find(v => String(v.lang || "").toLowerCase().startsWith("pt"))
      || null;
  }

  function speechSegments(text) {
    const pieces = String(text || "").split(/(?<=[.!?])\s+|\n+/).map(x => x.trim()).filter(Boolean);
    return pieces.map(piece => {
      const cyr = (piece.match(/[А-Яа-яЁё]/g) || []).length;
      const letters = (piece.match(/[A-Za-zÀ-ÿА-Яа-яЁё]/g) || []).length || 1;
      return { text:piece, lang:cyr / letters > 0.22 ? "ru-RU" : "pt-BR" };
    });
  }

  function speakCompanion(text) {
    if (!text || !window.speechSynthesis) return;
    if (companion.profile && companion.profile.voiceEnabled === false) return;

    stopRecognition(true);
    speechSynthesis.cancel();
    companion.speaking = true;
    setStatus("speaking", "falando");

    const segments = speechSegments(text);
    let index = 0;

    function next() {
      if (index >= segments.length) {
        companion.speaking = false;
        setStatus("idle", companion.wantsListening ? "ouvindo" : "observando");
        if (companion.wantsListening) scheduleRecognitionRestart(420);
        return;
      }

      const item = segments[index++];
      const utter = new SpeechSynthesisUtterance(item.text);
      utter.lang = item.lang;
      utter.volume = 1;

      if (item.lang === "ru-RU") {
        utter.rate = 0.72;
        utter.pitch = 0.72;
      } else {
        utter.rate = 0.98;
        utter.pitch = 0.96;
      }

      const selected = voiceFor(item.lang);
      if (selected) utter.voice = selected;
      utter.onend = next;
      utter.onerror = next;
      speechSynthesis.speak(utter);
    }

    next();
  }

  function waitForSpeechEnd() {
    if (companion.ttsWatch) clearInterval(companion.ttsWatch);
    companion.ttsWatch = setInterval(function () {
      if (!window.speechSynthesis || speechSynthesis.speaking || speechSynthesis.pending) return;
      clearInterval(companion.ttsWatch);
      companion.ttsWatch = null;
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

    if (/^(oi|olá|ola|eae|e aí|ei|opa|salve|привет)[!. ]*$/.test(m)) {
      const lines = [
        "Oi. Eu ouvi. Então o sistema ainda está vivo.",
        "E aí. Eu estava quieta, não desligada.",
        "Olá. Finalmente resolveu testar se eu estava acordada."
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
    if (m.includes("quem é você") || m.includes("quem e voce")) return "Eu sou o PUTIRUSU. Eu moro aqui dentro. Observo seu estudo, lembro do que importa e, aparentemente, também tenho que explicar minha própria existência.";
    if (m.includes("repete") || m.includes("repita") || m.includes("de novo")) return focus ? "De novo: " + focus : (companion.lastAnswer || "Você precisa me dar algo para repetir.");
    if (m.includes("devagar")) return focus ? "Certo. Bem devagar: " + focus : "Certo. Desacelerando.";
    if (m.includes("não entendi") || m.includes("nao entendi")) return focus ? "Eu vi. O ponto atual é “" + focus + "”. Vou separar isso em uma parte menor." : "Tá. Eu perdi a referência exata, mas não a conversa. Fala qual parte te travou.";
    if (m.includes("obrigad")) return "De nada. Registre este raro momento de educação digital.";
    if (m.includes("tchau") || m.includes("falou")) return "Vai lá. Eu continuo aqui. Vantagens de não ter pernas.";

    if (typeof localTeacher === "function") {
      const answer = localTeacher(raw, "professor");
      if (answer && !answer.startsWith("Vamos estudar.")) return answer;
    }

    return "Eu ouvi “" + raw + "”. Meu cérebro remoto não respondeu agora, então prefiro não inventar. " + (focus ? "Mas eu ainda sei que você está em “" + focus + "”." : "Eu continuo acompanhando a tela.");
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

  async function callBrain(message) {
    const payload = {
      method:"POST",
      body:JSON.stringify({
        message:String(message).slice(0,1600),
        context:currentContext()
      })
    };

    if (state.token && state.token !== "local-demo") {
      try {
        return await request("/ai/respond", payload);
      } catch (_) {}
    }

    try {
      return await request("/ai/guest/respond", payload);
    } catch (_) {
      return { answer:localBrain(message), provider:"local" };
    }
  }

  async function respondTo(message, options) {
    if (!message || companion.thinking || companion.speaking) return;

    companion.thinking = true;
    stopRecognition(true);
    setStatus("thinking", "pensando");
    setMood("focused");

    if (!(options && options.silentUi)) showBubble("Hm…", true, options && options.heard ? options.heard : "");

    try {
      const data = await callBrain(message);
      const answer = cleanCompanionSpeech(String(data && data.answer || "").trim() || localBrain(message));

      companion.lastAnswer = answer;
      companion.thinking = false;
      showBubble(answer, true, options && options.heard ? options.heard : "");
      speakCompanion(answer);
    } catch (_) {
      companion.thinking = false;
      const fallback = cleanCompanionSpeech(localBrain(message));
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
      }
      companion.idleTimer = setTimeout(pulse, 18000 + Math.random() * 16000);
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
    const intro = (name ? name + ". " : "") + "Eu sou o PUTIRUSU. Não precisa me procurar em lugar nenhum; eu já estou vendo o que acontece aqui. Fala comigo normalmente. Se você disser qualquer coisa, eu respondo.";

    companion.lastAnswer = intro;
    showBubble(intro, true);

    if (withVoice) {
      companion.wantsListening = true;
      speakCompanion(intro);
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
        '<p class="tag">PUTIRUSU • PRIVACIDADE</p>' +
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
        if (!confirm("Apagar a memória pedagógica e as conversas do PUTIRUSU desta conta? Seu progresso normal será mantido.")) return;
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
      return result;
    };

    const oldOpenCourse = openCourse;
    openCourse = function (id, lessonIndex) {
      const result = oldOpenCourse.apply(this, arguments);
      const session = state.lessonSession;
      if (session) {
        companion.recentMistakes = 0;
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
        track("lesson_answer", {
          courseId:session.course.id,
          lesson:session.course.lessons[session.lessonIndex],
          stepType:step.type,
          prompt:step.prompt || step.target || "",
          expected:step.answer || step.target || "",
          received,
          correct:Boolean(footer && footer.classList.contains("is-correct"))
        });
      }
      return result;
    };

    const oldMistake = recordLessonMistake;
    recordLessonMistake = function (session, step, expected, received) {
      const result = oldMistake.apply(this, arguments);
      companion.recentMistakes += 1;
      track("lesson_mistake", {
        courseId:session.course.id,
        lesson:session.course.lessons[session.lessonIndex],
        stepType:step.type,
        prompt:step.prompt || step.target || step.title || "",
        expected,
        received:received || ""
      });
      if (companion.recentMistakes >= 2) maybeNudge("repeated_lesson_error");
      return result;
    };

    const oldFinishLesson = finishLessonSession;
    finishLessonSession = function () {
      const session = state.lessonSession;
      if (session) {
        const score = session.graded ? Math.round((session.correct / session.graded) * 100) : 100;
        track("lesson_complete", {
          courseId:session.course.id,
          lesson:session.course.lessons[session.lessonIndex],
          score,
          correct:session.correct,
          graded:session.graded
        });
      }
      return oldFinishLesson.apply(this, arguments);
    };

    const oldScoreTrace = scoreTrace;
    scoreTrace = function () {
      const letter = ALPHABET[state.selectedLetter];
      const result = oldScoreTrace.apply(this, arguments);
      if (letter && state.progress.letters && state.progress.letters[letter.lower]) {
        const info = state.progress.letters[letter.lower];
        track("writing_score", { letter:letter.lower, mode:state.writingMode, score:info.score, attempts:info.attempts });
      }
      return result;
    };

    const oldCheckCopy = checkCopy;
    checkCopy = function () {
      const typed = normalize(document.getElementById("copyInput").value);
      const target = normalize(state.copyItem);
      const result = oldCheckCopy.apply(this, arguments);
      track("copy_answer", { target:state.copyItem, received:typed, correct:typed === target });
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
      track("exam_complete", { score, total:state.exam.length, percent:Math.round(score / total * 100) });
      return result;
    };

    const oldRateReview = rateReview;
    rateReview = function (ok) {
      track("review_result", { correct:Boolean(ok), index:state.reviewIndex });
      return oldRateReview.apply(this, arguments);
    };

    const oldSpeak = speak;
    speak = function () {
      if (companion.wantsListening) stopRecognition(true);
      const result = oldSpeak.apply(this, arguments);
      waitForSpeechEnd();
      return result;
    };

    const oldSpeakingRecognition = startRecognition;
    startRecognition = function () {
      companion.lessonMicBusy = true;
      stopRecognition(true);
      const result = oldSpeakingRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.wantsListening) scheduleRecognitionRestart(400);
      }, 12000);
      return result;
    };

    const oldLessonRecognition = startLessonRecognition;
    startLessonRecognition = function () {
      companion.lessonMicBusy = true;
      stopRecognition(true);
      const result = oldLessonRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.wantsListening) scheduleRecognitionRestart(400);
      }, 12000);
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

  async function init() {
    if (companion.initialized) return;
    companion.initialized = true;
    createUi();
    installHooks();
    scheduleIdleLife();

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

    const localIntroSeen = localStorage.getItem("putirusuCompanionIntroSeen") === "1";
    if (!companion.profile.onboarded && !localIntroSeen) {
      setTimeout(function () {
        const onboarding = document.getElementById("putiOnboarding");
        if (onboarding) onboarding.classList.remove("hidden");
      }, 550);
    } else if (companion.profile.ambientListening) {
      companion.wantsListening = true;
      setTimeout(function () { startRecognitionLoop(false); }, 700);
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
    localStorage.setItem("putirusuCompanionIntroSeen", "1");
    return oldComplete(withVoice);
  };

  document.addEventListener("DOMContentLoaded", function () {
    const app = document.getElementById("app");
    if (app && !app.classList.contains("hidden")) setTimeout(init, 60);
  });

  window.PUTIRUSU_COMPANION = {
    ask:message => respondTo(message, { heard:message }),
    listen:() => enableAmbientListening(true),
    silence:disableAmbientListening,
    context:currentContext
  };
})();
