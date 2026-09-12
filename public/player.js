// A fresh audio element per session prevents late events from an old station
// from changing the new station's UI. dispose() stops all prior network/audio work.
export class RadioPlayer {
  constructor({onChange=()=>{},createAudio=()=>new Audio(),getHls=()=>window.Hls,timeout=25000}={}) {
    Object.assign(this,{onChange,createAudio,getHls,timeout});
    this.station=null; this.state='idle'; this.volume=.8; this.generation=0;
  }
  emit(state,message='') {this.state=state;this.message=message;this.onChange({station:this.station,state,message});}
  dispose(){
    this.generation++;clearTimeout(this.timer);this.timer=null;
    if(this.audio){const old=this.audio;this.audio=null;old.pause();old.removeAttribute('src');old.load();}
    if(this.hls){this.hls.destroy();this.hls=null;}
  }
  pause(){if(!this.station)return;this.dispose();this.emit('paused','已暂停 · 再次播放将回到直播');}
  setVolume(value){if(!Number.isFinite(value))return;this.volume=Math.max(0,Math.min(1,value));if(this.audio)this.audio.volume=this.volume;}
  toggle(station=this.station){
    if(!station?.stream)return;
    if(this.station?.id===station.id&&['loading','playing','buffering'].includes(this.state)){this.pause();return;}
    this.play(station);
  }
  play(station){
    if(!station?.stream)return;
    this.dispose();this.station=station;
    const generation=this.generation, audio=this.createAudio();this.audio=audio;
    audio.preload='none';audio.volume=this.volume;
    const current=()=>generation===this.generation&&this.audio===audio;
    const fail=(error)=>{
      if(!current())return;
      this.dispose();
      this.emit('error',error?.name==='NotAllowedError'?'浏览器暂停了自动播放，请再次点击播放。':'暂时无法播放，可能是版权地域限制。也可稍后重试或切换电台。');
    };
    const armTimeout=()=>{if(!this.timer)this.timer=setTimeout(()=>fail(),this.timeout);};
    const start=()=>{if(!current())return;try{Promise.resolve(audio.play()).catch(fail);}catch(error){fail(error);}};
    audio.addEventListener('playing',()=>{if(current()){clearTimeout(this.timer);this.timer=null;this.emit('playing',`${station.country} · ${station.city} · 正在直播`);}});
    const waiting=()=>{if(current()){this.emit('buffering','正在缓冲，请稍候…');armTimeout();}};
    audio.addEventListener('waiting',waiting);audio.addEventListener('stalled',waiting);
    audio.addEventListener('error',()=>fail());audio.addEventListener('ended',()=>fail());
    audio.addEventListener('pause',()=>{if(current()&&this.state==='playing')this.pause();});
    this.emit('loading','正在连接音乐现场…');armTimeout();
    const isHls=station.type==='hls'||/\.m3u8(?:[?#]|$)/i.test(station.stream);
    if(!isHls){audio.src=station.stream;start();return;}
    const Hls=this.getHls();
    if(!Hls?.isSupported()){
      if(audio.canPlayType('application/vnd.apple.mpegurl')){audio.src=station.stream;start();return;}
      fail();return;
    }
    try{
      this.hls=new Hls({enableWorker:true,maxBufferLength:20,backBufferLength:15});
      this.hls.on(Hls.Events.MANIFEST_PARSED,start);
      this.hls.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal)fail();});
      this.hls.loadSource(station.stream);this.hls.attachMedia(audio);
    }catch(error){fail(error);}
  }
}
