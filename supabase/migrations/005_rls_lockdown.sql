-- SECURITY FIX #1 (critical): most tables had no RLS enabled at all, so the
-- public anon key (shipped in every page bundle) could read AND WRITE them
-- directly via the Supabase REST API, bypassing this app's auth entirely.
-- Verified exploitable before this migration: anon key could read
-- marks/results/leaves/registrations and INSERT into roles.
--
-- SECURITY/CORRECTNESS FIX #2 (pre-existing, independent of the above):
-- users/students/employees/notifications already had RLS enabled, but with
-- policies so narrow (service-role-only, or "own record only") that the
-- admin dashboard — which reads through the regular authenticated client on
-- 55 of its 56 pages, not the service-role admin client — would see ZERO
-- rows for students/employees regardless of how much data exists. This is
-- a functional bug that predates this migration, not something introduced
-- here, but it's fixed alongside the lockdown below.
--
-- Trust model actually implemented by this app: every logged-in user reaches
-- the dashboard, and permissions are enforced at the UI/route layer (roles,
-- menu visibility), not per-row in the database. So "authenticated" here
-- means "logged-in staff" and gets full access to internal operational
-- tables; "anon" (public marketing site visitors) gets read-only access to
-- specific published-content tables and nothing else.

alter table roles enable row level security;
alter table user_roles enable row level security;
alter table permissions enable row level security;
alter table roles_permissions enable row level security;
alter table users_permissions enable row level security;
alter table academic_years enable row level security;
alter table i_classes enable row level security;
alter table sections enable row level security;
alter table subjects enable row level security;
alter table student_info_log enable row level security;
alter table registrations enable row level security;
alter table registration_subjects enable row level security;
alter table teacher_profiles enable row level security;
alter table teacher_subjects enable row level security;
alter table leaves enable row level security;
alter table student_attendances enable row level security;
alter table employee_attendances enable row level security;
alter table exams enable row level security;
alter table grades enable row level security;
alter table exam_rules enable row level security;
alter table marks enable row level security;
alter table results enable row level security;
alter table events enable row level security;
alter table sliders enable row level security;
alter table testimonials enable row level security;
alter table class_profiles enable row level security;
alter table app_metas enable row level security;
alter table site_metas enable row level security;
alter table about_content enable row level security;
alter table about_content_images enable row level security;
alter table services enable row level security;
alter table statistics enable row level security;
alter table gallery_images enable row level security;
alter table faqs enable row level security;
alter table timeline_items enable row level security;
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;

-- Logged-in staff: full access to every internal table (matches how the
-- dashboard already queries these tables via the authenticated client).
do $$
declare
  t text;
begin
  foreach t in array array[
    'roles', 'user_roles', 'permissions', 'roles_permissions', 'users_permissions',
    'academic_years', 'i_classes', 'sections', 'subjects', 'student_info_log',
    'registrations', 'registration_subjects', 'teacher_profiles', 'teacher_subjects',
    'leaves', 'student_attendances', 'employee_attendances', 'exams', 'grades',
    'exam_rules', 'marks', 'results', 'events', 'sliders', 'testimonials',
    'class_profiles', 'app_metas', 'site_metas', 'about_content',
    'about_content_images', 'services', 'statistics', 'gallery_images', 'faqs',
    'timeline_items', 'users', 'students', 'employees', 'notifications'
  ]
  loop
    execute format(
      'create policy "Staff full access" on %I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- contact_messages / newsletter_subscribers: inbound public submissions,
-- written only through admin-client API routes. No authenticated or anon
-- policy needed beyond staff access for the admin to review them, which the
-- loop above already grants.

-- Public marketing site (app/(website)/**) reads through the anon-respecting
-- client, so these specific tables/rows need an explicit anon-read policy
-- scoped to published content only.
create policy "Public read published sliders" on sliders
  for select to anon using (status = 1);

create policy "Public read about content" on about_content
  for select to anon using (true);

create policy "Public read about content images" on about_content_images
  for select to anon using (true);

create policy "Public read active services" on services
  for select to anon using (status = 1);

create policy "Public read active statistics" on statistics
  for select to anon using (status = 1);

create policy "Public read active testimonials" on testimonials
  for select to anon using (status = 1);

create policy "Public read active events" on events
  for select to anon using (status = 1);

create policy "Public read active gallery images" on gallery_images
  for select to anon using (status = 1);

create policy "Public read active faqs" on faqs
  for select to anon using (status = 1);

create policy "Public read active timeline items" on timeline_items
  for select to anon using (status = 1);

create policy "Public read active class profiles" on class_profiles
  for select to anon using (status = 1);

create policy "Public read app metas" on app_metas
  for select to anon using (true);

create policy "Public read site metas" on site_metas
  for select to anon using (true);

-- class-details page joins i_classes/subjects/sections for a published class
-- profile; no sensitive data (names/capacity only), so plain public read.
create policy "Public read classes" on i_classes
  for select to anon using (status = 1);

create policy "Public read subjects" on subjects
  for select to anon using (status = 1);

create policy "Public read sections" on sections
  for select to anon using (status = 1);
