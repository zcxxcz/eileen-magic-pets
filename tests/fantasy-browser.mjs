import {chromium,expect} from '@playwright/test';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {mockCloud,login} from './mock-cloud.mjs';
import {ITEMS,PRIZES,SPECIES,lesson,hatch,collect} from '../src/game.js';
import {setupParent} from '../src/parent.js';
import {petArt} from '../src/art.js';
import {decorArt} from '../src/theme-art.js';
const cached=`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const browser=await chromium.launch({headless:true,...(existsSync(cached)?{executablePath:cached}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),cloud=await mockCloud(page.context());
const errors=[];page.on('pageerror',e=>errors.push(e.message));const auth=await setupParent('6291','6291');
const wait=()=>expect(page.locator('.cloud-bar')).not.toContainText('正在核对');
const nav=t=>page.locator(`nav [data-tab="${t}"]`).click();
const active=id=>expect(page.locator(`.pet-select [data-pet="${id}"]`)).toHaveClass('selected');
const cat=c=>page.locator(`[data-category="${c}"]`).click();
async function wear(id){await page.locator(`[data-equip="${id}"]`).click();await wait();}
async function openLesson(){await page.locator('[data-action="lesson"]').first().click();await expect(page.locator('#lesson-form')).toBeVisible();}
try{
 await page.clock.install();await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');await login(page);await page.locator('[data-action="hatch-first"]').first().click();await wait();
 cloud.advance(s=>{for(let i=0;i<5;i++)lesson(s,`cat${i}`);collect(s);for(const sp of SPECIES.slice(1)){hatch(s,sp.id);for(let i=0;i<5;i++)lesson(s,`${sp.id}${i}`);collect(s);}s.selected='pet-1';s.parentAuth=auth;});
 await page.reload();await nav('wardrobe');await wear('mint-top');const revision=cloud.row.revision;
 await page.locator('[data-pet="pet-2"]').click();await active('pet-2');
 for(let n=0;n<3;n++){if(n===1)cloud.advance(s=>{s.selected='pet-1';s.pets[0].food=3;});await page.clock.fastForward(16000);await wait();await active('pet-2');}
 assert.equal(cloud.row.revision,revision+1,'selection and refresh must not write cloud');assert.equal(cloud.row.state.pets[0].outfit.top,'mint-top');
 await wear('pink-top');assert.equal(cloud.row.state.pets[1].outfit.top,'pink-top');assert.equal(cloud.row.state.pets[0].outfit.top,'mint-top');
 await page.locator('[data-pet="pet-1"]').click();await page.clock.fastForward(16000);await wait();await active('pet-1');
 console.log('PASS: idle pet selection survives 3 cloud polls and other-device updates with no extra writes; outfits saved per pet.');
 // The lesson form has no password input and no username-shaped course field.
 await openLesson();assert.equal(await page.locator('#lesson-name').evaluate(el=>el.tagName),'TEXTAREA');assert.equal(await page.locator('#lesson-form input[type="password"]').count(),0);assert.equal(await page.locator('#parent-pin').getAttribute('autocomplete'),'one-time-code');assert.equal(await page.locator('#parent-pin').evaluate(el=>getComputedStyle(el).webkitTextSecurity),'disc');assert.equal(await page.locator('#lesson-name').inputValue(),'');assert.equal(await page.locator('#parent-pin').inputValue(),'');
 const stars=cloud.row.state.stars;await page.locator('#parent-pin').fill('6291');await page.locator('#parent-confirm').check();await page.locator('#lesson-form button').click();assert.equal(cloud.row.state.stars,stars);assert.equal(await page.locator('#lesson-form').evaluate(el=>el.checkValidity()),false);
 await page.locator('#lesson-name').fill('Pad新课程');await page.locator('#parent-pin').fill('0000');await page.locator('#lesson-form button').click();await expect(page.locator('#parent-error')).toContainText('不正确');assert.equal(cloud.row.state.stars,stars);
 await page.locator('#parent-pin').fill('6291');await page.locator('#lesson-form button').click();await page.locator('.modal').waitFor({state:'hidden'});assert.equal(cloud.row.state.stars,stars+1);
 await openLesson();await page.locator('#lesson-name').fill('Pad新课程');await page.locator('#parent-pin').fill('6291');await page.locator('#parent-confirm').check();await page.locator('#lesson-form button').click();await expect(page.locator('#parent-error')).toContainText('已经领取');assert.equal(cloud.row.state.stars,stars+1);await page.locator('.close').click();
 console.log('PASS: isolated masked numeric PIN/course form, blank title rejected, wrong PIN rejected, valid lesson awarded once, duplicate blocked. No real password-manager profile inspected.');
 for(const category of ['clothes','hand','makeup']){await cat(category);assert.equal(await page.locator('[data-equip]').count(),ITEMS[category].length);for(const item of ITEMS[category]){const beforePoints=cloud.row.state.pets[0].points,beforeTickets=cloud.row.state.tickets;await wear(item.id);const slot=item.kind||category;assert.equal(cloud.row.state.pets[0].outfit[slot],item.id);assert.equal(await page.locator(`.pet-stage [data-outfit="${item.id}"]`).count(),1);assert.equal(cloud.row.state.pets[0].points,beforePoints);assert.equal(cloud.row.state.tickets,beforeTickets);}}
 await cat('makeup');for(const [part,count] of [['face',4],['ear',3],['paw',3],['body',2]]){await page.locator(`[data-paint-part="${part}"]`).click();assert.equal(await page.locator('[data-equip]').count(),count);}await page.locator('[data-paint-part="all"]').click();
 assert.ok(cloud.row.state.pets[0].outfit.makeup&&cloud.row.state.pets[0].outfit.makeupEar&&cloud.row.state.pets[0].outfit.makeupPaw&&cloud.row.state.pets[0].outfit.makeupBody);
 await page.locator('[data-remove="makeupEar"]').click();await wait();assert.equal(cloud.row.state.pets[0].outfit.makeupEar,undefined);assert.ok(cloud.row.state.pets[0].outfit.makeupPaw);await wear('petal-ears');
 await cat('decor');assert.equal(await page.locator('[data-equip]').count(),10);assert.ok(await page.locator('[data-equip="cloud-lamp"]').isDisabled());const tickets=cloud.row.state.tickets;
 for(let n=0;n<PRIZES.length;n++){await page.locator('[data-action="draw"]').click();await page.locator('#wear-prize').waitFor();await page.locator('.close').click();}assert.equal(cloud.row.state.tickets,tickets-PRIZES.length);
 for(const item of PRIZES.filter(i=>i.kind==='decor')){await wear(item.id);assert.equal(await page.locator(`.decoration [data-decor="${item.id}"]`).count(),1);}
 await page.reload();await nav('wardrobe');assert.equal(await page.locator('.pet-stage [data-outfit="petal-ears"]').count(),1);await nav('nursery');assert.equal(await page.locator('[data-species]').count(),16);
 for(const sp of SPECIES.slice(10)){await page.locator(`[data-pet="pet-${SPECIES.indexOf(sp)+1}"]`).click();await nav('wardrobe');await cat('clothes');await wear('bunny-hoodie');await cat('makeup');await wear('aurora-ears');assert.equal(await page.locator(`.pet-stage [data-paint-species="${sp.id}"]`).count(),1);await nav('nursery');}
 await page.locator('[data-pet="pet-1"]').click();await nav('wardrobe');await cat('clothes');await wear('bunny-hoodie');await cat('hand');await wear('bubble-wand');await cat('makeup');await wear('rainbow-cheeks');await wear('belly-flower');await cat('decor');await wear('cloud-lamp');
 mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/fantasy-wardrobe-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});for(const c of ['clothes','hand','makeup','decor']){await cat(c);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await cat('makeup');await page.screenshot({path:'artifacts/fantasy-wardrobe-mobile.png',fullPage:true});
 const examples=[['cat','兔兔泡泡魔法师','bunny-hoodie','bubble-wand','cloud-lamp','petal-ears'],['panda','口袋里的月光','patchwork-overalls','moon-wand','moon-swing','polka-ears'],['rabbit','晚安星河','star-pajamas','crystal-wand','music-box','aurora-ears'],['koala','青蛙花园派对','frog-cape','flower-wand','teacup-garden','petal-ears'],['penguin','云朵小水手','cloud-sailor-top','ribbon-wand','duck-fountain','polka-ears'],['fawn','向日葵童话','sunflower-bib','comet-wand','tiny-castle','petal-ears']];
 const style=`body{margin:0;padding:32px;background:#fbf7ef;color:#705f50;font-family:system-ui,sans-serif}h1{font-size:26px;margin:0 0 10px}header p{font-size:13px;color:#aa917c;margin:0 0 25px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{background:#fffdf8;border:1px solid #e4d6c5;border-radius:20px;padding:16px;text-align:center}.stage{height:240px;position:relative;overflow:hidden;background:linear-gradient(#f5eee2 78%,#ede0cd 78%);border-radius:13px}.pet-art{width:220px;margin:auto}.decor{position:absolute;width:88px;right:2px;bottom:3px}.decor svg{width:100%}h2{font-size:15px;font-weight:500;margin:17px 0 8px}small{font-size:10px;color:#af9680}`;
 const showcase=`<!doctype html><html lang="zh"><meta charset="utf-8"><title>魔法宠物屋 · 新朋友的新衣橱</title><style>${style}</style><header><h1>新朋友的新衣橱 ✧</h1><p>16 种小伙伴 · 12 款衣服 · 8 款手持 · 10 款摆件 · 12 款多部位彩绘</p></header><div class="grid">${examples.map(([species,name,top,hand,decor,makeupEar])=>`<article><div class="stage">${petArt({species,points:2,outfit:{top,hand,makeup:'freckles',makeupEar,makeupPaw:'paw-hearts',makeupBody:'belly-flower'}})}<div class="decor">${decorArt(decor)}</div></div><h2>${name}</h2><small>${SPECIES.find(s=>s.id===species).label} · 四个位置的彩绘可以叠加</small></article>`).join('')}</div></html>`;
 writeFileSync('artifacts/fantasy-showcase.html',showcase);await page.setViewportSize({width:1200,height:860});await page.setContent(showcase);await page.screenshot({path:'artifacts/fantasy-showcase.png',fullPage:true});
 const speciesGallery=`<html lang="zh"><meta charset="utf-8"><style>${style}.grid{grid-template-columns:repeat(4,1fr)}.stage{height:230px}.pet-art{width:205px}</style><header><h1>16 位魔法小伙伴</h1></header><div class="grid">${SPECIES.map(sp=>`<article><div class="stage">${petArt({species:sp.id,points:0,outfit:{hand:'wand',makeupEar:'aurora-ears'}})}</div><h2>${sp.label} · ${sp.name}</h2></article>`).join('')}</div></html>`;
 await page.setViewportSize({width:1200,height:1300});await page.setContent(speciesGallery);await page.screenshot({path:'artifacts/fantasy-species.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: all new clothing/hand/paint/decor renders, per-part layering/removal, lottery-only decor, correct charges, 16 species, reload and 390px layout. Isolated mock cloud only.');
}finally{await browser.close();}
