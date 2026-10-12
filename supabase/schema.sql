-- WebAlchemy Invites — run this in Supabase SQL Editor (once)

create extension if not exists "pgcrypto";

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  edit_token uuid unique not null default gen_random_uuid(),
  template text not null default 'emerald-noir',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references invites(id) on delete cascade,
  name text not null,
  email text,
  attending text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invite_idx on rsvps(invite_id, created_at desc);

-- Lock everything down: only the service-role key (server-side API routes)
-- can read/write. No anon policies on purpose.
alter table invites enable row level security;
alter table rsvps enable row level security;
