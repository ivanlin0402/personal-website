-- Global F1 Time Trial leaderboard (top 50 last-lap times).
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
-- Re-run this file to update functions if you already created the table.

create table if not exists public.f1_laps (
  id bigint generated always as identity primary key,
  team text not null,
  driver text not null,
  lap_time double precision not null check (lap_time >= 5 and lap_time <= 900),
  created_at timestamptz not null default now()
);

create index if not exists f1_laps_time_idx on public.f1_laps (lap_time asc);

create or replace function public.get_f1_leaderboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'team', team,
        'driver', driver,
        'time', lap_time
      )
      order by lap_time asc
    ),
    '[]'::jsonb
  )
  into v_rows
  from (
    select team, driver, lap_time
    from public.f1_laps
    order by lap_time asc
    limit 50
  ) t;

  return v_rows;
end;
$$;

create or replace function public.submit_f1_lap(
  p_team text,
  p_driver text,
  p_lap_time double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rank int;
begin
  if p_team is null or length(trim(p_team)) < 1 or length(p_team) > 40 then
    raise exception 'invalid team';
  end if;
  if p_driver is null or length(trim(p_driver)) < 1 or length(p_driver) > 40 then
    raise exception 'invalid driver';
  end if;
  if p_lap_time is null or p_lap_time < 5 or p_lap_time > 900 then
    raise exception 'invalid lap time';
  end if;

  insert into public.f1_laps (team, driver, lap_time)
  values (trim(p_team), trim(p_driver), p_lap_time);

  select count(*)::int + 1
  into v_rank
  from public.f1_laps
  where lap_time < p_lap_time;

  -- Keep table small: delete anything outside the best 250 (ranks beyond top 50 still work)
  delete from public.f1_laps
  where id in (
    select id
    from public.f1_laps
    order by lap_time asc
    offset 250
  );

  return jsonb_build_object(
    'board', public.get_f1_leaderboard(),
    'last', jsonb_build_object(
      'team', trim(p_team),
      'driver', trim(p_driver),
      'time', p_lap_time,
      'rank', v_rank
    )
  );
end;
$$;

grant execute on function public.get_f1_leaderboard() to anon, authenticated;
grant execute on function public.submit_f1_lap(text, text, double precision) to anon, authenticated;

alter table public.f1_laps enable row level security;
-- No direct table policies: clients use RPCs only.
