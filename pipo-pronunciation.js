"use strict";
(function () {
  // WAV 16-kHz 16-bit mono for optional, evidence-based Russian speech assessment.
  const btn = document.getElementById("pipoPronunciationBtn");
  const resultEl = document.getElementById("pipoPronunciationResult");
  if (!btn || !resultEl) return;
  let busy = false;
  function message(text) { resultEl.textContent = text; }
  function encodeWav(samples, inputRate) {
    const size = Math.max(1, Math.round(samples.length * 16000 / inputRate));
    const pcm = new Int16Array(size);
    for (let i=0; i<size; i++) {
      const at = i * inputRate / 16000;
      const low = Math.min(samples.length-1, Math.floor(at));
      const high = Math.min(samples.length-1, low+1);
      const val = samples[low] * (1-(at-low)) + samples[high] * (at-low);
      pcm[i] = Math.round(Math.max(-1,Math.min(1,val)) * 32767);
    }
    const b = new ArrayBuffer(44 + pcm.byteLength), d = new DataView(b);
    const str = (p,s) => { for(let i=0;i<s.length;i++)d.setUint8(p+i,s.charCodeAt(i)); };
    str(0,"RIFF");d.setUint32(4,36+pcm.byteLength,true);str(8,"WAVE");
    str(12,"fmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);
    d.setUint16(22,1,true);d.setUint32(24,16000,true);d.setUint32(28,32000,true);
    d.setUint16(32,2,true);d.setUint16(34,16,true);
    str(36,"data");d.setUint32(40,pcm.byteLength,true);
    for(let i=0;i<pcm.length;i++)d.setInt16(44+i*2,pcm[i],true);
    return new Blob([b],{type:"audio/wav"});
  }
  async function record(seconds) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Error("Microfone indisponível neste navegador.");
    const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:false,channelCount:1}});
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { stream.getTracks().forEach(t=>t.stop());throw Error("Áudio Web não suportado."); }
    const ctx = new AudioCtx();
    let src, proc;
    const chunks=[];
    try {
      await ctx.resume();
      src=ctx.createMediaStreamSource(stream);
      // ScriptProcessor is a compatibility fallback used only for short explicit recordings.
      proc=ctx.createScriptProcessor(4096,1,1);
      proc.onaudioprocess=e=>{
        const input=e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(input));
        e.outputBuffer.getChannelData(0).fill(0);
      };
      src.connect(proc);
      proc.connect(ctx.destination);
      await new Promise(resolve=>setTimeout(resolve,seconds*1000));
      const n=chunks.reduce((sum,a)=>sum+a.length,0);
      const samples=new Float32Array(n);let offset=0;
      for(const chunk of chunks){samples.set(chunk,offset);offset+=chunk.length;}
      return encodeWav(samples,ctx.sampleRate);
    } finally {
      if(proc){proc.onaudioprocess=null;proc.disconnect();}
      if(src)src.disconnect();
      stream.getTracks().forEach(t=>t.stop());
      await ctx.close().catch(()=>{});
    }
  }
  function feedback(data) {
    const scores=data.scores || {};
    const bad=(data.words||[]).filter(w=>w.accuracy!=null).sort((a,b)=>a.accuracy-b.accuracy).slice(0,2);
    const fmt=n=>Number.isFinite(n)?Math.round(n)+"/100":"indisponível";
    const parts=[
      "Reconhecido: "+(data.recognized||"(sem transcrição)"),
      "Precisão acústica: "+fmt(scores.accuracy),
      "Fluência: "+fmt(scores.fluency),
      "Completude: "+fmt(scores.completeness)
    ];
    if(bad.length)parts.push("Vale repetir: "+bad.map(w=>w.word+" ("+fmt(w.accuracy)+")").join(", "));
    parts.push("Avaliação automática; não é certificação de sotaque nativo.");
    return parts.join("\n");
  }
  btn.addEventListener("click",async()=>{
    if(busy)return;
    const target=state.speakingItem && state.speakingItem.ru;
    if(!target){message("Escolha uma frase primeiro.");return;}
    if(!state.token||state.token==="local-demo"){message("Entre com sua conta para usar avaliação acústica.");return;}
    busy=true;btn.disabled=true;
    const tracks=state.companion && state.companion.realtimeStream && state.companion.realtimeStream.getAudioTracks();
    const previous=tracks?tracks.map(t=>t.enabled):[];
    try {
      if(tracks)tracks.forEach(t=>{t.enabled=false;});
      if(window.speechSynthesis)speechSynthesis.cancel();
      message("Gravando 5 segundos. Fale a frase em russo normalmente...");
      const wav=await record(5);
      message("Analisando sua pronúncia...");
      const res=await fetch("/api/ai/pronunciation?target="+encodeURIComponent(target),{
        method:"POST",headers:{"Authorization":"Bearer "+state.token,"Content-Type":"audio/wav"},
        body:wav
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw Error(data.error||"Não foi possível avaliar.");
      message(feedback(data));
      window.dispatchEvent(new CustomEvent("putirusu-pronunciation",{detail:{
        target,recognized:data.recognized,scores:data.scores,weakWords:(data.words||[]).filter(w=>w.accuracy!=null&&w.accuracy<75).slice(0,3)
      }}));
    }catch(error){message(error.message||"Não foi possível gravar.");}
    finally{
      if(tracks)tracks.forEach((t,i)=>{t.enabled=previous[i];});
      btn.disabled=false;busy=false;
    }
  });
})();
