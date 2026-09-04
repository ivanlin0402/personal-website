-- Visitor counter tables for the personal site footer.
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).

-- 1. Anonymous visitor IDs (no personal data — only a random browser UUID)
create table if not exists public.visitors (
  visitor_id text primary key,
  created_at timestamptz not null default now()
);

-- 2. Single-row site stats (total unique visits)
create table if not exists public.site_stats (
  id int primary key default 1 check (id = 1),
  total_visits bigint not null default 0
);

insert into public.site_stats (id, total_visits)
values (1, 0)
on conflict (id) do nothing;

-- 3. Register a unique visit and return the current total.
--    Idempotent: the same visitor_id will not increment the count twice.
create or replace function public.register_visit(p_visitor_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total bigint;
  v_rows int;
begin
  -- Reject empty / oversized IDs
  if p_visitor_id is null
     or length(trim(p_visitor_id)) < 8
     or length(p_visitor_id) > 64 then
    raise exception 'invalid visitor_id';
  end if;

  insert into public.visitors (visitor_id)
  values (p_visitor_id)
  on conflict (visitor_id) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    update public.site_stats
    set total_visits = total_visits + 1
    where id = 1;
  end if;

  select total_visits into v_total
  from public.site_stats
  where id = 1;

  return coalesce(v_total, 0);
end;
$$;

-- Allow the anon key to call the function (used by the Next.js API route)
grant execute on function public.register_visit(text) to anon, authenticated;

-- Lock down direct table access from the client
alter table public.visitors enable row level security;
alter table public.site_stats enable row level security;

-- Optional: allow reading the total only (the API uses the RPC above)
create policy "Anyone can read site stats"
  on public.site_stats
  for select
  to anon, authenticated
  using (true);
