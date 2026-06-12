(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.ai = {
    teacherStarted: false,
    scenarioStarted: false,

    updateMode(mode) {
      P.state.aiMode = mode;
      const label = P.$('#aiMode');
      if (!label) return;

      if (mode === 'real_ai' || mode === 'real') {
        label.textContent = 'IA: real ativa';
        label.classList.add('ai-real');
        label.classList.remove('ai-fallback', 'ai-offline');
      } else if (mode === 'fallback') {
        label.textContent = 'IA: fallback local';
        label.classList.add('ai-fallback');
        label.classList.remove('ai-real', 'ai-offline');
      } else {
        label.textContent = 'IA: offline';
        label.classList.add('ai-offline');
        label.classList.remove('ai-real', 'ai-fallback');
      }
    },

    initTeacher() {
      const chat = P.$('#teacherChat');
      if (!chat || this.teacherStarted) return;
      chat.innerHTML = '';
      P.addMessage(
        chat,
        'system',
        'Professora pronta. Peça explicação, correção, exercícios, plano de estudo ou ajuda com uma aula.'
      );
      P.addMessage(
        chat,
        'assistant',
        'Привет! Sou sua professora virtual. Em que parte do russo você precisa de ajuda?',
        'Mensagem inicial'
      );
      this.teacherStarted = true;
    },

    async sendTeacher(prefilled = null) {
      this.initTeacher();
      const input = P.$('#teacherInput');
      const message = String(prefilled ?? input?.value ?? '').trim();
      if (!message) {
        P.toast('Digite uma pergunta para a IA.');
        return;
      }

      const chat = P.$('#teacherChat');
      P.addMessage(chat, 'user', message);
      if (input) input.value = '';
      const waiting = P.addMessage(chat, 'assistant', 'Pensando e analisando seu nível...');

      try {
        const data = await P.api.post('/api/ai/teacher', {
          message,
          lessonId: P.state.currentLesson?.id || null
        });
        const meta = data.mode === 'real_ai'
          ? `IA real • ${data.model || 'modelo configurado'}`
          : 'Fallback local • configure OPENAI_API_KEY';
        P.updateMessage(waiting, data.answer, meta);
        this.updateMode(data.mode);
        await P.dashboard?.load?.();
      } catch (error) {
        P.updateMessage(waiting, error.message, 'Erro');
      }
    },

    clearTeacher() {
      const chat = P.$('#teacherChat');
      if (chat) chat.innerHTML = '';
      this.teacherStarted = false;
      this.initTeacher();
    },

    openTeacherWithPrompt(prompt) {
      P.showScreen('teacher');
      this.initTeacher();
      if (P.$('#teacherInput')) P.$('#teacherInput').value = prompt;
      this.sendTeacher();
    },

    renderScenarios() {
      const select = P.$('#scenarioSelect');
      if (!select) return;
      const scenarios = P.DATA.scenarios || [];
      const current = select.value;
      select.innerHTML = scenarios.map(item => `
        <option value="${P.escapeHtml(item.id)}">${P.escapeHtml(item.title)}</option>
      `).join('');
      if (scenarios.some(item => item.id === current)) select.value = current;
    },

    selectedScenario() {
      const id = P.$('#scenarioSelect')?.value;
      return (P.DATA.scenarios || []).find(item => item.id === id)
        || (P.DATA.scenarios || [])[0]
        || { id: 'general', title: 'Conversa geral', opener: 'Converse em russo.' };
    },

    initScenario(force = false) {
      this.renderScenarios();
      const chat = P.$('#realChat');
      if (!chat) return;
      if (this.scenarioStarted && !force) return;

      const scenario = this.selectedScenario();
      chat.innerHTML = '';
      P.state.scenarioHistory = [];
      P.addMessage(chat, 'system', scenario.opener);
      P.addMessage(
        chat,
        'assistant',
        'Comece com uma frase curta. Você pode misturar português e russo no início.'
      );
      this.scenarioStarted = true;
      P.state.scenarioStarted = true;
    },

    async sendScenario() {
      this.initScenario();
      const input = P.$('#realChatInput');
      const message = String(input?.value || '').trim();
      if (!message) {
        P.toast('Digite sua resposta.');
        return;
      }

      const scenario = this.selectedScenario();
      const chat = P.$('#realChat');
      P.addMessage(chat, 'user', message);
      P.state.scenarioHistory.push({ role: 'user', content: message });
      if (input) input.value = '';
      const waiting = P.addMessage(chat, 'assistant', 'A personagem está respondendo...');

      try {
        const context = P.state.scenarioHistory
          .slice(-8)
          .map(item => `${item.role}: ${item.content}`)
          .join('\n');

        const data = await P.api.post('/api/ai/scenario', {
          scenario: `${scenario.title}. ${scenario.opener}`,
          message: `${context}\nNova mensagem do aluno: ${message}`
        });

        P.updateMessage(
          waiting,
          data.answer,
          data.mode === 'real_ai' ? `IA real • ${data.model || ''}` : 'Fallback local'
        );
        P.state.scenarioHistory.push({ role: 'assistant', content: data.answer });
        this.updateMode(data.mode);
      } catch (error) {
        P.updateMessage(waiting, error.message, 'Erro');
      }
    },

    async correctPhrase({ phrase, expected = '', target }) {
      if (!String(phrase || '').trim()) {
        P.setFeedback(target, 'Digite uma frase para corrigir.', 'bad');
        return null;
      }

      P.setFeedback(target, 'A IA está corrigindo sua frase...', 'wait');

      try {
        const data = await P.api.post('/api/ai/correct', {
          phrase,
          expected
        });
        P.setFeedback(
          target,
          `${data.mode === 'real_ai' ? '🤖 IA real' : '⚠️ fallback'}\n\n${data.correction}`,
          data.mode === 'real_ai' ? 'good' : ''
        );
        this.updateMode(data.mode);
        return data;
      } catch (error) {
        P.setFeedback(target, error.message, 'bad');
        return null;
      }
    },

    async generateReview() {
      const target = P.$('#aiReviewBox');
      P.setFeedback(target, 'A IA está montando uma revisão com base nos seus erros...', 'wait');

      try {
        const data = await P.api.post('/api/ai/review', {
          mistakes: P.state.reviews
        });
        P.setFeedback(
          target,
          `${data.mode === 'real_ai' ? '🤖 Revisão da IA real' : '⚠️ Revisão local'}\n\n${data.review}`,
          data.mode === 'real_ai' ? 'good' : ''
        );
        this.updateMode(data.mode);
      } catch (error) {
        P.setFeedback(target, error.message, 'bad');
      }
    },

    async loadHistory() {
      try {
        const data = await P.api.get('/api/ai/history');
        return data.conversations || [];
      } catch {
        return [];
      }
    },

    bind() {
      P.$('#sendTeacherBtn')?.addEventListener('click', () => this.sendTeacher());
      P.$('#teacherInput')?.addEventListener('keydown', event => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          this.sendTeacher();
        }
      });
      P.$('#clearTeacherBtn')?.addEventListener('click', () => this.clearTeacher());

      P.$$('.teacher-prompt').forEach(button => {
        button.addEventListener('click', () => this.sendTeacher(button.dataset.text));
      });

      P.$('#sendRealChatBtn')?.addEventListener('click', () => this.sendScenario());
      P.$('#realChatInput')?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.sendScenario();
        }
      });
      P.$('#startScenarioBtn')?.addEventListener('click', () => this.initScenario(true));
      P.$('#scenarioSelect')?.addEventListener('change', () => this.initScenario(true));
      P.$('#generateReviewBtn')?.addEventListener('click', () => this.generateReview());
    }
  };
})();
