# School Management System

A full-featured school management system built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Designed to handle the complete administrative workflow of a school — from student enrollment and attendance to exam results and HRM.

## Features

- **Authentication** — Supabase Auth with role-based access control
- **Academic Management** — Classes, sections, subjects, and academic years
- **Student Management** — Enrollment, profiles, status tracking, and promotion
- **Attendance** — Daily student and employee attendance with reporting
- **Exam & Results** — Exam rules, marks entry, and automatic result generation
- **HRM** — Employee profiles, leave management, and teacher assignments
- **Roles & Permissions** — Granular permission system with assignable roles
- **Notifications** — Per-user notification system
- **Settings** — Institute-level configuration and site metadata
- **Reports** — Student list and academic reports

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| UI Components | Radix UI + shadcn/ui |
| Data Tables | TanStack Table v8 |
| Package Manager | npm |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone the repo**

```bash
git clone https://github.com/seemakram15/School-Management-System.git
cd School-Management-System
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Push the database schema**

Make sure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and are logged in:

```bash
supabase link --project-ref your_project_ref
supabase db push
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (auth)/           # Login and auth pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── academic/     # Classes, sections, subjects
│   │   ├── attendance/   # Student attendance
│   │   ├── exams/        # Exam management
│   │   ├── hrm/          # Employees and leaves
│   │   ├── marks/        # Marks entry
│   │   ├── results/      # Result generation
│   │   ├── students/     # Student management
│   │   └── ...
│   └── api/              # API route handlers
├── components/
│   ├── data-table/       # Reusable data table
│   ├── layout/           # Sidebar, header
│   ├── students/         # Student-specific components
│   └── ui/               # shadcn/ui primitives
├── lib/
│   └── supabase/         # Supabase client helpers
├── supabase/
│   └── migrations/       # Database schema migrations
└── types/
    └── database.ts       # Generated Supabase types
```

## Database Schema

The schema covers:

- `users` / `roles` / `permissions` — Auth and RBAC
- `i_classes` / `sections` / `subjects` — Academic structure
- `students` / `registrations` — Student enrollment
- `employees` / `teacher_profiles` — Staff management
- `student_attendances` / `employee_attendances` — Attendance
- `exams` / `marks` / `results` / `grades` — Examination system
- `leaves` — Employee leave requests
- `notifications` — User notifications
- `app_metas` / `site_metas` — Configuration

Row Level Security (RLS) is enabled on sensitive tables. Service role is used for all API routes.

## License

MIT
