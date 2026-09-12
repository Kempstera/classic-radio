import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {stations} from '../public/stations.js';
assert.equal(new Set(stations.map(s=>s.id)).size,stations.length);
assert.equal(stations.length,16);
for(const s of stations){for(const k of ['name','country','city','description','source'])assert.ok(s[k],`${s.id}: missing ${k}`);assert.ok(['uk','us','europe'].includes(s.region));assert.ok(s.stream===null||s.stream.startsWith('https://'));}
for(const f of readdirSync('public').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',`public/${f}`]);
for(const f of ['index.html','sources.html']){const html=readFileSync(`public/${f}`,'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const url=m[1];if(url==='./'||/^(https?:|data:)/.test(url))continue;assert.ok(existsSync(`public/${url}`),`${f}: missing ${url}`);}}
console.log(`Static checks passed: ${stations.length} stations, ${stations.filter(s=>s.stream).length} configured streams, all local assets resolve.`);
