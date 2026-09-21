-- SaaS Platform Tables
-- schools, plans, subscriptions + service provider flag on users

-- Add service provider flag and school link to users
alter table users
  add column if not exists is_service_provider boolean not null default false,
  add column if not exists school_id uuid;

-- Schools table — one per approved school owner
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references users(id) on delete cascade,
  tagline text,
  description text,
  address text,
  phone text,
  email text,
  logo_url text,
  hero_image_url text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- FK from users.school_id to schools
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'users_school_id_fkey' and table_name = 'users'
  ) then
    alter table users add constraint users_school_id_fkey
      foreign key (school_id) references schools(id) on delete set null;
  end if;
end $$;

-- Plans (3 tiers)
create table if not exists plans (
  id serial primary key,
  name text not null,
  price_pkr int not null,
  max_students int, -- null = unlimited
  features jsonb not null default '[]',
  is_popular boolean not null default false,
  sort_order int not null default 0,
  status smallint not null default 1,
  created_at timestamptz default now()
);

-- Seed plans (idempotent)
insert into plans (name, price_pkr, max_students, features, is_popular, sort_order) values
  ('Basic', 2000, 200,
   '["Up to 200 students","Attendance tracking","Marks & exam management","Student profiles","Basic reports","Email support"]',
   false, 1),
  ('Standard', 4000, 500,
   '["Up to 500 students","Everything in Basic","HRM & employee management","Leave management","Advanced reports","School public website","Priority email support"]',
   true, 2),
  ('Premium', 8000, null,
   '["Unlimited students","Everything in Standard","Custom branding","Dedicated account manager","Early feature access","Phone & WhatsApp support"]',
   false, 3)
on conflict do nothing;

-- Subscriptions — tracks plan purchase + payment proof
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  plan_id int not null references plans(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payment_method text not null check (payment_method in ('jazzcash', 'meezan')),
  transaction_id text not null,
  screenshot_url text not null,
  admin_notes text,
  approved_at timestamptz,
  approved_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for new tables
alter table schools enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;

-- Service providers can read/write everything
create policy "service_provider_all_schools" on schools
  for all using (
    exists (select 1 from users where id = auth.uid() and is_service_provider = true)
  );

create policy "service_provider_all_subscriptions" on subscriptions
  for all using (
    exists (select 1 from users where id = auth.uid() and is_service_provider = true)
  );

-- School owners can read/update their own school
create policy "owner_read_own_school" on schools
  for select using (owner_id = auth.uid());

create policy "owner_update_own_school" on schools
  for update using (owner_id = auth.uid());

-- School owners can read their own subscriptions
create policy "owner_read_own_subscriptions" on subscriptions
  for select using (
    school_id in (select id from schools where owner_id = auth.uid())
  );

-- Only authenticated users can insert their own school (owner_id must equal caller)
create policy "auth_insert_school" on schools
  for insert with check (owner_id = auth.uid());

-- Only owners can insert a subscription for their own school
create policy "auth_insert_subscription" on subscriptions
  for insert with check (
    school_id in (select id from schools where owner_id = auth.uid())
  );

-- Plans are publicly readable
create policy "plans_public_read" on plans
  for select using (true);
