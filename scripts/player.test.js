import test from 'node:test';
import assert from 'node:assert/strict';
import {RadioPlayer} from '../public/player.js';
class FakeAudio extends EventTarget {
 play(){this.played=true;return this.reject?Promise.reject(this.reject):Promise.resolve();}
 pause(){this.paused=true;}
 load(){this.reset=true;}
 removeAttribute(name){delete this[name];}
 canPlayType(){return '';}
}
const a={id:'a',stream:'https://example.test/a.mp3',country:'A',city:'A'},b={...a,id:'b'};
function setup(extra={}){const audios=[];return {audios,p:new RadioPlayer({createAudio:()=>{const a=new FakeAudio();audios.push(a);return a;},...extra})};}
test('switching stops previous audio and ignores its late error and play events',()=>{const{p,audios}=setup();p.play(a);p.play(b);assert.equal(audios[0].paused,true);assert.equal(audios[0].src,undefined);audios[0].dispatchEvent(new Event('playing'));audios[0].dispatchEvent(new Event('error'));assert.equal(p.state,'loading');assert.equal(p.station.id,'b');audios[1].dispatchEvent(new Event('playing'));assert.equal(p.state,'playing');p.pause();});
test('pause while connecting cancels playback and retry starts a fresh live session',()=>{const{p,audios}=setup();p.toggle(a);p.toggle(a);assert.equal(p.state,'paused');audios[0].dispatchEvent(new Event('playing'));assert.equal(p.state,'paused');p.toggle(a);assert.equal(audios.length,2);p.pause();});
test('unavailable station does not interrupt current audio',()=>{const{p}=setup();p.play(a);p.toggle({...b,stream:null});assert.equal(p.station.id,'a');p.pause();});
test('network error releases audio and permits retry',()=>{const{p,audios}=setup();p.play(a);audios[0].dispatchEvent(new Event('error'));assert.equal(p.state,'error');assert.match(p.message,/版权地域限制/);assert.equal(p.audio,null);p.toggle(a);assert.equal(p.state,'loading');p.pause();});
test('connection timeout cannot leave an infinite loading state',async()=>{const{p}=setup({timeout:8});p.play(a);await new Promise(r=>setTimeout(r,20));assert.equal(p.state,'error');assert.equal(p.audio,null);});
test('autoplay refusal yields a retry prompt and is handled',async()=>{const p=new RadioPlayer({createAudio:()=>{const a=new FakeAudio();a.reject={name:'NotAllowedError'};return a;}});p.play(a);await Promise.resolve();await Promise.resolve();assert.equal(p.state,'error');assert.match(p.message,/再次点击/);});
test('HLS is destroyed on switch and fatal errors fail gracefully',()=>{class FakeHls{static Events={MANIFEST_PARSED:'manifest',ERROR:'error'};static isSupported(){return true;}constructor(){this.handlers={};}on(e,fn){this.handlers[e]=fn;}loadSource(s){this.source=s;}attachMedia(a){this.audio=a;}destroy(){this.destroyed=true;}}
const{p}=setup({getHls:()=>FakeHls});p.play({...a,type:'hls'});const old=p.hls;p.play(b);assert.equal(old.destroyed,true);old.handlers.error(null,{fatal:true});assert.equal(p.state,'loading');p.play({...a,type:'hls'});p.hls.handlers.error(null,{fatal:true});assert.equal(p.state,'error');assert.equal(p.hls,null);});
test('unavailable HLS library does not crash MP3 playback',()=>{const{p}=setup({getHls:()=>undefined});p.play({...a,type:'hls'});assert.equal(p.state,'error');p.play(b);assert.equal(p.state,'loading');p.setVolume(.3);assert.equal(p.audio.volume,.3);p.pause();});
