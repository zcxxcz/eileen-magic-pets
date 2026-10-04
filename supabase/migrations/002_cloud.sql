begin;
create table public.game_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null check(public.valid_game_state(state)),
 revision bigint not null check(revision>0),
 updated_at timestamptz not null default now()
);
create table public.game_save_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 revision bigint not null,
 state jsonb not null,
 updated_at timestamptz not null,
 primary key(user_id,revision)
);
-- Compact receipts are kept independently of the 20 snapshot limit.
create table public.game_save_operations (
 user_id uuid not null references auth.users(id) on delete cascade,
 operation_id uuid not null,
 revision bigint not null,
 primary key(user_id,operation_id)
);
alter table public.game_saves enable row level security;
alter table public.game_save_history enable row level security;
alter table public.game_save_operations enable row level security;
create policy own_save on public.game_saves for select to authenticated using(user_id=(select auth.uid()));
create policy own_history on public.game_save_history for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.game_saves,public.game_save_history,public.game_save_operations from anon,authenticated;
grant select on public.game_saves,public.game_save_history to authenticated;

create or replace function public.commit_game_save(p_state jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); current_row public.game_saves; next_revision bigint;
begin
 if uid is null then raise sqlstate 'PT401' using message='Login required'; end if;
 if p_operation_id is null or p_expected_revision is null or p_expected_revision<0 then raise sqlstate 'PT400' using message='Invalid request'; end if;
 -- Serializes initial inserts as well as subsequent changes for this account.
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into current_row from public.game_saves where user_id=uid;
 if exists(select 1 from public.game_save_operations where user_id=uid and operation_id=p_operation_id) then
  return jsonb_build_object('state',current_row.state,'revision',current_row.revision,'updated_at',current_row.updated_at);
 end if;
 if coalesce(current_row.revision,0)<>p_expected_revision then raise sqlstate 'PT409' using message='Revision conflict'; end if;
 if p_state is null or not public.valid_game_state(p_state) then raise sqlstate 'PT400' using message='Invalid save'; end if;
 next_revision:=coalesce(current_row.revision,0)+1;
 insert into public.game_saves(user_id,state,revision,updated_at) values(uid,p_state,next_revision,clock_timestamp())
 on conflict(user_id) do update set state=excluded.state,revision=excluded.revision,updated_at=excluded.updated_at
 returning * into current_row;
 insert into public.game_save_history values(uid,next_revision,p_state,current_row.updated_at);
 insert into public.game_save_operations values(uid,p_operation_id,next_revision);
 delete from public.game_save_history where user_id=uid and revision<=next_revision-20;
 return jsonb_build_object('state',current_row.state,'revision',current_row.revision,'updated_at',current_row.updated_at);
end;
$$;
revoke all on function public.commit_game_save(jsonb,bigint,uuid) from public,anon;
grant execute on function public.commit_game_save(jsonb,bigint,uuid) to authenticated;
commit;
