-- Corrective migration: align schema with columns the application actually uses.

alter table employees
  add column if not exists blood_group text,
  add column if not exists nationality text,
  add column if not exists present_address text,
  add column if not exists permanent_address text,
  add column if not exists father_name text,
  add column if not exists father_phone_no text,
  add column if not exists mother_name text,
  add column if not exists mother_phone_no text,
  add column if not exists guardian text,
  add column if not exists guardian_phone_no text,
  add column if not exists sms_receive_no smallint not null default 0;

alter table i_classes
  add column if not exists numeric_value int,
  add column if not exists have_selective_subject boolean not null default false,
  add column if not exists max_selective_subject int,
  add column if not exists have_elective_subject boolean not null default false;
update i_classes set numeric_value = numeric_name where numeric_value is null;

alter table subjects
  add column if not exists code text;

alter table academic_years
  add column if not exists start_date date,
  add column if not exists end_date date;

alter table registrations
  add column if not exists regi_no text,
  add column if not exists card_no text,
  add column if not exists board_regi_no text,
  add column if not exists shift text,
  add column if not exists house text;

alter table student_subjects rename to registration_subjects;
alter table registration_subjects
  add column if not exists type text not null default 'core';

alter table teacher_profiles
  add column if not exists subject_id int references subjects(id);

alter table leaves
  add column if not exists leave_type text;

alter table student_attendances
  add column if not exists class_id int references i_classes(id),
  add column if not exists section_id int references sections(id),
  add column if not exists academic_year_id int references academic_years(id);

alter table exams
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists class_id int references i_classes(id);

alter table grades
  add column if not exists pass_mark numeric;

alter table exam_rules
  add column if not exists marks_distribution jsonb;

alter table marks
  add column if not exists marks_data jsonb,
  add column if not exists total_marks numeric,
  add column if not exists is_absent boolean not null default false,
  add column if not exists class_id int references i_classes(id),
  add column if not exists section_id int references sections(id),
  add column if not exists academic_year_id int references academic_years(id);

alter table results
  add column if not exists academic_year_id int references academic_years(id),
  add column if not exists class_id int references i_classes(id),
  add column if not exists publish_date timestamptz;
