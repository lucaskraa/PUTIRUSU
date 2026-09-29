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
    }

    return context;
  }

  function createUi() {
    if (document.getElementById("putirusuCompanion")) return;

    const root = document.createElement("section");
    root.id = "putirusuCompanion";
    root.className = "puti-companion";
    root.setAttribute("aria-live", "polite");
    root.innerHTML =
      '<button id="putiCompanionOrb" class="puti-companion-orb" type="button" aria-label="Abrir PUTIRUSU">' +
        '<span class="puti-orb-ring"></span><span class="puti-orb-core">П</span>' +
      '</button>' +
      '<div id="putiCompanionBubble" class="puti-companion-bubble hidden">' +
        '<div class="puti-companion-head">' +
          '<div><strong>PUTIRUSU</strong><span id="putiCompanionStatus">observando</span></div>' +
          '<button id="putiCompanionClose" type="button" aria-label="Fechar">×</button>' +
        '</div>' +
        '<p id="putiCompanionText">Estou aqui.</p>' +
        '<div class="puti-companion-actions">' +
          '<button id="putiMicToggle" type="button">Ativar voz</button>' +
          '<button id="putiCompanionRepeat" class="ghost" type="button">Ouvir de novo</button>' +
        '</div>' +
        '<small class="puti-privacy-note">O áudio bruto não é salvo. A escuta só funciona enquanto o site está aberto e com permissão do navegador.</small>' +
      '</div>' +
    '</section>';

    const onboarding = document.createElement("div");
    onboarding.id = "putiOnboarding";
    onboarding.className = "puti-onboarding hidden";
    onboarding.innerHTML =
      '<div class="puti-onboarding-card">' +
        '<div class="puti-onboarding-mark">П</div>' +
        '<span class="puti-onboarding-kicker">PRESENÇA DO PUTIRUSU</span>' +
        '<h1>Olá. Eu vou estudar você enquanto você estuda russo.</h1>' +
        '<p>Eu acompanho a atividade que está na tela, seus acertos e dificuldades para conseguir ajudar sem você precisar abrir um chat.</p>' +
        '<div class="puti-onboarding-points">' +
          '<div><b>Eu vejo o curso</b><span>Se você disser “não entendi”, eu sei em qual aula e exercício você está.</span></div>' +
          '<div><b>Posso ouvir você</b><span>Com sua permissão, fico disponível por voz enquanto o PUTIRUSU estiver aberto.</span></div>' +
          '<div><b>Minha memória é só sua</b><span>Cada conta tem contexto separado. O áudio bruto não é armazenado e você pode apagar minha memória no Perfil.</span></div>' +
        '</div>' +
        '<div class="puti-onboarding-actions">' +
          '<button id="putiOnboardingVoice" type="button">Ativar voz e continuar</button>' +
          '<button id="putiOnboardingSkip" class="ghost" type="button">Continuar sem microfone</button>' +
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
      if (companion.wantsListening || companion.listening) {
        disableAmbientListening();
      } else {
        enableAmbientListening(true);
      }
    });
    document.getElementById("putiCompanionRepeat").addEventListener("click", function () {
      if (companion.lastAnswer) speakCompanion(companion.lastAnswer);
    });
    document.getElementById("putiOnboardingVoice").addEventListener("click", async function () {
      await completeOnboarding(true);
    });
    document.getElementById("putiOnboardingSkip").addEventListener("click", async function () {
      await completeOnboarding(false);
    });
  }

  function setStatus(mode, label) {
    const root = document.getElementById("putirusuCompanion");
    const status = document.getElementById("putiCompanionStatus");
    if (root) root.dataset.state = mode || "idle";
    if (status) status.textContent = label || "observando";

    const mic = document.getElementById("putiMicToggle");
    if (mic) {
      mic.textContent = companion.wantsListening || companion.listening ? "Silenciar" : "Ativar voz";
    }
  }

  function showBubble(text, open) {
    const bubble = document.getElementById("putiCompanionBubble");
    const body = document.getElementById("putiCompanionText");
    if (!bubble || !body) return;
    body.textContent = text;
    if (open !== false) bubble.classList.remove("hidden");
  }

  async function savePrivacy(patch) {
    if (!state.token || state.token === "local-demo") return;
    try {
      const saved = await request("/ai/privacy", {
        method: "PUT",
        body: JSON.stringify(patch)
      });
      companion.profile = Object.assign({}, companion.profile || {}, saved);
      renderPrivacyPanel();
    } catch (_) {}
  }

  async function track(type, details) {
    if (!state.token || state.token === "local-demo") return;
    if (companion.profile && companion.profile.memoryEnabled === false) return;
    try {
      await request("/ai/event", {
        method: "POST",
        body: JSON.stringify({ type: type, details: details || {} })
      });
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
    }, delay || 650);
  }

  function startRecognitionLoop(fromUserGesture) {
    if (!companion.wantsListening || companion.speaking || companion.thinking || companion.lessonMicBusy) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      companion.wantsListening = false;
      setStatus("idle", "voz indisponível");
      showBubble("Seu navegador não oferece reconhecimento contínuo de voz. Eu continuo acompanhando suas atividades normalmente.");
      return;
    }

    stopRecognition(true);

    const rec = new Recognition();
    companion.recognition = rec;
    rec.lang = recognitionLanguage();
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = function () {
      companion.listening = true;
      setStatus("listening", "ouvindo");
    };

    rec.onresult = function (event) {
      if (companion.speaking || companion.thinking) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const heard = String(event.results[i][0].transcript || "").trim();
        if (heard) handleHeard(heard);
      }
    };

    rec.onerror = function (event) {
      companion.listening = false;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        companion.wantsListening = false;
        if (companion.profile) companion.profile.ambientListening = false;
        setStatus("idle", "microfone bloqueado");
        showBubble("O navegador bloqueou o microfone. Quando quiser falar comigo, clique no meu símbolo e ative a voz.");
        savePrivacy({ ambientListening: false });
        return;
      }
      if (event.error !== "no-speech" && fromUserGesture) {
        showBubble("O microfone falhou por um instante. Vou tentar novamente.");
      }
    };

    rec.onend = function () {
      companion.listening = false;
      companion.recognition = null;
      if (companion.wantsListening) scheduleRecognitionRestart(700);
    };

    try {
      rec.start();
    } catch (_) {
      scheduleRecognitionRestart(1000);
    }
  }

  async function enableAmbientListening(fromUserGesture) {
    companion.wantsListening = true;
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = true;
    companion.profile.voiceEnabled = true;
    await savePrivacy({ ambientListening: true, voiceEnabled: true });
    startRecognitionLoop(Boolean(fromUserGesture));
  }

  async function disableAmbientListening() {
    stopRecognition(false);
    if (!companion.profile) companion.profile = {};
    companion.profile.ambientListening = false;
    await savePrivacy({ ambientListening: false });
    setStatus("idle", "observando");
  }

  function waitForSpeechEnd() {
    if (companion.ttsWatch) clearInterval(companion.ttsWatch);
    companion.ttsWatch = setInterval(function () {
      if (!window.speechSynthesis || speechSynthesis.speaking || speechSynthesis.pending) return;
      clearInterval(companion.ttsWatch);
      companion.ttsWatch = null;
      if (!companion.speaking && companion.wantsListening && !companion.lessonMicBusy) {
        scheduleRecognitionRestart(450);
      }
    }, 180);
  }

  function voiceFor(lang) {
    if (!window.speechSynthesis) return null;
    const voices = speechSynthesis.getVoices();
    const wanted = lang.toLowerCase();
    return voices.find(function (voice) {
      return String(voice.lang || "").toLowerCase().startsWith(wanted);
    }) || null;
  }

  function speechSegments(text) {
    const pieces = String(text || "").split(/(?<=[.!?])\s+|\n+/).map(function (item) {
      return item.trim();
    }).filter(Boolean);

    return pieces.map(function (piece) {
      const cyr = (piece.match(/[А-Яа-яЁё]/g) || []).length;
      const letters = (piece.match(/[A-Za-zÀ-ÿА-Яа-яЁё]/g) || []).length || 1;
      return { text: piece, lang: cyr / letters > 0.28 ? "ru-RU" : "pt-BR" };
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
        if (companion.wantsListening) scheduleRecognitionRestart(450);
        return;
      }

      const item = segments[index++];
      const utter = new SpeechSynthesisUtterance(item.text);
      utter.lang = item.lang;
      if (item.lang === "ru-RU") {
        utter.rate = 0.78;
        utter.pitch = 0.82;
      } else {
        utter.rate = 0.96;
        utter.pitch = 1;
      }
      const selectedVoice = voiceFor(item.lang);
      if (selectedVoice) utter.voice = selectedVoice;
      utter.onend = next;
      utter.onerror = next;
      speechSynthesis.speak(utter);
    }

    next();
  }

  async function respondTo(message, options) {
    if (!message || companion.thinking) return;
    if (!state.token || state.token === "local-demo") {
      const fallback = "Eu consigo acompanhar a interface, mas minha memória privada precisa do servidor autenticado para funcionar.";
      companion.lastAnswer = fallback;
      showBubble(fallback);
      speakCompanion(fallback);
      return;
    }

    companion.thinking = true;
    stopRecognition(true);
    setStatus("thinking", "pensando");
    if (!(options && options.silentUi)) showBubble("Hm.", true);

    try {
      const data = await request("/ai/respond", {
        method: "POST",
        body: JSON.stringify({
          message: String(message).slice(0, 1600),
          context: Object.assign(currentContext(), options && options.context ? options.context : {})
        })
      });

      const answer = String(data.answer || "").trim();
      if (!answer || answer === "__SILENT__") {
        companion.thinking = false;
        setStatus("idle", companion.wantsListening ? "ouvindo" : "observando");
        if (companion.wantsListening) scheduleRecognitionRestart(500);
        return;
      }

      companion.lastAnswer = answer;
      companion.thinking = false;
      showBubble(answer, true);
      speakCompanion(answer);
    } catch (_) {
      companion.thinking = false;
      const fallback = "Tive um problema para pensar agora. Continue a atividade; eu não perdi seu progresso.";
      companion.lastAnswer = fallback;
      showBubble(fallback, true);
      setStatus("idle", companion.wantsListening ? "voz pausada" : "observando");
      if (companion.wantsListening) scheduleRecognitionRestart(900);
    }
  }

  function handleHeard(heard) {
    if (!heard || companion.speaking || companion.thinking) return;
    companion.lastHeard = heard;
    showBubble("“" + heard + "”", true);
    respondTo(heard, { context: { source: "ambient_voice" } });
  }

  async function maybeNudge(reason) {
    const now = Date.now();
    if (now - companion.lastNudgeAt < 90000) return;
    companion.lastNudgeAt = now;
    await respondTo(
      "Estou cometendo erros repetidos na atividade atual. Intervenha sozinho com uma dica curta, sem entregar a resposta.",
      { context: { source: "automatic_intervention", trigger: reason || "repeated_mistake" } }
    );
  }

  async function completeOnboarding(withVoice) {
    const overlay = document.getElementById("putiOnboarding");
    if (overlay) overlay.classList.add("hidden");

    try {
      await request("/ai/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({
          voiceEnabled: Boolean(withVoice),
          ambientListening: Boolean(withVoice)
        })
      });
    } catch (_) {}

    if (!companion.profile) companion.profile = {};
    companion.profile.onboarded = true;
    companion.profile.voiceEnabled = Boolean(withVoice);
    companion.profile.ambientListening = Boolean(withVoice);

    const intro = "Pronto. Não precisa me procurar em uma aba. Eu acompanho o que você estiver fazendo aqui. Se falar comigo, eu uso a atividade atual para entender do que você está falando.";
    companion.lastAnswer = intro;
    showBubble(intro, true);

    if (withVoice) {
      companion.wantsListening = true;
      speakCompanion(intro);
    }
  }

  function renderPrivacyPanel() {
    const layout = document.querySelector("#screen-profile .profile-layout");
    if (!layout || document.getElementById("putiPrivacyPanel")) return;

    const panel = document.createElement("article");
    panel.id = "putiPrivacyPanel";
    panel.className = "panel puti-privacy-panel";
    panel.innerHTML =
      '<p class="tag">PUTIRUSU • PRIVACIDADE</p>' +
      '<h2>Memória e voz</h2>' +
      '<p class="puti-privacy-copy">Sua conta tem memória pedagógica separada. O áudio bruto não é salvo.</p>' +
      '<label class="puti-setting"><span><b>Memória pedagógica</b><small>Guarda dificuldades e eventos de estudo para adaptar a ajuda.</small></span><input id="putiMemorySetting" type="checkbox"></label>' +
      '<label class="puti-setting"><span><b>Guardar transcrições</b><small>Permite lembrar conversas de voz. Desligar não apaga as antigas.</small></span><input id="putiTranscriptSetting" type="checkbox"></label>' +
      '<label class="puti-setting"><span><b>Responder por voz</b><small>O PUTIRUSU fala as respostas em voz alta.</small></span><input id="putiVoiceSetting" type="checkbox"></label>' +
      '<label class="puti-setting"><span><b>Escuta enquanto o site está aberto</b><small>Requer permissão do microfone do navegador.</small></span><input id="putiAmbientSetting" type="checkbox"></label>' +
      '<button id="putiClearMemory" class="ghost danger-outline" type="button">Apagar memória da IA</button>';

    layout.appendChild(panel);

    const profile = companion.profile || {};
    document.getElementById("putiMemorySetting").checked = profile.memoryEnabled !== false;
    document.getElementById("putiTranscriptSetting").checked = profile.storeTranscripts !== false;
    document.getElementById("putiVoiceSetting").checked = profile.voiceEnabled !== false;
    document.getElementById("putiAmbientSetting").checked = Boolean(profile.ambientListening);

    document.getElementById("putiMemorySetting").addEventListener("change", function (event) {
      if (!companion.profile) companion.profile = {};
      companion.profile.memoryEnabled = event.target.checked;
      savePrivacy({ memoryEnabled: event.target.checked });
    });
    document.getElementById("putiTranscriptSetting").addEventListener("change", function (event) {
      if (!companion.profile) companion.profile = {};
      companion.profile.storeTranscripts = event.target.checked;
      savePrivacy({ storeTranscripts: event.target.checked });
    });
    document.getElementById("putiVoiceSetting").addEventListener("change", function (event) {
      if (!companion.profile) companion.profile = {};
      companion.profile.voiceEnabled = event.target.checked;
      savePrivacy({ voiceEnabled: event.target.checked });
    });
    document.getElementById("putiAmbientSetting").addEventListener("change", function (event) {
      if (event.target.checked) enableAmbientListening(true);
      else disableAmbientListening();
    });
    document.getElementById("putiClearMemory").addEventListener("click", async function () {
      if (!confirm("Apagar a memória pedagógica e as conversas do PUTIRUSU desta conta? Seu progresso normal do curso será mantido.")) return;
      try {
        await request("/ai/memory", { method: "DELETE" });
        companion.recentMistakes = 0;
        showBubble("Minha memória pedagógica foi limpa. Seu progresso do curso continua intacto.", true);
        toast("Memória da IA apagada.");
      } catch (error) {
        toast(error.message || "Não foi possível apagar a memória.", "bad");
      }
    });
  }

  function installHooks() {
    const originalShowScreen = showScreen;
    showScreen = function (name) {
      const result = originalShowScreen.apply(this, arguments);
      track("screen_view", { screen: name });
      if (name === "profile") setTimeout(renderPrivacyPanel, 30);
      return result;
    };

    const originalOpenCourse = openCourse;
    openCourse = function (id, lessonIndex) {
      const result = originalOpenCourse.apply(this, arguments);
      const session = state.lessonSession;
      if (session) {
        companion.recentMistakes = 0;
        track("lesson_open", {
          courseId: session.course.id,
          level: session.course.level,
          unit: session.course.title,
          lessonIndex: session.lessonIndex,
          lesson: session.course.lessons[session.lessonIndex]
        });
      }
      return result;
    };

    const originalRenderLessonActivity = renderLessonActivity;
    renderLessonActivity = function () {
      const result = originalRenderLessonActivity.apply(this, arguments);
      const session = state.lessonSession;
      if (session && session.steps && session.steps[session.stepIndex]) {
        const step = session.steps[session.stepIndex];
        track("lesson_step", {
          courseId: session.course.id,
          lesson: session.course.lessons[session.lessonIndex],
          stepIndex: session.stepIndex,
          stepType: step.type,
          focus: step.target || step.prompt || (step.item && (step.item.glyph || step.item.example)) || step.title || step.objective || ""
        });
      }
      return result;
    };

    const originalHandleLessonPrimary = handleLessonPrimary;
    handleLessonPrimary = function () {
      const session = state.lessonSession;
      const primary = document.getElementById("lessonPrimary");
      const modeBefore = primary ? primary.dataset.mode : "";
      const step = session && session.steps ? session.steps[session.stepIndex] : null;
      const receivedBefore = step && step.type === "type" && document.getElementById("lessonTypeInput")
        ? document.getElementById("lessonTypeInput").value
        : (session && session.selected ? session.selected : (session && session.arranged ? session.arranged.join(" ") : ""));

      const result = originalHandleLessonPrimary.apply(this, arguments);

      if (session && step && modeBefore && modeBefore.indexOf("check-") === 0) {
        const footer = document.getElementById("lessonRunFooter");
        const correct = Boolean(footer && footer.classList.contains("is-correct"));
        track("lesson_answer", {
          courseId: session.course.id,
          lesson: session.course.lessons[session.lessonIndex],
          stepType: step.type,
          prompt: step.prompt || step.target || "",
          expected: step.answer || step.target || "",
          received: receivedBefore,
          correct: correct
        });
      }
      return result;
    };

    const originalRecordLessonMistake = recordLessonMistake;
    recordLessonMistake = function (session, step, expected, received) {
      const result = originalRecordLessonMistake.apply(this, arguments);
      companion.recentMistakes += 1;
      track("lesson_mistake", {
        courseId: session.course.id,
        lesson: session.course.lessons[session.lessonIndex],
        stepType: step.type,
        prompt: step.prompt || step.target || step.title || "",
        expected: expected,
        received: received || ""
      });
      if (companion.recentMistakes >= 2) maybeNudge("repeated_lesson_error");
      return result;
    };

    const originalFinishLessonSession = finishLessonSession;
    finishLessonSession = function () {
      const session = state.lessonSession;
      if (session) {
        const score = session.graded ? Math.round((session.correct / session.graded) * 100) : 100;
        track("lesson_complete", {
          courseId: session.course.id,
          lesson: session.course.lessons[session.lessonIndex],
          score: score,
          correct: session.correct,
          graded: session.graded
        });
      }
      return originalFinishLessonSession.apply(this, arguments);
    };

    const originalScoreTrace = scoreTrace;
    scoreTrace = function () {
      const letter = ALPHABET[state.selectedLetter];
      const result = originalScoreTrace.apply(this, arguments);
      if (letter && state.progress.letters && state.progress.letters[letter.lower]) {
        const info = state.progress.letters[letter.lower];
        track("writing_score", {
          letter: letter.lower,
          mode: state.writingMode,
          score: info.score,
          attempts: info.attempts
        });
      }
      return result;
    };

    const originalCheckCopy = checkCopy;
    checkCopy = function () {
      const typed = normalize(document.getElementById("copyInput").value);
      const target = normalize(state.copyItem);
      const result = originalCheckCopy.apply(this, arguments);
      track("copy_answer", { target: state.copyItem, received: typed, correct: typed === target });
      return result;
    };

    const originalFinishExam = finishExam;
    finishExam = function () {
      let score = 0;
      state.exam.forEach(function (question) {
        const chosen = document.querySelector('input[name="q' + question.id + '"]:checked');
        if (chosen && chosen.value === question.answer) score += 1;
      });
      const total = state.exam.length || 1;
      const pct = Math.round(score / total * 100);
      const result = originalFinishExam.apply(this, arguments);
      track("exam_complete", { score: score, total: state.exam.length, percent: pct });
      return result;
    };

    const originalRateReview = rateReview;
    rateReview = function (ok) {
      track("review_result", { correct: Boolean(ok), index: state.reviewIndex });
      return originalRateReview.apply(this, arguments);
    };

    const originalSpeak = speak;
    speak = function () {
      if (companion.wantsListening) stopRecognition(true);
      const result = originalSpeak.apply(this, arguments);
      waitForSpeechEnd();
      return result;
    };

    const originalStartRecognition = startRecognition;
    startRecognition = function () {
      companion.lessonMicBusy = true;
      stopRecognition(true);
      const result = originalStartRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.wantsListening) scheduleRecognitionRestart(400);
      }, 12000);
      return result;
    };

    const originalStartLessonRecognition = startLessonRecognition;
    startLessonRecognition = function () {
      companion.lessonMicBusy = true;
      stopRecognition(true);
      const result = originalStartLessonRecognition.apply(this, arguments);
      setTimeout(function () {
        companion.lessonMicBusy = false;
        if (companion.wantsListening) scheduleRecognitionRestart(400);
      }, 12000);
      return result;
    };

    document.addEventListener("click", function (event) {
      const audioAnswer = event.target.closest && event.target.closest("[data-audio-answer]");
      if (audioAnswer && state.audioItem) {
        track("lesson_answer", {
          area: "audio",
          prompt: state.audioItem.ru,
          expected: state.audioItem.pt,
          received: audioAnswer.dataset.audioAnswer,
          correct: audioAnswer.dataset.audioAnswer === state.audioItem.pt
        });
      }
    }, true);
  }

  async function init() {
    if (companion.initialized) return;
    companion.initialized = true;
    createUi();
    installHooks();
    document.body.classList.add("puti-companion-ready");

    if (!state.token || state.token === "local-demo") {
      setStatus("idle", "modo local");
      return;
    }

    try {
      const data = await request("/ai/state");
      companion.profile = data.profile || {};
      renderPrivacyPanel();

      if (!companion.profile.onboarded) {
        setTimeout(function () {
          const onboarding = document.getElementById("putiOnboarding");
          if (onboarding) onboarding.classList.remove("hidden");
        }, 700);
      } else if (companion.profile.ambientListening) {
        companion.wantsListening = true;
        setTimeout(function () { startRecognitionLoop(false); }, 900);
      } else {
        setStatus("idle", "observando");
      }
    } catch (_) {
      setStatus("idle", "offline");
    }
  }

  const originalEnterApp = enterApp;
  enterApp = function () {
    const result = originalEnterApp.apply(this, arguments);
    setTimeout(init, 80);
    return result;
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("app").classList.contains("hidden")) setTimeout(init, 80);
  });

  window.PUTIRUSU_COMPANION = {
    ask: function (message) { return respondTo(message, { context: { source: "manual" } }); },
    listen: function () { return enableAmbientListening(true); },
    silence: disableAmbientListening,
    context: currentContext
  };
})();
