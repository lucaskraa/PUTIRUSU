(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.dashboard = {
    async load() {
      if (!P.api.hasSession()) return null;
      const data = await P.api.get('/api/profile/dashboard');
      P.state.dashboard = data;
      P.state.user = data.user;
      this.render();
      P.app?.renderSharedUser?.();
      return data;
    },

    render() {
      const dashboard = P.state.dashboard;
      if (!dashboard) return;

      const user = dashboard.user || {};
      const stats = dashboard.stats || {};
      const achievements = dashboard.achievements || [];
      const totalLessons = P.getAllCourseLessons().length || 60;
      const completed = Number(stats.completed_lessons || 0);
      const percent = totalLessons
        ? Math.round((completed / totalLessons) * 100)
        : 0;

      const heroTitle = P.$('#home .hero-main h1');
      const heroText = P.$('#home .hero-main > p:not(.tag)');
      if (heroTitle) heroTitle.textContent = `Olá, ${user.name || 'estudante'}. Continue seu russo.`;
      if (heroText) heroText.textContent = user.goal || 'Aprender russo do zero ao avançado.';

      if (P.$('#homeProgress')) P.$('#homeProgress').style.width = `${percent}%`;
      if (P.$('#homeProgressText')) {
        P.$('#homeProgressText').textContent = `${percent}% do curso • ${completed}/${totalLessons} aulas`;
      }

      this.renderStats({ user, stats, completed, percent });
      this.renderAchievements(achievements);
    },

    renderStats({ user, stats, completed, percent }) {
      let block = P.$('#dashboardStats');
      if (!block) {
        block = document.createElement('div');
        block.id = 'dashboardStats';
        block.className = 'dashboard-cards';
        P.$('#home .hero')?.insertAdjacentElement('afterend', block);
      }

      block.innerHTML = `
        <article class="dashboard-stat">
          <span>⭐</span>
          <strong>${Number(user.total_xp || 0)}</strong>
          <small>XP total</small>
        </article>
        <article class="dashboard-stat">
          <span>📖</span>
          <strong>${completed}</strong>
          <small>aulas concluídas</small>
        </article>
        <article class="dashboard-stat">
          <span>🎯</span>
          <strong>${Number(stats.average_score || 0)}%</strong>
          <small>média de acertos</small>
        </article>
        <article class="dashboard-stat">
          <span>🧠</span>
          <strong>${Number(stats.due_reviews || 0)}</strong>
          <small>revisões pendentes</small>
        </article>
        <article class="dashboard-stat">
          <span>🔥</span>
          <strong>${Number(user.streak || 0)}</strong>
          <small>dias de sequência</small>
        </article>
        <article class="dashboard-stat">
          <span>🧭</span>
          <strong>${user.current_level || 'A1'}</strong>
          <small>nível atual</small>
        </article>
        <article class="dashboard-stat">
          <span>⏱️</span>
          <strong>${P.formatDuration(stats.time_spent_seconds || 0)}</strong>
          <small>tempo registrado</small>
        </article>
        <article class="dashboard-stat">
          <span>📊</span>
          <strong>${percent}%</strong>
          <small>curso concluído</small>
        </article>
      `;
    },

    renderAchievements(achievements) {
      let heading = P.$('#achievementHeading');
      let block = P.$('#homeAchievements');

      if (!heading) {
        heading = document.createElement('div');
        heading.id = 'achievementHeading';
        heading.className = 'section-title-inline';
        heading.innerHTML = `
          <div>
            <p class="tag">CONQUISTAS</p>
            <h2>Seu progresso no curso</h2>
          </div>
        `;
        P.$('#home .quick')?.insertAdjacentElement('afterend', heading);
      }

      if (!block) {
        block = document.createElement('div');
        block.id = 'homeAchievements';
        block.className = 'grid achievements-grid';
        heading.insertAdjacentElement('afterend', block);
      }

      block.innerHTML = achievements.length
        ? achievements.map(item => `
            <article class="card achievement-card">
              <div class="achievement-icon">${P.escapeHtml(item.icon)}</div>
              <div>
                <h3>${P.escapeHtml(item.name)}</h3>
                <p>${P.escapeHtml(item.description)}</p>
                <small>Conquistado em ${P.formatDate(item.earned_at)}</small>
              </div>
            </article>
          `).join('')
        : `
          <article class="card empty-card">
            <div class="achievement-icon">🏆</div>
            <div>
              <h3>Primeira conquista</h3>
              <p>Conclua sua primeira aula para desbloquear.</p>
            </div>
          </article>
        `;
    }
  };
})();
