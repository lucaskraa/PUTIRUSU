(function () {
  'use strict';

  const P = window.PUTIRUSU;

  P.speech = {
    supportedSynthesis() {
      return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    },

    supportedRecognition() {
      return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    speakRussian(text, options = {}) {
      if (!this.supportedSynthesis()) {
        throw new Error('Seu navegador não possui leitura de voz.');
      }

      const value = String(text || '').trim();
      if (!value) throw new Error('Não há texto para reproduzir.');

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(value);
      utterance.lang = 'ru-RU';
      utterance.rate = Number(options.rate || 0.82);
      utterance.pitch = Number(options.pitch || 1);
      utterance.volume = Number(options.volume || 1);

      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => String(voice.lang).toLowerCase().startsWith('ru'));
      if (russianVoice) utterance.voice = russianVoice;

      window.speechSynthesis.speak(utterance);
      return utterance;
    },

    recognizeRussian(callbacks = {}) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        throw new Error('O reconhecimento de voz não está disponível. Use Chrome ou Edge e permita o microfone.');
      }

      const recognition = new Recognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;

      recognition.onstart = () => callbacks.onStart?.();
      recognition.onaudiostart = () => callbacks.onAudioStart?.();
      recognition.onspeechstart = () => callbacks.onSpeechStart?.();
      recognition.onspeechend = () => callbacks.onSpeechEnd?.();
      recognition.onend = () => callbacks.onEnd?.();

      recognition.onerror = event => {
        const messages = {
          'not-allowed': 'Permissão do microfone negada.',
          'audio-capture': 'Nenhum microfone foi encontrado.',
          'no-speech': 'Nenhuma fala foi detectada.',
          network: 'Falha de rede no reconhecimento de voz.',
          aborted: 'Reconhecimento cancelado.'
        };
        callbacks.onError?.(messages[event.error] || `Erro no microfone: ${event.error}`);
      };

      recognition.onresult = event => {
        const result = event.results[event.resultIndex || 0] || event.results[0];
        const alternatives = Array.from(result || []).map(item => ({
          transcript: item.transcript,
          confidence: Number(item.confidence || 0)
        }));
        callbacks.onResult?.(alternatives);
      };

      recognition.start();
      return recognition;
    },

    wordSimilarity(left, right) {
      const a = P.normalize(left);
      const b = P.normalize(right);
      if (!a || !b) return 0;
      if (a === b) return 1;

      const leftWords = a.split(' ').filter(Boolean);
      const rightWords = b.split(' ').filter(Boolean);
      const leftSet = new Set(leftWords);
      const rightSet = new Set(rightWords);
      const intersection = [...leftSet].filter(word => rightSet.has(word)).length;
      const union = new Set([...leftSet, ...rightSet]).size;
      const wordScore = union ? intersection / union : 0;
      const charScore = this.levenshteinSimilarity(a, b);
      return (wordScore * 0.55) + (charScore * 0.45);
    },

    levenshteinSimilarity(left, right) {
      const a = String(left || '');
      const b = String(right || '');
      if (!a && !b) return 1;
      if (!a || !b) return 0;

      const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

      for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }

      const distance = matrix[a.length][b.length];
      return 1 - (distance / Math.max(a.length, b.length));
    }
  };
})();
