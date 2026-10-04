-- SQL Editor integration tests. Everything, including temporary auth identities, is rolled back.
begin;
insert into auth.users(id) values('ad100000-0000-4000-8000-000000000001'),('ad100000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','ad100000-0000-4000-8000-000000000001',true);
do $$
declare s jsonb:='{"version":1,"pets":[],"selected":null,"stars":0,"tickets":0,"lessons":[],"owned":["wand"],"eggs":1,"hatched":0,"routes":{"out":[[10,72],[90,25]],"back":[[90,25],[10,72]]},"trip":null}'; r jsonb; n int;
begin
 r:=public.commit_game_save(s,0,'be100000-0000-4000-8000-000000000001');
 if (r->>'revision')::int<>1 then raise exception 'initial save failed'; end if;
 r:=public.commit_game_save(s,0,'be100000-0000-4000-8000-000000000001');
 if (r->>'revision')::int<>1 then raise exception 'idempotency failed'; end if;
 begin perform public.commit_game_save(s,0,gen_random_uuid());raise exception 'stale version accepted';exception when sqlstate 'PT409' then null;end;
 begin perform public.commit_game_save(jsonb_set(s,'{stars}','-1'),1,gen_random_uuid());raise exception 'invalid state accepted';exception when sqlstate 'PT400' then null;end;
 begin update public.game_saves set revision=99;raise exception 'direct writes accepted';exception when insufficient_privilege then null;end;
 for n in 1..25 loop r:=public.commit_game_save(s,n,gen_random_uuid());end loop;
 if (select count(*) from public.game_save_history)<>20 then raise exception 'history retention failed';end if;
 r:=public.commit_game_save(s,0,'be100000-0000-4000-8000-000000000001');
 if (r->>'revision')::int<>26 then raise exception 'receipt lost after pruning';end if;
end;$$;
select set_config('request.jwt.claim.sub','ad100000-0000-4000-8000-000000000002',true);
do $$
begin
 if exists(select 1 from public.game_saves) or exists(select 1 from public.game_save_history) then raise exception 'cross account read';end if;
 begin update public.game_saves set revision=99 where user_id='ad100000-0000-4000-8000-000000000001';raise exception 'cross account write';exception when insufficient_privilege then null;end;
end;$$;
reset role;
set local role anon;
do $$begin
 begin perform public.commit_game_save('{}',0,gen_random_uuid());raise exception 'anonymous write';exception when insufficient_privilege then null;end;
 begin perform * from public.game_saves;raise exception 'anonymous read';exception when insufficient_privilege then null;end;
end;$$;
reset role;
select 'PASS: validation, CAS conflict, idempotency, 20 snapshots, receipt retention, account isolation, anonymous denial' as result;
rollback;
