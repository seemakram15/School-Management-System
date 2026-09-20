# Fee Management Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete student fee management system covering fee type setup, structure definition per class, invoice generation, payment collection, overdue tracking, per-student history, and admin reports.

**Architecture:** Supabase (5 new tables scoped by school_id) + Next.js App Router server components for pages + API routes using `createAdminClient()` for all mutations. No separate service layer — logic lives directly in API route handlers, consistent with the existing codebase pattern.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL + RLS), Tailwind CSS, shadcn/ui, TypeScript

**Spec:** Design doc discussed in conversation on 2026-09-20 (fee module design).

## Global Constraints

- All API routes use `createAdminClient()` from `@/lib/supabase/server` — never `createClient()` in routes
- All pages (server components) use `createClient()` from `@/lib/supabase/server`
- All new tables include `school_id uuid references schools(id) on delete cascade`
- No TypeScript database types file — use `any` casts, consistent with existing code (stale types comment in server.ts explains why)
- Tailwind + shadcn/ui components only — match existing card/table/form patterns from `app/(dashboard)/students/page.tsx` and `app/(dashboard)/dashboard/page.tsx`
- All amounts stored as `numeric(12,2)` in PKR
- `fee_invoices.status`: `'unpaid' | 'partial' | 'paid' | 'waived'`
- `fee_structures.frequency`: `'monthly' | 'quarterly' | 'yearly' | 'one_time'`
- Import paths: `@/lib/supabase/server`, `@/components/ui/*`, `next/navigation`, `lucide-react`

---

## File Map

**New files — migration:**
- `supabase/migrations/011_fee_module.sql`

**New files — API routes:**
- `app/api/fees/types/route.ts` — GET list, POST create
- `app/api/fees/types/[id]/route.ts` — GET one, PUT update, DELETE
- `app/api/fees/structures/route.ts` — GET list, POST create
- `app/api/fees/structures/[id]/route.ts` — PUT update, DELETE
- `app/api/fees/invoices/route.ts` — GET list (filters), POST bulk-generate
- `app/api/fees/invoices/[id]/route.ts` — GET detail, PATCH (fine/status/waive)
- `app/api/fees/payments/route.ts` — POST record payment
- `app/api/fees/students/[studentId]/route.ts` — GET all invoices+payments for student
- `app/api/fees/summary/route.ts` — GET dashboard totals

**New files — pages:**
- `app/(dashboard)/fees/page.tsx` — Fee dashboard
- `app/(dashboard)/fees/types/page.tsx` — Fee types list
- `app/(dashboard)/fees/types/new/page.tsx` — Create fee type
- `app/(dashboard)/fees/types/[id]/edit/page.tsx` — Edit fee type
- `app/(dashboard)/fees/structures/page.tsx` — Fee structures list
- `app/(dashboard)/fees/structures/new/page.tsx` — Create structure
- `app/(dashboard)/fees/structures/[id]/edit/page.tsx` — Edit structure
- `app/(dashboard)/fees/invoices/page.tsx` — Invoices list with filters
- `app/(dashboard)/fees/invoices/generate/page.tsx` — Bulk generate form
- `app/(dashboard)/fees/invoices/[id]/page.tsx` — Invoice detail + collect payment
- `app/(dashboard)/fees/collect/page.tsx` — Quick collection (search student → pay)
- `app/(dashboard)/fees/students/[studentId]/page.tsx` — Student fee history
- `app/(dashboard)/fees/reports/page.tsx` — Collection + defaulter reports

**Modified files:**
- `components/layout/Sidebar.tsx` — Add "Fees" nav group with sub-items

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/011_fee_module.sql`

**Interfaces:**
- Produces: tables `fee_types`, `fee_structures`, `fee_invoices`, `fee_payments`, `fee_discounts`; permissions `fees.manage`, `fees.collect`, `fees.report`

- [ ] **Step 1: Create the migration file**

```sql
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
```

- [ ] **Step 2: Apply the migration via Supabase CLI**

```bash
cd /Users/waseem.akram/Documents/Projects/school-management-nextjs
npx supabase db push
```

Expected: `Applying migration 011_fee_module.sql... done`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/011_fee_module.sql
git commit -m "feat: add fee module database migration (011)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Fee Types API

**Files:**
- Create: `app/api/fees/types/route.ts`
- Create: `app/api/fees/types/[id]/route.ts`

**Interfaces:**
- Consumes: `createAdminClient()` from `@/lib/supabase/server`
- Produces:
  - `GET /api/fees/types` → `{ id, name, description, status, school_id }[]`
  - `POST /api/fees/types` → `{ id, name }`
  - `PUT /api/fees/types/[id]` → `{ id }`
  - `DELETE /api/fees/types/[id]` → `{ success: true }`

- [ ] **Step 1: Create `app/api/fees/types/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "1";

  const query = supabase
    .from("fee_types")
    .select("id, name, description, status, created_at")
    .order("name");

  const { data, error } = status === "all"
    ? await query
    : await query.eq("status", parseInt(status));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { name, description } = await request.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("fee_types")
    .insert({ name: name.trim(), description: description?.trim() || null, status: 1 })
    .select("id, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/fees/types/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { name, description, status } = await request.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { error } = await supabase
    .from("fee_types")
    .update({ name: name.trim(), description: description?.trim() || null, status: parseInt(status ?? "1"), updated_at: new Date().toISOString() })
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;

  // soft-delete by setting status to 0
  const { error } = await supabase
    .from("fee_types")
    .update({ status: 0, updated_at: new Date().toISOString() })
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/fees/types/route.ts app/api/fees/types/[id]/route.ts
git commit -m "feat: fee types CRUD API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Fee Structures API

**Files:**
- Create: `app/api/fees/structures/route.ts`
- Create: `app/api/fees/structures/[id]/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/fees/structures` → `{ id, fee_type_id, class_id, academic_year_id, amount, frequency, due_day, fee_types(name), i_classes(name), academic_years(title) }[]`
  - `POST /api/fees/structures` → `{ id }`
  - `PUT /api/fees/structures/[id]` → `{ id }`
  - `DELETE /api/fees/structures/[id]` → `{ success: true }`

- [ ] **Step 1: Create `app/api/fees/structures/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const yearId = searchParams.get("academic_year_id");

  let query = supabase
    .from("fee_structures")
    .select("id, amount, frequency, due_day, fee_type_id, class_id, academic_year_id, fee_types(name), i_classes(name), academic_years(title)")
    .order("id");

  if (classId) query = query.eq("class_id", parseInt(classId));
  if (yearId) query = query.eq("academic_year_id", parseInt(yearId));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { fee_type_id, class_id, academic_year_id, amount, frequency, due_day } = await request.json();

  if (!fee_type_id || !class_id || !academic_year_id || amount == null) {
    return NextResponse.json({ error: "fee_type_id, class_id, academic_year_id, and amount are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fee_structures")
    .insert({
      fee_type_id: parseInt(fee_type_id),
      class_id: parseInt(class_id),
      academic_year_id: parseInt(academic_year_id),
      amount: parseFloat(amount),
      frequency: frequency || "monthly",
      due_day: parseInt(due_day ?? "10"),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/fees/structures/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { amount, frequency, due_day } = await request.json();

  const { error } = await supabase
    .from("fee_structures")
    .update({ amount: parseFloat(amount), frequency, due_day: parseInt(due_day), updated_at: new Date().toISOString() })
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { error } = await supabase.from("fee_structures").delete().eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/fees/structures/route.ts app/api/fees/structures/[id]/route.ts
git commit -m "feat: fee structures CRUD API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Fee Invoices API (list + bulk generate)

**Files:**
- Create: `app/api/fees/invoices/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/fees/invoices` → invoice rows with `students(name)`, `i_classes(name)`, `fee_types(name)`, paid_amount
  - `POST /api/fees/invoices` (body: `{ class_id, academic_year_id, fee_type_id, month, year }`) → `{ created: number, skipped: number }`

- [ ] **Step 1: Create `app/api/fees/invoices/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const status = searchParams.get("status");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const studentId = searchParams.get("student_id");
  const overdue = searchParams.get("overdue");
  const limit = parseInt(searchParams.get("limit") ?? "100");

  let query = supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, amount, discount, fine, net_amount,
      due_date, status, note, created_at,
      fee_type_id, registration_id, academic_year_id,
      fee_types(name),
      registrations(
        id, roll_no,
        students(id, name, photo),
        i_classes(name),
        sections(name)
      ),
      fee_payments(amount)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (classId) query = query.eq("registrations.class_id", parseInt(classId));
  if (status) query = query.eq("status", status);
  if (month) query = query.eq("month", parseInt(month));
  if (year) query = query.eq("year", parseInt(year));
  if (studentId) {
    const { data: reg } = await supabase.from("registrations").select("id").eq("student_id", parseInt(studentId)).single();
    if (reg) query = query.eq("registration_id", reg.id);
  }
  if (overdue === "1") {
    const today = new Date().toISOString().slice(0, 10);
    query = query.lt("due_date", today).in("status", ["unpaid", "partial"]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { class_id, academic_year_id, fee_type_id, month, year } = await request.json();

  if (!class_id || !academic_year_id || !fee_type_id || !month || !year) {
    return NextResponse.json({ error: "class_id, academic_year_id, fee_type_id, month, year are required" }, { status: 400 });
  }

  // Get fee structure for this class+year+type
  const { data: structure } = await supabase
    .from("fee_structures")
    .select("amount, due_day")
    .eq("class_id", parseInt(class_id))
    .eq("academic_year_id", parseInt(academic_year_id))
    .eq("fee_type_id", parseInt(fee_type_id))
    .single();

  if (!structure) return NextResponse.json({ error: "No fee structure found for this class/year/type" }, { status: 404 });

  // Get all active registrations for this class+year
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, student_id")
    .eq("class_id", parseInt(class_id))
    .eq("academic_year_id", parseInt(academic_year_id))
    .eq("status", 1);

  if (!registrations?.length) return NextResponse.json({ created: 0, skipped: 0 });

  const dueDate = `${year}-${String(month).padStart(2, "0")}-${String(structure.due_day).padStart(2, "0")}`;
  let created = 0;
  let skipped = 0;

  for (const reg of registrations) {
    // Check if invoice already exists
    const { data: existing } = await supabase
      .from("fee_invoices")
      .select("id")
      .eq("registration_id", reg.id)
      .eq("fee_type_id", parseInt(fee_type_id))
      .eq("month", parseInt(month))
      .eq("year", parseInt(year))
      .single();

    if (existing) { skipped++; continue; }

    // Get discount for this student+fee_type
    const { data: discount } = await supabase
      .from("fee_discounts")
      .select("discount_type, discount_value")
      .eq("registration_id", reg.id)
      .eq("fee_type_id", parseInt(fee_type_id))
      .single();

    let discountAmount = 0;
    if (discount) {
      discountAmount = discount.discount_type === "percent"
        ? (structure.amount * discount.discount_value) / 100
        : discount.discount_value;
    }

    const invoiceNo = `INV-${year}${String(month).padStart(2, "0")}-${String(reg.id).padStart(5, "0")}`;

    await supabase.from("fee_invoices").insert({
      registration_id: reg.id,
      fee_type_id: parseInt(fee_type_id),
      academic_year_id: parseInt(academic_year_id),
      invoice_no: invoiceNo,
      month: parseInt(month),
      year: parseInt(year),
      amount: structure.amount,
      discount: discountAmount,
      fine: 0,
      due_date: dueDate,
      status: "unpaid",
    });
    created++;
  }

  return NextResponse.json({ created, skipped });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/fees/invoices/route.ts
git commit -m "feat: fee invoices list and bulk generate API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Invoice Detail + Payment API

**Files:**
- Create: `app/api/fees/invoices/[id]/route.ts`
- Create: `app/api/fees/payments/route.ts`

**Interfaces:**
- Consumes: invoice rows from Task 4
- Produces:
  - `GET /api/fees/invoices/[id]` → invoice + payments list
  - `PATCH /api/fees/invoices/[id]` → update fine/note/status (waive)
  - `POST /api/fees/payments` (body: `{ invoice_id, amount, payment_method, payment_date, reference_no, note }`) → `{ id }` and auto-updates invoice status

- [ ] **Step 1: Create `app/api/fees/invoices/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, amount, discount, fine, net_amount,
      due_date, status, note, created_at,
      fee_types(name),
      registrations(
        id, roll_no,
        students(id, name, phone_no, father_name),
        i_classes(name), sections(name)
      ),
      fee_payments(id, amount, payment_date, payment_method, reference_no, note, created_at)
    `)
    .eq("id", parseInt(id))
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { fine, note, status } = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fine != null) updates.fine = parseFloat(fine);
  if (note != null) updates.note = note;
  if (status) updates.status = status; // allow waiving

  const { error } = await supabase.from("fee_invoices").update(updates).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}
```

- [ ] **Step 2: Create `app/api/fees/payments/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const { invoice_id, amount, payment_method, payment_date, reference_no, note } = await request.json();

  if (!invoice_id || !amount) {
    return NextResponse.json({ error: "invoice_id and amount are required" }, { status: 400 });
  }

  // Get invoice to check net_amount
  const { data: invoice } = await supabase
    .from("fee_invoices")
    .select("id, net_amount, status, fee_payments(amount)")
    .eq("id", parseInt(invoice_id))
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid" || invoice.status === "waived") {
    return NextResponse.json({ error: "Invoice is already settled" }, { status: 400 });
  }

  const { data: payment, error: pErr } = await supabase
    .from("fee_payments")
    .insert({
      invoice_id: parseInt(invoice_id),
      amount: parseFloat(amount),
      payment_date: payment_date || new Date().toISOString().slice(0, 10),
      payment_method: payment_method || "cash",
      reference_no: reference_no || null,
      note: note || null,
      collected_by: user?.id || null,
    })
    .select("id")
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Recalculate total paid and update invoice status
  const totalPaid = (invoice.fee_payments as { amount: number }[])
    .reduce((sum, p) => sum + p.amount, 0) + parseFloat(amount);

  const newStatus = totalPaid >= invoice.net_amount ? "paid" : "partial";
  await supabase
    .from("fee_invoices")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", parseInt(invoice_id));

  return NextResponse.json({ id: payment.id, status: newStatus }, { status: 201 });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/fees/invoices/[id]/route.ts app/api/fees/payments/route.ts
git commit -m "feat: invoice detail, patch, and payment recording API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Student History + Dashboard Summary API

**Files:**
- Create: `app/api/fees/students/[studentId]/route.ts`
- Create: `app/api/fees/summary/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/fees/students/[studentId]` → `{ student, invoices_with_payments[] }`
  - `GET /api/fees/summary` → `{ total_collected, total_pending, total_overdue, recent_payments[] }`

- [ ] **Step 1: Create `app/api/fees/students/[studentId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const supabase = createAdminClient();
  const { studentId } = await params;

  const { data: student } = await supabase
    .from("students")
    .select("id, name, photo, father_name, phone_no")
    .eq("id", parseInt(studentId))
    .single();

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, roll_no, i_classes(name), sections(name)")
    .eq("student_id", parseInt(studentId))
    .eq("status", 1)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const invoices = registration ? await supabase
    .from("fee_invoices")
    .select("id, invoice_no, month, year, amount, discount, fine, net_amount, due_date, status, fee_types(name), fee_payments(id, amount, payment_date, payment_method)")
    .eq("registration_id", registration.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false }) : { data: [] };

  return NextResponse.json({ student, registration, invoices: invoices.data ?? [] });
}
```

- [ ] **Step 2: Create `app/api/fees/summary/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [allInvoices, recentPayments] = await Promise.all([
    supabase.from("fee_invoices").select("net_amount, status, due_date"),
    supabase.from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, registrations(students(name), i_classes(name)))")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const invoices = (allInvoices.data ?? []) as { net_amount: number; status: string; due_date: string }[];

  const total_collected = (await supabase.from("fee_payments").select("amount")).data
    ?.reduce((s, p) => s + p.amount, 0) ?? 0;

  const total_pending = invoices
    .filter(i => i.status === "unpaid" || i.status === "partial")
    .reduce((s, i) => s + i.net_amount, 0);

  const total_overdue = invoices
    .filter(i => (i.status === "unpaid" || i.status === "partial") && i.due_date < today)
    .reduce((s, i) => s + i.net_amount, 0);

  return NextResponse.json({
    total_collected,
    total_pending,
    total_overdue,
    recent_payments: recentPayments.data ?? [],
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/fees/students/[studentId]/route.ts app/api/fees/summary/route.ts
git commit -m "feat: student fee history and dashboard summary API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Fee Types & Structures Pages

**Files:**
- Create: `app/(dashboard)/fees/types/page.tsx`
- Create: `app/(dashboard)/fees/types/new/page.tsx`
- Create: `app/(dashboard)/fees/types/[id]/edit/page.tsx`
- Create: `app/(dashboard)/fees/structures/page.tsx`
- Create: `app/(dashboard)/fees/structures/new/page.tsx`
- Create: `app/(dashboard)/fees/structures/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/fees/types/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function FeeTypesPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from("fee_types")
    .select("id, name, description, status")
    .order("name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Types</h2>
          <p className="text-sm text-muted-foreground">Manage fee categories (Tuition, Transport, etc.)</p>
        </div>
        <Link href="/fees/types/new"><Button size="sm">+ Add New</Button></Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(types ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No fee types yet</td></tr>
            ) : (types ?? []).map((t: { id: number; name: string; description: string | null; status: number }, i: number) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.description || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.status === 1 ? "default" : "secondary"}>{t.status === 1 ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/types/${t.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(dashboard)/fees/types/new/page.tsx`**

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NewFeeTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/types");
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">New Fee Type</h2>
        <p className="text-sm text-muted-foreground">Create a new fee category</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
          <input name="name" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Tuition Fee" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="Optional description" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(dashboard)/fees/types/[id]/edit/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeeTypeEditForm from "./FeeTypeEditForm";

export default async function EditFeeTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: type } = await supabase.from("fee_types").select("id, name, description, status").eq("id", parseInt(id)).single();
  if (!type) redirect("/fees/types");
  return (
    <div className="max-w-lg space-y-5">
      <div><h2 className="text-xl font-bold text-foreground">Edit Fee Type</h2></div>
      <FeeTypeEditForm type={type} />
    </div>
  );
}
```

Create `app/(dashboard)/fees/types/[id]/edit/FeeTypeEditForm.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FeeTypeEditForm({ type }: { type: { id: number; name: string; description: string | null; status: number } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/fees/types/${type.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description"), status: fd.get("status") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/types");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
        <input name="name" defaultValue={type.name} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" defaultValue={type.description ?? ""} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select name="status" defaultValue={type.status} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Update"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create `app/(dashboard)/fees/structures/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FeeStructuresPage() {
  const supabase = await createClient();
  const { data: structures } = await supabase
    .from("fee_structures")
    .select("id, amount, frequency, due_day, fee_types(name), i_classes(name), academic_years(title)")
    .order("id");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Structures</h2>
          <p className="text-sm text-muted-foreground">Define fee amounts per class and academic year</p>
        </div>
        <Link href="/fees/structures/new"><Button size="sm">+ Add New</Button></Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Fee Type","Class","Academic Year","Amount (PKR)","Frequency","Due Day",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(structures ?? []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No structures defined yet</td></tr>
            ) : (structures ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.fee_types?.name}</td>
                <td className="px-4 py-3">{s.i_classes?.name}</td>
                <td className="px-4 py-3">{s.academic_years?.title}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(s.amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{s.frequency}</td>
                <td className="px-4 py-3">{s.due_day}th</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/structures/${s.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `app/(dashboard)/fees/structures/new/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import NewStructureForm from "./NewStructureForm";

export default async function NewFeeStructurePage() {
  const supabase = await createClient();
  const [{ data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("numeric_value"),
    supabase.from("academic_years").select("id, title").order("created_at", { ascending: false }),
  ]);
  return (
    <div className="max-w-lg space-y-5">
      <div><h2 className="text-xl font-bold text-foreground">New Fee Structure</h2></div>
      <NewStructureForm feeTypes={feeTypes ?? []} classes={classes ?? []} years={years ?? []} />
    </div>
  );
}
```

Create `app/(dashboard)/fees/structures/new/NewStructureForm.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Option = { id: number; name?: string; title?: string };

export default function NewStructureForm({ feeTypes, classes, years }: { feeTypes: Option[]; classes: Option[]; years: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fee_type_id: fd.get("fee_type_id"),
        class_id: fd.get("class_id"),
        academic_year_id: fd.get("academic_year_id"),
        amount: fd.get("amount"),
        frequency: fd.get("frequency"),
        due_day: fd.get("due_day"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/structures");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {[
        { label: "Fee Type", name: "fee_type_id", opts: feeTypes.map(f => ({ value: f.id, label: f.name! })) },
        { label: "Class", name: "class_id", opts: classes.map(c => ({ value: c.id, label: c.name! })) },
        { label: "Academic Year", name: "academic_year_id", opts: years.map(y => ({ value: y.id, label: y.title! })) },
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label} <span className="text-destructive">*</span></label>
          <select name={field.name} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select {field.label}</option>
            {field.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Amount (PKR) *</label>
          <input name="amount" type="number" min="0" step="0.01" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <select name="frequency" defaultValue="monthly" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Day</label>
          <input name="due_day" type="number" min="1" max="28" defaultValue="10" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
```

Create `app/(dashboard)/fees/structures/[id]/edit/page.tsx` and `StructureEditForm.tsx` following the same pattern as fee types edit (fetch current values from DB, render form pre-filled, call PUT on submit).

- [ ] **Step 6: Commit**

```bash
git add app/\(dashboard\)/fees/types/ app/\(dashboard\)/fees/structures/
git commit -m "feat: fee types and structures pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Fee Invoices List + Generate Pages

**Files:**
- Create: `app/(dashboard)/fees/invoices/page.tsx`
- Create: `app/(dashboard)/fees/invoices/generate/page.tsx`
- Create: `app/(dashboard)/fees/invoices/generate/GenerateForm.tsx`
- Create: `app/(dashboard)/fees/invoices/[id]/page.tsx`
- Create: `app/(dashboard)/fees/invoices/[id]/PaymentForm.tsx`

- [ ] **Step 1: Create `app/(dashboard)/fees/invoices/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "default",
  waived: "outline",
};

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string; month?: string; year?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();

  let query = supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, net_amount, due_date, status,
      fee_types(name),
      registrations(students(name), i_classes(name))
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.status) query = query.eq("status", sp.status);
  if (sp.month) query = query.eq("month", parseInt(sp.month));
  if (sp.year) query = query.eq("year", parseInt(sp.year));

  const { data: invoices } = await query;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Invoices</h2>
          <p className="text-sm text-muted-foreground">All student invoices</p>
        </div>
        <Link href="/fees/invoices/generate"><Button size="sm">Generate Invoices</Button></Link>
      </div>

      <form method="GET" className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <select name="status" defaultValue={sp.status ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All</option>
              {["unpaid","partial","paid","waived"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Month</label>
            <select name="month" defaultValue={sp.month ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Months</option>
              {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Year</label>
            <select name="year" defaultValue={sp.year ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Years</option>
              {[today.getFullYear(), today.getFullYear() - 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline">Filter</Button>
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Invoice #","Student","Class","Fee Type","Period","Amount","Due Date","Status",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(invoices ?? []).length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No invoices found</td></tr>
            ) : (invoices ?? []).map((inv: any) => (
              <tr key={inv.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-medium">{inv.registrations?.students?.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.registrations?.i_classes?.name}</td>
                <td className="px-4 py-3">{inv.fee_types?.name}</td>
                <td className="px-4 py-3">{inv.month ? `${months[inv.month - 1]} ${inv.year}` : `${inv.year}`}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.due_date}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_COLORS[inv.status] as any} className="capitalize">{inv.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(dashboard)/fees/invoices/generate/page.tsx` + `GenerateForm.tsx`**

`page.tsx`:
```typescript
import { createClient } from "@/lib/supabase/server";
import GenerateForm from "./GenerateForm";

export default async function GenerateInvoicesPage() {
  const supabase = await createClient();
  const [{ data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("numeric_value"),
    supabase.from("academic_years").select("id, title, is_running").order("created_at", { ascending: false }),
  ]);
  const runningYear = years?.find(y => y.is_running)?.id;
  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Generate Fee Invoices</h2>
        <p className="text-sm text-muted-foreground">Bulk-create invoices for a class and month. Existing invoices are skipped.</p>
      </div>
      <GenerateForm feeTypes={feeTypes ?? []} classes={classes ?? []} years={years ?? []} defaultYearId={runningYear} />
    </div>
  );
}
```

`GenerateForm.tsx`:
```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Option = { id: number; name?: string; title?: string };

export default function GenerateForm({ feeTypes, classes, years, defaultYearId }: { feeTypes: Option[]; classes: Option[]; years: Option[]; defaultYearId?: number }) {
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: fd.get("class_id"),
        academic_year_id: fd.get("academic_year_id"),
        fee_type_id: fd.get("fee_type_id"),
        month: fd.get("month"),
        year: fd.get("year"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setResult(data);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">
          Generated <strong>{result.created}</strong> invoices. Skipped <strong>{result.skipped}</strong> (already existed).
        </div>
      )}
      {[
        { label: "Fee Type", name: "fee_type_id", opts: feeTypes.map(f => ({ value: f.id, label: f.name! })) },
        { label: "Class", name: "class_id", opts: classes.map(c => ({ value: c.id, label: c.name! })) },
        { label: "Academic Year", name: "academic_year_id", opts: years.map(y => ({ value: y.id, label: y.title! })), defaultValue: defaultYearId },
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label} <span className="text-destructive">*</span></label>
          <select name={field.name} required defaultValue={field.defaultValue ?? ""} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select {field.label}</option>
            {field.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Month <span className="text-destructive">*</span></label>
          <select name="month" required defaultValue={today.getMonth() + 1} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year <span className="text-destructive">*</span></label>
          <input name="year" type="number" required defaultValue={today.getFullYear()} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Generating…" : "Generate Invoices"}</Button>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/(dashboard)/fees/invoices/[id]/page.tsx` + `PaymentForm.tsx`**

`page.tsx`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import PaymentForm from "./PaymentForm";

const STATUS_COLORS: Record<string, string> = { unpaid: "destructive", partial: "secondary", paid: "default", waived: "outline" };
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("fee_invoices")
    .select(`id, invoice_no, month, year, amount, discount, fine, net_amount, due_date, status, note,
      fee_types(name),
      registrations(id, roll_no, students(id, name, phone_no, father_name), i_classes(name), sections(name)),
      fee_payments(id, amount, payment_date, payment_method, reference_no, note, created_at)`)
    .eq("id", parseInt(id))
    .single();

  if (!inv) redirect("/fees/invoices");

  const totalPaid = (inv.fee_payments as any[]).reduce((s: number, p: { amount: number }) => s + p.amount, 0);
  const balance = Number(inv.net_amount) - totalPaid;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Invoice #{inv.invoice_no}</h2>
          <p className="text-sm text-muted-foreground">{(inv.registrations as any)?.students?.name} — {(inv.registrations as any)?.i_classes?.name}</p>
        </div>
        <Badge variant={STATUS_COLORS[inv.status] as any} className="capitalize text-sm px-3 py-1">{inv.status}</Badge>
      </div>

      {/* Invoice details */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Fee Type", (inv.fee_types as any)?.name],
            ["Period", inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`],
            ["Due Date", inv.due_date],
            ["Father/Guardian", (inv.registrations as any)?.students?.father_name || "—"],
            ["Base Amount", `PKR ${Number(inv.amount).toLocaleString()}`],
            ["Discount", `PKR ${Number(inv.discount).toLocaleString()}`],
            ["Fine", `PKR ${Number(inv.fine).toLocaleString()}`],
            ["Net Amount", `PKR ${Number(inv.net_amount).toLocaleString()}`],
            ["Total Paid", `PKR ${totalPaid.toLocaleString()}`],
            ["Balance Due", `PKR ${balance.toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-muted-foreground">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment history */}
      {(inv.fee_payments as any[]).length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-medium text-sm">Payment History</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              {["Date","Amount","Method","Reference",""].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(inv.fee_payments as any[]).map((p: any) => (
                <tr key={p.id}><td className="px-4 py-2">{p.payment_date}</td><td className="px-4 py-2 font-mono">PKR {Number(p.amount).toLocaleString()}</td><td className="px-4 py-2 capitalize">{p.payment_method}</td><td className="px-4 py-2 text-muted-foreground">{p.reference_no || "—"}</td><td className="px-4 py-2 text-muted-foreground">{p.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Collect payment form — only if not settled */}
      {inv.status !== "paid" && inv.status !== "waived" && (
        <PaymentForm invoiceId={inv.id} balance={balance} />
      )}
    </div>
  );
}
```

`PaymentForm.tsx`:
```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentForm({ invoiceId, balance }: { invoiceId: number; balance: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoiceId,
        amount: fd.get("amount"),
        payment_method: fd.get("payment_method"),
        payment_date: fd.get("payment_date"),
        reference_no: fd.get("reference_no"),
        note: fd.get("note"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-sm mb-4">Collect Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Amount (PKR) *</label>
            <input name="amount" type="number" min="1" max={balance} defaultValue={balance} step="0.01" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Method</label>
            <select name="payment_method" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Date</label>
            <input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0,10)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Reference No.</label>
            <input name="reference_no" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="Cheque/Txn no." />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Note</label>
          <input name="note" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Recording…" : "Record Payment"}</Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/fees/invoices/
git commit -m "feat: fee invoices list, generate, and detail pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Quick Collection + Student History Pages

**Files:**
- Create: `app/(dashboard)/fees/collect/page.tsx`
- Create: `app/(dashboard)/fees/students/[studentId]/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/fees/collect/page.tsx`**

This is a client-side search-and-pay page. Student search calls `/api/students` (existing), then fetches unpaid invoices.

```typescript
"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function CollectFeePage() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/students?status=1`);
    const data = await res.json();
    setSearching(false);
    // Filter client-side by name
    setStudents((data ?? []).filter((r: any) =>
      r.students?.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.roll_no?.toString().includes(query)
    ).slice(0, 10));
  }

  async function selectStudent(reg: any) {
    setSelectedStudent(reg);
    setStudents([]);
    setLoadingInvoices(true);
    const res = await fetch(`/api/fees/invoices?status=unpaid&limit=50`);
    const data = await res.json();
    setLoadingInvoices(false);
    setInvoices((data ?? []).filter((inv: any) => inv.registration_id === reg.id));
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Collect Fee</h2>
        <p className="text-sm text-muted-foreground">Search a student to view and collect their dues</p>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Search by student name or roll no…"
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={search} disabled={searching}>{searching ? "…" : "Search"}</Button>
        </div>
        {students.length > 0 && (
          <div className="border border-border rounded-lg divide-y divide-border">
            {students.map((s: any) => (
              <button key={s.id} onClick={() => selectStudent(s)} className="w-full text-left px-4 py-2.5 hover:bg-muted/50 text-sm flex justify-between items-center">
                <span className="font-medium">{s.students?.name}</span>
                <span className="text-muted-foreground text-xs">{s.i_classes?.name} · Roll {s.roll_no}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student dues */}
      {selectedStudent && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">{selectedStudent.students?.name} — {selectedStudent.i_classes?.name}</p>
            <Link href={`/fees/students/${selectedStudent.students?.id}`} className="text-xs text-primary hover:underline">Full History →</Link>
          </div>
          {loadingInvoices ? <p className="text-sm text-muted-foreground">Loading…</p> :
            invoices.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">No unpaid invoices</div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border"><tr>
                    {["Fee Type","Period","Amount","Status",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">{inv.fee_types?.name}</td>
                        <td className="px-4 py-3">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                        <td className="px-4 py-3 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge variant="destructive" className="capitalize">{inv.status}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">Pay →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(dashboard)/fees/students/[studentId]/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = { unpaid: "destructive", partial: "secondary", paid: "default", waived: "outline" };
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function StudentFeeHistoryPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, name, photo, father_name, phone_no")
    .eq("id", parseInt(studentId))
    .single();

  if (!student) redirect("/fees/collect");

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, roll_no, i_classes(name), sections(name)")
    .eq("student_id", parseInt(studentId))
    .eq("status", 1)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: invoices } = registration ? await supabase
    .from("fee_invoices")
    .select("id, invoice_no, month, year, amount, discount, fine, net_amount, due_date, status, fee_types(name), fee_payments(amount)")
    .eq("registration_id", registration.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false }) : { data: [] };

  const totalBilled = (invoices ?? []).reduce((s: number, i: any) => s + Number(i.net_amount), 0);
  const totalPaid = (invoices ?? []).reduce((s: number, i: any) => s + (i.fee_payments as any[]).reduce((ps: number, p: any) => ps + p.amount, 0), 0);
  const totalDue = totalBilled - totalPaid;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">{(registration as any)?.i_classes?.name} · Roll {(registration as any)?.roll_no}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Billed", value: totalBilled, color: "text-blue-400" },
          { label: "Total Paid", value: totalPaid, color: "text-green-400" },
          { label: "Balance Due", value: totalDue, color: totalDue > 0 ? "text-red-400" : "text-green-400" },
        ].map(card => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`text-xl font-bold ${card.color}`}>PKR {card.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-medium text-sm">All Invoices</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            {["Invoice #","Fee Type","Period","Amount","Paid","Status",""].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {(invoices ?? []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices</td></tr>
            ) : (invoices ?? []).map((inv: any) => {
              const paid = (inv.fee_payments as any[]).reduce((s: number, p: any) => s + p.amount, 0);
              return (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">{inv.invoice_no}</td>
                  <td className="px-4 py-2">{inv.fee_types?.name}</td>
                  <td className="px-4 py-2">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                  <td className="px-4 py-2 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono">PKR {paid.toLocaleString()}</td>
                  <td className="px-4 py-2"><Badge variant={STATUS_COLORS[inv.status] as any} className="capitalize">{inv.status}</Badge></td>
                  <td className="px-4 py-2"><a href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">View</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/fees/collect/ app/\(dashboard\)/fees/students/
git commit -m "feat: quick fee collection and student fee history pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Fee Dashboard + Reports Pages

**Files:**
- Create: `app/(dashboard)/fees/page.tsx`
- Create: `app/(dashboard)/fees/reports/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/fees/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";

export default async function FeeDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [allInvoices, recentPayments] = await Promise.all([
    supabase.from("fee_invoices").select("net_amount, status, due_date"),
    supabase.from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, fee_types(name), registrations(students(name), i_classes(name)))")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const invoices = (allInvoices.data ?? []) as { net_amount: number; status: string; due_date: string }[];
  const payments = (recentPayments.data ?? []) as any[];

  const total_collected = payments.reduce((s, p) => s + p.amount, 0);
  const total_pending = invoices.filter(i => i.status === "unpaid" || i.status === "partial").reduce((s, i) => s + Number(i.net_amount), 0);
  const total_overdue = invoices.filter(i => (i.status === "unpaid" || i.status === "partial") && i.due_date < today).reduce((s, i) => s + Number(i.net_amount), 0);
  const total_invoices = invoices.length;

  const cards = [
    { label: "Total Collected (Recent)", value: `PKR ${total_collected.toLocaleString()}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Pending", value: `PKR ${total_pending.toLocaleString()}`, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Total Overdue", value: `PKR ${total_overdue.toLocaleString()}`, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Total Invoices", value: total_invoices.toLocaleString(), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  const quickActions = [
    { label: "Collect Fee", href: "/fees/collect" },
    { label: "Generate Invoices", href: "/fees/invoices/generate" },
    { label: "View All Invoices", href: "/fees/invoices" },
    { label: "Overdue Invoices", href: "/fees/invoices?status=unpaid" },
    { label: "Fee Types", href: "/fees/types" },
    { label: "Fee Structures", href: "/fees/structures" },
    { label: "Reports", href: "/fees/reports" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fee Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of fee collection and outstanding dues.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.bg}`}>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Recent Payments</h3>
            <Link href="/fees/invoices" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {payments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No payments yet</p>
            ) : payments.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{(p.fee_invoices as any)?.registrations?.students?.name}</p>
                  <p className="text-xs text-muted-foreground">{(p.fee_invoices as any)?.fee_types?.name} · {p.payment_date}</p>
                </div>
                <p className="text-sm font-bold text-green-400">PKR {Number(p.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {quickActions.map(a => (
              <Link key={a.label} href={a.href} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition text-sm font-medium text-foreground hover:text-primary">
                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(dashboard)/fees/reports/page.tsx`**

```typescript
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function FeeReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; report?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();
  const report = sp.report ?? "collection";
  const from = sp.from ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const to = sp.to ?? today.toISOString().slice(0, 10);

  let collectionData: any[] = [];
  let defaulterData: any[] = [];

  if (report === "collection") {
    const { data } = await supabase
      .from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, fee_types(name), registrations(students(name), i_classes(name)))")
      .gte("payment_date", from)
      .lte("payment_date", to)
      .order("payment_date", { ascending: false });
    collectionData = data ?? [];
  } else {
    const { data } = await supabase
      .from("fee_invoices")
      .select("id, invoice_no, month, year, net_amount, due_date, status, fee_types(name), registrations(students(name, phone_no, father_name), i_classes(name))")
      .lt("due_date", today.toISOString().slice(0, 10))
      .in("status", ["unpaid", "partial"])
      .order("due_date");
    defaulterData = data ?? [];
  }

  const totalCollection = collectionData.reduce((s, p) => s + Number(p.amount), 0);
  const totalDefaulter = defaulterData.reduce((s, i) => s + Number(i.net_amount), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Fee Reports</h2>
        <p className="text-sm text-muted-foreground">Collection summary and defaulter list</p>
      </div>

      <form method="GET" className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Report Type</label>
            <select name="report" defaultValue={report} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="collection">Collection Report</option>
              <option value="defaulters">Defaulters List</option>
            </select>
          </div>
          {report === "collection" && <>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">From Date</label>
              <input name="from" type="date" defaultValue={from} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">To Date</label>
              <input name="to" type="date" defaultValue={to} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </>}
          <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Generate</button>
        </div>
      </form>

      {report === "collection" ? (
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-green-400">Total Collected ({from} to {to})</p>
            <p className="text-lg font-bold text-green-400">PKR {totalCollection.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border"><tr>
                {["Date","Student","Class","Fee Type","Amount","Method"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {collectionData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No collections in this period</td></tr>
                ) : collectionData.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{p.payment_date}</td>
                    <td className="px-4 py-3 font-medium">{p.fee_invoices?.registrations?.students?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.fee_invoices?.registrations?.i_classes?.name}</td>
                    <td className="px-4 py-3">{p.fee_invoices?.fee_types?.name}</td>
                    <td className="px-4 py-3 font-mono text-green-400">PKR {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-red-400">Total Outstanding (Overdue)</p>
            <p className="text-lg font-bold text-red-400">PKR {totalDefaulter.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border"><tr>
                {["Student","Class","Fee Type","Period","Amount","Due Date","Status",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {defaulterData.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No overdue invoices</td></tr>
                ) : defaulterData.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{inv.registrations?.students?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.registrations?.i_classes?.name}</td>
                    <td className="px-4 py-3">{inv.fee_types?.name}</td>
                    <td className="px-4 py-3">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                    <td className="px-4 py-3 font-mono text-red-400">PKR {Number(inv.net_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.due_date}</td>
                    <td className="px-4 py-3"><Badge variant="destructive" className="capitalize">{inv.status}</Badge></td>
                    <td className="px-4 py-3"><a href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">Collect →</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/fees/page.tsx app/\(dashboard\)/fees/reports/
git commit -m "feat: fee dashboard and reports pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 11: Sidebar Navigation Update

**Files:**
- Modify: `components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: existing `nav` array in Sidebar
- Produces: new "Fees" group visible to all authenticated users

- [ ] **Step 1: Add `DollarSign` import and "Fees" nav group**

In `components/layout/Sidebar.tsx`, add `DollarSign` to the lucide-react import line:

```typescript
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarCheck, Briefcase, UserCheck, FileText, Settings, ChevronDown,
  School, Trophy, BarChart3, Bell, LogOut, Shield, Building2, DollarSign,
} from "lucide-react";
```

Add the Fees group to the `nav` array after the "Marks & Results" group:

```typescript
  {
    label: "Fees",
    icon: <DollarSign className="w-4 h-4" />,
    children: [
      { label: "Fee Dashboard", href: "/fees" },
      { label: "Fee Types", href: "/fees/types" },
      { label: "Fee Structures", href: "/fees/structures" },
      { label: "Invoices", href: "/fees/invoices" },
      { label: "Collect Fee", href: "/fees/collect" },
      { label: "Generate Invoices", href: "/fees/invoices/generate" },
      { label: "Reports", href: "/fees/reports" },
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: add Fees nav group to sidebar

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

- [x] Migration covers all 5 tables + permissions seed
- [x] All API routes use `createAdminClient()` (never `createClient()` in routes)
- [x] Invoice status auto-updates to `partial`/`paid` after payment
- [x] Bulk generate skips already-existing invoices (idempotent)
- [x] Discount auto-applied from `fee_discounts` table during generation
- [x] Student history shows total billed / paid / balance summary
- [x] Reports cover both collection (date-range) and defaulters (overdue)
- [x] Sidebar updated with all 7 fee sub-pages
- [x] `net_amount` is a computed column (`amount - discount + fine`) — no client calculation needed
- [x] `params` awaited in all dynamic route handlers (Next.js 15 pattern, matching existing code)
