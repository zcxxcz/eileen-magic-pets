import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,hatch,lesson,ITEMS,PRIZES,equip,draw} from '../src/game.js';
import {outfitArt} from '../src/outfit-art.js';
import {petArt} from '../src/art.js';
import {validateSave,parseBackup,backupText} from '../src/save-validation.js';
const groups={clip:ITEMS.clip,bracelet:ITEMS.bracelet,dress:PRIZES.filter(i=>i.kind==='dress')};
test('18 distinct silhouettes, shared by thumbnails and all species at each growth stage',()=>{
 for(const [slot,items] of Object.entries(groups)){
  assert.equal(items.length,6);
  const shapes=items.map(i=>outfitArt(i.id).replace(/#[0-9a-f]{3,8}/gi,'COLOR').replace(/data-outfit="[^"]+"/g,''));
  assert.equal(new Set(shapes).size,6);
  for(const i of items)for(const species of ['cat','dog','rabbit','bear','hamster','fox','chick','guinea','bird','turtle'])for(const points of [0,2,5]){
   const svg=petArt({species,points,outfit:{[slot]:i.id}});assert.ok(svg.includes(outfitArt(i.id)));assert.ok(svg.includes(i.name));
  }
 }
});
test('every new accessory costs one star only once; every dress still requires a lottery win',()=>{
 const s=fresh();hatch(s);for(let i=0;i<20;i++)lesson(s,`课 ${i}`);
 for(const [slot,items] of Object.entries(groups))for(const item of items){
  const stars=s.stars,tickets=s.tickets,points=s.pets[0].points;
  if(slot==='dress'){assert.throws(()=>equip(s,slot,item.id));assert.equal(s.stars,stars);while(!s.owned.includes(item.id))draw(s,()=>0);}
  equip(s,slot,item.id);assert.equal(s.stars,stars-(slot==='dress'?0:1));const balance=s.stars;equip(s,slot,item.id);assert.equal(s.stars,balance);assert.equal(s.pets[0].points,points);if(slot!=='dress')assert.equal(s.tickets,tickets);
  assert.deepEqual(parseBackup(backupText(s)),s);
 }
});
test('existing v1 wardrobe restores without granting items or losing its original equipment',()=>{
 const s=fresh();hatch(s);s.owned=['wand','pearl','jade','bow','flower','rose-dress','sky-dress'];s.pets[0].outfit={hand:'wand',clip:'bow',bracelet:'pearl',dress:'rose-dress'};
 const restored=parseBackup(JSON.stringify(s));assert.deepEqual(restored,s);assert.equal(restored.owned.length,7);assert.deepEqual(validateSave(restored),s);
});
