(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.alphabet = {
    currentIndex: 0,

    render() {
      const grid = P.$('#alphabetGrid');
      if (!grid) return;
      const letters = P.DATA.alphabet || [];

      grid.innerHTML = letters.map((item, index) => `
        <article class="alphabet-card" data-letter-index="${index}">
          <div class="alphabet-emoji">${P.escapeHtml(item.emoji || '🔤')}</div>
          <div class="letter">${P.escapeHtml(item.letter)}</div>
          <div class="sound">${P.escapeHtml(item.sound)}</div>
          <div class="example">${P.escapeHtml(item.example)} • ${P.escapeHtml(item.pt)}</div>
        </article>
      `).join('');

      grid.querySelectorAll('[data-letter-index]').forEach(card => {
        card.addEventListener('click', () => this.showDetail(Number(card.dataset.letterIndex)));
      });

      if (letters.length && !P.$('#letterDetail').innerHTML.trim()) {
        this.showDetail(0);
      }
    },

    showDetail(index) {
      const letters = P.DATA.alphabet || [];
      const item = letters[index];
      if (!item) return;
      this.currentIndex = index;

      P.$('#letterDetail').innerHTML = `
        <article class="panel alphabet-detail-card">
          <div class="alphabet-detail-main">
            <div class="alphabet-detail-letter">${P.escapeHtml(item.letter)}</div>
            <div>
              <p class="tag">LETRA ${index + 1} DE ${letters.length}</p>
              <h2>Som: ${P.escapeHtml(item.sound)}</h2>
              <p><strong>Palavra:</strong> ${P.escapeHtml(item.example)}</p>
              <p><strong>Pronúncia:</strong> ${P.escapeHtml(item.pron || item.pronunciation)}</p>
              <p><strong>Tradução:</strong> ${P.escapeHtml(item.pt)}</p>
            </div>
          </div>
          <div class="row">
            <button id="alphabetListenWord">Ouvir palavra</button>
            <button id="alphabetListenLetter" class="ghost">Ouvir letra</button>
            <button id="alphabetAskAi" class="ghost">IA explica</button>
            <button id="alphabetTestLetter" class="ghost">Testar esta letra</button>
          </div>
          <div id="alphabetMiniTest"></div>
        </article>
      `;

      P.$('#alphabetListenWord')?.addEventListener('click', () => {
        try {
          P.speech.speakRussian(item.example);
        } catch (error) {
          P.toast(error.message);
        }
      });

      P.$('#alphabetListenLetter')?.addEventListener('click', () => {
        try {
          P.speech.speakRussian(item.letter.split(' ')[0], { rate: 0.65 });
        } catch (error) {
          P.toast(error.message);
        }
      });

      P.$('#alphabetAskAi')?.addEventListener('click', () => {
        P.ai.openTeacherWithPrompt(
          `Explique a letra russa ${item.letter}. O som aproximado é ${item.sound}. Use a palavra ${item.example} (${item.pt}) e dê três exemplos adicionais.`
        );
      });

      P.$('#alphabetTestLetter')?.addEventListener('click', () => this.renderMiniTest(item));
      P.$('#letterDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    renderMiniTest(target) {
      const letters = P.DATA.alphabet || [];
      const alternatives = P.shuffle([
        target,
        ...P.shuffle(letters.filter(item => item !== target)).slice(0, 3)
      ]);

      P.$('#alphabetMiniTest').innerHTML = `
        <div class="alphabet-test-box">
          <h3>Qual palavra usa o som “${P.escapeHtml(target.sound)}”?</h3>
          <div class="exercise-options">
            ${alternatives.map(item => `
              <button class="ghost" data-alphabet-answer="${P.escapeHtml(item.example)}">
                ${P.escapeHtml(item.example)}
              </button>
            `).join('')}
          </div>
          <div id="alphabetTestFeedback" class="feedback"></div>
        </div>
      `;

      P.$$('#alphabetMiniTest [data-alphabet-answer]').forEach(button => {
        button.addEventListener('click', () => {
          const correct = button.dataset.alphabetAnswer === target.example;
          P.setFeedback(
            P.$('#alphabetTestFeedback'),
            correct
              ? `Certo! ${target.example} começa com ${target.letter.split(' ')[0]}.`
              : `Ainda não. A resposta é ${target.example}.`,
            correct ? 'good' : 'bad'
          );
        });
      });
    },

    random() {
      const letters = P.DATA.alphabet || [];
      if (!letters.length) return;
      let index = Math.floor(Math.random() * letters.length);
      if (letters.length > 1 && index === this.currentIndex) {
        index = (index + 1) % letters.length;
      }
      this.showDetail(index);
    },

    bind() {
      P.$('#randomLetterBtn')?.addEventListener('click', () => this.random());
    }
  };
})();
