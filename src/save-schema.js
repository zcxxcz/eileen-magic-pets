import {SPECIES, ITEMS, PRIZES} from './game.js';
const integer={type:'integer',minimum:0,maximum:1000000000};
const text={type:'string',minLength:1,maxLength:60,pattern:'^[^<>&]*$'};
const object=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const array=(items,maxItems)=>({type:'array',items,maxItems});
const itemIds=[...Object.values(ITEMS).flat(),...PRIZES].map(x=>x.id);
const points={...array({type:'array',items:{type:'number',minimum:0,maximum:100},minItems:2,maxItems:2},14),minItems:2};
const outfit={};
for(const [category,items] of Object.entries(ITEMS))for(const item of items){const slot=item.kind||category;outfit[slot]??={enum:[]};outfit[slot].enum.push(item.id);}
for(const item of PRIZES){outfit[item.kind]??={enum:[]};outfit[item.kind].enum.push(item.id);}
export const saveSchema=object({
 version:{const:1},pets:array(object({id:{type:'string',pattern:'^pet-[1-9][0-9]*$',maxLength:30},species:{enum:SPECIES.map(x=>x.id)},name:text,points:integer,generation:{...integer,minimum:1},location:{enum:['home','zoo']},food:integer,eggReady:{type:'boolean'},eggProgress:{...integer,maximum:3},outfit:object(outfit,[])}),500),
 selected:{type:['string','null']},stars:integer,tickets:integer,lessons:array(object({id:{...integer,minimum:1},title:{type:'string',minLength:1,maxLength:60},pet:{type:'string'},date:{type:'string',pattern:'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$'}}),10000),
 owned:{...array({enum:itemIds},itemIds.length),uniqueItems:true},eggs:integer,hatched:integer,routes:object({out:points,back:points}),
 trip:{anyOf:[{type:'null'},object({pet:{type:'string'},direction:{enum:['out','back']},points,start:{type:'integer',minimum:0,maximum:8640000000000000},duration:{const:6000}})]},
 parentAuth:object({salt:{type:'string',pattern:'^[0-9a-f]{32}$'},hash:{type:'string',pattern:'^[0-9a-f]{64}$'},failures:{...integer,maximum:4},lockUntil:{type:'integer',minimum:0,maximum:8640000000000000}})
},['version','pets','selected','stars','tickets','lessons','owned','eggs','hatched','routes','trip']);
