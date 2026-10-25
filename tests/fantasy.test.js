import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,hatch,lesson,ITEMS,PRIZES,SPECIES,equip,unequip,current,travel,arrive,collect} from '../src/game.js';
import {themeArt,paintArt,decorArt,earAnchors} from '../src/theme-art.js';
import {petArt} from '../src/art.js';
import {validateSave,parseBackup,backupText} from '../src/save-validation.js';
import {PetSelection} from '../src/pet-selection.js';
const allItems=[...Object.values(ITEMS).flat(),...PRIZES];
const funded=()=>{const s=fresh();hatch(s);for(let i=0;i<60;i++)lesson(s,`Pad课次${i}`);return s;};
test('expanded catalog keeps old IDs and offers 12 clothes, 8 hands, 12 paints, 10 decor and 16 species',()=>{
 assert.deepEqual([ITEMS.clothes.length,ITEMS.hand.length,ITEMS.makeup.length,PRIZES.filter(i=>i.kind==='decor').length,SPECIES.length],[12,8,12,10,16]);assert.equal(new Set(allItems.map(i=>i.id)).size,60);
 for(const id of ['mint-top','pink-top','blue-pants','yellow-pants','wand','heart-wand','blush','stars','flower-pot','mushroom','gift','rainbow'])assert.ok(allItems.some(i=>i.id===id));
});
test('all themed clothes and hand tools have distinct non-color geometry',()=>{
 for(const group of [ITEMS.clothes.filter(i=>i.theme),ITEMS.hand]){const shapes=group.map(i=>themeArt(i.id).replace(/#[\da-f]{3,8}/gi,'COLOR').replace(/data-outfit="[^"]+"/g,''));assert.ok(shapes.every(Boolean));assert.equal(new Set(shapes).size,group.length);}
 assert.equal(new Set(PRIZES.filter(i=>i.kind==='decor').map(i=>decorArt(i.id))).size,10);
});
test('all buyable new items charge once and never change growth or tickets',()=>{
 const s=funded();for(const [category,items] of Object.entries(ITEMS))for(const item of items){const before=[s.stars,current(s).points,s.tickets];equip(s,category,item.id);assert.equal(s.stars,before[0]-(item.id==='wand'?0:1));assert.equal(current(s).points,before[1]);assert.equal(s.tickets,before[2]);const stars=s.stars;equip(s,category,item.id);assert.equal(s.stars,stars);assert.deepEqual(validateSave(s),s);}
 for(const prize of PRIZES)assert.throws(()=>equip(s,prize.kind,prize.id),/只能通过抽奖/);
});
test('four paint slots layer with clothes and remove independently with save round-trip',()=>{
 const s=funded();for(const [cat,id] of [['clothes','star-pajamas'],['makeup','rainbow-cheeks'],['makeup','petal-ears'],['makeup','paw-hearts'],['makeup','belly-flower']])equip(s,cat,id);
 assert.deepEqual(current(s).outfit,{hand:'wand',top:'star-pajamas',makeup:'rainbow-cheeks',makeupEar:'petal-ears',makeupPaw:'paw-hearts',makeupBody:'belly-flower'});
 const svg=petArt(current(s));assert.ok(svg.indexOf('data-outfit="belly-flower"')>svg.indexOf('data-outfit="star-pajamas"'));assert.ok(svg.indexOf('data-outfit="paw-hearts"')>svg.indexOf('rotate(-30 181 197)'));
 const before=[s.stars,s.tickets,current(s).points];unequip(s,'makeupEar');assert.equal(current(s).outfit.makeupEar,undefined);assert.equal(current(s).outfit.makeup,'rainbow-cheeks');assert.deepEqual([s.stars,s.tickets,current(s).points],before);assert.deepEqual(parseBackup(backupText(s)),s);
});
test('full outfits, trousers and dresses replace only conflicting clothes',()=>{
 const s=funded();equip(s,'clothes','blue-pants');equip(s,'clothes','patchwork-overalls');assert.equal(current(s).outfit.bottom,undefined);equip(s,'clothes','pumpkin-shorts');assert.equal(current(s).outfit.top,undefined);s.owned.push('rose-dress');equip(s,'dress','rose-dress');assert.equal(current(s).outfit.bottom,undefined);equip(s,'clothes','bunny-hoodie');assert.equal(current(s).outfit.dress,undefined);
 s.owned.push('star-pajamas');current(s).outfit.top='star-pajamas';current(s).outfit.bottom='blue-pants';assert.throws(()=>validateSave(s));
});
test('all 16 species render every new slot at all ages, ear anchors adapt, new animals hatch and travel',()=>{
 for(const species of SPECIES)for(const points of [0,2,5])for(const slot of ['top','hand','makeup','makeupEar','makeupPaw','makeupBody']){
  const id={top:'bunny-hoodie',hand:'bubble-wand',makeup:'rainbow-cheeks',makeupEar:'aurora-ears',makeupPaw:'paw-socks',makeupBody:'belly-rainbow'}[slot];const p={species:species.id,points,outfit:{[slot]:id}};const svg=petArt(p);assert.ok(svg.includes(`data-outfit="${id}"`));assert.ok(!svg.includes('undefined'));assert.ok(!svg.includes('NaN'));
 }
 for(const item of ITEMS.makeup)for(const sp of SPECIES)assert.ok(paintArt(item.id,sp.id));assert.notDeepEqual(earAnchors('rabbit'),earAnchors('turtle'));
 const s=funded();collect(s);for(const sp of SPECIES.slice(10)){hatch(s,sp.id);for(let n=0;n<5;n++)lesson(s,`${sp.id}${n}`);collect(s);travel(s,100);arrive(s,6100);assert.equal(current(s).location,'zoo');travel(s,6200);arrive(s,12200);assert.equal(current(s).location,'home');assert.deepEqual(validateSave(s),s);}
});
test('local selection resists stale cloud A, other updates and save callbacks without mutating cloud state',()=>{
 const s=funded();collect(s);hatch(s,'rabbit');s.selected='pet-1';const view=new PetSelection();view.view(s,'family');view.choose('pet-2',s);for(let n=0;n<4;n++){const snapshot=structuredClone(s);snapshot.pets[0].food=n;assert.equal(view.view(snapshot,'family').selected,'pet-2');assert.equal(snapshot.selected,'pet-1');}assert.equal(view.view(s,'other-family').selected,'pet-1');
});
