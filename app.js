(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.app = {
    async checkHealth() {
      try {
        const data = await P.api.get('/api/health');
        P.ai.updateMode(data.ai === 'real' ? 'real_ai' : 'fallback');
        return data;
      } catch (error) {
        P.ai.updateMode('offline');
        throw error;
      }
    },

    renderSharedUser() {
      const user = P.state.user;
      if (!user) return;

      const completed = Number(P.state.dashboard?.stats?.completed_lessons || 0);
      if (P.$('#xpStat')) P.$('#xpStat').textContent = `⭐ ${Number(user.total_xp || 0)} XP`;
      if (P.$('#lessonStat')) P.$('#lessonStat').textContent = `${completed} aulas`;

      let mini = P.$('#sidebarProfileMini');
      if (!mini) {
        mini = document.createElement('div');
        mini.id = 'sidebarProfileMini';
        mini.className = 'sidebar-profile-mini';
        P.$('#logoutBtn')?.insertAdjacentElement('beforebegin', mini);
      }

      mini.innerHTML = `
        <div class="sidebar-profile-avatar">${P.escapeHtml(user.avatar || '🇷🇺')}</div>
        <div>
          <strong>${P.escapeHtml(user.name || 'Estudante')}</strong>
          <small>${P.escapeHtml(user.current_level || 'A1')} • ${Number(user.total_xp || 0)} XP</small>
        </div>
      `;

      P.profile?.render?.();
    },

    async bootAuthenticated() {
      P.showApp();

      try {
        const results = await Promise.allSettled([
          P.dashboard.load(),
          P.course.load(true),
          this.checkHealth(),
          P.practice.loadReviews(false)
        ]);

        const criticalFailure = results
          .slice(0, 2)
          .find(result => result.status === 'rejected');

        if (criticalFailure) throw criticalFailure.reason;

        this.renderSharedUser();
        P.alphabet.render();
        P.ai.initTeacher();
        P.ai.initScenario(true);
        P.practice.renderWriting(true);
        P.practice.renderSpeaking(true);
        P.games.render();
        P.dictionary.render();
        P.profile.render();
        await P.showScreen('home');
      } catch (error) {
        console.error(error);
        if (error.status === 401) {
          P.auth.logout(false);
          P.setFeedback(P.$('#welcomeStatus'), 'Entre novamente.', 'bad');
          return;
        }
        P.toast(error.message || 'Falha ao carregar o aplicativo.');
      }
    },

    bindNavigation() {
      P.$$('nav [data-screen]').forEach(button => {
        button.addEventListener('click', () => P.showScreen(button.dataset.screen));
      });

      P.$$('[data-go]').forEach(button => {
        button.addEventListener('click', () => P.showScreen(button.dataset.go));
      });

      P.$('#menuBtn')?.addEventListener('click', () => {
        P.$('#sidebar')?.classList.toggle('open');
      });

      document.addEventListener('click', event => {
        const sidebar = P.$('#sidebar');
        const menu = P.$('#menuBtn');
        if (!sidebar?.classList.contains('open')) return;
        if (sidebar.contains(event.target) || menu?.contains(event.target)) return;
        sidebar.classList.remove('open');
      });
    },

    bindModules() {
      P.auth.bind();
      P.course.bind();
      P.alphabet.bind();
      P.ai.bind();
      P.practice.bind();
      P.games.bind();
      P.dictionary.bind();
      P.profile.bind();
      this.bindNavigation();
    },

    hideSplash() {
      const splash = P.$('#splash');
      if (!splash) return;
      splash.classList.add('hide');
      setTimeout(() => splash.setAttribute('aria-hidden', 'true'), 700);
    },

    async boot() {
      if (P.state.booted) return;
      P.state.booted = true;
      this.bindModules();

      setTimeout(async () => {
        this.hideSplash();
        if (P.api.hasSession()) {
          await this.bootAuthenticated();
        } else {
          P.showAuth();
        }
      }, 1250);
    }
  };

  document.addEventListener('DOMContentLoaded', () => P.app.boot());
})();
