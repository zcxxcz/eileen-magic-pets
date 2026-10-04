import Ajv from 'ajv';
import {saveSchema} from './save-schema.js';
const check=new Ajv({strict:false}).compile(saveSchema);
export function validateSave(value){
 const s=structuredClone(value);
 if(!check(s))throw Error('存档格式无效，原进度未修改。');
 const ids=new Set(s.pets.map(p=>p.id));
 const valid=ids.size===s.pets.length && s.hatched===s.pets.length &&
  (s.pets.length?ids.has(s.selected):s.selected===null) &&
  s.pets.every((p,i)=>p.id===`pet-${i+1}`&&p.generation===i+1&&Object.values(p.outfit).every(x=>s.owned.includes(x))&&!(p.outfit.dress&&(p.outfit.top||p.outfit.bottom))) &&
  s.lessons.every((l,i)=>l.id===i+1&&ids.has(l.pet)&&Number.isFinite(Date.parse(l.date))) &&
  new Set(s.lessons.map(l=>l.title)).size===s.lessons.length && (!s.trip||ids.has(s.trip.pet));
 if(!valid)throw Error('存档引用关系无效，原进度未修改。');
 return s;
}
export function parseBackup(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>2000000)throw Error('存档文件过大。');
 let data;try{data=JSON.parse(raw);}catch{throw Error('这不是有效的 JSON 存档。');}
 return validateSave(data?.format==='magic-pets-backup-v1'?data.state:data);
}
export function backupText(state){return JSON.stringify({format:'magic-pets-backup-v1',exportedAt:new Date().toISOString(),state:validateSave(state)},null,2);}
