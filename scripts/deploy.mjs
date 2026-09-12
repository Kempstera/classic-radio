// Node 22+. The token is read from the process environment and is never logged.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const project='classic-radio',zoneName='signupeverywhere.cc',domain='classicradio.signupeverywhere.cc';
const token=process.env.CLOUDFLARE_API_TOKEN;
if(!token){console.error('部署中止：当前进程未收到 CLOUDFLARE_API_TOKEN。请在已 export 令牌的同一终端运行 npm run deploy。');process.exit(1);}
async function api(path,method='GET',body){
 const response=await fetch(`https://api.cloudflare.com/client/v4${path}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 const data=await response.json();if(!response.ok||!data.success)throw new Error(`Cloudflare ${method} ${path}: HTTP ${response.status} ${JSON.stringify(data.errors)}`);return data.result;
}
function wrangler(args,account){execFileSync('npx',['--yes','wrangler@4.131.1',...args],{stdio:'inherit',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:account,CI:'true'},timeout:180000});}
try{
 execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});
 const zones=await api(`/zones?name=${zoneName}`);if(zones.length!==1)throw new Error(`未找到唯一域名 ${zoneName}，请检查令牌的 Zone Read 权限。`);
 const zone=zones[0],account=zone.account.id,base=`/accounts/${account}/pages/projects/${project}`;
 if(process.env.CLOUDFLARE_ACCOUNT_ID&&process.env.CLOUDFLARE_ACCOUNT_ID!==account)throw new Error('CLOUDFLARE_ACCOUNT_ID 与域名所属账号不一致，已中止。');
 const projects=await api(`/accounts/${account}/pages/projects`);
 if(!projects.some(p=>p.name===project))wrangler(['pages','project','create',project,'--production-branch','main'],account);
 wrangler(['pages','deploy','public','--project-name',project,'--branch','main'],account);
 const result=await api(base),deployment=result.canonical_deployment;
 if(deployment?.latest_stage?.status!=='success')throw new Error('部署尚未报告 success，请查看 Pages 部署日志。');
 console.log(`部署地址：https://${result.subdomain}`);
 const records=await api(`/zones/${zone.id}/dns_records?name=${domain}`);
 if(records.some(r=>r.type!=='CNAME'||r.content.replace(/\.$/,'')!==result.subdomain))throw new Error(`${domain} 已有指向其他目标的 DNS 记录，未覆盖。`);
 const domains=await api(`${base}/domains`);
 if(!domains.some(d=>d.name===domain))await api(`${base}/domains`,'POST',{name:domain});
 // API association may not create DNS automatically. Check before creating it.
 const after=await api(`/zones/${zone.id}/dns_records?name=${domain}`);
 if(!after.length)await api(`/zones/${zone.id}/dns_records`,'POST',{type:'CNAME',name:domain,content:result.subdomain,proxied:true,ttl:1});
 let status;
 for(let attempt=0;attempt<12;attempt++){
  status=await api(`${base}/domains/${domain}`);
  if(status.status==='active')break;
  if(attempt%3===0)console.log(`域名状态：${status.status}，正在等待证书和 DNS 验证…`);
  await new Promise(r=>setTimeout(r,10000));
 }
 console.log(`自定义域名：https://${domain}；Cloudflare 状态：${status.status}`);
 if(status.status==='active'){
  const response=await fetch(`https://${domain}`,{signal:AbortSignal.timeout(20000)});
  const html=await response.text();if(!response.ok||!html.includes('世界古典音乐电台'))throw new Error(`域名已激活，但网页验证未通过，HTTP ${response.status}`);
  console.log('完成：自定义域名 HTTPS 页面验证通过。');
 }else{console.log('部署已完成，域名仍待验证。请在 Cloudflare → Workers & Pages → classic-radio → Custom domains 检查状态；若长时间不变，检查 DNS CNAME 与 CAA。');process.exitCode=2;}
}catch(error){console.error(error.message);process.exitCode=1;}
