-- Add school_id to all core tables for multi-tenant isolation
-- Columns are nullable so existing data is not broken

alter table students       add column if not exists school_id uuid references schools(id) on delete cascade;
alter table employees      add column if not exists school_id uuid references schools(id) on delete cascade;
alter table i_classes      add column if not exists school_id uuid references schools(id) on delete cascade;
alter table sections       add column if not exists school_id uuid references schools(id) on delete cascade;
alter table subjects       add column if not exists school_id uuid references schools(id) on delete cascade;
alter table academic_years add column if not exists school_id uuid references schools(id) on delete cascade;
alter table exams          add column if not exists school_id uuid references schools(id) on delete cascade;
alter table grades         add column if not exists school_id uuid references schools(id) on delete cascade;
alter table exam_rules     add column if not exists school_id uuid references schools(id) on delete cascade;
alter table marks          add column if not exists school_id uuid references schools(id) on delete cascade;
alter table results        add column if not exists school_id uuid references schools(id) on delete cascade;
alter table student_attendances  add column if not exists school_id uuid references schools(id) on delete cascade;
alter table employee_attendances add column if not exists school_id uuid references schools(id) on delete cascade;
alter table leaves         add column if not exists school_id uuid references schools(id) on delete cascade;
alter table roles          add column if not exists school_id uuid references schools(id) on delete cascade;
alter table events         add column if not exists school_id uuid references schools(id) on delete cascade;
alter table notifications  add column if not exists school_id uuid references schools(id) on delete cascade;

-- Indexes for performance
create index if not exists idx_students_school       on students(school_id);
create index if not exists idx_employees_school      on employees(school_id);
create index if not exists idx_i_classes_school      on i_classes(school_id);
create index if not exists idx_academic_years_school on academic_years(school_id);
create index if not exists idx_exams_school          on exams(school_id);
create index if not exists idx_marks_school          on marks(school_id);
create index if not exists idx_results_school        on results(school_id);
create index if not exists idx_leaves_school         on leaves(school_id);

-- Update RLS: authenticated users see only their school's data
-- Students
drop policy if exists "authenticated_read_students" on students;
create policy "authenticated_read_students" on students
  for select using (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  );

drop policy if exists "authenticated_write_students" on students;
create policy "authenticated_write_students" on students
  for all
  using (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  )
  with check (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  );

-- Employees
drop policy if exists "authenticated_read_employees" on employees;
create policy "authenticated_read_employees" on employees
  for select using (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  );

drop policy if exists "authenticated_write_employees" on employees;
create policy "authenticated_write_employees" on employees
  for all
  using (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  )
  with check (
    auth.uid() is not null
    and (
      school_id in (select id from schools where owner_id = auth.uid())
      or school_id = (select school_id from users where id = auth.uid())
      or exists (select 1 from users where id = auth.uid() and is_service_provider = true)
    )
  );
