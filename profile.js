(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.profile = {
    render() {
      const user = P.state.user;
      if (!user) return;

      if (P.$('#profileName')) P.$('#profileName').value = user.name || '';
      if (P.$('#profileLevel')) P.$('#profileLevel').value = user.current_level || 'A1';
      if (P.$('#profileGoal')) P.$('#profileGoal').value = user.goal || '';
      if (P.$('#profileDailyGoal')) P.$('#profileDailyGoal').value = user.daily_goal_minutes || 20;
      if (P.$('#profileAvatar')) P.$('#profileAvatar').value = user.avatar || '🇷🇺';

      this.updatePreview();
    },

    updatePreview() {
      const name = P.$('#profileName')?.value || P.state.user?.name || 'Estudante';
      const level = P.$('#profileLevel')?.value || P.state.user?.current_level || 'A1';
      const goal = P.$('#profileGoal')?.value || P.state.user?.goal || 'Aprender russo';
      const avatar = P.$('#profileAvatar')?.value || P.state.user?.avatar || '🇷🇺';
      const xp = Number(P.state.user?.total_xp || 0);
      const completed = Number(P.state.dashboard?.stats?.completed_lessons || 0);
      const totalLessons = P.getAllCourseLessons().length || 60;
      const percent = Math.round((completed / totalLessons) * 100);

      if (P.$('#avatarBig')) P.$('#avatarBig').textContent = avatar;
      if (P.$('#profileViewName')) P.$('#profileViewName').textContent = name;
      if (P.$('#profileViewGoal')) P.$('#profileViewGoal').textContent = goal;
      if (P.$('#profileProgress')) P.$('#profileProgress').style.width = `${percent}%`;
      if (P.$('#profileNumbers')) {
        P.$('#profileNumbers').textContent = `${xp} XP • ${completed}/${totalLessons} aulas • nível ${level}`;
      }
    },

    async save() {
      const body = {
        name: P.$('#profileName')?.value || 'Estudante',
        currentLevel: P.$('#profileLevel')?.value || 'A1',
        goal: P.$('#profileGoal')?.value || 'Aprender russo',
        dailyGoalMinutes: Number(P.$('#profileDailyGoal')?.value || 20),
        avatar: P.$('#profileAvatar')?.value || '🇷🇺'
      };

      try {
        const data = await P.api.put('/api/profile', body);
        P.state.user = {
          ...P.state.user,
          ...data.user
        };
        this.render();
        P.app.renderSharedUser();
        await P.dashboard.load();
        P.toast('Perfil salvo no PostgreSQL.');
      } catch (error) {
        P.toast(error.message);
      }
    },

    bind() {
      ['#profileName', '#profileLevel', '#profileGoal', '#profileDailyGoal', '#profileAvatar']
        .forEach(selector => {
          P.$(selector)?.addEventListener('input', () => this.updatePreview());
          P.$(selector)?.addEventListener('change', () => this.updatePreview());
        });

      P.$('#saveProfileBtn')?.addEventListener('click', () => this.save());
    }
  };
})();
