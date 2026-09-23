-- Run once in Supabase SQL Editor. Public rooms are accessible by their random code.
create table if not exists public.dice_rooms (
  code text primary key,
  state jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists public.dice_room_members (
  room_code text not null references public.dice_rooms(code) on delete cascade,
  seat integer not null,
  token_hash text not null,
  primary key(room_code,seat),
  unique(room_code,token_hash)
);
create index if not exists dice_rooms_created_at on public.dice_rooms(created_at);
alter table public.dice_rooms enable row level security;
alter table public.dice_room_members enable row level security;
revoke all on public.dice_rooms from anon,authenticated;
revoke all on public.dice_room_members from anon,authenticated;

create or replace function public.dice_create_room(p_name text,p_token text,p_count integer,p_millionaire boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c text; st jsonb;
begin
  if length(trim(p_name)) not between 1 and 20 or length(p_token)<24 or p_count not in (4,5) then raise exception '鏄电О銆佷护鐗屾垨浜烘暟鏃犳晥'; end if;
  loop
    c:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
    exit when not exists(select 1 from public.dice_rooms where code=c);
  end loop;
  st:=jsonb_build_object('status','lobby','settings',jsonb_build_object('playerCount',p_count,'harbor',p_count=5,'millionaire',coalesce(p_millionaire,false)),'players',jsonb_build_array(jsonb_build_object('name',trim(p_name))));
  insert into public.dice_rooms(code,state) values(c,st);
  insert into public.dice_room_members(room_code,seat,token_hash) values(c,0,md5(p_token));
  return jsonb_build_object('code',c,'state',st,'version',1,'seat',0);
end $$;

create or replace function public.dice_join_room(p_code text,p_name text,p_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.dice_rooms%rowtype; seat_no integer; st jsonb;
begin
  if length(trim(p_name)) not between 1 and 20 or length(p_token)<24 then raise exception '鏄电О鎴栦护鐗屾棤鏁�'; end if;
  select * into r from public.dice_rooms where code=upper(trim(p_code)) for update;
  if not found then raise exception '鎴块棿涓嶅瓨鍦�'; end if;
  if r.state->>'status'<>'lobby' then raise exception '瀵瑰眬宸茬粡寮€濮�'; end if;
  seat_no:=jsonb_array_length(r.state->'players');
  if seat_no>=(r.state->'settings'->>'playerCount')::integer then raise exception '鎴块棿宸叉弧'; end if;
  st:=jsonb_set(r.state,'{players}',(r.state->'players')||jsonb_build_array(jsonb_build_object('name',trim(p_name))));
  update public.dice_rooms set state=st,version=version+1 where code=r.code;
  insert into public.dice_room_members(room_code,seat,token_hash) values(r.code,seat_no,md5(p_token));
  return jsonb_build_object('code',r.code,'state',st,'version',r.version+1,'seat',seat_no);
end $$;

create or replace function public.dice_read_room(p_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.dice_rooms%rowtype;
begin
  select * into r from public.dice_rooms where code=upper(trim(p_code));
  if not found then raise exception '鎴块棿涓嶅瓨鍦�'; end if;
  return jsonb_build_object('code',r.code,'state',r.state,'version',r.version);
end $$;

create or replace function public.dice_start_room(p_code text,p_token text,p_state jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.dice_rooms%rowtype; st jsonb; i integer;
begin
  select * into r from public.dice_rooms where code=upper(trim(p_code)) for update;
  if not found then raise exception '鎴块棿涓嶅瓨鍦�'; end if;
  if not exists(select 1 from public.dice_room_members where room_code=r.code and seat=0 and token_hash=md5(p_token)) then raise exception '鍙湁鎴夸富鑳藉紑濮�'; end if;
  if r.state->>'status'<>'lobby' then raise exception '瀵瑰眬宸茬粡寮€濮�'; end if;
  if jsonb_array_length(r.state->'players')<>(r.state->'settings'->>'playerCount')::integer then raise exception '璇风瓑寰呭叏閮ㄧ帺瀹跺姞鍏�'; end if;
  if p_state->'settings'<>r.state->'settings' then raise exception '妯″紡璁剧疆涓嶅尮閰�'; end if;
  if jsonb_array_length(p_state->'players')<>jsonb_array_length(r.state->'players') or p_state->>'phase'<>'roll' then raise exception '鍒濆鐘舵€佹棤鏁�'; end if;
  for i in 0..jsonb_array_length(r.state->'players')-1 loop
    if p_state->'players'->i->>'name'<>r.state->'players'->i->>'name' then raise exception '鐜╁鍚嶅崟涓嶅尮閰�'; end if;
  end loop;
  st:=p_state;
  update public.dice_rooms set state=st,version=version+1 where code=r.code;
  return jsonb_build_object('code',r.code,'state',st,'version',r.version+1);
end $$;

create or replace function public.dice_save_move(p_code text,p_token text,p_version integer,p_state jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.dice_rooms%rowtype; seat_no integer;
begin
  select * into r from public.dice_rooms where code=upper(trim(p_code)) for update;
  if not found then raise exception '鎴块棿涓嶅瓨鍦�'; end if;
  if r.version<>p_version then raise exception '鎴块棿宸叉洿鏂帮紝璇烽噸璇�'; end if;
  if r.state->>'status'='lobby' then raise exception '瀵瑰眬灏氭湭寮€濮�'; end if;
  select seat into seat_no from public.dice_room_members where room_code=r.code and token_hash=md5(p_token);
  if seat_no is null or seat_no<>(r.state->>'turn')::integer then raise exception '杩樻病杞埌浣�'; end if;
  if jsonb_array_length(p_state->'players')<>jsonb_array_length(r.state->'players') then raise exception '鐜╁浜烘暟涓嶈兘鏇存敼'; end if;
  if (p_state->>'version')::integer<>(r.state->>'version')::integer+1 then raise exception '鍥炲悎鐗堟湰鏃犳晥'; end if;
  update public.dice_rooms set state=p_state,version=version+1 where code=r.code;
  return jsonb_build_object('code',r.code,'state',p_state,'version',r.version+1);
end $$;

revoke all on function public.dice_create_room(text,text,integer,boolean),public.dice_join_room(text,text,text),public.dice_read_room(text),public.dice_start_room(text,text,jsonb),public.dice_save_move(text,text,integer,jsonb) from public;
grant execute on function public.dice_create_room(text,text,integer,boolean),public.dice_join_room(text,text,text),public.dice_read_room(text),public.dice_start_room(text,text,jsonb),public.dice_save_move(text,text,integer,jsonb) to anon,authenticated;

