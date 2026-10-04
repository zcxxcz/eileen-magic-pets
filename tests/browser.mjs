import {mockCloud,login} from './mock-cloud.mjs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, existsSync } from 'node:fs';
const cached=`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const browser=await chromium.launch({headless:true,...(existsSync(cached)?{executablePath:cached}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
await mockCloud(page.context());
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=async()=>{await page.waitForFunction(()=>!document.querySelector('.cloud-bar').textContent.includes('正在核对'));return page.evaluate(()=>JSON.parse(localStorage.getItem('eileen-cloud-v1:00000000-0000-4000-8000-000000000001')).state);};
const clickAction=a=>page.locator(`[data-action="${a}"]`).first().click();
const nav=t=>page.locator(`nav [data-tab="${t}"]`).click();
async function reward(title,pin='6291'){
 await clickAction('lesson');await page.locator('#lesson-name').fill(title);await page.locator('#parent-pin').fill(pin);await page.locator('#parent-confirm').check();await page.locator('#lesson-form button[type=submit]').click();
 if(pin==='6291')await page.locator('.modal').waitFor({state:'hidden'});else await page.locator('#parent-error').filter({hasText:'密码不正确'}).waitFor();
}
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');await login(page);mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/cloud-first-egg.png',fullPage:true});
 await clickAction('hatch-first');assert.equal((await state()).pets[0].species,'cat');
 await clickAction('lesson');await page.locator('#parent-pin').fill('6291');await page.locator('#confirm-pin').fill('6291');await page.locator('#lesson-form button[type=submit]').click();await page.locator('.modal').waitFor({state:'hidden'});assert.equal((await state()).tickets,0);
 await reward('Pad 语文第 1 课','0000');assert.equal((await state()).tickets,0);await page.locator('.close').click();
 await reward('Pad 语文第 1 课');assert.deepEqual([(await state()).stars,(await state()).tickets,(await state()).pets[0].points],[1,1,1]);
 await page.screenshot({path:'artifacts/cloud-home.png',fullPage:true});
 await clickAction('lesson');await page.locator('#lesson-name').fill('Pad 语文第 1 课');await page.locator('#parent-pin').fill('6291');await page.locator('#parent-confirm').check();await page.locator('#lesson-form button[type=submit]').click();await page.locator('#parent-error').filter({hasText:'已经领取'}).waitFor();assert.equal((await state()).tickets,1);await page.locator('.close').click();
 await nav('wardrobe');await page.locator('[data-equip="mint-top"]').click();assert.equal((await state()).stars,0);assert.equal((await state()).pets[0].points,1);assert.equal((await state()).pets[0].outfit.top,'mint-top');
 await clickAction('draw');await page.locator('#wear-prize').click();assert.equal((await state()).tickets,0);assert.equal((await page.locator('[data-action="draw"]').isDisabled()),true);
 for(let i=2;i<=5;i++)await reward('Pad 语文第 '+i+' 课');assert.equal((await state()).pets[0].points,5);assert.equal((await state()).pets[0].eggReady,true);
 await nav('nursery');await clickAction('collect');await page.locator('[data-species="rabbit"]').click();assert.equal((await state()).pets.length,2);assert.equal((await state()).selected,'pet-2');
 await page.locator('[data-pet="pet-1"]').click();await nav('zoo');
 await clickAction('edit-route');let map=page.locator('#zoo-map');await map.click({position:{x:260,y:100}});await clickAction('save-route');const out=(await state()).routes.out;
 await page.locator('[data-direction="back"]').click();await clickAction('edit-route');await map.click({position:{x:610,y:310}});await clickAction('save-route');assert.notDeepEqual((await state()).routes.back,out);
 await clickAction('travel');assert.deepEqual((await state()).trip.points,out);await page.waitForFunction(()=>JSON.parse(localStorage.getItem('eileen-cloud-v1:00000000-0000-4000-8000-000000000001')).state.trip===null);assert.equal((await state()).pets[0].location,'zoo');await clickAction('feed');await clickAction('feed');assert.equal((await state()).pets[0].food,2);
 await page.screenshot({path:'artifacts/cloud-zoo.png',fullPage:true});await clickAction('travel');await state();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('eileen-cloud-v1:00000000-0000-4000-8000-000000000001')).state.trip===null);assert.equal((await state()).pets[0].location,'home');
 await page.reload();assert.equal((await state()).pets.length,2);assert.equal((await state()).pets[0].points,5);assert.equal((await state()).pets[0].food,2);await page.screenshot({path:'artifacts/cloud-adult-home.png',fullPage:true});
 for(const size of [{width:1024,height:768},{width:390,height:844}]){await page.setViewportSize(size);for(const t of ['home','wardrobe','zoo','nursery']){await nav(t);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow: ${t} @ ${size.width}`);}await nav('home');await page.screenshot({path:`artifacts/cloud-home-${size.width}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);console.log('PASS: parent setup, invalid PIN, approved rewards, duplicate blocking, purchases, lottery consumption, growth, eggs, new pet, independent routes, both trips, repeated feeding, reload persistence, desktop/mobile layout, no browser errors.');
}finally{await browser.close();}
