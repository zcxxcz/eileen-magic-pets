import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const client=url&&key?createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,signal:init?.signal||AbortSignal.timeout(12000)})}}):null;
const unwrap=({data,error})=>{if(error)throw error;return data;};
export const api=client?{
 read:async()=>unwrap(await client.from('game_saves').select('state,revision,updated_at').maybeSingle()),
 commit:async args=>unwrap(await client.rpc('commit_game_save',args)),
 history:async()=>unwrap(await client.from('game_save_history').select('state,revision,updated_at').order('revision',{ascending:false}).limit(20))
}:null;
