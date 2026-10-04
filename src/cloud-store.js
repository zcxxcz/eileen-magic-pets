import {fresh,KEY} from './game.js';
import {validateSave,parseBackup} from './save-validation.js';

// A cached snapshot is never an offline write queue. Only acknowledged snapshots are cached.
export class CloudStore {
 constructor({api=null,storage=globalThis.localStorage,online=()=>globalThis.navigator?.onLine!==false,onChange=()=>{},uuid=()=>crypto.randomUUID()}={}){
  Object.assign(this,{api,storage,online,onChange,uuid});this.user=null;this.row=null;this.state=fresh();this.busy=false;this.connected=false;this.epoch=0;this.pending=null;this.cacheWarning=false;
  this.status=api?'请家长登录':'尚未配置云存档';
  try{this.legacy=parseBackup(storage.getItem(KEY));if(!api)this.state=structuredClone(this.legacy);}catch{this.legacy=null;}
 }
 get canWrite(){return !!(this.api&&this.user&&this.connected&&this.online()&&!this.busy&&!this.pending);}
 emit(){this.onChange(this);}
 cacheKey(){return `eileen-cloud-v1:${this.user.id}`;}
 accept(row){this.row=row?{...row,state:validateSave(row.state)}:null;this.state=this.row?structuredClone(this.row.state):fresh();if(this.user){try{this.storage.setItem(this.cacheKey(),JSON.stringify(this.row));this.cacheWarning=false;}catch{this.cacheWarning=true;}}}
 async setUser(user){
  const previous=this.user?.id;if(previous===user?.id&&user){this.user=user;return this.refresh();}
  this.epoch++;this.user=user;this.row=null;this.pending=null;this.connected=false;this.busy=false;this.state=fresh();
  if(user){try{const cached=JSON.parse(this.storage.getItem(this.cacheKey()));if(cached){this.row={...cached,state:validateSave(cached.state)};this.state=structuredClone(this.row.state);}}catch{}this.status='正在连接云存档…';}
  else this.status=this.api?'请家长登录':'尚未配置云存档';
  this.emit();if(user)await this.refresh();
 }
 disconnected(){this.connected=false;this.status='连接不可用 · 仅查看缓存';this.emit();}
 async refresh(){
  if(!this.user||!this.api||this.busy)return;
  if(!this.online()){this.disconnected();return;}
  this.busy=true;const epoch=this.epoch;this.emit();
  try{
   // Resolve an uncertain submission with the SAME operation id before accepting new edits.
   if(this.pending)await this.api.commit(this.pending);
   const row=await this.api.read();if(epoch!==this.epoch)return;
   this.pending=null;this.accept(row);this.connected=true;this.status=row?'已同步到云端':'请选择迁移或新建存档';
  }catch(e){if(epoch!==this.epoch)return;
   if(e.code==='PT409'){this.pending=null;this.status='其他设备已更新，请刷新后重试';}else this.status='连接不可用 · 仅查看缓存';
   this.connected=false;
  }finally{if(epoch===this.epoch){this.busy=false;this.emit();}}
 }
 async change(mutator,{initial=false}={}){
  if(!this.canWrite)throw Error('请登录并连接云存档后再操作。');
  if(!this.row&&!initial)throw Error('请先在家长设置中迁移或新建存档。');
  const epoch=this.epoch;this.busy=true;this.emit();
  let result;
  try{
   const next=structuredClone(this.state);result=await mutator(next);
   if(epoch!==this.epoch)throw Error('账号已变更，请重试。');
   validateSave(next);
   const request={p_state:next,p_expected_revision:this.row?.revision||0,p_operation_id:this.uuid()};
   this.pending=request;
   let row;
   try{row=await this.api.commit(request);}catch(e){
    if(e.code==='PT409'||e.code==='PT400'||e.code==='42501')throw e;
    // The first response may be lost after COMMIT. The server receipt makes this retry safe.
    row=await this.api.commit(request);
   }
   if(epoch!==this.epoch)throw Error('账号已变更，请重试。');
   this.pending=null;this.accept(row);this.connected=true;this.status='已同步到云端';return result;
  }catch(e){
   if(epoch===this.epoch){
    if(e.code==='PT400'||e.code==='42501'){this.pending=null;throw Error('服务器拒绝了存档，请检查数据格式或数据库配置。');}
    if(e.code==='PT409'){
     this.pending=null;
     try{const row=await this.api.read();if(epoch!==this.epoch)throw Error('账号已变更');this.accept(row);this.connected=true;}catch{if(epoch===this.epoch)this.connected=false;}
     this.status=this.connected?'其他设备已更新，请重试':'连接不可用 · 仅查看缓存';
     throw Error('其他设备已更新进度，已停止本次操作。请刷新后重试。');
    }
    if(this.pending){this.connected=false;this.status='保存结果待核对 · 请恢复连接';throw Error('暂时无法确认保存结果，请恢复连接后刷新核对。');}
   }
   throw e;
  }finally{if(epoch===this.epoch){this.busy=false;this.emit();}}
 }
 async replace(next,{initial=false}={}){const valid=validateSave(next);return this.change(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,valid);},{initial});}
 async history(){if(!this.canWrite)throw Error('请先连接云存档。');return this.api.history();}
}
