/* 直播源核验记录 —— 双语（中 / EN）
   语言键沿用 classic-radio-lang，与聆听室首页保持一致。 */
import {stations} from './stations.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const I18N = {
  zh: {
    title: '直播源核验记录 · 颂 Classic Radio',
    brandSub: '世界古典音乐电台',
    home: '← 返回主页面',
    room: '← 返回聆听室',
    eyebrow: 'SOURCES & NOTES',
    h1: '每段旋律，<br>都有来处。',
    p1: '核验日期：2026 年 9 月 12 日。直播源直接连接电台或其广播服务商，不经本站转播。',
    p2: 'HTTP 成功与音频数据检查只代表核验时的网络结果，不保证所有地区、节目及浏览器均可播放。缺少可验证直链的电台保留官网入口。',
    footR: '把时间，交还给音乐。',
    official: '官方收听页面 ↗',
    stream: s => `直播地址：${s}`,
    noStream: '暂时缺少直播源'
  },
  en: {
    title: 'Sources & Verification · Classic Radio',
    brandSub: 'Classical radio listening room',
    home: '← Home',
    room: '← Back to the listening room',
    eyebrow: 'SOURCES & NOTES',
    h1: 'Every melody<br>comes from somewhere.',
    p1: 'Verified 12 September 2026. Streams connect directly to each station or its broadcasting provider; nothing is relayed by this site.',
    p2: 'A successful HTTP and audio-data check reflects only the network conditions at the time of verification; it does not guarantee playback in every region, programme or browser. Stations without a verifiable direct link keep their official entry point.',
    footR: 'Give the time back to music.',
    official: 'Official listening page ↗',
    stream: s => `Stream: ${s}`,
    noStream: 'No stream available yet'
  }
};

let lang = 'zh';
try { const s = localStorage.getItem('classic-radio-lang'); if (s === 'en' || s === 'zh') lang = s; } catch {}
const T = () => I18N[lang];

const fNote = s => (lang === 'zh' ? s.verificationNote : (s.verificationNoteEn || s.verificationNote));

/* ---------- 静态文案 ---------- */
function applyStatic() {
  const t = T();
  document.title = t.title;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  const set = (sel, v) => { const el = $(sel); if (el) el.innerHTML = v; };
  set('#brand-sub', t.brandSub);
  set('#nav-home', t.home);
  set('#nav-room', t.room);
  set('#src-eyebrow', t.eyebrow);
  set('#src-h1', t.h1);
  set('#src-p1', t.p1);
  set('#src-p2', t.p2);
  set('#foot-r', t.footR);
  document.querySelectorAll('#lang button').forEach(b => {
    const on = b.dataset.l === lang;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

/* ---------- 核验列表 ---------- */
function render() {
  const t = T();
  const list = $('#sources');
  list.innerHTML = '';
  for (const s of stations) {
    const li = document.createElement('li');
    const title = document.createElement('h2');
    title.textContent = s.name;
    const note = document.createElement('p');
    note.textContent = fNote(s) || '';
    const link = document.createElement('a');
    link.href = s.source;
    link.textContent = t.official;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const address = document.createElement('p');
    address.textContent = s.stream ? t.stream(s.stream) : t.noStream;
    li.append(title, note, link, address);
    list.append(li);
  }
}

function applyLang(l) {
  lang = l === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('classic-radio-lang', lang); } catch {}
  applyStatic();
  render();
}

document.querySelectorAll('#lang button').forEach(b => {
  b.addEventListener('click', () => applyLang(b.dataset.l));
});

applyLang(lang);
