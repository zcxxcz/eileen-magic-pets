import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import {mockCloud} from './mock-cloud.mjs';
import {fresh,hatch,lesson} from '../src/game.js';
import {setupParent} from '../src/parent.js';
const cached=`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const browser=await chromium.launch({headless:true,...(existsSync(cached)?{executablePath:cached}:{})});
const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}}),page=await context.newPage();
const backend=await mockCloud(context),errors=[];page.on('pageerror',e=>errors.push(e.message));
const old=fresh();hatch(old);lesson(old,'迁移前课程');old.parentAuth=await setupParent('6291','6291');
await context.addInitScript(old=>{if(!localStorage.getItem('legacy-seeded')){localStorage.setItem('eileen-magic-pets-v1',JSON.stringify(old));localStorage.setItem('legacy-seeded','1');}},old);
const settle=()=>expect(page.locator('.cloud-bar')).not.toContainText('正在核对');
const settings=()=>page.locator('[data-action="settings"]').click();
const close=()=>page.locator('.close').click();
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173');await settings();await page.locator('#cloud-email').fill('parent@example.test');await page.locator('#cloud-password').fill('test-only-password');await page.locator('#login-form button').click();
 await page.locator('#migrate-save').click();await page.locator('#replace-confirm').check();await page.locator('#replace-form button').click();await page.locator('.modal').waitFor({state:'hidden'});
 assert.equal(backend.row.state.lessons.length,1);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('eileen-magic-pets-v1')).lessons.length),1);
 // Offline reads remain visible, mutation controls are disabled.
 await context.setOffline(true);await expect(page.locator('.cloud-bar')).toContainText('仅查看');await expect(page.locator('.learn')).toBeDisabled();await expect(page.locator('.pet-info')).toContainText('奶糖');
 await context.setOffline(false);await settle();await expect(page.locator('.learn')).toBeEnabled();
 // A racing other device spends the star before this page's purchase.
 await page.locator('[data-tab="wardrobe"]').first().click();backend.advance(s=>{s.stars=0;s.owned.push('pink-top');});await page.locator('[data-equip="mint-top"]').click();await expect(page.locator('#toast')).toContainText('其他设备');assert.equal(backend.row.state.owned.includes('mint-top'),false);
 await settings();await page.locator('#refresh-cloud').click();await close();
 // Import invalid JSON leaves the existing cloud state intact.
 await settings();const rev=backend.row.revision;await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await expect(page.locator('#toast')).toContainText('JSON');assert.equal(backend.row.revision,rev);
 // Valid import requires PIN and explicit confirmation; original cloud state remains in history.
 await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});await page.locator('#restore-pin').fill('6291');await page.locator('#replace-confirm').check();await page.locator('#replace-form button').click();await page.locator('.modal').waitFor({state:'hidden'});assert.equal(backend.row.state.stars,1);assert.equal(backend.history[1].state.stars,0);
 await settings();const download=page.waitForEvent('download');await page.locator('#export-save').click();assert.ok((await download).suggestedFilename().endsWith('.json'));
 await page.locator('#history-save').click();await page.locator('[data-history="1"]').click();await page.locator('#restore-pin').fill('6291');await page.locator('#replace-confirm').check();await page.locator('#replace-form button').click();await page.locator('.modal').waitFor({state:'hidden'});assert.equal(backend.row.state.stars,0);
 // A second browser page sees the same cloud state after login session restore.
 const second=await context.newPage();await second.goto(process.env.TEST_URL||'http://127.0.0.1:5173');await expect(second.locator('.cloud-bar')).toContainText('已同步');await expect(second.locator('.pet-info')).toContainText('奶糖');await second.close();
 await settings();mkdirSync('artifacts',{recursive:true});await expect(page.locator('.modal')).toHaveCSS('opacity','1');await page.screenshot({path:'artifacts/cloud-settings-mobile.png'});await page.locator('#logout-cloud').click();await expect(page.locator('#login-form')).toBeVisible();await close();await expect(page.locator('.pet-info')).toHaveCount(0);await expect(page.locator('.learn')).toBeDisabled();
 assert.deepEqual(errors,[]);console.log('PASS: migration, offline gating, multi-device conflict, invalid import, PIN-gated import/restore, export, second page, logout, mobile settings.');
}catch(e){await page.screenshot({path:'artifacts/cloud-failure.png',fullPage:true});console.log(await page.locator('.modal').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),scrollTop:el.scrollTop,close:el.querySelector('.close').getBoundingClientRect().toJSON()})));throw e;}finally{await browser.close();}
