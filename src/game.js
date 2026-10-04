export const KEY = 'eileen-magic-pets-v1';
export const SPECIES = [
  ['cat','小猫','奶糖','#f5c99e'],['dog','小狗','布丁','#cda478'],['rabbit','兔子','糯米','#f8ded8'],['bear','小熊','可可','#c5a180'],['hamster','小仓鼠','团子','#e9c389'],['fox','小狐狸','橘子','#e8a26d'],['chick','小鸡','啾啾','#f5d475'],['guinea','豚鼠','豆包','#c8ad93'],['bird','小鸟','蓝莓','#a9cbd1'],['turtle','小乌龟','抹茶','#a7bf8e']
].map(([id,label,name,color])=>({id,label,name,color}));
export const ITEMS = {
 clothes:[{id:'mint-top',name:'薄荷上衣',cost:1,kind:'top',color:'#a7cbb7'},{id:'pink-top',name:'桃桃上衣',cost:1,kind:'top',color:'#e6aab9'},{id:'blue-pants',name:'云朵裤子',cost:1,kind:'bottom',color:'#9dbacd'},{id:'yellow-pants',name:'奶油裤子',cost:1,kind:'bottom',color:'#e8ce8b'}],
 bracelet:[{id:'pearl',name:'珍珠手镯',cost:1,color:'#fff4d7'},{id:'jade',name:'薄荷手镯',cost:1,color:'#8fbfa4'}],
 clip:[{id:'bow',name:'蝴蝶结发卡',cost:1,color:'#d893ac'},{id:'flower',name:'小花发卡',cost:1,color:'#f1cf77'}],
 hand:[{id:'wand',name:'星星魔法棒',cost:0,color:'#edc667'},{id:'heart-wand',name:'爱心魔法棒',cost:1,color:'#d98da6'}],
 makeup:[{id:'blush',name:'桃桃腮红',cost:1,color:'#e6a0a5'},{id:'stars',name:'星星妆',cost:1,color:'#e9bd61'}]
};
export const PRIZES = [
 {id:'rose-dress',name:'玫瑰公主裙',kind:'dress',color:'#dc9db4',icon:'♕'},
 {id:'sky-dress',name:'星空纱裙',kind:'dress',color:'#b8acd8',icon:'✧'},
 {id:'flower-pot',name:'小花盆',kind:'decor',icon:'🌷'},
 {id:'mushroom',name:'童话蘑菇',kind:'decor',icon:'🍄'},
 {id:'gift',name:'蝴蝶结礼物',kind:'decor',icon:'🎁'},
 {id:'rainbow',name:'迷你彩虹',kind:'decor',icon:'🌈'}
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
 if(slot==='dress'){delete p.outfit.top;delete p.outfit.bottom;}
 if(slot==='top'||slot==='bottom')delete p.outfit.dress;
}
export function collect(s){const p=current(s);if(!p||!p.eggReady)throw Error('成年后会有第一颗魔法蛋。');s.eggs++;p.eggReady=false;p.eggProgress=0;}
export function feed(s){const p=current(s);if(!p||p.location!=='zoo'||s.trip?.pet===p.id)throw Error('等宠物到动物园再喂食吧。');p.food++;}
export function saveRoute(s,direction,points){if(!['out','back'].includes(direction)||points.length<2)throw Error('路线需要起点和终点。');const start=direction==='out'?[10,72]:[90,25],end=direction==='out'?[90,25]:[10,72];s.routes[direction]=[start,...points.slice(1,-1).map(([x,y])=>[Math.max(5,Math.min(95,x)),Math.max(8,Math.min(90,y))]),end];}
export function travel(s,now=Date.now()){const p=current(s);if(!p)throw Error('先孵化一只宠物吧。');if(s.trip)throw Error('先等路上的宠物到达吧。');const direction=p.location==='home'?'out':'back';s.trip={pet:p.id,direction,points:s.routes[direction].map(x=>[...x]),start:now,duration:6000};}
export function arrive(s,now=Date.now()){if(s.trip&&now>=s.trip.start+s.trip.duration){const p=s.pets.find(p=>p.id===s.trip.pet);if(p)p.location=s.trip.direction==='out'?'zoo':'home';s.trip=null;return true;}return false;}
export function restore(raw){try{const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.pets)||!Array.isArray(s.owned)||!Array.isArray(s.lessons)||!s.routes||!Number.isInteger(s.stars)||s.stars<0||!Number.isInteger(s.tickets)||s.tickets<0) return fresh();arrive(s);return s;}catch{return fresh();}}
