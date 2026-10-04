import {fresh} from './game.js';
import {backupText,parseBackup,validateSave} from './save-validation.js';
import {verifyParent} from './parent.js';
export function createSettings({store,client,showModal,closeModal,toast,esc}){
 const $=s=>document.querySelector(s);
 const summary=s=>`${s.pets.length} 位宠物 · ${s.lessons.length} 课 · ${s.stars} 星星`;
 function download(s){const url=URL.createObjectURL(new Blob([backupText(s)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`magic-pets-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function run(fn){try{await fn();}catch(e){toast(e.message);}}
 function confirmReplace(next,label,{initial=false}={}){
  const revision=store.row?.revision||0,user=store.user?.id;
  showModal(`<h2 id="modal-title">${label}</h2><p>将使用：${summary(next)}</p><p>当前：${summary(store.state)}</p><p>确认后生成新版本，当前云存档保留在历史记录中。</p><form id="replace-form">${store.state.parentAuth?'<label for="restore-pin">家长数字密码</label><input id="restore-pin" type="password" inputmode="numeric" required autocomplete="off">':''}<label class="confirm-check"><input id="replace-confirm" type="checkbox" required>我确认使用这份进度</label><button class="primary" type="submit">确认${label}</button></form>`);
  $('#replace-form').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;const pin=$('#restore-pin')?.value;
   await run(async()=>{
    if(store.user?.id!==user||(store.row?.revision||0)!==revision)throw Error('进度已更新，请重新打开确认。');
    let failure;
    await store.change(async s=>{
     if(s.parentAuth){try{await verifyParent(s.parentAuth,pin);}catch(e){failure=e;return;}}
     for(const k of Object.keys(s))delete s[k];Object.assign(s,validateSave(next));
    },{initial});
    if(failure)throw failure;
    closeModal();toast('云存档已更新。');
   });button.disabled=false;
  };
 }
 async function history(){await run(async()=>{const user=store.user.id;const rows=await store.history();if(user!==store.user?.id)return;
  showModal(`<h2 id="modal-title">历史存档</h2><p>保留最近 20 个版本，恢复会生成新版本。</p><div class="history-list">${rows.map((r,i)=>`<button data-history="${i}" ${r.revision===store.row?.revision?'disabled':''}>版本 ${r.revision} · ${esc(new Date(r.updated_at).toLocaleString())}<small>${summary(r.state)}</small></button>`).join('')||'<p>暂无历史记录。</p>'}</div>`);
  document.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>confirmReplace(rows[Number(b.dataset.history)].state,'恢复存档'));
 });}
 function open(){
  showModal(`<h2 id="modal-title">家长设置</h2><p class="settings-status">${esc(store.status)}${store.cacheWarning?' · 本机缓存写入失败，请导出备份':''}</p>
  ${!client?'<p>云存档尚未配置。请按 README 设置 Supabase 项目地址和公开密钥；现在可以查看、导出原有记录。</p>':!store.user?`<p>使用家长邮箱和账号密码登录。数字密码仍用于确认学习奖励。</p><form id="login-form"><label for="cloud-email">邮箱</label><input id="cloud-email" type="email" autocomplete="username" required><label for="cloud-password">账号密码</label><input id="cloud-password" type="password" autocomplete="current-password" required><p id="login-error" role="alert"></p><button class="primary" type="submit">登录云存档</button></form><p>仅限家庭账号，无公开注册。忘记账号密码请在 Supabase 后台重设。</p>`:`<p>${esc(store.user.email||'家长账号')} · ${store.row?'版本 '+store.row.revision:'还没有云存档'}</p><div class="settings-actions"><button class="secondary" id="refresh-cloud">刷新云存档</button><button class="secondary" id="logout-cloud" ${store.busy?'disabled':''}>退出登录</button></div>${!store.row&&store.connected?`<div class="migration-card"><h3>开始云存档</h3>${store.legacy?`<p>原本机记录：${summary(store.legacy)}</p><button class="primary" id="migrate-save">迁移原本机记录</button>`:'<p>此网址没有旧记录，可从原网址导出后导入。</p>'}<button class="secondary" id="new-save">新建存档</button></div>`:''}`}
  <div class="settings-actions">${store.row?'<button class="secondary" id="export-save">导出当前存档</button>':''}${store.legacy?'<button class="secondary" id="export-legacy">导出原本机记录</button>':''}${store.user?`<button class="secondary" id="import-save" ${store.canWrite?'':'disabled'}>导入存档</button><button class="secondary" id="history-save" ${store.canWrite&&store.row?'':'disabled'}>历史恢复</button>`:''}</div><input id="import-file" type="file" accept=".json,application/json" hidden><p>断网时仅查看缓存，联网后才能修改。云存档会自动刷新。</p>`);
  const bind=(id,fn)=>{if($(id))$(id).onclick=()=>run(fn);};
  if($('#login-form'))$('#login-form').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;const email=$('#cloud-email').value.trim(),password=$('#cloud-password').value;
   try{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await store.setUser(data.user);open();}catch{$('#login-error').textContent='登录失败，请检查邮箱、密码或网络连接。';button.disabled=false;}
  };
  bind('#refresh-cloud',async()=>{await store.refresh();open();});
  bind('#logout-cloud',async()=>{if(store.busy)throw Error('请等本次操作完成。');if(store.pending)throw Error('还有一次保存结果待核对，请先刷新云存档。');const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;await store.setUser(null);open();});
  bind('#export-save',()=>download(store.state));bind('#export-legacy',()=>download(store.legacy));
  bind('#migrate-save',()=>confirmReplace(store.legacy,'迁移存档',{initial:true}));bind('#new-save',()=>confirmReplace(fresh(),'新建存档',{initial:true}));
  bind('#history-save',history);bind('#import-save',()=>$('#import-file').click());
  $('#import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;const user=store.user?.id;await run(async()=>{if(file.size>2000000)throw Error('文件超过 2 MB，无法导入。');const next=parseBackup(await file.text());if(user!==store.user?.id)throw Error('账号已变更。');confirmReplace(next,'导入存档',{initial:!store.row});});};
 }
 return open;
}
