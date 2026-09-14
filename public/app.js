import {stations} from './stations.js';
import {RadioPlayer} from './player.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- i18n ---------------- */
const I18N = {
  zh: {
    home: '← 返回主页面',
    more: '更多古典电台 · 全集 ↗',
    brandSub: '世界古典音乐电台',
    about: '聆听须知',
    heroEyebrow: 'A LITTLE STILLNESS, A WORLD OF MUSIC',
    heroH1: '让世界慢下来，<br>听一曲<span>古典。</span>',
    heroP: '从伦敦的清晨，到维也纳的夜晚。<br>让远方的音乐厅，成为此刻的陪伴。',
    heroBrowse: '探索电台 <span>↓</span>',
    mbH: '想听得更多？',
    mbP: '这里有 16 座精选电台。我们还整理了 390+ 座来自世界各地的古典音乐电台，按地区分列，每一座都附有简介。',
    mbA: '查看古典电台全集 ↗',
    colEyebrow: 'THE RADIO COLLECTION',
    colTitle: '穿越时区的乐章',
    emptyH: '还没有找到这段旋律',
    emptyP: '试试其他电台名、城市或国家。',
    reset: '查看全部电台',
    notesH: '关于这间小小的聆听室',
    notesP1: '这里汇集电台官方直播流，节目与音乐版权归各电台及权利人所有。点击卡片即可收听；部分节目可能受所在地区、网络或电台政策限制。',
    notesP2: '直播不是点播，邂逅下一首，也是收听的乐趣。',
    notesSrc: '查看直播源与核验记录 ↗',
    footR: '把时间，交还给音乐。',
    volLabel: '音量',
    playerEnd: 'LIVE RADIO<br><small>随时，为你奏响</small>',
    pkKick: 'NOW LISTENING',
    nowIdle: '此刻，留一点空白',
    statusIdle: '选择一座城市，开启一段旋律',
    searchPh: '搜索电台、城市或国家',
    filters: {all:'全部电台', uk:'英国', us:'美国', europe:'欧洲'},
    live: '直播电台',
    noStream: '暂时缺少直播源',
    count: (n,c) => `${n} 座电台 · ${c} 个国家`,
    groupName: {uk:'英国', us:'美国', europe:'欧洲'},
    playing: '正在播放 · LIVE',
    loading: '正在连接…',
    buffering: '正在缓冲…',
    paused: '已暂停',
    error: '播放未成功 · 点击重试'
  },
  en: {
    home: '← Home',
    more: 'More classical stations ↗',
    brandSub: 'Classical radio listening room',
    about: 'Listening notes',
    heroEyebrow: 'A LITTLE STILLNESS, A WORLD OF MUSIC',
    heroH1: 'Let the world slow down,<br>and hear some <span>classical.</span>',
    heroP: 'From a London morning to a Vienna night —<br>let a distant concert hall keep you company.',
    heroBrowse: 'Explore stations <span>↓</span>',
    mbH: 'Want to hear more?',
    mbP: 'That is 16 selected stations. We have also gathered 390+ classical stations from around the world, grouped by region, each with a short note.',
    mbA: 'See the full collection ↗',
    colEyebrow: 'THE RADIO COLLECTION',
    colTitle: 'Movements across time zones',
    emptyH: 'That melody is not here yet',
    emptyP: 'Try another station name, city or country.',
    reset: 'Show all stations',
    notesH: 'About this little listening room',
    notesP1: 'This page gathers the official live streams of each station; programme and music rights belong to the stations and rights holders. Tap a card to listen — some programmes may be restricted by region, network or station policy.',
    notesP2: 'Live is not on demand; meeting the next piece is part of the pleasure.',
    notesSrc: 'Sources & verification notes ↗',
    footR: 'Give the time back to music.',
    volLabel: 'Volume',
    playerEnd: 'LIVE RADIO<br><small>Always playing for you</small>',
    pkKick: 'NOW LISTENING',
    nowIdle: 'A little silence for now',
    statusIdle: 'Pick a city and begin a melody',
    searchPh: 'Search station, city or country',
    filters: {all:'All stations', uk:'United Kingdom', us:'United States', europe:'Europe'},
    live: 'Live radio',
    noStream: 'No stream available yet',
    count: (n,c) => `${n} stations · ${c} countries`,
    groupName: {uk:'United Kingdom', us:'United States', europe:'Europe'},
    playing: 'Now playing · LIVE',
    loading: 'Connecting…',
    buffering: 'Buffering…',
    paused: 'Paused',
    error: 'Playback failed · tap to retry'
  }
};
let lang = 'zh';
try { const s = localStorage.getItem('classic-radio-lang'); if (s === 'en' || s === 'zh') lang = s; } catch {}
const T = () => I18N[lang];

const labels = ['uk', 'us', 'europe'];
let region = 'all', query = '';
const player = new RadioPlayer({onChange: updatePlayer});

/* 按语言取字段 */
const fName = s => s.name;
const fDesc = s => (lang === 'zh' ? s.description : (s.descriptionEn || s.description));
const fCountry = s => (lang === 'zh' ? s.country : (s.countryEn || s.country));
const fCity = s => (lang === 'zh' ? s.city : (s.cityEn || s.city));

function card(s) {
  return `<article class="card ${s.stream?'':'unavailable'}" data-id="${esc(s.id)}">
    <div class="card-top"><div class="monogram" aria-hidden="true">${esc(s.monogram)}</div>
    <span class="card-index">NO. ${String(stations.indexOf(s)+1).padStart(2,'0')}</span></div>
    <h3>${esc(fName(s))}</h3>
    <div class="location">${esc(fCountry(s))} · ${esc(fCity(s))}</div>
    <p class="description">${esc(fDesc(s))}</p>
    <div class="card-bottom"><span class="card-status">${s.stream?T().live:T().noStream}</span>
    <button class="play" ${s.stream?'':'disabled'} aria-label="${esc(fName(s))}" aria-pressed="false">▶</button></div>
    ${s.stream?'':`<a class="official" href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">${lang==='zh'?'前往电台官网':'Official site'} ↗</a>`}
  </article>`;
}

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function render() {
  const found = stations.filter(s =>
    (region === 'all' || region === s.region) &&
    normalize([s.name, s.country, s.city, s.countryEn || '', s.cityEn || '',
               s.description, s.descriptionEn || '', s.aliases || ''].join(' '))
      .includes(normalize(query.trim())));

  $('#station-count').textContent = T().count(found.length, new Set(found.map(s => fCountry(s))).size);

  $('#stations').innerHTML = labels.map(id => {
    const group = found.filter(s => s.region === id);
    if (!group.length) return '';
    const content = id === 'europe'
      ? [...new Set(group.map(s => fCountry(s)))].map(country =>
          `<h4 class="country-heading">${esc(country)}</h4><div class="grid">${
            group.filter(s => fCountry(s) === country).map(card).join('')}</div>`).join('')
      : `<div class="grid">${group.map(card).join('')}</div>`;
    return `<section class="group" aria-label="${esc(T().groupName[id])}"><h3 class="group-heading">${
      esc(T().groupName[id])}</h3>${content}</section>`;
  }).join('');

  $('#empty').hidden = found.length > 0;
  updateCards();
}

function updateCards() {
  document.querySelectorAll('.card').forEach(el => {
    const selected = el.dataset.id === player.station?.id;
    const engaged = selected && ['playing','loading','buffering'].includes(player.state);
    el.classList.toggle('active', selected);
    const button = el.querySelector('.play');
    const station = stations.find(s => s.id === el.dataset.id);
    if (!station) return;
    button.textContent = engaged ? 'Ⅱ' : '▶';
    button.setAttribute('aria-pressed', String(engaged));
    button.setAttribute('aria-label', `${engaged?(lang==='zh'?'暂停':'Pause'):(lang==='zh'?'播放':'Play')} ${fName(station)}`);
    el.querySelector('.card-status').textContent = selected
      ? ({playing:T().playing, loading:T().loading, buffering:T().buffering, paused:T().paused, error:T().error}[player.state] || '')
      : station.stream ? T().live : T().noStream;
  });
}

function updatePlayer({station, state, message}) {
  $('#now-name').textContent = station ? fName(station) : T().nowIdle;
  $('#status').textContent = message;
  const engaged = ['playing','loading','buffering'].includes(state);
  $('#main-play').disabled = !station?.stream;
  $('#main-play').textContent = engaged ? 'Ⅱ' : '▶';
  $('#main-play').setAttribute('aria-label', `${engaged?(lang==='zh'?'暂停':'Pause'):(lang==='zh'?'播放':'Play')} ${station?fName(station):''}`);
  $('#live-badge').hidden = state !== 'playing';
  updateCards();
  if ('mediaSession' in navigator) {
    if (station && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: fName(station),
        artist: `${fCountry(station)} · ${fCity(station)}`,
        album: '颂 · Classic Radio'
      });
    }
    navigator.mediaSession.playbackState = state === 'playing' ? 'playing' : 'paused';
  }
}

/* ---------------- 语言应用 ---------------- */
function applyLang() {
  const t = T();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = lang === 'zh' ? '颂 · Classic Radio | 世界古典音乐电台'
                                 : '颂 · Classic Radio | A classical listening room';

  $('#nav-home').textContent = t.home;
  $('#nav-more').textContent = t.more;
  $('#brand-sub').textContent = t.brandSub;
  $('#about-link').innerHTML = `${t.about} <span>↗</span>`;
  $('#hero-eyebrow').textContent = t.heroEyebrow;
  $('#hero-h1').innerHTML = t.heroH1;
  $('#hero-p').innerHTML = t.heroP;
  $('#hero-browse').innerHTML = t.heroBrowse;
  $('#mb-h').textContent = t.mbH;
  $('#mb-p').textContent = t.mbP;
  $('#mb-a').textContent = t.mbA;
  $('#col-eyebrow').textContent = t.colEyebrow;
  $('#collection-title').textContent = t.colTitle;
  $('#empty-h').textContent = t.emptyH;
  $('#empty-p').textContent = t.emptyP;
  $('#reset').textContent = t.reset;
  $('#notes-h').textContent = t.notesH;
  $('#notes-p1').textContent = t.notesP1;
  $('#notes-p2').textContent = t.notesP2;
  $('#notes-src').textContent = t.notesSrc;
  $('#foot-r').textContent = t.footR;
  $('#vol-label').textContent = t.volLabel;
  $('#player-end').innerHTML = t.playerEnd;
  $('#pk-kick').textContent = t.pkKick;
  $('#search').placeholder = t.searchPh;
  $('#search').setAttribute('aria-label', t.searchPh);

  document.querySelectorAll('#region-filters button').forEach(b => {
    b.textContent = t.filters[b.dataset.region] || b.textContent;
  });
  document.querySelectorAll('#lang button').forEach(b => {
    const on = b.dataset.l === lang;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });

  if (!player.station) {
    $('#now-name').textContent = t.nowIdle;
    $('#status').textContent = t.statusIdle;
  } else {
    $('#now-name').textContent = fName(player.station);
    updatePlayer({station: player.station, state: player.state,
                  message: player.message || t.statusIdle});
  }
  render();
}

/* ---------------- events ---------------- */
$('#stations').addEventListener('click', e => {
  if (e.target.closest('a')) return;
  const c = e.target.closest('.card');
  if (c) player.toggle(stations.find(s => s.id === c.dataset.id));
});
$('#region-filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  region = b.dataset.region;
  document.querySelectorAll('[data-region]').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
  render();
});
$('#search').addEventListener('input', e => { query = e.target.value; render(); });
$('#reset').addEventListener('click', () => {
  query = ''; region = 'all'; $('#search').value = '';
  document.querySelectorAll('#region-filters [data-region]').forEach(el => {
    el.textContent = T().filters[el.dataset.region];
    el.setAttribute('aria-pressed', String(el.dataset.region === 'all'));
  });
  render(); $('#search').focus();
});
$('#main-play').addEventListener('click', () => player.toggle());

$('#lang').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.dataset.l === lang) return;
  lang = b.dataset.l;
  try { localStorage.setItem('classic-radio-lang', lang); } catch {}
  applyLang();
});

try { const saved = localStorage.getItem('classic-radio-volume'); if (saved !== null && Number.isFinite(Number(saved))) player.setVolume(Number(saved)); } catch {}
$('#volume').value = player.volume;
$('#volume').addEventListener('input', e => {
  player.setVolume(Number(e.target.value));
  try { localStorage.setItem('classic-radio-volume', String(player.volume)); } catch {}
});
if ('mediaSession' in navigator) {
  for (const [action, fn] of Object.entries({
    play: () => player.station && player.play(player.station),
    pause: () => player.pause(),
    stop: () => player.pause()
  })) {
    try { navigator.mediaSession.setActionHandler(action, fn); } catch {}
  }
}
window.addEventListener('pagehide', () => player.pause());

applyLang();

// Optional browser standard: expose the same visible search, without autoplay.
if (document.modelContext?.registerTool) {
  const life = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'filter_radio_stations',
      description: '按电台、城市或国家筛选可见电台列表。',
      inputSchema: {type:'object', properties:{query:{type:'string'}}, required:['query'], additionalProperties:false},
      annotations: {readOnlyHint:false},
      execute(input) {
        if (typeof input?.query !== 'string' || input.query.length > 200) throw new Error('query must be a string of at most 200 characters');
        query = input.query; $('#search').value = query; render();
        return {visibleStations: [...document.querySelectorAll('.card h3')].map(el => el.textContent)};
      }
    }, {signal: life.signal})).catch(() => {});
  } catch {}
  window.addEventListener('pagehide', () => life.abort(), {once:true});
}
