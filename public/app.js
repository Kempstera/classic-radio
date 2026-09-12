import {stations} from './stations.js';
import {RadioPlayer} from './player.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={uk:['英国','UNITED KINGDOM'],us:['美国','UNITED STATES'],europe:['欧洲','EUROPE']};
let region='all',query='';
const player=new RadioPlayer({onChange:updatePlayer});
function card(s){return `<article class="card ${s.stream?'':'unavailable'}" data-id="${esc(s.id)}"><div class="card-top"><div class="monogram" aria-hidden="true">${esc(s.monogram)}</div><span class="card-index">NO. ${String(stations.indexOf(s)+1).padStart(2,'0')}</span></div><h3>${esc(s.name)}</h3><div class="location">${esc(s.country)} · ${esc(s.city)}</div><p class="description">${esc(s.description)}</p><div class="card-bottom"><span class="card-status">${s.stream?'直播电台':'暂时缺少直播源'}</span><button class="play" ${s.stream?'':'disabled'} aria-label="播放 ${esc(s.name)}" aria-pressed="false">▶</button></div>${s.stream?'':`<a class="official" href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">前往电台官网 ↗</a>`}</article>`;}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function render(){
 const found=stations.filter(s=>(region==='all'||region===s.region)&&normalize([s.name,s.country,s.city,s.description,s.aliases||''].join(' ')).includes(normalize(query.trim())));
 $('#station-count').textContent=`${found.length} 座电台 · ${new Set(found.map(s=>s.country)).size} 个国家`;
 $('#stations').innerHTML=Object.entries(labels).map(([id,[name,en]])=>{
  const group=found.filter(s=>s.region===id);if(!group.length)return '';
  const content=id==='europe'?[...new Set(group.map(s=>s.country))].map(country=>`<h4 class="country-heading">${esc(country)}</h4><div class="grid">${group.filter(s=>s.country===country).map(card).join('')}</div>`).join(''):`<div class="grid">${group.map(card).join('')}</div>`;
  return `<section class="group" aria-label="${name}电台"><h3 class="group-heading">${name}<span>${en}</span></h3>${content}</section>`;
 }).join('');
 $('#empty').hidden=found.length>0;updateCards();
}
function updateCards(){
 document.querySelectorAll('.card').forEach(el=>{
  const selected=el.dataset.id===player.station?.id,engaged=selected&&['playing','loading','buffering'].includes(player.state);
  el.classList.toggle('active',selected);const button=el.querySelector('.play');
  const station=stations.find(s=>s.id===el.dataset.id);
  button.textContent=engaged?'Ⅱ':'▶';button.setAttribute('aria-pressed',String(engaged));button.setAttribute('aria-label',`${engaged?'暂停':'播放'} ${station.name}`);
  el.querySelector('.card-status').textContent=selected?({playing:'正在播放 · LIVE',loading:'正在连接…',buffering:'正在缓冲…',paused:'已暂停',error:'播放未成功 · 点击重试'}[player.state]):station.stream?'直播电台':'暂时缺少直播源';
 });
}
function updatePlayer({station,state,message}){
 $('#now-name').textContent=station?.name||'此刻，留一点空白';$('#status').textContent=message;
 const engaged=['playing','loading','buffering'].includes(state);
 $('#main-play').disabled=!station?.stream;$('#main-play').textContent=engaged?'Ⅱ':'▶';$('#main-play').setAttribute('aria-label',`${engaged?'暂停':'播放'} ${station?.name||'电台'}`);
 $('#live-badge').hidden=state!=='playing';updateCards();
 if('mediaSession' in navigator){
  if(station&&'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:station.name,artist:`${station.country} · ${station.city}`,album:'颂 · Classic Radio'});
  navigator.mediaSession.playbackState=state==='playing'?'playing':'paused';
 }
}
$('#stations').addEventListener('click',e=>{if(e.target.closest('a'))return;const c=e.target.closest('.card');if(c)player.toggle(stations.find(s=>s.id===c.dataset.id));});
$('.region-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;region=b.dataset.region;document.querySelectorAll('[data-region]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render();});
$('#search').addEventListener('input',e=>{query=e.target.value;render();});
$('#reset').addEventListener('click',()=>{query='';region='all';$('#search').value='';document.querySelectorAll('[data-region]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.region==='all')));render();$('#search').focus();});
$('#main-play').addEventListener('click',()=>player.toggle());
try{const saved=localStorage.getItem('classic-radio-volume');if(saved!==null&&Number.isFinite(Number(saved)))player.setVolume(Number(saved));}catch{}
$('#volume').value=player.volume;
$('#volume').addEventListener('input',e=>{player.setVolume(Number(e.target.value));try{localStorage.setItem('classic-radio-volume',String(player.volume));}catch{}});
if('mediaSession' in navigator){for(const [action,fn] of Object.entries({play:()=>player.station&&player.play(player.station),pause:()=>player.pause(),stop:()=>player.pause()})){try{navigator.mediaSession.setActionHandler(action,fn);}catch{}}}
window.addEventListener('pagehide',()=>player.pause());
render();
// Optional browser standard: expose the same visible search, without autoplay.
if(document.modelContext?.registerTool){const life=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'filter_radio_stations',description:'按电台、城市或国家筛选可见电台列表。',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(typeof input?.query!=='string'||input.query.length>200)throw new Error('query must be a string of at most 200 characters');query=input.query;$('#search').value=query;render();return {visibleStations:[...document.querySelectorAll('.card h3')].map(el=>el.textContent)};}},{signal:life.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>life.abort(),{once:true});}
