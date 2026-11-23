# Pipo 3A — voz bilíngue e avaliação de pronúncia

## O que foi implementado

- WebRTC para conversa de áudio em tempo real (quando a API OpenAI está configurada).
- Instruções pedagógicas bilíngues em português brasileiro e russo, sem limitar todas as respostas a frases curtas.
- VAD semântico por padrão, com VAD de silêncio configurável via variáveis.
- Contexto estruturado menor e sincronizado com menos frequência.
- Não reenvia a conversa inteira como novas falas ao conectar; não tenta criar mensagens de sistema pelo data channel.
- Deduplicação e janelas de silêncio mais conservadoras no reconhecimento alternativo.
- Voz neural `cedar` por padrão, configurável.
- Avaliação acústica opcional, autenticada e efêmera de pronúncia ru-RU usando Azure Speech (não é só transcrição).
- Proteção contra acesso HTTP a `data/db.json`, `server.js`, `database.sql` e demais arquivos internos.
- Smoke tests com `npm test`.

## Variáveis de ambiente no servidor

- `OPENAI_API_KEY`: necessária para conversa por voz em tempo real.
- `OPENAI_REALTIME_MODEL`: padrão `gpt-realtime-2.1`. Custos e acesso dependem da conta.
- `OPENAI_TRANSCRIBE_MODEL`: padrão `gpt-live-transcribe`.
- `PIPO_REALTIME_VOICE`: padrão `cedar`; também pode experimentar `marin`. Reinicie a sessão de voz após alterar a voz.
- `PIPO_TTS_VOICE`: padrão `cedar`.
- `PIPO_VAD_MODE`: `semantic` (padrão) ou `server`.
- `PIPO_SEMANTIC_EAGERNESS`: `auto`, `low`, `medium` ou `high`. Ajuste com testes reais de turnos.
- `PIPO_VAD_THRESHOLD`: para modo server; padrão 0.42.
- `PIPO_VAD_SILENCE_MS`: para modo server; padrão 550.
- `AZURE_SPEECH_KEY` e `AZURE_SPEECH_REGION`: habilitam a avaliação acústica na tela Prática > Fala.
- `TOKEN_SECRET`: obrigatório em implantação persistente, segredo criptograficamente aleatório.
- `CORS_ORIGINS`: lista separada por vírgula de origens de frontend autorizadas.

Nenhuma chave precisa estar no JavaScript do navegador.

## Funcionamento da avaliação acústica

Na tela **Prática > Fala**, há um botão **Avaliar pronúncia real (5s)**.

A gravação explicitamente autorizada é convertida para WAV mono PCM 16 kHz, enviada ao servidor autenticado e encaminhada temporariamente para Azure Speech. O resultado pode incluir scores de precisão, fluência e completude, além de palavras com maior dificuldade. O servidor não persiste esse áudio.

Esta funcionalidade não funciona sem credenciais Azure configuradas. O modelo de fala pode errar na avaliação de certos sons, sotaques ou gravações; scores não comprovam fala nativa. Para treino longo é recomendada análise de sessões dedicadas.

## Limitações conhecidas e próximos passos

- O fallback nativo `SpeechRecognition` não é um ASR bilíngue robusto; para alternância entre português e russo, use o modo WebRTC.
- A velocidade real depende de rede, navegador, instância do servidor e serviços pagos. Apenas métricas dos eventos de rede foram instrumentadas; não há benchmarking da saída audível.
- A função de avaliação acústica é restrita à tela de prática de fala; a parte de pronúncia nas aulas continua utilizando reconhecimento aproximado, agora identificado como tal.
- A análise contextual acompanha o estado da aula, não a webcam nem o conteúdo visual externo.
- O modo TTS separado, quando o Realtime falha, ainda espera pelo arquivo de áudio completo e pode ser mais lento.
- O backend JSON e as rotas de autenticação preexistentes ainda precisam de revisão antes de colocar muitos alunos em produção.
- Na hospedagem, frontend e API devem compartilhar a mesma origem ou você deve implementar configuração explícita e segura da origem da API.

## Testar

```bash
npm install
npm test
npm start
```

Depois, em ambiente com HTTPS e chaves de API, testar manualmente: conversação curta, alternância pt/ru, interrupção durante áudio, ditado e correção acústica. Não confundir teste estático com latência real.

Referências oficiais:
- https://developers.openai.com/api/docs/guides/realtime-conversations
- https://developers.openai.com/api/docs/guides/voice-prompting
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
