create table if not exists public.user_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by_device text not null
);

alter table public.user_states enable row level security;

drop policy if exists "Users can read their own state" on public.user_states;
create policy "Users can read their own state"
on public.user_states for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own state" on public.user_states;
create policy "Users can insert their own state"
on public.user_states for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own state" on public.user_states;
create policy "Users can update their own state"
on public.user_states for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_states'
  ) then
    alter publication supabase_realtime add table public.user_states;
  end if;
end
$$;
