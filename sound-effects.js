(() => {
  let context=null,noiseBuffer=null,flipNoiseBuffer=null;
  const audioContext=window.AudioContext||window.webkitAudioContext;

  function getContext(){
    if(!audioContext)return null;
    if(!context){
      context=new audioContext();
      const length=Math.ceil(context.sampleRate*.055);
      noiseBuffer=context.createBuffer(1,length,context.sampleRate);
      const samples=noiseBuffer.getChannelData(0);
      for(let i=0;i<length;i++)samples[i]=(Math.random()*2-1)*(1-i/length);
    }
    if(context.state==='suspended')context.resume().catch(()=>{});
    return context;
  }

  function playButtonClick(){
    const ctx=getContext();if(!ctx)return;
    const now=ctx.currentTime;

    // A quiet, short wooden tap with a crisp edge; generated locally by Web Audio.
    const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;
    const highpass=ctx.createBiquadFilter();highpass.type='highpass';highpass.frequency.value=650;
    const noiseGain=ctx.createGain();noiseGain.gain.setValueAtTime(.0001,now);
    noiseGain.gain.exponentialRampToValueAtTime(.105,now+.003);
    noiseGain.gain.exponentialRampToValueAtTime(.0001,now+.047);
    noise.connect(highpass).connect(noiseGain).connect(ctx.destination);
    noise.start(now);noise.stop(now+.05);

    const tone=ctx.createOscillator();tone.type='triangle';
    tone.frequency.setValueAtTime(520,now);tone.frequency.exponentialRampToValueAtTime(245,now+.055);
    const toneGain=ctx.createGain();toneGain.gain.setValueAtTime(.0001,now);
    toneGain.gain.exponentialRampToValueAtTime(.045,now+.004);
    toneGain.gain.exponentialRampToValueAtTime(.0001,now+.065);
    tone.connect(toneGain).connect(ctx.destination);tone.start(now);tone.stop(now+.07);
  }

  function playPaperFlip(){
    const ctx=getContext();if(!ctx)return;
    const now=ctx.currentTime;
    if(!flipNoiseBuffer){
      const length=Math.ceil(ctx.sampleRate*.24);
      flipNoiseBuffer=ctx.createBuffer(1,length,ctx.sampleRate);
      const samples=flipNoiseBuffer.getChannelData(0);
      for(let i=0;i<length;i++){
        const t=i/length;
        samples[i]=(Math.random()*2-1)*(1-t)*(.72+.28*Math.sin(t*Math.PI*9));
      }
    }
    const rustle=ctx.createBufferSource();rustle.buffer=flipNoiseBuffer;
    const highpass=ctx.createBiquadFilter();highpass.type='highpass';
    highpass.frequency.setValueAtTime(420,now);highpass.frequency.exponentialRampToValueAtTime(2400,now+.075);
    const lowpass=ctx.createBiquadFilter();lowpass.type='lowpass';
    lowpass.frequency.setValueAtTime(5200,now);lowpass.frequency.exponentialRampToValueAtTime(1900,now+.22);
    const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.075,now+.014);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.225);
    rustle.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination);
    rustle.start(now);rustle.stop(now+.24);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#app button');
    if(!button||button.disabled||button.getAttribute('aria-disabled')==='true')return;
    if(document.querySelector('#app')?.hasAttribute('aria-busy'))return;
    const destination=window.BANG_FIGMA_FLOW?.frames?.[button.dataset.targetFrame]?.screenId;
    if([66,67,68,69].includes(destination))return;
    playButtonClick();
  },true);
  window.BangEffects={playPaperFlip};
})();
