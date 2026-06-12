(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.api = {
    getToken() {
      return localStorage.getItem(P.TOKEN_KEY) || '';
    },

    setToken(token) {
      if (token) localStorage.setItem(P.TOKEN_KEY, token);
      else localStorage.removeItem(P.TOKEN_KEY);
    },

    hasSession() {
      return Boolean(this.getToken());
    },

    async request(path, options = {}) {
      const token = this.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };

      let response;
      try {
        response = await fetch(path, {
          ...options,
          headers
        });
      } catch (error) {
        const networkError = new Error('Não foi possível conectar ao servidor. Confira se o Node.js está rodando.');
        networkError.cause = error;
        throw networkError;
      }

      const data = await response.json().catch(() => ({
        ok: false,
        error: 'O servidor respondeu em um formato inválido.'
      }));

      if (response.status === 401 && !path.startsWith('/api/auth/')) {
        this.setToken('');
        window.dispatchEvent(new CustomEvent('putirusu:unauthorized'));
      }

      if (!response.ok) {
        const error = new Error(data.error || `Erro HTTP ${response.status}.`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    },

    get(path) {
      return this.request(path);
    },

    post(path, body = {}) {
      return this.request(path, {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },

    put(path, body = {}) {
      return this.request(path, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
    }
  };
})();
