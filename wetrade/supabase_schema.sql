-- ============================================
-- WeTrade Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Daily Plans
create table if not exists daily_plans (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  bias        text,
  goals       text,
  rules       text,
  max_loss    numeric,
  target      numeric,
  notes       text,
  is_shared   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, date)
);

-- Watchlist
create table if not exists watchlist (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  date           date not null,
  ticker         text not null,
  company        text,
  direction      text default 'Long',
  why_in_play    text,
  entry_criteria text,
  how_to_trade   text,
  stop_loss      text,
  target         text,
  risk_reward    text,
  is_shared      boolean default false,
  created_at     timestamptz default now()
);

-- Strategies
create table if not exists strategies (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  name                text not null,
  timeframe           text,
  setup_description   text,
  what_i_need_to_see  text,
  trigger             text,
  invalidation        text,
  sizing              text,
  notes               text,
  is_shared           boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS) — REQUIRED
-- This makes data private by default
-- ============================================

alter table daily_plans enable row level security;
alter table watchlist    enable row level security;
alter table strategies   enable row level security;

-- Daily Plans policies
create policy "Users manage own plans"
  on daily_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see shared plans"
  on daily_plans for select
  using (is_shared = true);

-- Watchlist policies
create policy "Users manage own watchlist"
  on watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see shared watchlist items"
  on watchlist for select
  using (is_shared = true);

-- Strategy policies
create policy "Users manage own strategies"
  on strategies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see shared strategies"
  on strategies for select
  using (is_shared = true);
