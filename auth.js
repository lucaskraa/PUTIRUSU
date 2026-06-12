(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.auth = {
    async login(email, password) {
      const data = await P.api.post('/api/auth/login', { email, password });
      P.api.setToken(data.token);
      P.state.user = data.user;
      return data.user;
    },

    async register(name, email, password) {
      const data = await P.api.post('/api/auth/register', { name, email, password });
      P.api.setToken(data.token);
      P.state.user = data.user;
      return data.user;
    },

    logout(showMessage = true) {
      P.api.setToken('');
      P.resetState();
      P.showAuth();
      if (showMessage) P.toast('Você saiu da conta.');
    },

    switchTab(tab) {
      const isLogin = tab === 'login';
      P.$('#loginForm')?.classList.toggle('hidden', !isLogin);
      P.$('#registerForm')?.classList.toggle('hidden', isLogin);
      P.$('#showLoginBtn')?.classList.toggle('active', isLogin);
      P.$('#showRegisterBtn')?.classList.toggle('active', !isLogin);
      P.$('#showLoginBtn')?.classList.toggle('ghost', !isLogin);
      P.$('#showRegisterBtn')?.classList.toggle('ghost', isLogin);
      P.setFeedback(P.$('#welcomeStatus'), '');
    },

    async handleLogin(event) {
      event.preventDefault();
      const status = P.$('#welcomeStatus');
      P.setFeedback(status, 'Entrando...', 'wait');

      try {
        await this.login(
          P.$('#loginEmail').value,
          P.$('#loginPassword').value
        );
        P.setFeedback(status, 'Login realizado.', 'good');
        await P.app.bootAuthenticated();
      } catch (error) {
        P.setFeedback(status, error.message, 'bad');
      }
    },

    async handleRegister(event) {
      event.preventDefault();
      const status = P.$('#welcomeStatus');
      P.setFeedback(status, 'Criando conta...', 'wait');

      try {
        await this.register(
          P.$('#registerName').value,
          P.$('#registerEmail').value,
          P.$('#registerPassword').value
        );
        P.setFeedback(status, 'Conta criada.', 'good');
        await P.app.bootAuthenticated();
      } catch (error) {
        P.setFeedback(status, error.message, 'bad');
      }
    },

    bind() {
      P.$('#showLoginBtn')?.addEventListener('click', () => this.switchTab('login'));
      P.$('#showRegisterBtn')?.addEventListener('click', () => this.switchTab('register'));
      P.$('#loginForm')?.addEventListener('submit', event => this.handleLogin(event));
      P.$('#registerForm')?.addEventListener('submit', event => this.handleRegister(event));
      P.$('#logoutBtn')?.addEventListener('click', () => this.logout(true));

      window.addEventListener('putirusu:unauthorized', () => {
        this.logout(false);
        P.setFeedback(
          P.$('#welcomeStatus'),
          'Sua sessão expirou. Entre novamente.',
          'bad'
        );
      });
    }
  };
})();
