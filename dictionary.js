(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.dictionary = {
    words() {
      const map = new Map();

      for (const word of P.DATA.dictionary || []) {
        const normalized = {
          russian: word.ru,
          pronunciation: word.pron,
          portuguese: word.pt,
          category: word.cat || 'Geral',
          level: 'Base',
          lesson: 'Dicionário principal'
        };
        map.set(`${normalized.russian}|${normalized.portuguese}`, normalized);
      }

      for (const word of P.state.courseWords || []) {
        const normalized = {
          russian: word.russian,
          pronunciation: word.pronunciation,
          portuguese: word.portuguese,
          category: word.lesson || 'Aula',
          level: word.level || 'Curso',
          lesson: word.lesson || 'Aula atual'
        };
        map.set(`${normalized.russian}|${normalized.portuguese}`, normalized);
      }

      return Array.from(map.values());
    },

    render() {
      const grid = P.$('#dictGrid');
      if (!grid) return;
      const query = P.normalize(P.$('#dictSearch')?.value || '');
      const words = this.words();

      const filtered = words.filter(word => {
        const text = P.normalize([
          word.russian,
          word.pronunciation,
          word.portuguese,
          word.category,
          word.level,
          word.lesson
        ].join(' '));
        return !query || text.includes(query);
      });

      grid.innerHTML = filtered.length
        ? filtered.map(word => `
            <article class="dict-card dictionary-card">
              <div class="row dictionary-tags">
                <span class="pill">${P.escapeHtml(word.level || 'Curso')}</span>
                <span class="pill">${P.escapeHtml(word.category || 'Geral')}</span>
              </div>
              <h3>${P.escapeHtml(word.russian)}</h3>
              <strong>${P.escapeHtml(word.pronunciation || '')}</strong>
              <p>${P.escapeHtml(word.portuguese)}</p>
              <small>${P.escapeHtml(word.lesson || '')}</small>
              <div class="row">
                <button class="ghost" data-dict-speak="${P.escapeHtml(word.russian)}">🔊 Ouvir</button>
                <button class="ghost" data-dict-ai="${P.escapeHtml(word.russian)}" data-dict-pt="${P.escapeHtml(word.portuguese)}">IA explica</button>
              </div>
            </article>
          `).join('')
        : `
          <article class="card empty-card" style="grid-column:1/-1">
            <h3>Nenhuma palavra encontrada</h3>
            <p>Tente pesquisar outra palavra, tradução ou categoria.</p>
          </article>
        `;

      grid.querySelectorAll('[data-dict-speak]').forEach(button => {
        button.addEventListener('click', () => {
          try {
            P.speech.speakRussian(button.dataset.dictSpeak);
          } catch (error) {
            P.toast(error.message);
          }
        });
      });

      grid.querySelectorAll('[data-dict-ai]').forEach(button => {
        button.addEventListener('click', () => {
          P.ai.openTeacherWithPrompt(
            `Explique a palavra ou expressão russa “${button.dataset.dictAi}”, que significa “${button.dataset.dictPt}”. Dê pronúncia, uso, forma gramatical e três frases de exemplo.`
          );
        });
      });
    },

    bind() {
      P.$('#dictSearch')?.addEventListener('input', () => this.render());
    }
  };
})();
