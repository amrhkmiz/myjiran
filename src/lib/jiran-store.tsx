import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "resident" | "admin" | "guard";
export type HomeStatus = "home" | "busy" | "vacation";
export type Priority = "Emergency" | "Event" | "General";

export interface Notice {
  id: string;
  title: string;
  summary: string;
  priority: Priority;
  date?: string;
  time?: string;
  location?: string;
  postedAt: string;
}
export interface CalEvent { id: string; title: string; date: string; time: string; location: string }
export interface House { unit: number; owner: string; status: HomeStatus; lastPatrol?: string }
export interface GateEntry { id: string; plate: string; name: string; unit: string; seconds: number; at: string }
export interface Applicant { id: string; name: string; unit: string; doc: string; confidence: number; code?: string }

const now = () => new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });

const initialHouses: House[] = [
  { unit: 8, owner: "Tan Wei Ming", status: "home" },
  { unit: 9, owner: "Nurul Aina", status: "busy" },
  { unit: 10, owner: "Rajesh Kumar", status: "home" },
  { unit: 11, owner: "Siti Hajar", status: "busy" },
  { unit: 12, owner: "Amirrul Hakimi", status: "home" },
  { unit: 14, owner: "Lim Mei Ling", status: "vacation" },
  { unit: 15, owner: "Faizal Rahman", status: "home" },
  { unit: 16, owner: "Kavitha Devi", status: "home" },
  { unit: 17, owner: "Ong Kah Hoe", status: "home" },
  { unit: 18, owner: "Mak Cik Rohana", status: "home" },
  { unit: 19, owner: "Daniel Wong", status: "busy" },
  { unit: 20, owner: "Hafiz Ismail", status: "home" },
];

interface Store {
  role: Role; setRole: (r: Role) => void;
  homeStatus: HomeStatus; vacation: { start: string; end: string };
  setHomeStatus: (s: HomeStatus) => void; setVacation: (v: { start: string; end: string }) => void;
  houses: House[]; logPatrol: (unit: number) => void;
  notices: Notice[]; addNotice: (n: Omit<Notice, "id" | "postedAt">) => void;
  calendar: CalEvent[]; addCalendar: (e: Omit<CalEvent, "id">) => boolean;
  gate: GateEntry[]; addGate: (e: Omit<GateEntry, "id" | "at">) => void;
  applicants: Applicant[]; approve: (id: string) => string;
  onboardOpen: boolean; setOnboardOpen: (b: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

export function JiranProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("resident");
  const [homeStatus, setHS] = useState<HomeStatus>("home");
  const [vacation, setVacation] = useState({ start: "2026-10-24", end: "2026-10-30" });
  const [houses, setHouses] = useState(initialHouses);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([
    { id: "n1", title: "Urgent: Water Pipe Burst at Jalan Elmina 3/2", summary: "Air Selangor crew on site. Water supply disrupted until 6:00 PM. Water tanker at the surau.", priority: "Emergency", postedAt: "09:12" },
    { id: "n2", title: "Road Resurfacing – Jalan Elmina 3/1", summary: "Expect lane closure 9 AM–4 PM tomorrow. Please park inside your porch.", priority: "Emergency", postedAt: "08:30" },
    { id: "n3", title: "Annual General Meeting (AGM) 2026", summary: "Election of new RA committee and 2027 budget approval.", priority: "Event", date: "2026-11-02", time: "20:00", location: "Elmina Community Hall", postedAt: "Yesterday" },
    { id: "n4", title: "Precinct Gotong-Royong", summary: "Monsoon-ready drain cleaning. Breakfast provided.", priority: "Event", date: "2026-11-08", time: "07:30", location: "Taman Tasik Elmina", postedAt: "Mon" },
  ]);
  const [calendar, setCalendar] = useState<CalEvent[]>([
    { id: "c1", title: "Annual General Meeting (AGM) 2026", date: "2026-11-02", time: "20:00", location: "Elmina Community Hall" },
    { id: "c2", title: "Precinct Gotong-Royong", date: "2026-11-08", time: "07:30", location: "Taman Tasik Elmina" },
  ]);
  const [gate, setGate] = useState<GateEntry[]>([
    { id: "g1", plate: "WXY 2231", name: "GrabFood Rider", unit: "Unit 15", seconds: 2.1, at: "15:58" },
    { id: "g2", plate: "BMK 7710", name: "Puan Zaleha", unit: "Unit 9", seconds: 2.7, at: "15:41" },
    { id: "g3", plate: "VBN 4402", name: "J&T Express", unit: "Unit 18", seconds: 1.9, at: "15:20" },
  ]);
  const [applicants, setApplicants] = useState<Applicant[]>([
    { id: "a1", name: "Muhammad Iqbal bin Hassan", unit: "No. 22, Jalan Elmina 3/1", doc: "TNB Utility Bill", confidence: 99 },
    { id: "a2", name: "Chong Li Ying", unit: "No. 7, Jalan Elmina 3/3", doc: "Tenancy Agreement", confidence: 96 },
    { id: "a3", name: "Arvind Subramaniam", unit: "No. 31, Jalan Elmina 3/2", doc: "Indah Water Bill", confidence: 91 },
  ]);

  const setHomeStatus = (s: HomeStatus) => {
    setHS(s);
    setHouses((h) => h.map((x) => (x.unit === 12 ? { ...x, status: s } : x)));
  };

  const value: Store = {
    role, setRole, homeStatus, vacation, setHomeStatus, setVacation,
    houses,
    logPatrol: (unit) => setHouses((h) => h.map((x) => (x.unit === unit ? { ...x, lastPatrol: now() } : x))),
    notices,
    addNotice: (n) => {
      setNotices((p) => [{ ...n, id: crypto.randomUUID(), postedAt: "Just now" }, ...p]);
      if (n.priority === "Event" && n.date)
        setCalendar((c) => [...c, { id: crypto.randomUUID(), title: n.title, date: n.date!, time: n.time ?? "", location: n.location ?? "" }]);
    },
    calendar,
    addCalendar: (e) => {
      if (calendar.some((c) => c.title === e.title && c.date === e.date)) return false;
      setCalendar((c) => [...c, { ...e, id: crypto.randomUUID() }]);
      return true;
    },
    gate,
    addGate: (e) => setGate((g) => [{ ...e, id: crypto.randomUUID(), at: now() }, ...g]),
    applicants,
    approve: (id) => {
      const code = `ELM-${Math.floor(1000 + Math.random() * 9000)}-${"ABCDEFGHJKX"[Math.floor(Math.random() * 11)]}`;
      setApplicants((a) => a.map((x) => (x.id === id ? { ...x, code } : x)));
      return code;
    },
    onboardOpen, setOnboardOpen,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJiran() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useJiran outside provider");
  return c;
}

/** Simulated on-device NLP: classifies a raw notice and extracts date/time/location. */
export function analyzeNotice(raw: string): Omit<Notice, "id" | "postedAt"> {
  const t = raw.toLowerCase();
  const priority: Priority = /(urgent|emergency|burst|banjir|flood|fire|kecemasan|gangguan|disrupt)/.test(t)
    ? "Emergency"
    : /(meeting|agm|gotong|event|majlis|festival|session|program|jamuan|ceramah)/.test(t)
      ? "Event"
      : "General";
  const months: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", mei: "05", jun: "06", jul: "07", aug: "08", ogos: "08", sep: "09", oct: "10", okt: "10", nov: "11", dec: "12", dis: "12" };
  let date: string | undefined;
  const m1 = raw.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|mei|jun|jul|aug|ogos|sep|oct|okt|nov|dec|dis)[a-z]*/i);
  const m2 = raw.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (m1) date = `2026-${months[m1[2]!.toLowerCase()]!}-${m1[1]!.padStart(2, "0")}`;
  else if (m2) date = `2026-${m2[2]!.padStart(2, "0")}-${m2[1]!.padStart(2, "0")}`;
  let time: string | undefined;
  const tm = raw.match(/(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm|pagi|petang|malam)/i);
  if (tm) {
    let h = parseInt(tm[1]!);
    const pm = /pm|petang|malam/i.test(tm[3] ?? "");
    if (pm && h < 12) h += 12;
    time = `${String(h).padStart(2, "0")}:${tm[2] ?? "00"}`;
  }
  const loc = raw.match(/(?:at|@|di|venue[:\s])\s*([A-Z][\w'&]*(?:\s+[A-Z0-9][\w'&/]*){0,4})/);
  const firstLine = raw.split(/[\n.!]/).map((s) => s.replace(/[*_~📢🚨‼️]/g, "").trim()).find((s) => s.length > 8) ?? "Community notice";
  const title = firstLine.length > 60 ? firstLine.slice(0, 57) + "…" : firstLine;
  const summary =
    priority === "Emergency"
      ? `Urgent precinct alert: ${title.toLowerCase()} — residents should take note immediately.`
      : priority === "Event"
        ? `${title} on ${date ?? "a date TBC"}${time ? " at " + time : ""}${loc ? ", " + loc[1] : ""}. All residents invited.`
        : `General notice: ${title}.`;
  return { title, summary, priority, ...(date ? { date } : {}), ...(time ? { time } : {}), ...(loc?.[1] ? { location: loc[1] } : {}) };
}
