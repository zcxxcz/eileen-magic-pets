export const KEY = 'eileen-magic-pets-v1';
export const SPECIES = [
  ['cat','小猫','奶糖','#f5c99e'],['dog','小狗','布丁','#cda478'],['rabbit','兔子','糯米','#f8ded8'],['bear','小熊','可可','#c5a180'],['hamster','小仓鼠','团子','#e9c389'],['fox','小狐狸','橘子','#e8a26d'],['chick','小鸡','啾啾','#f5d475'],['guinea','豚鼠','豆包','#c8ad93'],['bird','小鸟','蓝莓','#a9cbd1'],['turtle','小乌龟','抹茶','#a7bf8e'],
 ['panda','大熊猫宝宝','芝麻','#f6eddc'],['koala','考拉','灰灰','#b5bcc1'],['sheep','小绵羊','棉花','#f1e5cf'],['hedgehog','小刺猬','栗子','#c9aa84'],['penguin','小企鹅','冰糖','#657681'],['fawn','小鹿','桃枝','#d5ac7e']
].map(([id,label,name,color])=>({id,label,name,color,icon:({cat:'🐱',dog:'🐶',rabbit:'🐰',bear:'🐻',hamster:'🐹',fox:'🦊',chick:'🐥',guinea:'🐹',bird:'🐦',turtle:'🐢',panda:'🐼',koala:'🐨',sheep:'🐑',hedgehog:'🦔',penguin:'🐧',fawn:'🦌'})[id]}));
export const ITEMS = {
 clothes:[{id:'mint-top',name:'薄荷上衣',cost:1,kind:'top',color:'#a7cbb7'},{id:'pink-top',name:'桃桃上衣',cost:1,kind:'top',color:'#e6aab9'},{id:'blue-pants',name:'云朵裤子',cost:1,kind:'bottom',color:'#9dbacd'},{id:'yellow-pants',name:'奶油裤子',cost:1,kind:'bottom',color:'#e8ce8b'},
 {id:'bunny-hoodie',name:'垂耳兔帽兜',cost:1,kind:'top',color:'#e6c1cb',theme:'帽兜'},
 {id:'frog-cape',name:'小青蛙斗篷',cost:1,kind:'top',color:'#a9c58e',theme:'斗篷'},
 {id:'cloud-sailor-top',name:'云朵水手衫',cost:1,kind:'top',color:'#a9c6d5',theme:'特别领子'},
 {id:'sunflower-bib',name:'向日葵围兜',cost:1,kind:'top',color:'#e9c87b',theme:'围兜'},
 {id:'patchwork-overalls',name:'口袋探险背带装',cost:1,kind:'top',coversBottom:true,color:'#a8bea5',theme:'整套'},
 {id:'star-pajamas',name:'晚安星星连体衣',cost:1,kind:'top',coversBottom:true,color:'#b5afd1',theme:'整套'},
 {id:'pumpkin-shorts',name:'南瓜灯笼裤',cost:1,kind:'bottom',color:'#e7b077',theme:'蓬蓬裤'},
 {id:'rainbow-tier-pants',name:'彩虹荷叶裤',cost:1,kind:'bottom',color:'#b9c9cc',theme:'层次裤'}],
 bracelet:[{id:'pearl',name:'珍珠手镯',cost:1,color:'#fff4d7'},{id:'jade',name:'薄荷手镯',cost:1,color:'#8fbfa4'},
 {id:'bell-bracelet',name:'铃铛手镯',cost:1,color:'#e3b657'},{id:'ribbon-bracelet',name:'丝带手镯',cost:1,color:'#d893ac'},
 {id:'star-bracelet',name:'星星吊坠手镯',cost:1,color:'#b9abd8'},{id:'leaf-bracelet',name:'小叶子手镯',cost:1,color:'#88ac78'}],
 clip:[{id:'bow',name:'蝴蝶结发卡',cost:1,color:'#d893ac'},{id:'flower',name:'小花发卡',cost:1,color:'#f1cf77'},
 {id:'moon-clip',name:'月牙发卡',cost:1,color:'#e6bd65'},{id:'cherry-clip',name:'樱桃发卡',cost:1,color:'#d78191'},
 {id:'butterfly-clip',name:'蝴蝶发卡',cost:1,color:'#b1a0cf'},{id:'rainbow-clip',name:'彩虹发卡',cost:1,color:'#dc9a9d'}],
 hand:[{id:'wand',name:'星星魔法棒',cost:0,color:'#edc667'},{id:'heart-wand',name:'爱心魔法棒',cost:1,color:'#d98da6'},
 {id:'moon-wand',name:'月牙铃铛魔法棒',cost:1,color:'#d9bd77'},
 {id:'bubble-wand',name:'泡泡魔法棒',cost:1,color:'#9fc9ce'},
 {id:'flower-wand',name:'花仙子魔法棒',cost:1,color:'#d6a0b5'},
 {id:'crystal-wand',name:'水晶雪花魔法棒',cost:1,color:'#a6bfdc'},
 {id:'ribbon-wand',name:'彩带旋风魔法棒',cost:1,color:'#c3a6d1'},
 {id:'comet-wand',name:'流星羽翼魔法棒',cost:1,color:'#e5be7f'}],
 makeup:[{id:'blush',name:'桃桃腮红',cost:1,color:'#e6a0a5',part:'face'},{id:'stars',name:'星星妆',cost:1,color:'#e9bd61',part:'face'},
 {id:'freckles',name:'小花雀斑妆',cost:1,color:'#d69b8a',part:'face'},
 {id:'rainbow-cheeks',name:'彩虹脸颊妆',cost:1,color:'#d6a0b5',part:'face'},
 {id:'petal-ears',name:'花瓣耳彩',cost:1,kind:'makeupEar',color:'#dca1b1',part:'ear'},
 {id:'aurora-ears',name:'极光耳彩',cost:1,kind:'makeupEar',color:'#a4c7cf',part:'ear'},
 {id:'polka-ears',name:'糖豆耳彩',cost:1,kind:'makeupEar',color:'#d9bb74',part:'ear'},
 {id:'paw-hearts',name:'爱心爪爪印',cost:1,kind:'makeupPaw',color:'#dc9aaa',part:'paw'},
 {id:'paw-socks',name:'草莓爪爪袜彩',cost:1,kind:'makeupPaw',color:'#df9fa8',part:'paw'},
 {id:'paw-sparkles',name:'闪闪星爪彩',cost:1,kind:'makeupPaw',color:'#b6acd3',part:'paw'},
 {id:'belly-flower',name:'肚肚小花彩',cost:1,kind:'makeupBody',color:'#e5bf72',part:'body'},
 {id:'belly-rainbow',name:'肚肚彩虹彩',cost:1,kind:'makeupBody',color:'#b6c9ae',part:'body'}]
};
export const PRIZES = [
 {id:'rose-dress',name:'玫瑰公主裙',kind:'dress',color:'#dc9db4',icon:'♕'},
 {id:'sky-dress',name:'星空纱裙',kind:'dress',color:'#b8acd8',icon:'✧'},
 {id:'sailor-dress',name:'海军领百褶裙',kind:'dress',color:'#91b6ce'},
 {id:'strawberry-dress',name:'草莓围裙',kind:'dress',color:'#e9a3ab'},
 {id:'ballet-dress',name:'芭蕾蓬蓬裙',kind:'dress',color:'#d6b5d8'},
 {id:'leaf-dress',name:'森林叶子裙',kind:'dress',color:'#a0bc8d'},
 {id:'flower-pot',name:'小花盆',kind:'decor',icon:'🌷'},
 {id:'mushroom',name:'童话蘑菇',kind:'decor',icon:'🍄'},
 {id:'gift',name:'蝴蝶结礼物',kind:'decor',icon:'🎁'},
 {id:'rainbow',name:'迷你彩虹',kind:'decor',icon:'🌈'},
 {id:'cloud-lamp',name:'晚安云朵灯',kind:'decor'},
 {id:'moon-swing',name:'月亮小秋千',kind:'decor'},
 {id:'tiny-castle',name:'糖果小城堡',kind:'decor'},
 {id:'teacup-garden',name:'茶杯小花园',kind:'decor'},
 {id:'duck-fountain',name:'小鸭喷泉',kind:'decor'},
 {id:'music-box',name:'旋转木马音乐盒',kind:'decor'}
];
export function fresh(){return {version:1,pets:[],selected:null,stars:0,tickets:0,lessons:[],owned:['wand'],eggs:1,hatched:0,routes:{out:[[10,72],[33,68],[52,44],[72,48],[90,25]],back:[[90,25],[72,74],[45,79],[26,47],[10,72]]},trip:null};}
export const level = p => p.points >= 5 ? 3 : p.points >= 2 ? 2 : 1;
export const adult = p => p.points >= 5;
export const current = s => s.pets.find(p=>p.id===s.selected);
export function hatch(s,speciesId='cat'){
 if(!s.eggs) throw Error('还没有魔法蛋哦。');
 if(s.pets.some(p=>!adult(p))) throw Error('先陪现在的宝宝长大，再孵化下一只。');
 const sp=SPECIES.find(x=>x.id===speciesId); if(!sp) throw Error('请选择一种小动物。');
 if(!s.hatched && sp.id!=='cat') throw Error('第一只宠物是拿魔法棒的小猫。');
 s.hatched++; const p={id:`pet-${s.hatched}`,species:sp.id,name:sp.name,points:0,generation:s.hatched,location:'home',food:0,eggReady:false,eggProgress:0,outfit:{hand:'wand'}};
 s.pets.push(p);s.selected=p.id;s.eggs--;return p;
}
export function lesson(s,title){
 const p=current(s);if(!p)throw Error('先孵化你的第一只宠物。');
 if(!title.trim())throw Error('写下刚学完的课吧。');
 if(s.lessons.some(l=>l.title===title.trim().slice(0,60)))throw Error('这一课已经领取过奖励；如果是不同课程，请写清课程名称或课次。');
 const wasAdult=adult(p); p.points++; s.stars++;s.tickets++;
 s.lessons.push({id:s.lessons.length+1,title:title.trim().slice(0,60),pet:p.id,date:new Date().toISOString()});
 if(!wasAdult && adult(p))p.eggReady=true;
 else if(wasAdult && !p.eggReady){p.eggProgress++;if(p.eggProgress>=3)p.eggReady=true;}
 return p;
}
export function draw(s,rng=Math.random){if(s.tickets<1)throw Error('每学完一课才能获得一次抽奖机会哦。');s.tickets--;const missing=PRIZES.filter(p=>!s.owned.includes(p.id));const pool=missing.length?missing:PRIZES;const prize=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];if(!s.owned.includes(prize.id))s.owned.push(prize.id);return prize;}
export function equip(s,category,id){
 const p=current(s);if(!p)throw Error('先孵化一只宠物吧。');
 const item=[...Object.values(ITEMS).flat(),...PRIZES].find(i=>i.id===id);if(!item)throw Error('没有这件装扮。');
 if(!s.owned.includes(id)){if(item.kind==='dress'||item.kind==='decor')throw Error('这件礼物只能通过抽奖获得。');if(s.stars<item.cost)throw Error('星星不够啦，学完一课就能获得一颗。');s.stars-=item.cost;s.owned.push(id);}
 const slot=item.kind||category;p.outfit[slot]=id;
 if(item.coversBottom)delete p.outfit.bottom;
 if(slot==='bottom'&&ITEMS.clothes.find(i=>i.id===p.outfit.top)?.coversBottom)delete p.outfit.top;
 if(slot==='dress'){delete p.outfit.top;delete p.outfit.bottom;}
 if(slot==='top'||slot==='bottom')delete p.outfit.dress;
}
export const OUTFIT_LABELS={top:'上衣／套装',bottom:'裤子',dress:'裙子',clip:'发卡',bracelet:'手镯',hand:'手持物',makeup:'脸部彩绘',makeupEar:'耳侧／头顶彩绘',makeupPaw:'爪爪彩绘',makeupBody:'身体彩绘',decor:'小摆件'};
export function unequip(s,slot){const p=current(s);if(!p)throw Error('先孵化一只宠物吧。');if(!Object.hasOwn(OUTFIT_LABELS,slot))throw Error('请选择要卸下的装扮。');delete p.outfit[slot];}
export function collect(s){const p=current(s);if(!p||!p.eggReady)throw Error('成年后会有第一颗魔法蛋。');s.eggs++;p.eggReady=false;p.eggProgress=0;}
export function feed(s){const p=current(s);if(!p||p.location!=='zoo'||s.trip?.pet===p.id)throw Error('等宠物到动物园再喂食吧。');p.food++;}
export function saveRoute(s,direction,points){if(!['out','back'].includes(direction)||points.length<2)throw Error('路线需要起点和终点。');const start=direction==='out'?[10,72]:[90,25],end=direction==='out'?[90,25]:[10,72];s.routes[direction]=[start,...points.slice(1,-1).map(([x,y])=>[Math.max(5,Math.min(95,x)),Math.max(8,Math.min(90,y))]),end];}
export function travel(s,now=Date.now()){const p=current(s);if(!p)throw Error('先孵化一只宠物吧。');if(s.trip)throw Error('先等路上的宠物到达吧。');const direction=p.location==='home'?'out':'back';s.trip={pet:p.id,direction,points:s.routes[direction].map(x=>[...x]),start:now,duration:6000};}
export function arrive(s,now=Date.now()){if(s.trip&&now>=s.trip.start+s.trip.duration){const p=s.pets.find(p=>p.id===s.trip.pet);if(p)p.location=s.trip.direction==='out'?'zoo':'home';s.trip=null;return true;}return false;}
export function restore(raw){try{const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.pets)||!Array.isArray(s.owned)||!Array.isArray(s.lessons)||!s.routes||!Number.isInteger(s.stars)||s.stars<0||!Number.isInteger(s.tickets)||s.tickets<0) return fresh();arrive(s);return s;}catch{return fresh();}}
