import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT=9346, F='file:///Users/eremin/Library/CloudStorage/Dropbox/UT/website/site/index.html';
const OUT='/private/tmp/claude-501/-Users-eremin-Library-CloudStorage-Dropbox-UT-website/b11a7d55-685e-43ae-b794-4428b0ac7da0/scratchpad';
const ch=spawn(CHROME,['--headless=new','--disable-gpu',`--remote-debugging-port=${PORT}`,'--remote-allow-origins=*','--no-first-run','--user-data-dir=/tmp/cdp-hero','about:blank']);
const s=ms=>new Promise(r=>setTimeout(r,ms));let ver;
for(let i=0;i<40;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();break;}catch{await s(250);}}
const ws=new WebSocket(ver.webSocketDebuggerUrl);let id=0;const p=new Map();
const send=(m,pr={},se)=>new Promise(res=>{const _id=++id;p.set(_id,res);ws.send(JSON.stringify({id:_id,method:m,params:pr,sessionId:se}));});
await new Promise(r=>ws.addEventListener('open',r));
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id);}});
const {result:{targetId}}=await send('Target.createTarget',{url:'about:blank'});
const {result:{sessionId}}=await send('Target.attachToTarget',{targetId,flatten:true});
const S=(m,pr={})=>send(m,pr,sessionId);await S('Page.enable');
async function shot(w,h,mob,name){await S('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1.6,mobile:mob});await S('Page.navigate',{url:F});await s(900);
const {result:{result:m}}=await S('Runtime.evaluate',{expression:'JSON.stringify({sw:document.documentElement.scrollWidth,iw:innerWidth})',returnByValue:true});
const {result:{data}}=await S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(`${OUT}/${name}`,Buffer.from(data,'base64'));console.log(name,m.value);}
await shot(1220,900,false,'hero-desk.png');
await shot(390,900,true,'hero-mob.png');
ws.close();ch.kill();process.exit(0);
