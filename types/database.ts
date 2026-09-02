export type Database = {
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: string; deletable: boolean; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["roles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
      };
      users: {
        Row: { id: string; name: string; username: string; email: string; phone_no: string | null; force_logout: boolean; status: 0 | 1; is_super_admin: boolean; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      user_roles: {
        Row: { user_id: string; role_id: number };
        Insert: Database["public"]["Tables"]["user_roles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
      };
      permissions: {
        Row: { id: number; name: string; slug: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["permissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
      };
      academic_years: {
        Row: { id: number; title: string; year: string; is_running: boolean; status: 0 | 1; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["academic_years"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["academic_years"]["Insert"]>;
      };
      i_classes: {
        Row: { id: number; name: string; numeric_name: number | null; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["i_classes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["i_classes"]["Insert"]>;
      };
      sections: {
        Row: { id: number; class_id: number; name: string; capacity: number; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["sections"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sections"]["Insert"]>;
      };
      subjects: {
        Row: { id: number; class_id: number; name: string; type: number; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      students: {
        Row: { id: number; user_id: string | null; name: string; nick_name: string | null; dob: string; gender: 1 | 2; religion: string | null; blood_group: string | null; nationality: string | null; photo: string | null; email: string | null; phone_no: string | null; extra_activity: string | null; note: string | null; father_name: string | null; father_phone_no: string | null; mother_name: string | null; mother_phone_no: string | null; guardian: string | null; guardian_phone_no: string | null; present_address: string | null; permanent_address: string; sms_receive_no: 0 | 1 | 2 | 3; siblings: string | null; signature: string | null; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      registrations: {
        Row: { id: number; student_id: number; class_id: number; section_id: number; academic_year_id: number; roll_no: string | null; is_promoted: boolean; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["registrations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["registrations"]["Insert"]>;
      };
      employees: {
        Row: { id: number; user_id: string | null; role_id: number; id_card: string; name: string; designation: number | null; qualification: string | null; dob: string; gender: 1 | 2; religion: 1 | 2 | 3 | 4 | 5; email: string | null; phone_no: string | null; address: string | null; joining_date: string; leave_date: string | null; photo: string | null; signature: string | null; shift: 1 | 2; duty_start: string | null; duty_end: string | null; status: 0 | 1; order: number; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      teacher_profiles: {
        Row: { id: number; employee_id: number; about: string | null; facebook: string | null; twitter: string | null; linkedin: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["teacher_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["teacher_profiles"]["Insert"]>;
      };
      teacher_subjects: {
        Row: { id: number; teacher_id: number; subject_id: number; section_id: number; academic_year_id: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["teacher_subjects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["teacher_subjects"]["Insert"]>;
      };
      student_subjects: {
        Row: { id: number; registration_id: number; subject_id: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["student_subjects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["student_subjects"]["Insert"]>;
      };
      student_attendances: {
        Row: { id: number; registration_id: number; attendance_date: string; attendance: 0 | 1 | 2; note: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["student_attendances"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["student_attendances"]["Insert"]>;
      };
      employee_attendances: {
        Row: { id: number; employee_id: number; attendance_date: string; attendance: 0 | 1 | 2; note: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["employee_attendances"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["employee_attendances"]["Insert"]>;
      };
      leaves: {
        Row: { id: number; employee_id: number; apply_date: string; from_date: string; to_date: string; total_days: number; reason: string | null; status: 0 | 1 | 2; note: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["leaves"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leaves"]["Insert"]>;
      };
      exams: {
        Row: { id: number; academic_year_id: number; name: string; status: 0 | 1; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["exams"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["exams"]["Insert"]>;
      };
      grades: {
        Row: { id: number; academic_year_id: number; name: string; percent_from: number; percent_to: number; grade_point: number; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: Omit<Database["public"]["Tables"]["grades"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["grades"]["Insert"]>;
      };
      exam_rules: {
        Row: { id: number; exam_id: number; class_id: number; subject_id: number; total_marks: number; pass_marks: number; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["exam_rules"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["exam_rules"]["Insert"]>;
      };
      marks: {
        Row: { id: number; registration_id: number; exam_id: number; subject_id: number; marks: number; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["marks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["marks"]["Insert"]>;
      };
      results: {
        Row: { id: number; registration_id: number; exam_id: number; total_marks: number; obtained_marks: number; percentage: number; grade_id: number | null; is_pass: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["results"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["results"]["Insert"]>;
      };
      notifications: {
        Row: { id: string; type: string; notifiable_type: string; notifiable_id: string; data: string; read_at: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      events: {
        Row: { id: number; title: string; description: string | null; start_date: string; end_date: string; status: 0 | 1; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      app_metas: {
        Row: { id: number; meta_key: string; meta_value: string | null; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["app_metas"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["app_metas"]["Insert"]>;
      };
      site_metas: {
        Row: { id: number; meta_key: string; meta_value: string | null; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["site_metas"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["site_metas"]["Insert"]>;
      };
      sliders: {
        Row: { id: number; title: string; sub_title: string | null; image: string | null; status: 0 | 1; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["sliders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sliders"]["Insert"]>;
      };
      testimonials: {
        Row: { id: number; name: string; designation: string | null; message: string; photo: string | null; status: 0 | 1; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };
      class_profiles: {
        Row: { id: number; class_id: number; description: string | null; image: string | null; status: 0 | 1; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["class_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["class_profiles"]["Insert"]>;
      };
    };
  };
};

// Convenience type aliases
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type AppUser = Database["public"]["Tables"]["users"]["Row"];
export type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
export type IClass = Database["public"]["Tables"]["i_classes"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type StudentAttendance = Database["public"]["Tables"]["student_attendances"]["Row"];
export type EmployeeAttendance = Database["public"]["Tables"]["employee_attendances"]["Row"];
export type Leave = Database["public"]["Tables"]["leaves"]["Row"];
export type Exam = Database["public"]["Tables"]["exams"]["Row"];
export type Grade = Database["public"]["Tables"]["grades"]["Row"];
export type ExamRule = Database["public"]["Tables"]["exam_rules"]["Row"];
export type Mark = Database["public"]["Tables"]["marks"]["Row"];
export type Result = Database["public"]["Tables"]["results"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
