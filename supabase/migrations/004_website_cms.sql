-- New tables backing the "Website" admin CMS section (About/Service/Statistics/
-- Gallery/FAQ/Timeline/Contact/Newsletter) and the public marketing site.
-- Mirrors the Laravel app's SiteController-managed content (routes/website.php).

create table if not exists about_content (
  id serial primary key,
  title text not null default 'About Us',
  description text,
  updated_at timestamptz default now()
);
insert into about_content (id, title) values (1, 'About Us') on conflict (id) do nothing;

create table if not exists about_content_images (
  id serial primary key,
  image text not null,
  caption text,
  "order" smallint not null default 0,
  created_at timestamptz default now()
);

create table if not exists services (
  id serial primary key,
  title text not null,
  description text,
  icon text,
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists statistics (
  id serial primary key,
  label text not null,
  value text not null,
  icon text,
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists gallery_images (
  id serial primary key,
  image text not null,
  caption text,
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now()
);

create table if not exists faqs (
  id serial primary key,
  question text not null,
  answer text not null,
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists timeline_items (
  id serial primary key,
  year text not null,
  title text not null,
  description text,
  "order" smallint not null default 0,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists newsletter_subscribers (
  id serial primary key,
  email text not null unique,
  created_at timestamptz default now()
);

-- Public teacher bio (distinct from the employee/teacher record itself) already
-- has a home: the existing `teacher_profiles` table (about, facebook, twitter,
-- linkedin, subject_id) from 001_initial_schema.sql. No new table needed.

insert into site_metas (meta_key, meta_value) values
  ('analytics_code', ''),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('youtube_url', ''),
  ('linkedin_url', ''),
  ('site_tagline', '')
on conflict (meta_key) do nothing;
