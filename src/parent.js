export async function pinHash(pin,salt){
 const bytes=new TextEncoder().encode(`${salt}:${pin}`);
 const key=await crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveBits']);
 const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function setupParent(pin,confirm){
 if(!/^\d{4,6}$/.test(pin))throw Error('请设置 4–6 位数字的家长密码。');
 if(pin!==confirm)throw Error('两次输入的密码不一致，请再试一次。');
 const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 return {salt,hash:await pinHash(pin,salt),failures:0,lockUntil:0};
}
export async function verifyParent(auth,pin,now=Date.now()){
 if(!auth)throw Error('请先由家长设置确认密码。');
 if(auth.lockUntil>now)throw Error(`请等 ${Math.ceil((auth.lockUntil-now)/1000)} 秒，再请家长输入。`);
 if(await pinHash(pin,auth.salt)!==auth.hash){auth.failures=(auth.failures||0)+1;if(auth.failures>=5){auth.lockUntil=now+60000;auth.failures=0;}throw Error(auth.lockUntil>now?'密码输入错误次数较多，请 1 分钟后再试。':'密码不正确，请让家长来确认。');}
 auth.failures=0;auth.lockUntil=0;return true;
}
