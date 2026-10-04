import {validateSave} from '../src/save-validation.js';
export async function mockCloud(context){
 let row=null,history=[],lost=false;const ops=new Set();const uid='00000000-0000-4000-8000-000000000001';
 const user={id:uid,aud:'authenticated',role:'authenticated',email:'parent@example.test',created_at:new Date().toISOString()};
 const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const token=`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.test`;
 await context.route('**/auth/v1/**',async route=>{const path=new URL(route.request().url()).pathname;await route.fulfill({contentType:'application/json',body:JSON.stringify(path.endsWith('/user')?user:path.endsWith('/logout')?{}:{access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user})});});
 await context.route('**/rest/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let data=row,status=200;
  if(path.endsWith('/game_save_history'))data=history;
  if(path.endsWith('/rpc/commit_game_save')){
   const p=req.postDataJSON();
   if(!ops.has(p.p_operation_id)){
    if((row?.revision||0)!==p.p_expected_revision){status=409;data={code:'PT409',message:'Revision conflict'};}
    else{row={state:validateSave(p.p_state),revision:(row?.revision||0)+1,updated_at:new Date().toISOString()};history=[structuredClone(row),...history].slice(0,20);ops.add(p.p_operation_id);data=row;}
   }
   if(lost){lost=false;await route.abort();return;}
  }
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 return {get row(){return row;},loseNext(){lost=true;},get history(){return history;}, advance(fn){const next=structuredClone(row.state);fn(next);row={...row,state:validateSave(next),revision:row.revision+1};history=[structuredClone(row),...history].slice(0,20);}};
}
export async function login(page){
 await page.locator('[data-action="settings"]').click();
 await page.locator('#cloud-email').fill('parent@example.test');await page.locator('#cloud-password').fill('test-only-password');
 await page.locator('#login-form button').click();await page.locator('#new-save').waitFor();
 await page.locator('#new-save').click();await page.locator('#replace-confirm').check();await page.locator('#replace-form button').click();await page.locator('.modal').waitFor({state:'hidden'});
}
