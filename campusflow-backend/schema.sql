-- ===== CampusFlow Supabase schema =====
-- Person 1: paste this whole file into Supabase -> SQL Editor -> Run.
-- Then go to Authentication -> Providers -> Email and TURN OFF "Confirm email"
-- so registration works instantly during the demo.

-- Students profile (id matches the Supabase Auth user id)
create table if not exists students (
  id uuid primary key,
  name text not null,
  email text unique not null,
  branch text,
  year text,
  phone text,                 -- WhatsApp number, e.g. +9198XXXXXXXX
  subjects text[] default '{}',
  created_at timestamptz default now()
);

-- Tasks / deadlines
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  subject text,
  deadline timestamptz not null,
  reminder_time timestamptz,
  add_to_calendar boolean default true,
  done boolean default false,
  created_at timestamptz default now()
);

-- Automation log (powers the "My Automations" page + green/pending status)
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  type text,                  -- 'deadline' | 'notice'
  status text,                -- 'success' | 'pending'
  detail text,
  created_at timestamptz default now()
);

-- Demo speed: disable RLS so the service-role backend just works.
-- (Fine for a hackathon. Mention in the README you'd add RLS policies for production.)
alter table students disable row level security;
alter table tasks disable row level security;
alter table automations disable row level security;
