import {chromium} from '@playwright/test';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {mockCloud,login} from './mock-cloud.mjs';
import {ITEMS,PRIZES,lesson} from '../src/game.js';
import {petArt} from '../src/art.js';
const cached=`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const browser=await chromium.launch({headless:true,...(existsSync(cached)?{executablePath:cached}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),cloud=await mockCloud(page.context());
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const groups={clip:ITEMS.clip,bracelet:ITEMS.bracelet,dress:PRIZES.filter(i=>i.kind==='dress')};
const wait=()=>page.waitForFunction(()=>!document.querySelector('.cloud-bar').textContent.includes('正在核对'));
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');await login(page);await page.locator('[data-action="hatch-first"]').first().click();await wait();
 cloud.advance(s=>{for(let i=0;i<20;i++)lesson(s,`装扮测试课 ${i}`);s.owned.push('bow','pearl','rose-dress');s.pets[0].outfit={hand:'wand',clip:'bow',bracelet:'pearl',dress:'rose-dress'};});
 await page.reload();await page.locator('nav [data-tab="wardrobe"]').click();
 for(const [category,items] of Object.entries(groups)){
  await page.locator(`[data-category="${category}"]`).click();assert.equal(await page.locator('[data-equip]').count(),6);
  await page.locator('[data-ownership="owned"]').click();assert.equal(await page.locator('[data-equip]').count(),1);
  await page.locator('[data-ownership="missing"]').click();assert.equal(await page.locator('[data-equip]').count(),5);
  if(category==='dress'){
   for(const el of await page.locator('[data-equip]').all())assert.ok(await el.isDisabled());
   for(let i=0;i<PRIZES.length-1;i++){await page.locator('[data-action="draw"]').click();await page.locator('#wear-prize').waitFor();await page.locator('.close').click();}
   assert.equal(cloud.row.state.tickets,20-(PRIZES.length-1));
  }
  await page.locator('[data-ownership="all"]').click();
  for(const item of items){await page.locator(`[data-equip="${item.id}"]`).click();await wait();assert.equal(cloud.row.state.pets[0].outfit[category],item.id);assert.equal(await page.locator(`.pet-stage [data-outfit="${item.id}"]`).count(),1);}
  mkdirSync('artifacts',{recursive:true});await page.screenshot({path:`artifacts/wardrobe-${category}.png`,fullPage:true});
 }
 assert.equal(cloud.row.state.stars,10);assert.equal(cloud.row.state.pets[0].points,20);await page.reload();await page.locator('nav [data-tab="wardrobe"]').click();assert.equal(await page.locator('.pet-stage [data-outfit="leaf-dress"]').count(),1);
 await page.setViewportSize({width:390,height:844});for(const category of Object.keys(groups)){await page.locator(`[data-category="${category}"]`).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await page.screenshot({path:'artifacts/wardrobe-mobile.png',fullPage:true});
 const gallery=`<!doctype html><html lang="zh"><meta charset="utf-8"><title>18 款装扮实穿预览</title><style>body{margin:0;padding:32px;background:#faf6ed;color:#675346;font-family:sans-serif}h1{font-size:24px}section{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}article{padding:10px;text-align:center;background:#fffdf8;border:1px solid #e5d8c5;border-radius:16px}svg{width:100%}p{font-size:14px}</style><h1>魔法衣橱 · 18 款不同样式</h1>${Object.entries(groups).map(([slot,items])=>`<h2>${{clip:'发卡',bracelet:'手镯',dress:'裙子'}[slot]}</h2><section>${items.map(item=>`<article>${petArt({species:'cat',points:5,outfit:{[slot]:item.id}})}<p>${item.name}</p></article>`).join('')}</section>`).join('')}</html>`;
 writeFileSync('artifacts/wardrobe-gallery.html',gallery);await page.setViewportSize({width:1440,height:1400});await page.setContent(gallery);await page.screenshot({path:'artifacts/wardrobe-gallery.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: all 18 equipped renders; original outfits retained; filters and counts; one-star purchases; lottery-only dresses; draws consume exactly one ticket each; unchanged growth; new-item cloud save and reload; 390px layout. Mock cloud only.');
}finally{await browser.close();}
