-- Missed in 002_schema_fixes.sql: app/api/employees/route.ts and the new-employee
-- form also read/write these two columns.
alter table employees
  add column if not exists extra_activity text,
  add column if not exists note varchar(500);
