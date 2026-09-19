-- School public landing page content (multi-tenant, per school_id)
-- Each table scoped to a school so all schools share the same schema

-- Hero carousel slides
create table if not exists school_hero_slides (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references schools(id) on delete cascade,
  image_url text not null,
  caption text,
  "order" smallint not null default 0,
  created_at timestamptz default now()
);
create index if not exists school_hero_slides_school_id on school_hero_slides(school_id);

-- Principal / headmaster message
create table if not exists school_principal (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null unique references schools(id) on delete cascade,
  name text not null,
  title text not null default 'Principal',
  message text not null,
  photo_url text,
  updated_at timestamptz default now()
);

-- Events (recent school events)
create table if not exists school_events (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  description text,
  event_date date,
  image_url text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists school_events_school_id on school_events(school_id, status);

-- Achievements
create table if not exists school_achievements (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  description text,
  year text,
  icon text not null default 'trophy',
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists school_achievements_school_id on school_achievements(school_id, status);

-- RLS
alter table school_hero_slides enable row level security;
alter table school_principal enable row level security;
alter table school_events enable row level security;
alter table school_achievements enable row level security;

-- Public can read all (filtering status in query)
create policy "public_read_hero_slides" on school_hero_slides for select using (true);
create policy "public_read_principal" on school_principal for select using (true);
create policy "public_read_events" on school_events for select using (status = 1);
create policy "public_read_achievements" on school_achievements for select using (status = 1);

-- School owners manage their own content
create policy "owner_all_hero_slides" on school_hero_slides
  for all using (
    school_id in (select id from schools where owner_id = auth.uid())
  ) with check (
    school_id in (select id from schools where owner_id = auth.uid())
  );

create policy "owner_all_principal" on school_principal
  for all using (
    school_id in (select id from schools where owner_id = auth.uid())
  ) with check (
    school_id in (select id from schools where owner_id = auth.uid())
  );

create policy "owner_all_events" on school_events
  for all using (
    school_id in (select id from schools where owner_id = auth.uid())
  ) with check (
    school_id in (select id from schools where owner_id = auth.uid())
  );

create policy "owner_all_achievements" on school_achievements
  for all using (
    school_id in (select id from schools where owner_id = auth.uid())
  ) with check (
    school_id in (select id from schools where owner_id = auth.uid())
  );

-- Service providers manage everything
create policy "sp_all_hero_slides" on school_hero_slides
  for all using (exists (select 1 from users where id = auth.uid() and is_service_provider = true));
create policy "sp_all_principal" on school_principal
  for all using (exists (select 1 from users where id = auth.uid() and is_service_provider = true));
create policy "sp_all_events" on school_events
  for all using (exists (select 1 from users where id = auth.uid() and is_service_provider = true));
create policy "sp_all_achievements" on school_achievements
  for all using (exists (select 1 from users where id = auth.uid() and is_service_provider = true));
