-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ROLES & USERS
-- ============================================================
create table if not exists roles (
  id serial primary key,
  name text not null unique,
  deletable boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- app_users mirrors auth.users but stores school-specific fields
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique,
  email text not null unique,
  phone_no varchar(15),
  force_logout boolean not null default false,
  status smallint not null default 1 check (status in (0, 1)),
  is_super_admin boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id int not null references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists permissions (
  id serial primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists roles_permissions (
  role_id int not null references roles(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists users_permissions (
  user_id uuid not null references users(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  primary key (user_id, permission_id)
);

-- ============================================================
-- ACADEMIC YEARS
-- ============================================================
create table if not exists academic_years (
  id serial primary key,
  title text not null,
  year varchar(10) not null,
  is_running boolean not null default false,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CLASSES, SECTIONS, SUBJECTS
-- ============================================================
create table if not exists i_classes (
  id serial primary key,
  name text not null,
  numeric_name int,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists sections (
  id serial primary key,
  class_id int not null references i_classes(id) on delete cascade,
  name text not null,
  capacity int not null default 40,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists subjects (
  id serial primary key,
  class_id int not null references i_classes(id) on delete cascade,
  name text not null,
  type smallint not null default 1, -- 1=compulsory, 2=optional
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- ============================================================
-- STUDENTS
-- ============================================================
create table if not exists students (
  id serial primary key,
  user_id uuid references users(id) on delete set null,
  name text not null,
  nick_name varchar(50),
  dob varchar(10) not null,
  gender smallint not null default 1 check (gender in (1, 2)),
  religion text,
  blood_group varchar(10),
  nationality varchar(50),
  photo text,
  email varchar(100),
  phone_no text,
  extra_activity text,
  note varchar(500),
  father_name text,
  father_phone_no varchar(15),
  mother_name text,
  mother_phone_no varchar(15),
  guardian text,
  guardian_phone_no varchar(15),
  present_address varchar(500),
  permanent_address varchar(500) not null,
  sms_receive_no smallint not null default 1 check (sms_receive_no in (0, 1, 2, 3)),
  siblings text,
  signature text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists student_info_log (
  student_id int not null references students(id) on delete cascade,
  academic_year_id int not null references academic_years(id) on delete cascade,
  meta_key text not null,
  meta_value text,
  created_at timestamptz default now()
);

create table if not exists registrations (
  id serial primary key,
  student_id int not null references students(id) on delete cascade,
  class_id int not null references i_classes(id),
  section_id int not null references sections(id),
  academic_year_id int not null references academic_years(id),
  roll_no varchar(20),
  is_promoted boolean not null default false,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists student_subjects (
  id serial primary key,
  registration_id int not null references registrations(id) on delete cascade,
  subject_id int not null references subjects(id),
  created_at timestamptz default now()
);

-- ============================================================
-- EMPLOYEES / HRM
-- ============================================================
create table if not exists employees (
  id serial primary key,
  user_id uuid references users(id) on delete set null,
  role_id int not null references roles(id),
  id_card varchar(50) not null unique,
  name text not null,
  designation smallint,
  qualification text,
  dob varchar(10) not null,
  gender smallint not null default 1 check (gender in (1, 2)),
  religion smallint not null default 1 check (religion in (1, 2, 3, 4, 5)),
  email varchar(100),
  phone_no varchar(15),
  address varchar(500),
  joining_date date not null,
  leave_date date,
  photo text,
  signature text,
  shift smallint not null default 1 check (shift in (1, 2)),
  duty_start time,
  duty_end time,
  status smallint not null default 1 check (status in (0, 1)),
  "order" smallint not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists teacher_profiles (
  id serial primary key,
  employee_id int not null references employees(id) on delete cascade,
  about text,
  facebook text,
  twitter text,
  linkedin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists teacher_subjects (
  id serial primary key,
  teacher_id int not null references employees(id) on delete cascade,
  subject_id int not null references subjects(id),
  section_id int not null references sections(id),
  academic_year_id int not null references academic_years(id),
  created_at timestamptz default now()
);

create table if not exists leaves (
  id serial primary key,
  employee_id int not null references employees(id) on delete cascade,
  apply_date date not null,
  from_date date not null,
  to_date date not null,
  total_days int not null default 1,
  reason text,
  status smallint not null default 0 check (status in (0, 1, 2)), -- 0=pending,1=approved,2=rejected
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table if not exists student_attendances (
  id serial primary key,
  registration_id int not null references registrations(id) on delete cascade,
  attendance_date date not null,
  attendance smallint not null default 1 check (attendance in (0, 1, 2)), -- 0=absent,1=present,2=late
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(registration_id, attendance_date)
);

create table if not exists employee_attendances (
  id serial primary key,
  employee_id int not null references employees(id) on delete cascade,
  attendance_date date not null,
  attendance smallint not null default 1 check (attendance in (0, 1, 2)),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employee_id, attendance_date)
);

-- ============================================================
-- EXAM, GRADES, MARKS, RESULTS
-- ============================================================
create table if not exists exams (
  id serial primary key,
  academic_year_id int not null references academic_years(id),
  name text not null,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists grades (
  id serial primary key,
  academic_year_id int not null references academic_years(id),
  name text not null,
  percent_from numeric(5,2) not null,
  percent_to numeric(5,2) not null,
  grade_point numeric(4,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists exam_rules (
  id serial primary key,
  exam_id int not null references exams(id) on delete cascade,
  class_id int not null references i_classes(id),
  subject_id int not null references subjects(id),
  total_marks int not null default 100,
  pass_marks int not null default 33,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists marks (
  id serial primary key,
  registration_id int not null references registrations(id) on delete cascade,
  exam_id int not null references exams(id),
  subject_id int not null references subjects(id),
  marks numeric(6,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(registration_id, exam_id, subject_id)
);

create table if not exists results (
  id serial primary key,
  registration_id int not null references registrations(id) on delete cascade,
  exam_id int not null references exams(id),
  total_marks numeric(8,2) not null default 0,
  obtained_marks numeric(8,2) not null default 0,
  percentage numeric(5,2) not null default 0,
  grade_id int references grades(id),
  is_pass boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(registration_id, exam_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  notifiable_type text not null,
  notifiable_id uuid not null,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WEBSITE / CMS
-- ============================================================
create table if not exists events (
  id serial primary key,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists sliders (
  id serial primary key,
  title text not null,
  sub_title text,
  image text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists testimonials (
  id serial primary key,
  name text not null,
  designation text,
  message text not null,
  photo text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists class_profiles (
  id serial primary key,
  class_id int not null references i_classes(id) on delete cascade,
  description text,
  image text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_metas (
  id serial primary key,
  meta_key text not null unique,
  meta_value text,
  updated_at timestamptz default now()
);

create table if not exists site_metas (
  id serial primary key,
  meta_key text not null unique,
  meta_value text,
  updated_at timestamptz default now()
);

-- ============================================================
-- SEED: DEFAULT ROLES & PERMISSIONS
-- ============================================================
insert into roles (name, deletable) values
  ('superadmin', false),
  ('admin', false),
  ('teacher', true),
  ('student', true),
  ('accountant', true),
  ('librarian', true)
on conflict (name) do nothing;

insert into permissions (name, slug) values
  ('View Dashboard', 'dashboard.view'),
  ('Manage Students', 'students.manage'),
  ('Manage Teachers', 'teachers.manage'),
  ('Manage Employees', 'employees.manage'),
  ('Manage Attendance', 'attendance.manage'),
  ('Manage Exams', 'exams.manage'),
  ('Manage Marks', 'marks.manage'),
  ('View Results', 'results.view'),
  ('Manage Promotion', 'promotion.manage'),
  ('View Reports', 'reports.view'),
  ('Manage Academic', 'academic.manage'),
  ('Manage Users', 'users.manage'),
  ('Manage Roles', 'roles.manage'),
  ('Manage Settings', 'settings.manage'),
  ('Manage Website', 'website.manage'),
  ('Manage Notifications', 'notifications.manage'),
  ('Manage HRM', 'hrm.manage')
on conflict (slug) do nothing;

insert into app_metas (meta_key, meta_value) values
  ('institute_name', 'CloudSchool'),
  ('institute_short_name', 'CS'),
  ('institute_address', ''),
  ('institute_phone', ''),
  ('institute_email', ''),
  ('institute_website', ''),
  ('institute_logo', null),
  ('academic_year_id', null),
  ('currency', 'USD'),
  ('date_format', 'Y-m-d'),
  ('attendance_type', '1'),
  ('hrm_policy', null)
on conflict (meta_key) do nothing;

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table users enable row level security;
alter table students enable row level security;
alter table employees enable row level security;
alter table notifications enable row level security;

-- Allow authenticated users to read their own user record
create policy "Users can view own record" on users
  for select using (auth.uid() = id);

-- Allow service role full access (for API routes)
create policy "Service role full access to users" on users
  for all using (auth.role() = 'service_role');

create policy "Service role full access to students" on students
  for all using (auth.role() = 'service_role');

create policy "Service role full access to employees" on employees
  for all using (auth.role() = 'service_role');

-- Notifications: users see only their own
create policy "Users see own notifications" on notifications
  for select using (notifiable_id = auth.uid());

create policy "Service role full access to notifications" on notifications
  for all using (auth.role() = 'service_role');
