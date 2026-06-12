(function () {
  'use strict';

  const P = window.PUTIRUSU;
  const stepNames = ['Objetivos', 'Explicação', 'Vocabulário', 'Diálogo', 'Exemplos', 'Exercícios'];

  P.course = {
    async load(force = false) {
      if (P.state.levels.length && !force) {
        this.render();
        return P.state.levels;
      }

      const data = await P.api.get('/api/course');
      P.state.levels = data.levels || [];

      if (!P.state.levels.find(level => level.code === P.state.activeLevel)) {
        P.state.activeLevel = P.state.levels[0]?.code || 'A1';
      }

      this.render();
      return P.state.levels;
    },

    render() {
      const tabs = P.$('#levelTabs');
      const grid = P.$('#courseGrid');
      if (!tabs || !grid) return;

      if (!P.state.levels.length) {
        tabs.innerHTML = '';
        grid.innerHTML = `
          <article class="card empty-card">
            <h3>Nenhuma aula encontrada</h3>
            <p>Configure o PostgreSQL e execute <code>npm run db:setup</code>.</p>
          </article>
        `;
        return;
      }

      tabs.innerHTML = P.state.levels.map(level => `
        <button class="${level.code === P.state.activeLevel ? 'active' : ''}" data-level="${P.escapeHtml(level.code)}">
          ${P.escapeHtml(level.code)} • ${P.escapeHtml(level.name)}
        </button>
      `).join('');

      tabs.querySelectorAll('[data-level]').forEach(button => {
        button.addEventListener('click', () => {
          P.state.activeLevel = button.dataset.level;
          P.state.currentLesson = null;
          P.$('#lessonView').innerHTML = '';
          this.render();
        });
      });

      const level = P.getCurrentLevel();
      if (!level) return;

      const completed = level.lessons.filter(lesson => lesson.status === 'completed').length;
      const percent = level.lessons.length
        ? Math.round((completed / level.lessons.length) * 100)
        : 0;

      grid.innerHTML = `
        <article class="level-summary" style="grid-column:1/-1">
          <div>
            <p class="tag">NÍVEL ${P.escapeHtml(level.code)}</p>
            <h2>${P.escapeHtml(level.name)}</h2>
            <p>${P.escapeHtml(level.description)}</p>
          </div>
          <div class="level-progress-box">
            <strong>${percent}%</strong>
            <span>${completed}/${level.lessons.length} aulas</span>
            <div class="progress"><span style="width:${percent}%"></span></div>
          </div>
        </article>
        ${level.lessons.map(lesson => this.renderLessonCard(lesson)).join('')}
      `;

      grid.querySelectorAll('[data-open-lesson]').forEach(button => {
        button.addEventListener('click', () => this.openLesson(button.dataset.openLesson));
      });
    },

    renderLessonCard(lesson) {
      const completed = lesson.status === 'completed';
      return `
        <article class="unit-card lesson-card ${completed ? 'completed' : ''}">
          <div class="lesson-card-top">
            <span class="pill ${completed ? 'done' : ''}">
              ${lesson.isExam ? 'Prova do nível' : `Aula ${lesson.position}`}
            </span>
            ${completed ? '<span class="lesson-check">✓</span>' : ''}
          </div>
          <h3>${P.escapeHtml(lesson.title)}</h3>
          <p>${P.escapeHtml(lesson.subtitle)}</p>
          <div class="lesson-card-meta">
            <span class="pill">⏱ ${Number(lesson.estimatedMinutes || 20)} min</span>
            <span class="pill">⭐ ${Number(lesson.xp || 0)} XP</span>
            <span class="pill">🎯 ${Number(lesson.bestScore || 0)}%</span>
          </div>
          <button data-open-lesson="${P.escapeHtml(lesson.id)}">
            ${completed ? 'Revisar aula' : 'Abrir aula'}
          </button>
        </article>
      `;
    },

    async openLesson(lessonId) {
      const view = P.$('#lessonView');
      view.innerHTML = `
        <article class="panel lesson-loading">
          <div class="loader-inline"></div>
          <strong>Carregando aula...</strong>
        </article>
      `;
      view.scrollIntoView({ behavior: 'smooth', block: 'start' });

      try {
        const data = await P.api.get(`/api/course/lessons/${lessonId}`);
        P.state.currentLesson = data.lesson;
        P.state.currentLessonStep = 0;
        P.state.currentExerciseIndex = 0;
        P.state.lessonStartedAt = Date.now();
        P.state.lessonCorrectAnswers = 0;
        P.state.lessonAttemptedExercises = new Set();
        P.state.selectedAnswers = new Map();

        this.collectWords(data.lesson);
        this.renderLesson();
      } catch (error) {
        view.innerHTML = `
          <article class="panel">
            <h3>Não foi possível abrir a aula</h3>
            <p>${P.escapeHtml(error.message)}</p>
          </article>
        `;
      }
    },

    collectWords(lesson) {
      const words = Array.isArray(lesson?.vocabulary) ? lesson.vocabulary : [];
      const existing = new Map(
        (P.state.courseWords || []).map(word => [
          `${word.russian}|${word.portuguese}`,
          word
        ])
      );

      for (const word of words) {
        existing.set(`${word.russian}|${word.portuguese}`, {
          ...word,
          level: lesson.levelCode,
          lesson: lesson.title
        });
      }

      P.state.courseWords = Array.from(existing.values());
      P.dictionary?.render?.();
    },

    renderLesson() {
      const lesson = P.state.currentLesson;
      const view = P.$('#lessonView');
      if (!lesson || !view) return;

      view.innerHTML = `
        <article class="lesson-shell">
          <header class="panel lesson-header-large">
            <div>
              <p class="tag">${P.escapeHtml(lesson.levelCode)} • ${P.escapeHtml(lesson.levelName)}</p>
              <h2>${P.escapeHtml(lesson.title)}</h2>
              <p>${P.escapeHtml(lesson.subtitle)}</p>
            </div>
            <div class="lesson-header-stats">
              <span>⏱ ${Number(lesson.estimatedMinutes || 20)} min</span>
              <span>⭐ ${Number(lesson.xp || 0)} XP</span>
              <span>🎯 ${Number(lesson.bestScore || 0)}%</span>
              <span>${lesson.status === 'completed' ? '✅ Concluída' : '📘 Em andamento'}</span>
            </div>
          </header>

          <div id="lessonStepTabs" class="lesson-step-tabs"></div>
          <div id="lessonStage" class="lesson-stage"></div>

          <footer class="panel lesson-footer">
            <button id="lessonPrevStep" class="ghost">Voltar</button>
            <div class="lesson-footer-progress">
              <strong id="lessonStepLabel">1 / ${stepNames.length}</strong>
              <div class="progress"><span id="lessonStepProgress"></span></div>
            </div>
            <button id="lessonNextStep">Continuar</button>
          </footer>
        </article>
      `;

      this.renderStepTabs();
      this.renderCurrentStep();

      P.$('#lessonPrevStep').addEventListener('click', () => this.previousStep());
      P.$('#lessonNextStep').addEventListener('click', () => this.nextStep());
      view.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    renderStepTabs() {
      const tabs = P.$('#lessonStepTabs');
      if (!tabs) return;

      tabs.innerHTML = stepNames.map((name, index) => `
        <button class="${index === P.state.currentLessonStep ? 'active' : ''}" data-lesson-step="${index}">
          <span>${index + 1}</span>
          ${P.escapeHtml(name)}
        </button>
      `).join('');

      tabs.querySelectorAll('[data-lesson-step]').forEach(button => {
        button.addEventListener('click', () => {
          P.state.currentLessonStep = Number(button.dataset.lessonStep);
          this.renderStepTabs();
          this.renderCurrentStep();
        });
      });
    },

    renderCurrentStep() {
      const lesson = P.state.currentLesson;
      const stage = P.$('#lessonStage');
      if (!lesson || !stage) return;

      const step = P.state.currentLessonStep;
      if (P.$('#lessonStepLabel')) P.$('#lessonStepLabel').textContent = `${step + 1} / ${stepNames.length}`;
      if (P.$('#lessonStepProgress')) {
        P.$('#lessonStepProgress').style.width = `${((step + 1) / stepNames.length) * 100}%`;
      }
      if (P.$('#lessonPrevStep')) P.$('#lessonPrevStep').disabled = step === 0;
      if (P.$('#lessonNextStep')) {
        P.$('#lessonNextStep').textContent = step === stepNames.length - 1
          ? 'Concluir aula'
          : 'Continuar';
      }

      if (step === 0) stage.innerHTML = this.renderObjectives(lesson);
      if (step === 1) stage.innerHTML = this.renderExplanation(lesson);
      if (step === 2) stage.innerHTML = this.renderVocabulary(lesson);
      if (step === 3) stage.innerHTML = this.renderDialogue(lesson);
      if (step === 4) stage.innerHTML = this.renderExamples(lesson);
      if (step === 5) stage.innerHTML = this.renderExercises(lesson);

      this.bindStageEvents();
    },

    renderObjectives(lesson) {
      return `
        <article class="panel lesson-content-card">
          <p class="tag">OBJETIVOS DA AULA</p>
          <h2>O que você vai aprender</h2>
          <p class="lesson-lead">${P.escapeHtml(lesson.subtitle)}</p>
          <ul class="objective-list">
            ${(lesson.objectives || []).map(item => `<li>${P.escapeHtml(item)}</li>`).join('')}
          </ul>
          <div class="method-card-grid">
            <article><strong>1</strong><span>Leia a explicação.</span></article>
            <article><strong>2</strong><span>Ouça o vocabulário.</span></article>
            <article><strong>3</strong><span>Escreva e fale.</span></article>
            <article><strong>4</strong><span>Resolva os exercícios.</span></article>
          </div>
        </article>
      `;
    },

    renderExplanation(lesson) {
      return `
        <article class="panel lesson-content-card">
          <p class="tag">EXPLICAÇÃO SIMPLES</p>
          <h2>Gramática e uso real</h2>
          <div class="grammar-box">${P.escapeHtml(lesson.grammar)}</div>
          <h3>Como revisar</h3>
          <ul class="tip-list">
            ${(lesson.reviewTips || []).map(item => `<li>${P.escapeHtml(item)}</li>`).join('')}
          </ul>
          <div class="row">
            <button id="lessonAskAi" class="ghost">Pedir outra explicação para a IA</button>
            <button id="lessonCreateExercises" class="ghost">IA cria exercícios extras</button>
          </div>
        </article>
      `;
    },

    renderVocabulary(lesson) {
      const words = lesson.vocabulary || [];
      return `
        <article class="panel lesson-content-card">
          <p class="tag">VOCABULÁRIO</p>
          <h2>${words.length} palavras e expressões</h2>
          <div class="vocabulary-grid">
            ${words.map(word => `
              <article class="word-card">
                <h3>${P.escapeHtml(word.russian)}</h3>
                <strong>${P.escapeHtml(word.pronunciation)}</strong>
                <span>${P.escapeHtml(word.portuguese)}</span>
                <small>${P.escapeHtml(word.example_russian || '')}</small>
                <button class="ghost" data-speak-russian="${P.escapeHtml(word.russian)}">🔊 Ouvir</button>
              </article>
            `).join('')}
          </div>
        </article>
      `;
    },

    renderDialogue(lesson) {
      const dialogue = lesson.dialogue || [];
      return `
        <article class="panel lesson-content-card">
          <p class="tag">DIÁLOGO</p>
          <h2>Leia, ouça e repita</h2>
          <div class="dialogue-list">
            ${dialogue.map(line => `
              <article class="dialogue-line">
                <div class="dialogue-speaker">${P.escapeHtml(line.speaker || 'Falante')}</div>
                <div>
                  <strong>${P.escapeHtml(line.ru || '')}</strong>
                  <span>${P.escapeHtml(line.pronunciation || '')}</span>
                  <p>${P.escapeHtml(line.pt || '')}</p>
                </div>
                <button class="ghost" data-speak-russian="${P.escapeHtml(line.ru || '')}">🔊</button>
              </article>
            `).join('')}
          </div>
          <button id="playFullDialogue">Ouvir diálogo completo</button>
        </article>
      `;
    },

    renderExamples(lesson) {
      const examples = lesson.examples || [];
      return `
        <article class="panel lesson-content-card">
          <p class="tag">FRASES EM CONTEXTO</p>
          <h2>Veja como o conteúdo aparece</h2>
          <div class="example-grid">
            ${examples.map(example => `
              <article class="example-card">
                <strong>${P.escapeHtml(example.ru || '')}</strong>
                <span>${P.escapeHtml(example.pronunciation || '')}</span>
                <p>${P.escapeHtml(example.pt || '')}</p>
                <button class="ghost" data-speak-russian="${P.escapeHtml(example.ru || '')}">Ouvir frase</button>
              </article>
            `).join('')}
          </div>
          <button id="examplesToWriting" class="ghost">Criar uma frase parecida na área de escrita</button>
        </article>
      `;
    },

    renderExercises(lesson) {
      const exercises = lesson.exercises || [];
      if (!exercises.length) {
        return `
          <article class="panel lesson-content-card">
            <h2>Aula sem exercícios</h2>
            <p>Você já pode concluir esta aula.</p>
          </article>
        `;
      }

      const index = P.clamp(P.state.currentExerciseIndex, 0, exercises.length - 1);
      P.state.currentExerciseIndex = index;
      const exercise = exercises[index];
      const saved = P.state.selectedAnswers.get(index) || '';
      const options = Array.isArray(exercise.options) ? exercise.options : [];
      const choice = exercise.type === 'multiple_choice';
      const speaking = exercise.type === 'speaking';

      return `
        <article class="panel lesson-content-card exercise-card">
          <div class="exercise-header">
            <div>
              <p class="tag">EXERCÍCIO ${index + 1} DE ${exercises.length}</p>
              <h2>${P.escapeHtml(exercise.prompt)}</h2>
            </div>
            <span class="pill">${P.escapeHtml(this.exerciseTypeLabel(exercise.type))}</span>
          </div>

          ${choice ? `
            <div class="exercise-options">
              ${options.map(option => `
                <button class="ghost ${saved === option ? 'selected' : ''}" data-exercise-option="${P.escapeHtml(option)}">
                  ${P.escapeHtml(option)}
                </button>
              `).join('')}
            </div>
          ` : `
            <textarea id="exerciseAnswer" placeholder="${speaking ? 'O texto reconhecido aparecerá aqui' : 'Digite sua resposta'}">${P.escapeHtml(saved)}</textarea>
          `}

          ${speaking ? `
            <div class="row">
              <button id="exerciseListenModel" class="ghost">Ouvir modelo</button>
              <button id="exerciseUseMic">Usar microfone</button>
            </div>
          ` : ''}

          <div class="exercise-actions">
            <button id="exerciseSubmit">Corrigir resposta</button>
            <button id="exercisePrevious" class="ghost" ${index === 0 ? 'disabled' : ''}>Questão anterior</button>
            <button id="exerciseNext" class="ghost" ${index === exercises.length - 1 ? 'disabled' : ''}>Próxima questão</button>
          </div>
          <div id="exerciseFeedback" class="feedback"></div>
          <div class="progress"><span style="width:${((index + 1) / exercises.length) * 100}%"></span></div>
        </article>
      `;
    },

    exerciseTypeLabel(type) {
      const labels = {
        multiple_choice: 'Múltipla escolha',
        translation: 'Tradução',
        writing: 'Escrita',
        speaking: 'Fala',
        listening: 'Escuta',
        essay: 'Produção aberta'
      };
      return labels[type] || 'Exercício';
    },

    bindStageEvents() {
      const lesson = P.state.currentLesson;
      if (!lesson) return;

      P.$$('#lessonStage [data-speak-russian]').forEach(button => {
        button.addEventListener('click', () => {
          try {
            P.speech.speakRussian(button.dataset.speakRussian);
          } catch (error) {
            P.toast(error.message);
          }
        });
      });

      P.$$('#lessonStage [data-exercise-option]').forEach(button => {
        button.addEventListener('click', () => {
          P.$$('#lessonStage [data-exercise-option]').forEach(item => item.classList.remove('selected'));
          button.classList.add('selected');
          P.state.selectedAnswers.set(
            P.state.currentExerciseIndex,
            button.dataset.exerciseOption
          );
        });
      });

      P.$('#lessonAskAi')?.addEventListener('click', () => {
        P.ai.openTeacherWithPrompt(
          `Explique novamente a aula “${lesson.title}” (${lesson.levelCode}) de forma simples. Conteúdo principal: ${lesson.grammar}`
        );
      });

      P.$('#lessonCreateExercises')?.addEventListener('click', () => {
        P.ai.openTeacherWithPrompt(
          `Crie cinco exercícios extras sobre a aula “${lesson.title}”, nível ${lesson.levelCode}. Não mostre o gabarito antes de eu tentar.`
        );
      });

      P.$('#playFullDialogue')?.addEventListener('click', () => {
        const text = (lesson.dialogue || []).map(line => line.ru).join(' ');
        try {
          P.speech.speakRussian(text, { rate: 0.78 });
        } catch (error) {
          P.toast(error.message);
        }
      });

      P.$('#examplesToWriting')?.addEventListener('click', () => {
        P.showScreen('writing');
        const model = lesson.examples?.[0]?.ru || lesson.vocabulary?.[0]?.russian || '';
        P.$('#writingHint').textContent = `Crie uma frase parecida com: ${model}`;
        P.$('#writingInput').focus();
      });

      P.$('#exercisePrevious')?.addEventListener('click', () => {
        this.saveCurrentExerciseDraft();
        P.state.currentExerciseIndex = Math.max(0, P.state.currentExerciseIndex - 1);
        this.renderCurrentStep();
      });

      P.$('#exerciseNext')?.addEventListener('click', () => {
        this.saveCurrentExerciseDraft();
        P.state.currentExerciseIndex = Math.min(
          lesson.exercises.length - 1,
          P.state.currentExerciseIndex + 1
        );
        this.renderCurrentStep();
      });

      P.$('#exerciseSubmit')?.addEventListener('click', () => this.submitCurrentExercise());

      P.$('#exerciseListenModel')?.addEventListener('click', () => {
        const exercise = lesson.exercises[P.state.currentExerciseIndex];
        const text = exercise.answer || exercise.prompt;
        try {
          P.speech.speakRussian(text);
        } catch (error) {
          P.toast(error.message);
        }
      });

      P.$('#exerciseUseMic')?.addEventListener('click', () => this.useExerciseMicrophone());
    },

    saveCurrentExerciseDraft() {
      const input = P.$('#exerciseAnswer');
      if (input) {
        P.state.selectedAnswers.set(P.state.currentExerciseIndex, input.value);
      }
    },

    async submitCurrentExercise() {
      const lesson = P.state.currentLesson;
      const exercise = lesson?.exercises?.[P.state.currentExerciseIndex];
      const feedback = P.$('#exerciseFeedback');
      if (!exercise) return;

      this.saveCurrentExerciseDraft();
      const answer = String(P.state.selectedAnswers.get(P.state.currentExerciseIndex) || '').trim();
      if (!answer) {
        P.setFeedback(feedback, 'Responda antes de corrigir.', 'bad');
        return;
      }

      P.setFeedback(feedback, 'Corrigindo e salvando no banco...', 'wait');

      try {
        const result = await P.api.post('/api/progress/attempts', {
          exerciseId: exercise.id,
          answer
        });

        const alreadyAttempted = P.state.lessonAttemptedExercises.has(exercise.id);
        P.state.lessonAttemptedExercises.add(exercise.id);
        if (result.isCorrect && !alreadyAttempted) P.state.lessonCorrectAnswers += 1;

        if (result.isCorrect) {
          P.setFeedback(
            feedback,
            `Resposta aceita! +${Number(result.score || 0)} XP\n${result.explanation || ''}`,
            'good'
          );
        } else {
          P.setFeedback(
            feedback,
            `Ainda não.\nResposta modelo: ${result.correctAnswer || '—'}\n${result.explanation || ''}`,
            'bad'
          );
        }

        await P.dashboard.load();
      } catch (error) {
        P.setFeedback(feedback, error.message, 'bad');
      }
    },

    useExerciseMicrophone() {
      const feedback = P.$('#exerciseFeedback');
      P.setFeedback(feedback, 'Ouvindo sua pronúncia...', 'wait');

      try {
        P.speech.recognizeRussian({
          onResult: alternatives => {
            const transcript = alternatives[0]?.transcript || '';
            const input = P.$('#exerciseAnswer');
            if (input) input.value = transcript;
            P.state.selectedAnswers.set(P.state.currentExerciseIndex, transcript);
            P.setFeedback(feedback, `Reconhecido: ${transcript}`, 'good');
          },
          onError: message => P.setFeedback(feedback, message, 'bad')
        });
      } catch (error) {
        P.setFeedback(feedback, error.message, 'bad');
      }
    },

    previousStep() {
      if (!P.state.currentLesson) return;
      P.state.currentLessonStep = Math.max(0, P.state.currentLessonStep - 1);
      this.renderStepTabs();
      this.renderCurrentStep();
    },

    async nextStep() {
      if (!P.state.currentLesson) return;

      if (P.state.currentLessonStep < stepNames.length - 1) {
        P.state.currentLessonStep += 1;
        this.renderStepTabs();
        this.renderCurrentStep();
        return;
      }

      await this.completeLesson();
    },

    async completeLesson() {
      const lesson = P.state.currentLesson;
      if (!lesson) return;

      const totalExercises = Math.max(1, lesson.exercises?.length || 0);
      const score = Math.round((P.state.lessonCorrectAnswers / totalExercises) * 100);
      const timeSpentSeconds = Math.max(
        1,
        Math.round((Date.now() - (P.state.lessonStartedAt || Date.now())) / 1000)
      );

      try {
        const result = await P.api.post(`/api/progress/lessons/${lesson.id}/complete`, {
          score,
          timeSpentSeconds
        });

        P.toast(`Aula concluída! +${Number(result.xpEarned || 0)} XP`);
        await Promise.all([
          this.load(true),
          P.dashboard.load(),
          P.practice?.loadReviews?.(false)
        ]);
        P.$('#lessonView').innerHTML = `
          <article class="panel lesson-complete-card">
            <div class="lesson-complete-icon">🏆</div>
            <h2>Aula concluída</h2>
            <p>Nota registrada: ${score}%</p>
            <p>Tempo: ${P.formatDuration(timeSpentSeconds)}</p>
            <div class="row center-row">
              <button id="backToCourseAfterComplete">Voltar às aulas</button>
              <button id="reviewAfterComplete" class="ghost">Revisar erros</button>
            </div>
          </article>
        `;

        P.$('#backToCourseAfterComplete')?.addEventListener('click', () => {
          P.$('#lessonView').innerHTML = '';
          P.$('#courseGrid').scrollIntoView({ behavior: 'smooth' });
        });
        P.$('#reviewAfterComplete')?.addEventListener('click', () => P.showScreen('review'));
      } catch (error) {
        P.toast(error.message);
      }
    },

    bind() {
      P.$('#refreshCourseBtn')?.addEventListener('click', async () => {
        try {
          await this.load(true);
          P.toast('Curso atualizado.');
        } catch (error) {
          P.toast(error.message);
        }
      });

      P.$('#askLessonAiBtn')?.addEventListener('click', () => {
        const lesson = P.state.currentLesson;
        const prompt = lesson
          ? `Explique minha aula atual “${lesson.title}”, nível ${lesson.levelCode}. Conteúdo: ${lesson.grammar}`
          : `Me ajude a escolher a próxima aula de russo. Meu nível é ${P.state.user?.current_level || 'A1'}.`;
        P.ai.openTeacherWithPrompt(prompt);
      });
    }
  };
})();
