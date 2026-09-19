"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap, MapPin, Phone, Mail, Users, BookOpen, Award,
  Trophy, Star, Calendar, ChevronLeft, ChevronRight, Edit3,
  X, Plus, Trash2, Upload, CheckCircle, Save, Eye, EyeOff,
  Pencil, Globe, ArrowRight,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────── */
type Slide = { id?: string; image_url: string; caption?: string | null; order: number };
type Principal = { id?: string; name: string; title: string; message: string; photo_url?: string | null };
type Event = { id: string; title: string; description?: string | null; event_date?: string | null; image_url?: string | null };
type Achievement = { id: string; title: string; description?: string | null; year?: string | null; icon: string };
type School = {
  id: string; name: string; slug: string; tagline?: string | null;
  description?: string | null; address?: string | null; phone?: string | null;
  email?: string | null; logo_url?: string | null; stats: { students: number; staff: number };
  planName?: string;
};

type Props = {
  school: School;
  slides: Slide[];
  principal: Principal | null;
  events: Event[];
  achievements: Achievement[];
  isOwner: boolean;
};

/* ── Demo defaults (shown when no data added yet) ───── */
const DEMO_SLIDES: Slide[] = [
  { image_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80", caption: "Excellence in Education", order: 0 },
  { image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80", caption: "Nurturing Young Minds", order: 1 },
  { image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400&q=80", caption: "Building Tomorrow's Leaders", order: 2 },
  { image_url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1400&q=80", caption: "A World of Knowledge", order: 3 },
  { image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80", caption: "Celebrating Every Success", order: 4 },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: "1", title: "Board Matric Toppers", description: "Our students consistently rank in the top 10 at board level.", year: "2024", icon: "star" },
  { id: "2", title: "National Science Olympiad", description: "Gold medal winners in regional & national rounds.", year: "2023", icon: "trophy" },
  { id: "3", title: "Best School Award", description: "Recognized by the District Education Authority.", year: "2023", icon: "award" },
  { id: "4", title: "Sports Champions", description: "Inter-school cricket & football champions.", year: "2024", icon: "globe" },
];

const DEMO_EVENTS: Event[] = [
  { id: "1", title: "Annual Day Celebrations", description: "A dazzling evening of talent, performances, and prize distribution.", event_date: "2024-03-15", image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80" },
  { id: "2", title: "Science & Technology Fair", description: "Students showcased innovative projects judged by industry experts.", event_date: "2024-02-10", image_url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&q=80" },
  { id: "3", title: "Parent-Teacher Meeting", description: "Quarterly academic progress review with parents and faculty.", event_date: "2024-01-20", image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" },
];

/* ── Icon map ──────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy, star: Star, award: Award, globe: Globe, book: BookOpen,
};

/* ── Upload helper ─────────────────────────────────────── */
async function uploadImage(file: File, schoolId: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("schoolId", schoolId);
  const res = await fetch("/api/upload/school-image", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url as string;
}

/* ── Hero Carousel ─────────────────────────────────────── */
function HeroCarousel({ slides, schoolName, tagline, editMode, onEdit }: {
  slides: Slide[]; schoolName: string; tagline?: string | null;
  editMode: boolean; onEdit: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((dir: number) => {
    if (!slides.length) return;
    setCurrent(c => (c + dir + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    timerRef.current = setTimeout(() => go(1), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, go, slides.length]);

  const slide = slides[current] ?? slides[0];
  if (!slide) return <div className="h-[85vh] min-h-[520px] bg-slate-900" />;

  return (
    <section className="relative h-[85vh] min-h-[520px] overflow-hidden group">
      {/* Image */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <Image src={slide.image_url} alt={slide.caption ?? schoolName} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/25 text-white/90 text-sm mb-6 backdrop-blur-sm">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
          Verified on Schoolly
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight drop-shadow-lg max-w-4xl">
          {schoolName}
        </h1>
        {tagline && <p className="mt-4 text-xl sm:text-2xl text-white/80 font-light max-w-2xl">{tagline}</p>}
        {slide.caption && (
          <p className="mt-3 text-base text-white/60 italic">— {slide.caption}</p>
        )}
        <div className="mt-8 flex gap-3">
          <a href="#contact" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:scale-105">
            Contact Us
          </a>
          <a href="#about" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 backdrop-blur-sm transition-all hover:scale-105">
            Learn More
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
        ))}
      </div>

      {/* Edit button */}
      {editMode && (
        <button onClick={onEdit} className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg transition-all">
          <Edit3 className="w-4 h-4" /> Edit Hero
        </button>
      )}
    </section>
  );
}

/* ── Stats Bar ─────────────────────────────────────────── */
function StatsBar({ students, staff, founded }: { students: number; staff: number; founded?: string }) {
  const stats = [
    { icon: Users, value: students > 0 ? `${students}+` : "500+", label: "Students Enrolled" },
    { icon: BookOpen, value: staff > 0 ? `${staff}+` : "50+", label: "Expert Faculty" },
    { icon: Award, value: "15+", label: "Years of Excellence" },
    { icon: Trophy, value: "100+", label: "Awards Won" },
  ];
  return (
    <div className="bg-indigo-700 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <s.icon className="w-7 h-7 mx-auto mb-2 text-indigo-200" />
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-indigo-200 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Principal Section ──────────────────────────────────── */
function PrincipalSection({ principal, editMode, onEdit }: { principal: Principal | null; editMode: boolean; onEdit: () => void }) {
  const p = principal ?? {
    name: "Mr. Muhammad Asif Khan",
    title: "Principal",
    message: "Education is the most powerful weapon which you can use to change the world. At our school, we don't just teach—we inspire, nurture, and empower every student to discover their potential. Our dedicated faculty and modern facilities create an environment where curiosity flourishes and dreams take shape. I warmly welcome you to our school family.",
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  };

  return (
    <section id="principal" className="py-20 bg-slate-50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-600/10 rounded-3xl -rotate-2" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-w-sm mx-auto">
              {p.photo_url ? (
                <Image src={p.photo_url} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-24 h-24 text-indigo-300" />
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Message from the</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">{p.title}</h2>
            <div className="relative">
              <div className="absolute -left-6 top-0 text-indigo-200 text-8xl font-serif leading-none">"</div>
              <p className="text-slate-600 text-lg leading-relaxed pl-4">{p.message}</p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-0.5 w-12 bg-indigo-600" />
              <div>
                <p className="font-bold text-slate-900 text-lg">{p.name}</p>
                <p className="text-slate-500 text-sm">{p.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {editMode && (
        <button onClick={onEdit} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow transition-all">
          <Edit3 className="w-4 h-4" /> Edit
        </button>
      )}
    </section>
  );
}

/* ── Events Section ─────────────────────────────────────── */
function EventsSection({ events, editMode, onEdit }: { events: Event[]; editMode: boolean; onEdit: () => void }) {
  const list = events.length > 0 ? events : DEMO_EVENTS;
  return (
    <section id="events" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-2">What's Happening</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Recent Events</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(ev => (
            <div key={ev.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                {ev.image_url ? (
                  <Image src={ev.image_url} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-indigo-400" />
                  </div>
                )}
                {ev.event_date && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-indigo-500" />
                    {new Date(ev.event_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{ev.title}</h3>
                {ev.description && <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {editMode && (
        <button onClick={onEdit} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow transition-all">
          <Edit3 className="w-4 h-4" /> Edit Events
        </button>
      )}
    </section>
  );
}

/* ── Achievements Section ───────────────────────────────── */
function AchievementsSection({ achievements, editMode, onEdit }: { achievements: Achievement[]; editMode: boolean; onEdit: () => void }) {
  const list = achievements.length > 0 ? achievements : DEMO_ACHIEVEMENTS;
  return (
    <section id="achievements" className="py-20 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-indigo-200 font-semibold text-sm uppercase tracking-widest mb-2">Our Pride</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold">Achievements & Awards</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map(ac => {
            const Icon = iconMap[ac.icon] ?? Trophy;
            return (
              <div key={ac.id} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-sm transition-all hover:scale-[1.02]">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-yellow-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">{ac.title}</h3>
                {ac.description && <p className="text-indigo-100 text-sm leading-relaxed">{ac.description}</p>}
                {ac.year && <p className="mt-3 text-xs text-indigo-300 font-semibold">{ac.year}</p>}
              </div>
            );
          })}
        </div>
      </div>
      {editMode && (
        <button onClick={onEdit} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg border border-white/30 transition-all">
          <Edit3 className="w-4 h-4" /> Edit
        </button>
      )}
    </section>
  );
}

/* ── About Section ──────────────────────────────────────── */
function AboutSection({ school }: { school: School }) {
  const features = [
    { icon: Users, text: "Experienced & certified faculty committed to student growth" },
    { icon: BookOpen, text: "Modern, up-to-date curriculum aligned with national standards" },
    { icon: Award, text: "Consistently strong academic and extracurricular results" },
    { icon: Globe, text: "Safe, inclusive, and technology-equipped learning environment" },
  ];
  return (
    <section id="about" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">About Us</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
              {school.name}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {school.description || "A premier educational institution dedicated to academic excellence, character development, and holistic growth. We prepare students not just for exams, but for life."}
            </p>
            <ul className="space-y-4">
              {features.map(f => (
                <li key={f.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-slate-600 leading-relaxed">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80",
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
                "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80",
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80",
              ].map((src, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl shadow-lg ${i === 0 ? "row-span-2" : ""} aspect-square`}>
                  <Image src={src} alt="School life" fill className="object-cover hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Contact Section ────────────────────────────────────── */
function ContactSection({ school }: { school: School }) {
  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-2">Get in Touch</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Contact Us</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {school.phone && (
            <a href={`tel:${school.phone}`} className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Phone</p>
                <p className="font-bold text-slate-900">{school.phone}</p>
              </div>
            </a>
          )}
          {school.email && (
            <a href={`mailto:${school.email}`} className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Email</p>
                <p className="font-bold text-slate-900 break-all">{school.email}</p>
              </div>
            </a>
          )}
          {school.address && (
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Address</p>
                <p className="font-bold text-slate-900">{school.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Edit Panels ────────────────────────────────────────── */
function EditPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-600">
        <h3 className="font-bold text-white text-lg">{title}</h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}

function ImageUploader({ schoolId, onUploaded }: { schoolId: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, schoolId);
      onUploaded(url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-slate-500 hover:text-indigo-600 transition-all text-sm">
      <Upload className="w-4 h-4" />
      {uploading ? "Uploading…" : "Upload Image"}
      <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={handle} disabled={uploading} />
    </label>
  );
}

/* ── Hero Edit Panel ─────────────────────────────────────── */
function HeroEditPanel({ slides: init, schoolId, onClose, onSaved }: {
  slides: Slide[]; schoolId: string; onClose: () => void; onSaved: (s: Slide[]) => void;
}) {
  const [slides, setSlides] = useState<Slide[]>(init.length > 0 ? init : DEMO_SLIDES);
  const [saving, setSaving] = useState(false);

  const remove = (i: number) => setSlides(s => s.filter((_, idx) => idx !== i));
  const addUrl = (url: string) => setSlides(s => [...s, { image_url: url, caption: "", order: s.length }]);
  const update = (i: number, key: "image_url" | "caption", val: string) =>
    setSlides(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: val } : sl));

  const save = async () => {
    setSaving(true);
    await fetch(`/api/school/${schoolId}/hero-slides`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(slides) });
    setSaving(false);
    onSaved(slides);
    onClose();
  };

  return (
    <EditPanel title="Edit Hero Slides" onClose={onClose}>
      <p className="text-sm text-slate-500 mb-4">Add or remove images for the hero carousel. Supported: JPG, PNG, WebP.</p>
      <div className="space-y-4 mb-6">
        {slides.map((sl, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="relative h-28 rounded-lg overflow-hidden bg-slate-100">
              {sl.image_url && <Image src={sl.image_url} alt="" fill className="object-cover" />}
            </div>
            <div className="flex gap-2">
              <input value={sl.image_url} onChange={e => update(i, "image_url", e.target.value)}
                placeholder="Image URL" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <ImageUploader schoolId={schoolId} onUploaded={url => update(i, "image_url", url)} />
            </div>
            <div className="flex gap-2 items-center">
              <input value={sl.caption ?? ""} onChange={e => update(i, "caption", e.target.value)}
                placeholder="Caption (optional)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => addUrl("")} className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>
      <button onClick={save} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
      </button>
    </EditPanel>
  );
}

/* ── Principal Edit Panel ───────────────────────────────── */
function PrincipalEditPanel({ principal: init, schoolId, onClose, onSaved }: {
  principal: Principal | null; schoolId: string; onClose: () => void; onSaved: (p: Principal) => void;
}) {
  const def = init ?? { name: "", title: "Principal", message: "", photo_url: "" };
  const [form, setForm] = useState(def);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Principal, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/school/${schoolId}/principal`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { onSaved(data); onClose(); }
  };

  return (
    <EditPanel title="Principal's Message" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Dr. John Smith" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Principal" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Photo</label>
          <div className="flex gap-2 items-center">
            <input value={form.photo_url ?? ""} onChange={e => set("photo_url", e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Photo URL" />
            <ImageUploader schoolId={schoolId} onUploaded={url => set("photo_url", url)} />
          </div>
          {form.photo_url && (
            <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden">
              <Image src={form.photo_url} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
          <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Write the principal's message…" />
        </div>
        <button onClick={save} disabled={saving || !form.name || !form.message} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </EditPanel>
  );
}

/* ── Events Edit Panel ──────────────────────────────────── */
function EventsEditPanel({ events: init, schoolId, onClose, onSaved }: {
  events: Event[]; schoolId: string; onClose: () => void; onSaved: (ev: Event[]) => void;
}) {
  const [events, setEvents] = useState(init);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);

  const remove = async (id: string) => {
    await fetch(`/api/school/${schoolId}/events`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const next = events.filter(e => e.id !== id);
    setEvents(next);
    onSaved(next);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const res = await fetch(`/api/school/${schoolId}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      const next = [data, ...events];
      setEvents(next);
      onSaved(next);
      setForm({});
      setAdding(false);
    }
  };

  return (
    <EditPanel title="Manage Events" onClose={onClose}>
      <div className="space-y-4 mb-6">
        {events.map(ev => (
          <div key={ev.id} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl">
            {ev.image_url && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={ev.image_url} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{ev.title}</p>
              {ev.event_date && <p className="text-xs text-slate-400 mt-0.5">{ev.event_date}</p>}
            </div>
            <button onClick={() => remove(ev.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="border-2 border-indigo-200 rounded-xl p-4 space-y-3">
          <input value={form.title ?? ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Event title *" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          <input type="date" value={form.event_date ?? ""} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <div className="flex gap-2 items-center">
            <input value={form.image_url ?? ""} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="Image URL" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <ImageUploader schoolId={schoolId} onUploaded={url => setForm(f => ({ ...f, image_url: url }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
              {saving ? "Saving…" : "Add Event"}
            </button>
            <button onClick={() => { setAdding(false); setForm({}); }} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      )}
    </EditPanel>
  );
}

/* ── Achievements Edit Panel ────────────────────────────── */
function AchievementsEditPanel({ achievements: init, schoolId, onClose, onSaved }: {
  achievements: Achievement[]; schoolId: string; onClose: () => void; onSaved: (a: Achievement[]) => void;
}) {
  const [items, setItems] = useState(init);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Achievement>>({ icon: "trophy" });
  const [saving, setSaving] = useState(false);

  const remove = async (id: string) => {
    await fetch(`/api/school/${schoolId}/achievements`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const next = items.filter(a => a.id !== id);
    setItems(next);
    onSaved(next);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const res = await fetch(`/api/school/${schoolId}/achievements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, order: items.length }) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { const next = [...items, data]; setItems(next); onSaved(next); setForm({ icon: "trophy" }); setAdding(false); }
  };

  const icons = ["trophy", "star", "award", "globe", "book"] as const;

  return (
    <EditPanel title="Manage Achievements" onClose={onClose}>
      <div className="space-y-3 mb-6">
        {items.map(ac => {
          const Icon = iconMap[ac.icon] ?? Trophy;
          return (
            <div key={ac.id} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{ac.title}</p>
                {ac.year && <p className="text-xs text-slate-400">{ac.year}</p>}
              </div>
              <button onClick={() => remove(ac.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="border-2 border-indigo-200 rounded-xl p-4 space-y-3">
          <input value={form.title ?? ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Achievement title *" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.year ?? ""} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              placeholder="Year (e.g. 2024)" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
              {saving ? "Saving…" : "Add Achievement"}
            </button>
            <button onClick={() => { setAdding(false); setForm({ icon: "trophy" }); }} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      )}
    </EditPanel>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function SchoolLandingClient({ school, slides: initSlides, principal: initPrincipal, events: initEvents, achievements: initAchievements, isOwner }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [panel, setPanel] = useState<"hero" | "principal" | "events" | "achievements" | null>(null);

  const [slides, setSlides] = useState(initSlides);
  const [principal, setPrincipal] = useState(initPrincipal);
  const [events, setEvents] = useState(initEvents);
  const [achievements, setAchievements] = useState(initAchievements);

  const displaySlides = slides.length > 0 ? slides : DEMO_SLIDES;
  const initials = school.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-white relative">
      {/* Edit Mode Overlay */}
      {editMode && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-indigo-700 text-white py-2.5 px-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Pencil className="w-4 h-4" />
            <span className="font-semibold text-sm">Edit Mode — Click any <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Edit</span> button to modify sections</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-indigo-200 text-xs">Previewing as public</span>
            <button onClick={() => setEditMode(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm transition-all">
              <EyeOff className="w-3.5 h-3.5" /> Exit Edit
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`${editMode ? "mt-11" : ""} sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {school.logo_url ? (
              <Image src={school.logo_url} alt={school.name} width={36} height={36} className="rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
            )}
            <span className="font-bold text-slate-900 text-lg">{school.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[["About", "#about"], ["Principal", "#principal"], ["Events", "#events"], ["Achievements", "#achievements"], ["Contact", "#contact"]].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {school.phone && (
              <a href={`tel:${school.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                <Phone className="w-4 h-4" />
                {school.phone}
              </a>
            )}
            {isOwner && !editMode && (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Customize Page</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroCarousel
        slides={displaySlides}
        schoolName={school.name}
        tagline={school.tagline}
        editMode={editMode}
        onEdit={() => setPanel("hero")}
      />

      {/* Stats */}
      <StatsBar students={school.stats.students} staff={school.stats.staff} />

      {/* About */}
      <AboutSection school={school} />

      {/* Principal */}
      <PrincipalSection principal={principal} editMode={editMode} onEdit={() => setPanel("principal")} />

      {/* Events */}
      <EventsSection events={events} editMode={editMode} onEdit={() => setPanel("events")} />

      {/* Achievements */}
      <AchievementsSection achievements={achievements} editMode={editMode} onEdit={() => setPanel("achievements")} />

      {/* Contact */}
      <ContactSection school={school} />

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {school.logo_url ? (
                <Image src={school.logo_url} alt={school.name} width={32} height={32} className="rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
              )}
              <div>
                <p className="font-bold text-slate-900 text-sm">{school.name}</p>
                {school.tagline && <p className="text-slate-400 text-xs">{school.tagline}</p>}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[["About", "#about"], ["Events", "#events"], ["Contact", "#contact"]].map(([label, href]) => (
                <a key={label} href={href} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{label}</a>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <span>Powered by</span>
              <Link href="/" className="flex items-center gap-1.5 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                <GraduationCap className="w-4 h-4" />
                Schoolly
              </Link>
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs mt-6">© {new Date().getFullYear()} {school.name}. All rights reserved.</p>
        </div>
      </footer>

      {/* Edit Panels */}
      {panel === "hero" && (
        <HeroEditPanel slides={slides} schoolId={school.id} onClose={() => setPanel(null)} onSaved={setSlides} />
      )}
      {panel === "principal" && (
        <PrincipalEditPanel principal={principal} schoolId={school.id} onClose={() => setPanel(null)} onSaved={setPrincipal} />
      )}
      {panel === "events" && (
        <EventsEditPanel events={events} schoolId={school.id} onClose={() => setPanel(null)} onSaved={setEvents} />
      )}
      {panel === "achievements" && (
        <AchievementsEditPanel achievements={achievements} schoolId={school.id} onClose={() => setPanel(null)} onSaved={setAchievements} />
      )}

      {/* Panel backdrop */}
      {panel && <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setPanel(null)} />}
    </div>
  );
}
