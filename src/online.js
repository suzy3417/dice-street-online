// Supabase RPC transport. Put the public project URL and anon key in config.js.
import {supabaseUrl,supabaseAnonKey} from '../config.js';
const endpoint=(name)=>`${supabaseUrl.replace(/\/$/,'')}/rest/v1/rpc/${name}`;
export const onlineReady=Boolean(supabaseUrl&&supabaseAnonKey);
async function rpc(name,data){
  if(!onlineReady)throw Error('联机尚未配置：请先部署 Supabase 数据库并填写 config.js');
  const r=await fetch(endpoint(name),{method:'POST',headers:{'Content-Type':'application/json',apikey:supabaseAnonKey},body:JSON.stringify(data)});
  const value=await r.json();if(!r.ok)throw Object.assign(Error(value.message||value.error||'房间连接失败'),{code:value.code});return value;
}
export async function createRoom(name,token,count,harbor,millionaire){
  try{return await rpc('dice_create_room',{p_name:name,p_token:token,p_count:count,p_harbor:harbor,p_millionaire:millionaire});}
  catch(error){
    if(error.code!=='PGRST202')throw error;
    if(count===4&&harbor)throw Error('四人港口联机房间暂不可用，请先更新数据库。');
    return rpc('dice_create_room',{p_name:name,p_token:token,p_count:count,p_millionaire:millionaire});
  }
}
export const joinRoom=(code,name,token)=>rpc('dice_join_room',{p_code:code,p_name:name,p_token:token});
export const readRoom=code=>rpc('dice_read_room',{p_code:code});
export const startRoom=(code,token,state)=>rpc('dice_start_room',{p_code:code,p_token:token,p_state:state});
export const saveMove=(code,token,version,state)=>rpc('dice_save_move',{p_code:code,p_token:token,p_version:version,p_state:state});

