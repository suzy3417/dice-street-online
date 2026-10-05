-- Apply to the existing king-5v5 project. The existing four-argument function remains
-- available for clients that have not refreshed yet.
create or replace function public.dice_create_room(
  p_name text,
  p_token text,
  p_count integer,
  p_harbor boolean,
  p_millionaire boolean
)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c text; st jsonb;
begin
  if length(trim(p_name)) not between 1 and 20 or length(p_token)<24 or p_count not in (4,5) or (p_count=5 and p_harbor is not true) then
    raise exception '昵称、令牌或模式无效';
  end if;
  loop
    c:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
    exit when not exists(select 1 from public.dice_rooms where code=c);
  end loop;
  st:=jsonb_build_object('status','lobby','settings',jsonb_build_object('playerCount',p_count,'harbor',coalesce(p_harbor,false),'millionaire',coalesce(p_millionaire,false)),'players',jsonb_build_array(jsonb_build_object('name',trim(p_name))));
  insert into public.dice_rooms(code,state) values(c,st);
  insert into public.dice_room_members(room_code,seat,token_hash) values(c,0,md5(p_token));
  return jsonb_build_object('code',c,'state',st,'version',1,'seat',0);
end $$;

revoke all on function public.dice_create_room(text,text,integer,boolean,boolean) from public;
grant execute on function public.dice_create_room(text,text,integer,boolean,boolean) to anon,authenticated;
notify pgrst, 'reload schema';
