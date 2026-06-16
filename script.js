(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.practice = {
    keyboardLetters: 'А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я'.split(' '),

    writingPool() {
      const base = Array.isArray(P.DATA.writingChallenges)
        ? [...P.DATA.writingChallenges]
        : [];

      const lesson = P.state.currentLesson;
      if (lesson?.examples?.length) {
        for (const example of lesson.examples.slice(0, 4)) {
          base.push({
            pt: example.pt,
            ru: example.ru,
            hint: `Use a estrutura da aula ${lesson.title}.`
          });
        }
      }

      return base;
    },

    renderWriting(force = false) {
      if (!P.state.currentWriting || force) {
        P.state.currentWriting = P.randomItem(this.writingPool());
      }

      const item = P.state.currentWriting || {
        pt: 'Eu estudo russo.',
        ru: 'Я учу русский язык.',
        hint: 'Use Я + verbo.'
      };

      if (P.$('#writingPrompt')) P.$('#writingPrompt').textContent = item.pt;
      if (P.$('#writingHint')) P.$('#writingHint').textContent = item.hint || '';
      if (P.$('#writingInput') && force) P.$('#writingInput').value = '';
      if (P.$('#writingModel')) P.$('#writingModel').textContent = '';
      if (force) P.setFeedback(P.$('#writingFeedback'), '');
      this.renderKeyboard();
    },

    renderKeyboard() {
      const keyboard = P.$('#keyboard');
      if (!keyboard || keyboard.dataset.ready === '1') return;

      keyboard.innerHTML = this.keyboardLetters.map(letter => `
        <button type="button" class="ghost" data-cyrillic="${letter}">${letter}</button>
      `).join('');

      keyboard.querySelectorAll('[data-cyrillic]').forEach(button => {
        button.addEventListener('click', () => {
          const input = P.$('#writingInput');
          if (!input) return;
          const start = input.selectionStart ?? input.value.length;
          const end = input.selectionEnd ?? input.value.length;
          const value = input.value;
          const letter = button.dataset.cyrillic.toLowerCase();
          input.value = `${value.slice(0, start)}${letter}${value.slice(end)}`;
          input.focus();
          input.selectionStart = input.selectionEnd = start + letter.length;
        });
      });

      keyboard.dataset.ready = '1';
    },

    quickCheckWriting() {
      const input = String(P.$('#writingInput')?.value || '').trim();
      const item = P.state.currentWriting;
      const feedback = P.$('#writingFeedback');

      if (!input) {
        P.setFeedback(feedback, 'Escreva sua resposta primeiro.', 'bad');
        return;
      }

      const target = item?.ru || '';
      const score = P.speech.wordSimilarity(input, target);
      const percent = Math.round(score * 100);
      const accepted = percent >= 72;

      if (P.$('#writingModel')) {
        P.$('#writingModel').textContent = `Modelo: ${target}`;
      }

      P.setFeedback(
        feedback,
        accepted
          ? `Sua resposta está próxima do modelo (${percent}%). Agora peça a correção da IA para entender detalhes.`
          : `Sua resposta ainda está diferente do modelo (${percent}%). Compare a ordem e as terminações.`,
        accepted ? 'good' : 'bad'
      );
    },

    async correctWritingWithAi() {
      const phrase = String(P.$('#writingInput')?.value || '').trim();
      const item = P.state.currentWriting;

      if (P.$('#writingModel')) {
        P.$('#writingModel').textContent = item?.ru ? `Modelo de referência: ${item.ru}` : '';
      }

      await P.ai.correctPhrase({
        phrase,
        expected: `Traduza “${item?.pt || ''}”. Modelo de referência: ${item?.ru || ''}`,
        target: P.$('#writingFeedback')
      });
    },

    speakingPool() {
      const words = P.getAllKnownWords();
      const phrases = [];

      for (const word of words.slice(0, 80)) {
        const ru = word.russian || word.ru;
        const pronunciation = word.pronunciation || word.pron || '';
        const pt = word.portuguese || word.pt || '';
        if (ru) {
          phrases.push({
            ru,
            pronunciation,
            pt,
            category: word.lesson || word.category || word.cat || 'Vocabulário'
          });
        }
      }

      const lesson = P.state.currentLesson;
      if (lesson?.examples?.length) {
        for (const example of lesson.examples) {
          phrases.unshift({
            ru: example.ru,
            pronunciation: example.pronunciation,
            pt: example.pt,
            category: lesson.title
          });
        }
      }

      if (!phrases.length) {
        phrases.push(
          { ru: 'Привет', pronunciation: 'privet', pt: 'Oi', category: 'Saudação' },
          { ru: 'Спасибо', pronunciation: 'spasíba', pt: 'Obrigado', category: 'Educação' },
          { ru: 'Я учу русский язык', pronunciation: 'ya uchú rússkiy yazýk', pt: 'Eu estudo russo', category: 'Estudo' },
          { ru: 'Где метро?', pronunciation: 'gdye mitró?', pt: 'Onde fica o metrô?', category: 'Cidade' }
        );
      }

      return phrases;
    },

    renderSpeaking(force = false) {
      if (!P.state.currentSpeaking || force) {
        P.state.currentSpeaking = P.randomItem(this.speakingPool());
      }

      const item = P.state.currentSpeaking || {
        ru: 'Привет',
        pronunciation: 'privet',
        pt: 'Oi',
        category: 'Saudação'
      };

      if (P.$('#speakRu')) P.$('#speakRu').textContent = item.ru;
      if (P.$('#speakPron')) P.$('#speakPron').textContent = item.pronunciation;
      if (P.$('#speakPt')) P.$('#speakPt').textContent = `${item.pt} • ${item.category}`;
      if (force) P.setFeedback(P.$('#speechFeedback'), 'Ouça e depois use o microfone.');
    },

    hearSpeaking() {
      const item = P.state.currentSpeaking;
      if (!item) return;
      try {
        P.speech.speakRussian(item.ru);
      } catch (error) {
        P.setFeedback(P.$('#speechFeedback'), error.message, 'bad');
      }
    },

    useMicrophone() {
      const item = P.state.currentSpeaking;
      const feedback = P.$('#speechFeedback');
      if (!item) return;

      P.setFeedback(feedback, 'Ouvindo... fale a frase completa.', 'wait');

      try {
        P.speech.recognizeRussian({
          onResult: alternatives => {
            const transcript = alternatives[0]?.transcript || '';
            const score = P.speech.wordSimilarity(transcript, item.ru);
            const percent = Math.round(score * 100);
            const confidence = Math.round((alternatives[0]?.confidence || 0) * 100);
            const good = percent >= 65;

            P.setFeedback(
              feedback,
              [
                `Reconhecido: ${transcript || 'nenhum texto'}`,
                `Frase alvo: ${item.ru}`,
                `Semelhança aproximada: ${percent}%`,
                confidence ? `Confiança do navegador: ${confidence}%` : '',
                good
                  ? 'A pronúncia foi reconhecida. Repita tentando manter o ritmo.'
                  : 'Repita mais devagar, separando as palavras.'
              ].filter(Boolean).join('\n'),
              good ? 'good' : 'bad'
            );
          },
          onError: message => P.setFeedback(feedback, message, 'bad')
        });
      } catch (error) {
        P.setFeedback(feedback, error.message, 'bad');
      }
    },

    askPronunciationAi() {
      const item = P.state.currentSpeaking;
      if (!item) return;
      P.ai.openTeacherWithPrompt(
        `Dê dicas detalhadas de pronúncia para a frase “${item.ru}”. Pronúncia aproximada: ${item.pronunciation}. Tradução: ${item.pt}. Explique ritmo, sílaba forte e erros comuns para brasileiros.`
      );
    },

    async loadReviews(render = true) {
      if (!P.api.hasSession()) return [];
      try {
        const data = await P.api.get('/api/progress/reviews');
        P.state.reviews = data.items || [];
        if (render) this.renderReviews();
        return P.state.reviews;
      } catch (error) {
        if (render) {
          P.$('#mistakesList').innerHTML = `<li>${P.escapeHtml(error.message)}</li>`;
        }
        return [];
      }
    },

    renderReviews() {
      const list = P.$('#mistakesList');
      if (!list) return;

      if (!P.state.reviews.length) {
        list.innerHTML = `
          <li class="review-empty">
            Nenhum erro pendente. Respostas erradas dos exercícios aparecerão aqui automaticamente.
          </li>
        `;
        return;
      }

      list.innerHTML = P.state.reviews.map(item => `
        <li class="review-item">
          <div>
            <span class="pill">Dificuldade ${Number(item.difficulty || 1)}</span>
            <strong>${P.escapeHtml(item.prompt)}</strong>
            <small>Esperado: ${P.escapeHtml(item.expected_answer || 'resposta aberta')}</small>
            <small>Sua resposta: ${P.escapeHtml(item.user_answer || '—')}</small>
            <small>Intervalo atual: ${Number(item.interval_days || 1)} dia(s)</small>
          </div>
          <div class="review-item-actions">
            <button data-review-id="${P.escapeHtml(item.id)}" data-review-result="true">Lembrei</button>
            <button class="ghost" data-review-id="${P.escapeHtml(item.id)}" data-review-result="false">Errei novamente</button>
          </div>
        </li>
      `).join('');

      list.querySelectorAll('[data-review-id]').forEach(button => {
        button.addEventListener('click', () => this.answerReview(
          button.dataset.reviewId,
          button.dataset.reviewResult === 'true'
        ));
      });
    },

    async answerReview(reviewId, correct) {
      try {
        await P.api.post(`/api/progress/reviews/${reviewId}/answer`, { correct });
        P.toast(correct
          ? 'Item avançou na repetição espaçada.'
          : 'Item reagendado para amanhã.');
        await Promise.all([
          this.loadReviews(true),
          P.dashboard?.load?.()
        ]);
      } catch (error) {
        P.toast(error.message);
      }
    },

    bind() {
      P.$('#newWritingBtn')?.addEventListener('click', () => this.renderWriting(true));
      P.$('#simpleCheckBtn')?.addEventListener('click', () => this.quickCheckWriting());
      P.$('#correctWritingBtn')?.addEventListener('click', () => this.correctWritingWithAi());

      P.$('#newSpeakBtn')?.addEventListener('click', () => this.renderSpeaking(true));
      P.$('#hearSpeakBtn')?.addEventListener('click', () => this.hearSpeaking());
      P.$('#micBtn')?.addEventListener('click', () => this.useMicrophone());
      P.$('#askPronunciationAiBtn')?.addEventListener('click', () => this.askPronunciationAi());
    }
  };
})();
