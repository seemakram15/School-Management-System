-- 011_fee_module.sql
-- Fee Management Tables

-- Fee Types: reusable categories (Tuition, Transport, Exam, etc.)
create table if not exists fee_types (
  id serial primary key,
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  description text,
  status smallint not null default 1 check (status in (0, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fee Structures: amount per fee_type × class × academic_year
create table if not exists fee_structures (
  id serial primary key,
  school_id uuid references schools(id) on delete cascade,
  fee_type_id int not null references fee_types(id) on delete cascade,
  class_id int not null references i_classes(id) on delete cascade,
  academic_year_id int not null references academic_years(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  frequency text not null default 'monthly' check (frequency in ('monthly','quarterly','yearly','one_time')),
  due_day smallint not null default 10 check (due_day between 1 and 28),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(fee_type_id, class_id, academic_year_id)
);

-- Fee Invoices: one per student × fee_type × period
create table if not exists fee_invoices (
  id serial primary key,
  school_id uuid references schools(id) on delete cascade,
  registration_id int not null references registrations(id) on delete cascade,
  fee_type_id int not null references fee_types(id) on delete cascade,
  academic_year_id int not null references academic_years(id) on delete cascade,
  invoice_no text not null,
  month smallint,          -- 1-12, null for one_time/yearly
  year smallint,           -- e.g. 2026
  amount numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  fine numeric(12,2) not null default 0,
  net_amount numeric(12,2) generated always as (amount - discount + fine) stored,
  due_date date not null,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid','waived')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(registration_id, fee_type_id, month, year)
);

-- Fee Payments: actual payments against an invoice
create table if not exists fee_payments (
  id serial primary key,
  school_id uuid references schools(id) on delete cascade,
  invoice_id int not null references fee_invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  payment_method text not null default 'cash' check (payment_method in ('cash','cheque','bank_transfer','online')),
  reference_no text,
  note text,
  collected_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Fee Discounts: per-student concession per fee_type
create table if not exists fee_discounts (
  id serial primary key,
  school_id uuid references schools(id) on delete cascade,
  registration_id int not null references registrations(id) on delete cascade,
  fee_type_id int not null references fee_types(id) on delete cascade,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(registration_id, fee_type_id)
);

-- Indexes
create index if not exists idx_fee_types_school on fee_types(school_id);
create index if not exists idx_fee_structures_school on fee_structures(school_id);
create index if not exists idx_fee_invoices_school on fee_invoices(school_id);
create index if not exists idx_fee_invoices_status on fee_invoices(status);
create index if not exists idx_fee_invoices_due_date on fee_invoices(due_date);
create index if not exists idx_fee_invoices_registration on fee_invoices(registration_id);
create index if not exists idx_fee_payments_invoice on fee_payments(invoice_id);

-- RLS
alter table fee_types enable row level security;
alter table fee_structures enable row level security;
alter table fee_invoices enable row level security;
alter table fee_payments enable row level security;
alter table fee_discounts enable row level security;

create policy "service_role_fee_types" on fee_types for all using (auth.role() = 'service_role');
create policy "service_role_fee_structures" on fee_structures for all using (auth.role() = 'service_role');
create policy "service_role_fee_invoices" on fee_invoices for all using (auth.role() = 'service_role');
create policy "service_role_fee_payments" on fee_payments for all using (auth.role() = 'service_role');
create policy "service_role_fee_discounts" on fee_discounts for all using (auth.role() = 'service_role');

-- Seed permissions
insert into permissions (name, slug) values
  ('Manage Fees', 'fees.manage'),
  ('Collect Fees', 'fees.collect'),
  ('View Fee Reports', 'fees.report')
on conflict (slug) do nothing;
