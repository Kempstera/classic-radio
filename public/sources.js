import {stations} from './stations.js';
const list=document.querySelector('#sources');
for(const s of stations){const li=document.createElement('li'),title=document.createElement('h2'),note=document.createElement('p'),link=document.createElement('a'),address=document.createElement('p');title.textContent=s.name;note.textContent=s.verificationNote;link.href=s.source;link.textContent='官方收听页面 ↗';link.target='_blank';link.rel='noopener noreferrer';address.textContent=s.stream?`直播地址：${s.stream}`:'暂时缺少直播源';li.append(title,note,link,address);list.append(li);}
