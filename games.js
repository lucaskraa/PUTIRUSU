(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.games = {
    modes: ['translation', 'memory', 'typing', 'listening'],
    currentModeIndex: 0,

    wordPool() {
      const words = P.getAllKnownWords().map(word => ({
        russian: word.russian || word.ru,
        pronunciation: word.pronunciation || word.pron || '',
        portuguese: word.portuguese || word.pt,
        category: word.lesson || word.category || word.cat || 'Geral'
      })).filter(word => word.russian && word.portuguese);

      if (words.length >= 8) return words;

      return [
        { russian: 'Привет', pronunciation: 'privet', portuguese: 'oi', category: 'Saudação' },
        { russian: 'Спасибо', pronunciation: 'spasíba', portuguese: 'obrigado', category: 'Educação' },
        { russian: 'Вода', pronunciation: 'vadá', portuguese: 'água', category: 'Comida' },
        { russian: 'Хлеб', pronunciation: 'khlyep', portuguese: 'pão', category: 'Comida' },
        { russian: 'Дом', pronunciation: 'dom', portuguese: 'casa', category: 'Casa' },
        { russian: 'Школа', pronunciation: 'shkóla', portuguese: 'escola', category: 'Cidade' },
        { russian: 'Город', pronunciation: 'górat', portuguese: 'cidade', category: 'Cidade' },
        { russian: 'Книга', pronunciation: 'kníga', portuguese: 'livro', category: 'Estudo' },
        { russian: 'Работа', pronunciation: 'rabóta', portuguese: 'trabalho', category: 'Trabalho' },
        { russian: 'Семья', pronunciation: 'simyá', portuguese: 'família', category: 'Família' },
        { russian: 'Сегодня', pronunciation: 'sivódnya', portuguese: 'hoje', category: 'Tempo' },
        { russian: 'Завтра', pronunciation: 'záftra', portuguese: 'amanhã', category: 'Tempo' }
      ];
    },

    render(forceNextMode = false) {
      if (forceNextMode) {
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
      }

      const mode = this.modes[this.currentModeIndex];
      if (mode === 'memory') this.renderMemory();
      else if (mode === 'typing') this.renderTyping();
      else if (mode === 'listening') this.renderListening();
      else this.renderTranslation();
    },

    renderTranslation() {
      const pool = this.wordPool();
      const target = P.randomItem(pool);
      const alternatives = P.shuffle([
        target,
        ...P.shuffle(pool.filter(word => word.portuguese !== target.portuguese)).slice(0, 3)
      ]);

      P.$('#gameArea').innerHTML = `
        <article class="game-card panel">
          <p class="tag">TRADUÇÃO RÁPIDA</p>
          <h2>${P.escapeHtml(target.russian)}</h2>
          <p class="game-pronunciation">${P.escapeHtml(target.pronunciation)}</p>
          <button id="gameHearWord" class="ghost">🔊 Ouvir palavra</button>
          <div class="game-options">
            ${alternatives.map(word => `
              <button class="ghost" data-game-answer="${P.escapeHtml(word.portuguese)}">
                ${P.escapeHtml(word.portuguese)}
              </button>
            `).join('')}
          </div>
          <div id="gameFeedback" class="feedback"></div>
          <button id="sameGameAgain" class="ghost">Outra palavra</button>
        </article>
      `;

      P.$('#gameHearWord')?.addEventListener('click', () => P.speech.speakRussian(target.russian));
      P.$('#sameGameAgain')?.addEventListener('click', () => this.renderTranslation());
      P.$$('#gameArea [data-game-answer]').forEach(button => {
        button.addEventListener('click', () => {
          const correct = button.dataset.gameAnswer === target.portuguese;
          P.setFeedback(
            P.$('#gameFeedback'),
            correct
              ? 'Acertou! Continue.'
              : `Resposta correta: ${target.portuguese}`,
            correct ? 'good' : 'bad'
          );
        });
      });
    },

    renderTyping() {
      const target = P.randomItem(this.wordPool());
      P.$('#gameArea').innerHTML = `
        <article class="game-card panel">
          <p class="tag">DIGITAÇÃO</p>
          <h3>Digite em russo:</h3>
          <h2 class="game-target-pt">${P.escapeHtml(target.portuguese)}</h2>
          <input id="typingGameInput" placeholder="Resposta em russo">
          <div class="row center-row">
            <button id="checkTypingGame">Corrigir</button>
            <button id="hearTypingAnswer" class="ghost">Ouvir resposta</button>
            <button id="anotherTypingGame" class="ghost">Nova palavra</button>
          </div>
          <div id="gameFeedback" class="feedback"></div>
        </article>
      `;

      P.$('#checkTypingGame')?.addEventListener('click', () => {
        const answer = P.$('#typingGameInput').value;
        const score = P.speech.wordSimilarity(answer, target.russian);
        const correct = score >= 0.85;
        P.setFeedback(
          P.$('#gameFeedback'),
          correct
            ? 'Perfeito!'
            : `Resposta correta: ${target.russian} (${target.pronunciation})`,
          correct ? 'good' : 'bad'
        );
      });
      P.$('#hearTypingAnswer')?.addEventListener('click', () => P.speech.speakRussian(target.russian));
      P.$('#anotherTypingGame')?.addEventListener('click', () => this.renderTyping());
    },

    renderListening() {
      const target = P.randomItem(this.wordPool());
      const alternatives = P.shuffle([
        target,
        ...P.shuffle(this.wordPool().filter(word => word.portuguese !== target.portuguese)).slice(0, 3)
      ]);

      P.$('#gameArea').innerHTML = `
        <article class="game-card panel">
          <p class="tag">ESCUTA</p>
          <h2>Ouça e escolha o significado</h2>
          <button id="playListeningGame" class="listening-main-button">🔊 Reproduzir</button>
          <div class="game-options">
            ${alternatives.map(word => `
              <button class="ghost" data-listening-answer="${P.escapeHtml(word.portuguese)}">
                ${P.escapeHtml(word.portuguese)}
              </button>
            `).join('')}
          </div>
          <div id="gameFeedback" class="feedback"></div>
          <button id="anotherListeningGame" class="ghost">Nova rodada</button>
        </article>
      `;

      P.$('#playListeningGame')?.addEventListener('click', () => P.speech.speakRussian(target.russian));
      P.$('#anotherListeningGame')?.addEventListener('click', () => this.renderListening());
      P.$$('#gameArea [data-listening-answer]').forEach(button => {
        button.addEventListener('click', () => {
          const correct = button.dataset.listeningAnswer === target.portuguese;
          P.setFeedback(
            P.$('#gameFeedback'),
            correct
              ? `Certo! A palavra era ${target.russian}.`
              : `A palavra era ${target.russian} = ${target.portuguese}.`,
            correct ? 'good' : 'bad'
          );
        });
      });

      setTimeout(() => {
        try { P.speech.speakRussian(target.russian); } catch {}
      }, 250);
    },

    renderMemory() {
      const selected = P.shuffle(this.wordPool()).slice(0, 6);
      const cards = P.shuffle(selected.flatMap((word, pairId) => [
        { pairId, value: word.russian, type: 'ru' },
        { pairId, value: word.portuguese, type: 'pt' }
      ]));

      P.$('#gameArea').innerHTML = `
        <article class="game-card panel">
          <p class="tag">MEMÓRIA</p>
          <h2>Combine russo e português</h2>
          <div class="memory-grid">
            ${cards.map((card, index) => `
              <button class="memory-card" data-memory-index="${index}">?</button>
            `).join('')}
          </div>
          <div id="gameFeedback" class="feedback"></div>
          <button id="restartMemoryGame" class="ghost">Recomeçar</button>
        </article>
      `;

      const buttons = P.$$('#gameArea [data-memory-index]');
      const matched = new Set();
      let opened = [];

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.memoryIndex);
          if (matched.has(index) || opened.includes(index) || opened.length >= 2) return;

          opened.push(index);
          button.textContent = cards[index].value;
          button.classList.add('open');

          if (opened.length === 2) {
            const [first, second] = opened;
            const pair = cards[first].pairId === cards[second].pairId
              && cards[first].type !== cards[second].type;

            if (pair) {
              matched.add(first);
              matched.add(second);
              buttons[first].classList.add('matched');
              buttons[second].classList.add('matched');
              opened = [];

              if (matched.size === cards.length) {
                P.setFeedback(P.$('#gameFeedback'), 'Você completou todas as combinações!', 'good');
              }
            } else {
              setTimeout(() => {
                buttons[first].textContent = '?';
                buttons[second].textContent = '?';
                buttons[first].classList.remove('open');
                buttons[second].classList.remove('open');
                opened = [];
              }, 750);
            }
          }
        });
      });

      P.$('#restartMemoryGame')?.addEventListener('click', () => this.renderMemory());
    },

    bind() {
      P.$('#newGameBtn')?.addEventListener('click', () => this.render(true));
    }
  };
})();
