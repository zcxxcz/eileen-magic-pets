import {themeArt,clothingBackArt,paintArt} from './theme-art.js';
import {speciesArt} from './species-art.js';
import {outfitArt} from './outfit-art.js';
import {SPECIES,ITEMS,PRIZES,level} from './game.js';
export const icons={home:'⌂',wardrobe:'♧',zoo:'♧',nursery:'♧'};
const star=(x,y,r=12,color='#edc86d')=>`<path d="M ${x} ${y-r} l ${r*.3} ${r*.65} ${r*.7} ${r*.1} -${r*.5} ${r*.5} ${r*.12} ${r*.7} -${r*.62} -${r*.33} -${r*.62} ${r*.33} ${r*.12} -${r*.7} -${r*.5} -${r*.5} ${r*.7} -${r*.1} Z" fill="${color}"/>`;
export function petArt(p,{mini=false}={}){
 const features=speciesArt(p.species);
 const sp=SPECIES.find(s=>s.id===p.species),c=sp.color,o=p.outfit||{},l=level(p),scale=l===1?.82:l===2?.91:1;
 const item=id=>[...Object.values(ITEMS).flat(),...PRIZES].find(x=>x.id===id);
 const cat=['cat','fox'].includes(sp.id),round=['bear','hamster','guinea'].includes(sp.id),wing=['bird','chick'].includes(sp.id);
 let ears=cat?`<path d="M75 99 L65 39 Q94 43 110 65 M153 66 Q177 41 197 40 L184 102" fill="${c}" stroke="#9a715c" stroke-width="3"/><path d="M78 77 L76 52 99 70 M170 70 L187 52 184 78" fill="#eab0ab"/>`:sp.id==='rabbit'?`<ellipse cx="106" cy="49" rx="18" ry="48" fill="${c}"/><ellipse cx="154" cy="49" rx="18" ry="48" fill="${c}"/><ellipse cx="106" cy="46" rx="8" ry="34" fill="#eebfc2"/><ellipse cx="154" cy="46" rx="8" ry="34" fill="#eebfc2"/>`:sp.id==='dog'?`<ellipse cx="75" cy="103" rx="25" ry="47" transform="rotate(18 75 103)" fill="#a8795c"/><ellipse cx="185" cy="103" rx="25" ry="47" transform="rotate(-18 185 103)" fill="#a8795c"/>`:round?`<circle cx="81" cy="71" r="25" fill="${c}"/><circle cx="179" cy="71" r="25" fill="${c}"/><circle cx="81" cy="71" r="13" fill="#e2b0a2"/><circle cx="179" cy="71" r="13" fill="#e2b0a2"/>`:wing?`<path d="M120 62 Q104 22 129 46 Q142 22 143 63" fill="${c}"/>`:'';
 return `<svg class="pet-art ${mini?'mini':''}" viewBox="0 0 260 285" role="img" aria-label="${sp.label}，${l===1?'宝宝':l===2?'成长中':'成年'}，${Object.values(o).map(id=>item(id)?.name).filter(Boolean).join('、')}"><ellipse cx="130" cy="264" rx="78" ry="12" fill="#957258" opacity=".12"/><g transform="translate(${130*(1-scale)} ${262*(1-scale)}) scale(${scale})">
 ${clothingBackArt(o.top)}
 ${cat?`<path d="M179 227 Q242 217 219 173" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round"/>`:''}
 <ellipse cx="130" cy="206" rx="54" ry="57" fill="${sp.id==='turtle'?'#789764':c}"/><ellipse cx="107" cy="253" rx="24" ry="13" fill="${features.limbs||c}"/><ellipse cx="156" cy="253" rx="24" ry="13" fill="${features.limbs||c}"/>
 <ellipse cx="130" cy="212" rx="35" ry="39" fill="#fff0dc"/>
 ${themeArt(o.bottom)}
 ${themeArt(o.top)}
 ${outfitArt(o.dress)}
 ${paintArt(o.makeupBody,p.species)}
 <ellipse cx="80" cy="198" rx="16" ry="28" transform="rotate(22 80 198)" fill="${features.limbs||c}"/><ellipse cx="181" cy="197" rx="16" ry="28" transform="rotate(-30 181 197)" fill="${features.limbs||c}"/>
 ${paintArt(o.makeupPaw,p.species)}
 ${outfitArt(o.bracelet)}
 ${features.ears||ears}<ellipse cx="130" cy="117" rx="66" ry="61" fill="${c}"/>
 ${features.mask||''}
 ${sp.id==='fox'?'<path d="M65 110 Q87 118 129 145 Q171 118 195 110 Q191 179 130 178 Q69 178 65 110" fill="#fff1df"/>':''}
 <ellipse cx="106" cy="120" rx="5.5" ry="7" fill="#594739"/><ellipse cx="155" cy="120" rx="5.5" ry="7" fill="#594739"/><circle cx="108" cy="118" r="1.8" fill="white"/><circle cx="157" cy="118" r="1.8" fill="white"/>
 ${features.nose|| (wing?'<path d="M120 136 L132 147 144 136 132 129Z" fill="#d69947"/>':'<path d="M123 137 Q131 131 139 137 L131 143Z" fill="#bb847d"/><path d="M131 143 Q124 153 118 146 M131 143 Q138 153 144 146" fill="none" stroke="#8c665a" stroke-width="2.6" stroke-linecap="round"/>')}
 <ellipse cx="89" cy="140" rx="12" ry="7" fill="#e5a497" opacity=".55"/><ellipse cx="174" cy="140" rx="12" ry="7" fill="#e5a497" opacity=".55"/>
 ${cat?'<path d="M80 133 L58 130 M80 144 L57 147 M181 133 L204 130 M181 144 L203 147" stroke="#b28870" stroke-width="2.5" stroke-linecap="round"/>':''}
 ${features.fluff||''}
 ${paintArt(o.makeup,p.species)}
 ${paintArt(o.makeupEar,p.species)}
 ${outfitArt(o.clip)}
 ${l>=2?'<path d="M107 173 L131 181 152 172" fill="none" stroke="#e4b964" stroke-width="6"/>':''}
 ${l===3?`<path d="M104 58 L100 37 117 46 130 26 144 46 161 37 156 58Z" fill="#efcb77" stroke="#d9b263" stroke-width="2"/><circle cx="130" cy="46" r="4" fill="#e398aa"/>`:''}
 ${themeArt(o.hand)}
 </g></svg>`;
}
export function eggArt(){return `<svg class="egg-art" viewBox="0 0 200 230" role="img" aria-label="等待孵化的魔法蛋"><ellipse cx="100" cy="211" rx="61" ry="10" fill="#bb9f8a" opacity=".15"/><path d="M100 28 C145 28 173 118 168 155 C162 220 35 220 31 155 C27 116 57 28 100 28" fill="#f9e7e0" stroke="#deb9b8" stroke-width="3"/><path d="M34 142 Q68 108 101 141 T166 140" fill="none" stroke="#e5b4c6" stroke-width="14"/>${star(103,86,22,'#e7bf76')}${star(76,178,12,'#e7bf76')}${star(133,176,9,'#c7bad8')}${star(29,59,10)}${star(177,91,10)}</svg>`;}
export function mapArt(){return `<svg class="map-bg" viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true"><rect width="1000" height="440" fill="#eaf0df"/><path d="M0 20 Q160 80 310 30 T660 20 T1000 80 V0 H0" fill="#dce8cf"/><path d="M410 -30 Q590 80 455 176 T546 470" stroke="#bddbd7" stroke-width="62" fill="none"/><path d="M407 -30 Q581 80 449 176 T540 470" stroke="#d0e5de" stroke-width="5" fill="none"/><path d="M0 360 Q200 268 345 338 T710 365 T1000 315" stroke="#faf5df" stroke-width="47" fill="none"/><g fill="#cadab7"><circle cx="180" cy="75" r="65"/><circle cx="745" cy="150" r="65"/><circle cx="310" cy="230" r="46"/><circle cx="700" cy="417" r="65"/></g><g fill="#abc49e"><circle cx="183" cy="67" r="39"/><circle cx="756" cy="137" r="38"/><circle cx="308" cy="219" r="26"/></g><g fill="#edc794"><circle cx="335" cy="80" r="5"/><circle cx="355" cy="88" r="5"/><circle cx="650" cy="252" r="5"/><circle cx="680" cy="265" r="5"/></g></svg>`;}
