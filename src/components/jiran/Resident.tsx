import { useEffect, useState } from "react";
import {
  AlertTriangle, Bell, CalendarCheck, CalendarDays, Camera, Car, Check, CheckCircle2, Home, MapPin, Moon,
  PawPrint, QrCode, Search, ShieldCheck, Sparkles, Store, Users, Wand2, Clock, Key, MessageCircle, Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeNotice, useJiran, type HomeStatus, type Notice } from "@/lib/jiran-store";
import { Card, Pill, Progress, SectionTitle, Sheet, inputCls } from "./ui";
import { cn } from "@/lib/utils";

const fmtDate = (d?: string) => (d ? new Date(d + "T00:00").toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" }) : "TBC");

const RAW = `📢 *SALAM SEMUA PENDUDUK PRECINCT A* 📢
Pls take note ya!! JMB will hold Majlis Jamuan Deepavali & Hari Raya open house on 15 Nov, 7.30pm at Dewan Komuniti Elmina. Food by Mak Cik Rohana catering 🍛🍛 all residents + family welcome!! Pls RSVP to Encik Faizal b4 10/11. TQ 🙏🙏`;

export function ResidentView() {
  const [tab, setTab] = useState<"alerts" | "home" | "visitor" | "social">("alerts");
  const tabs = [
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "home", label: "Home", icon: Home },
    { id: "visitor", label: "Visitors", icon: QrCode },
    { id: "social", label: "Community", icon: Users },
  ] as const;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
        {tab === "alerts" && <AlertsTab />}
        {tab === "home" && <HomeTab />}
        {tab === "visitor" && <VisitorTab />}
        {tab === "social" && <SocialTab />}
      </div>
      <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t bg-card/95 backdrop-blur">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition", tab === t.id ? "text-primary" : "text-muted-foreground")}>
            <t.icon className="h-5 w-5" />{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function AlertsTab() {
  const { notices, calendar, addCalendar } = useJiran();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState(RAW);
  const [stage, setStage] = useState<"idle" | "busy" | "done">("idle");
  const [res, setRes] = useState<ReturnType<typeof analyzeNotice> | null>(null);
  const [synced, setSynced] = useState(false);
  const critical = notices.filter((n) => n.priority === "Emergency");
  const events = notices.filter((n) => n.priority !== "Emergency");
  const run = () => { setStage("busy"); setTimeout(() => { setRes(analyzeNotice(raw)); setStage("done"); }, 1400); };

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
        <p className="text-xs opacity-80">Your precinct</p>
        <h1 className="text-lg font-bold">Elmina Green Precinct A</h1>
        <p className="mt-1 flex items-center gap-1 text-xs"><ShieldCheck className="h-4 w-4" />100% Verified Residents · 248 homes</p>
      </div>
      <Button variant="outline" className="mt-3 w-full border-primary/40 text-primary" onClick={() => { setOpen(true); setStage("idle"); setSynced(false); }}>
        <Wand2 className="h-4 w-4" />Test AI Notice-to-Calendar (NLP)
      </Button>

      <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-primary" />}>Critical Alerts</SectionTitle>
      <div className="space-y-2">{critical.map((n) => <NoticeCard key={n.id} n={n} />)}</div>

      <SectionTitle icon={<Sparkles className="h-4 w-4 text-success" />}>Upcoming Community Events (AI Auto-Synced)</SectionTitle>
      <div className="space-y-2">{events.map((n) => <NoticeCard key={n.id} n={n} />)}</div>

      <SectionTitle icon={<CalendarDays className="h-4 w-4" />}>My Calendar</SectionTitle>
      <Card className="space-y-2 p-3">
        {[...calendar].sort((a, b) => a.date.localeCompare(b.date)).map((c) => (
          <div key={c.id} className="flex items-center gap-3 animate-in fade-in">
            <div className="w-12 rounded-lg bg-success/15 py-1 text-center text-success">
              <div className="text-[10px] font-bold uppercase">{new Date(c.date + "T00:00").toLocaleDateString("en-MY", { month: "short" })}</div>
              <div className="text-lg font-bold leading-none">{c.date.slice(8)}</div>
            </div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{c.title}</p><p className="truncate text-xs text-muted-foreground">{c.time} · {c.location}</p></div>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        ))}
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title="AI Notice-to-Calendar">
        <p className="mb-2 text-xs text-muted-foreground">Raw WhatsApp-style announcement from JMB:</p>
        <textarea className={cn(inputCls, "h-36 bg-success/5 font-mono text-xs")} value={raw} onChange={(e) => { setRaw(e.target.value); setStage("idle"); }} />
        <Button className="mt-3 w-full" onClick={run} disabled={stage === "busy"}><Sparkles className="h-4 w-4" />{stage === "busy" ? "Analyzing with AI…" : "Analyze with AI"}</Button>
        {stage === "busy" && <div className="mt-3"><Progress value={70} /></div>}
        {stage === "done" && res && (
          <Card className="mt-3 space-y-2 animate-in fade-in">
            <Pill tone={res.priority === "Emergency" ? "primary" : "success"}>{res.priority === "Emergency" ? "Urgent Alert" : res.priority === "Event" ? "Official Event" : "General"}</Pill>
            <p className="text-sm font-semibold">{res.summary}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-muted p-2"><CalendarDays className="mb-1 h-4 w-4" />{fmtDate(res.date)}</div>
              <div className="rounded-lg bg-muted p-2"><Clock className="mb-1 h-4 w-4" />{res.time ?? "TBC"}</div>
              <div className="rounded-lg bg-muted p-2"><MapPin className="mb-1 h-4 w-4" />{res.location ?? "TBC"}</div>
            </div>
            <Button variant={synced ? "outline" : "default"} className={cn("w-full", synced && "border-success text-success")} disabled={synced || !res.date}
              onClick={() => { addCalendar({ title: res.title, date: res.date!, time: res.time ?? "", location: res.location ?? "" }); setSynced(true); }}>
              {synced ? <><Check className="h-4 w-4" />Synced to Calendar</> : <><CalendarCheck className="h-4 w-4" />Auto-Sync to Phone Calendar</>}
            </Button>
          </Card>
        )}
      </Sheet>
    </>
  );
}

function NoticeCard({ n }: { n: Notice }) {
  const urgent = n.priority === "Emergency";
  return (
    <Card className={cn("animate-in fade-in slide-in-from-top-2", urgent ? "border-primary/40 bg-primary/5" : "")}>
      <div className="mb-1 flex items-center justify-between">
        <Pill tone={urgent ? "primary" : n.priority === "Event" ? "success" : "muted"}>{urgent ? "URGENT" : n.priority.toUpperCase()}</Pill>
        <span className="text-[11px] text-muted-foreground">{n.postedAt}</span>
      </div>
      <p className="text-sm font-bold">{n.title}</p>
      <p className="text-xs text-muted-foreground">{n.summary}</p>
      {n.date && <p className="mt-2 flex items-center gap-1 text-xs font-medium"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(n.date)} · {n.time} · {n.location}</p>}
    </Card>
  );
}

const statusMeta: Record<HomeStatus, { label: string; tone: "success" | "warning" | "info"; icon: typeof Home; desc: string }> = {
  home: { label: "At Home / Available", tone: "success", icon: Home, desc: "Neighbours can drop by or deliver parcels" },
  busy: { label: "Busy / Do Not Disturb", tone: "warning", icon: Moon, desc: "Neighbours see you're unavailable" },
  vacation: { label: "On Vacation / No One Home", tone: "info", icon: Plane, desc: "Silent patrol protection enabled" },
};

function HomeTab() {
  const { homeStatus, setHomeStatus, vacation, setVacation, houses } = useJiran();
  const ring = { success: "border-success bg-success/10", warning: "border-warning bg-warning/15", info: "border-info bg-info/10" };
  return (
    <>
      <h1 className="text-xl font-bold">Smart Home Status</h1>
      <p className="text-sm text-muted-foreground">Unit 12 · No. 12, Jalan Elmina 3/1</p>
      <div className="mt-3 space-y-2">
        {(Object.keys(statusMeta) as HomeStatus[]).map((s) => {
          const m = statusMeta[s];
          return (
            <button key={s} onClick={() => setHomeStatus(s)} className={cn("flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left transition", homeStatus === s ? ring[m.tone] : "border-transparent")}>
              <div className={cn("rounded-xl p-2", `bg-${m.tone}/15 text-${m.tone}`)}><m.icon className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-bold">{m.label}</p><p className="text-xs text-muted-foreground">{m.desc}</p></div>
              {homeStatus === s && <CheckCircle2 className={`h-5 w-5 text-${m.tone}`} />}
            </button>
          );
        })}
      </div>
      {homeStatus === "vacation" && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold">From<input type="date" className={inputCls} value={vacation.start} onChange={(e) => setVacation({ ...vacation, start: e.target.value })} /></label>
            <label className="text-xs font-semibold">Until<input type="date" className={inputCls} value={vacation.end} onChange={(e) => setVacation({ ...vacation, end: e.target.value })} /></label>
          </div>
          <Card className="border-info/40 bg-info/5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-info"><ShieldCheck className="h-5 w-5" />2-Layer Privacy Shield Active</p>
            <div className="space-y-2">
              <div className="rounded-xl bg-card p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Layer 1 · What neighbours see</p><p className="text-sm font-semibold">Status: Away / Busy</p><p className="text-xs text-muted-foreground">No vacation info leaked — protects against burglary.</p></div>
              <div className="rounded-xl bg-card p-3"><p className="text-[11px] font-bold uppercase text-muted-foreground">Layer 2 · What guardhouse sees</p><p className="text-sm font-semibold text-primary">Silent Alert Sent → Unit 12 added to High-Priority Night Patrol Route</p><p className="text-xs text-muted-foreground">{fmtDate(vacation.start)} – {fmtDate(vacation.end)}</p></div>
            </div>
          </Card>
        </div>
      )}
      <SectionTitle icon={<Users className="h-4 w-4" />}>Neighbour Availability Directory</SectionTitle>
      <div className="space-y-2">
        {houses.filter((h) => [10, 11, 14, 15].includes(h.unit)).map((h) => {
          const avail = h.status === "home";
          return (
            <Card key={h.unit} className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">{h.unit}</div>
              <div className="flex-1"><p className="text-sm font-semibold">{h.owner}</p><p className="text-xs text-muted-foreground">No. {h.unit}, Jalan Elmina 3/1</p></div>
              <Pill tone={avail ? "success" : "warning"}>{avail ? "Available" : "Away / Busy"}</Pill>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function VisitorTab() {
  const { addGate } = useJiran();
  const [f, setF] = useState({ name: "Encik Azman", plate: "VKL 8821", pax: "3", purpose: "Family visit" });
  const [photo, setPhoto] = useState(false);
  const [pass, setPass] = useState<null | { token: string; until: string }>(null);
  const [sim, setSim] = useState<"off" | "run" | "done">("off");
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (sim !== "run") return;
    if (step >= 3) { const t = setTimeout(() => { setSim("done"); addGate({ plate: f.plate, name: f.name, unit: "Unit 12", seconds: 2.4 }); }, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [sim, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const gen = () => {
    const until = new Date(Date.now() + 6 * 3600e3).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
    setPass({ token: "JH-" + Math.random().toString(36).slice(2, 8).toUpperCase(), until });
  };
  const checks = ["CCTV scanned plate " + f.plate, "Face match 98.7%", "Valid dynamic QR"];
  return (
    <>
      <h1 className="text-xl font-bold">Fast-Lane Visitor Pass</h1>
      <p className="text-sm text-muted-foreground">Pre-register guests for zero-queue entry</p>
      {!pass ? (
        <Card className="mt-3 space-y-3">
          <input className={inputCls} placeholder="Visitor name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={cn(inputCls, "font-mono uppercase")} placeholder="Plate" value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value.toUpperCase() })} />
            <input className={inputCls} type="number" min={1} placeholder="Pax" value={f.pax} onChange={(e) => setF({ ...f, pax: e.target.value })} />
          </div>
          <select className={inputCls} value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })}>
            {["Family visit", "Delivery", "Contractor / Renovation", "Event guest"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <button onClick={() => setPhoto(!photo)} className={cn("flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left text-sm", photo && "border-success bg-success/5")}>
            {photo ? <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-lg font-bold text-success-foreground">A</div> : <Camera className="h-6 w-6 text-muted-foreground" />}
            <span className="flex-1">{photo ? "Face ID / IC photo attached" : "Upload Visitor Face ID / IC Photo"}</span>
            {!photo && <span className="text-xs font-semibold text-primary">Use mock</span>}
          </button>
          <Button className="w-full" disabled={!f.name || !f.plate} onClick={gen}><QrCode className="h-4 w-4" />Generate Smart Pass</Button>
        </Card>
      ) : (
        <Card className="mt-3 overflow-hidden p-0 animate-in zoom-in-95">
          <div className="bg-primary p-4 text-primary-foreground"><p className="text-xs opacity-80">JiranHub Smart Pass · Precinct A</p><p className="text-lg font-bold">{f.name}</p></div>
          <div className="flex flex-col items-center gap-3 p-4">
            <FakeQR seed={pass.token} />
            <div className="grid w-full grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-muted p-2"><Car className="mx-auto h-4 w-4" /><b className="font-mono">{f.plate}</b></div>
              <div className="rounded-lg bg-muted p-2"><Users className="mx-auto h-4 w-4" />{f.pax} pax</div>
              <div className="rounded-lg bg-muted p-2"><Clock className="mx-auto h-4 w-4" />til {pass.until}</div>
            </div>
            <p className="font-mono text-xs text-muted-foreground">Token {pass.token}</p>
            <Button className="w-full bg-success text-success-foreground hover:bg-success/90" onClick={() => { setSim("run"); setStep(0); }}><Car className="h-4 w-4" />Simulate Boom Gate Arrival</Button>
            <Button variant="ghost" size="sm" onClick={() => setPass(null)}>New pass</Button>
          </div>
        </Card>
      )}
      <Sheet open={sim !== "off"} onClose={() => setSim("off")} title="Guardhouse Live Simulation">
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={c} className={cn("flex items-center gap-2 rounded-xl p-3 text-sm transition", step > i ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
              {step > i ? <CheckCircle2 className="h-4 w-4" /> : <Search className="h-4 w-4 animate-pulse" />}{c}
            </div>
          ))}
        </div>
        {sim === "done" && (
          <div className="mt-4 rounded-2xl bg-success p-4 text-center text-success-foreground animate-in zoom-in-95">
            <p className="text-2xl font-extrabold">Boom Gate Opened</p>
            <p className="text-sm">in 2.4 seconds · Zero Queue!</p>
          </div>
        )}
      </Sheet>
    </>
  );
}

function FakeQR({ seed }: { seed: string }) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cells = Array.from({ length: 21 * 21 }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const x = i % 21, y = Math.floor(i / 21); const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); if (finder) { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); } return (h >> 16) % 2 === 0; });
  return <div className="grid h-44 w-44 grid-cols-[repeat(21,1fr)] rounded-lg bg-card p-2 ring-1 ring-border">{cells.map((on, i) => <div key={i} className={on ? "bg-foreground" : ""} />)}</div>;
}

function SocialTab() {
  const [sub, setSub] = useState<"feed" | "lost">("feed");
  return (
    <>
      <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
        {(["feed", "lost"] as const).map((s) => (
          <button key={s} onClick={() => setSub(s)} className={cn("rounded-lg py-2 transition", sub === s ? "bg-card shadow-sm" : "text-muted-foreground")}>{s === "feed" ? "Feed & Market" : "AI Lost & Found"}</button>
        ))}
      </div>
      {sub === "feed" ? <Feed /> : <LostFound />}
    </>
  );
}

const posts = [
  { who: "Mak Cik Rohana", unit: 18, tag: "Marketplace", text: "Selling Nasi Lemak Sambal Sotong & Crispy Karipap every Sat–Sun 7am! RM5/pack. PM or come to Unit 18 🍛", likes: 42 },
  { who: "Daniel Wong", unit: 19, tag: "Activity", text: "Weekend Badminton Session at Elmina Sports Hall, Sunday 8pm. Need 2 more players 🏸", likes: 17 },
  { who: "Kavitha Devi", unit: 16, tag: "Marketplace", text: "Homemade murukku & Deepavali cookies, pre-order now before stock runs out!", likes: 28 },
  { who: "Hafiz Ismail", unit: 20, tag: "Update", text: "Spotted a family of monitor lizards near the lake jogging track — beautiful but keep kids away 🦎", likes: 9 },
];

function Feed() {
  return (
    <div className="mt-3 space-y-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Bell className="h-3 w-3" />Casual posts never trigger urgent push alerts.</p>
      {posts.map((p) => (
        <Card key={p.who}>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{p.who[0]}</div>
            <div className="flex-1"><p className="flex items-center gap-1 text-sm font-semibold">{p.who}<CheckCircle2 className="h-3.5 w-3.5 text-success" /></p><p className="text-[11px] text-muted-foreground">Unit {p.unit} · Verified</p></div>
            <Pill tone={p.tag === "Marketplace" ? "warning" : "muted"}>{p.tag === "Marketplace" && <Store className="h-3 w-3" />}{p.tag}</Pill>
          </div>
          <p className="text-sm">{p.text}</p>
          <p className="mt-2 flex gap-4 text-xs text-muted-foreground"><span>♥ {p.likes}</span><span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />Reply</span></p>
        </Card>
      ))}
    </div>
  );
}

const lostItems = [
  { kind: "cat", title: "Orange tabby cat 'Oyen'", owner: "Sarah · Unit 24", when: "Lost 2 days ago", icon: PawPrint },
  { kind: "keys", title: "Honda car keys with blue tag", owner: "Sarah · Unit 24", when: "Lost yesterday", icon: Key },
  { kind: "bike", title: "Kid's red bicycle", owner: "Ong Kah Hoe · Unit 17", when: "Lost 5 days ago", icon: Car },
];

function LostFound() {
  const [pick, setPick] = useState<null | "cat" | "keys">(null);
  const [p, setP] = useState(0);
  const [notified, setNotified] = useState(false);
  useEffect(() => {
    if (!pick || p >= 100) return;
    const t = setTimeout(() => setP((v) => Math.min(100, v + 9)), 80);
    return () => clearTimeout(t);
  }, [pick, p]);
  const match = lostItems.find((l) => l.kind === pick);
  return (
    <div className="mt-3 space-y-3">
      <Card className="bg-gradient-to-br from-success/10 to-transparent">
        <p className="flex items-center gap-2 text-sm font-bold"><Camera className="h-4 w-4 text-success" />Snap Found Item (AI Vision)</p>
        <p className="mb-3 text-xs text-muted-foreground">Pick a demo photo to upload:</p>
        <div className="grid grid-cols-2 gap-2">
          {([["cat", "🐈 Orange cat"], ["keys", "🔑 Honda keys"]] as const).map(([k, l]) => (
            <Button key={k} variant={pick === k ? "default" : "outline"} onClick={() => { setPick(k); setP(0); setNotified(false); }}>{l}</Button>
          ))}
        </div>
        {pick && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold">{p < 100 ? "AI Computer Vision Matching…" : "Match found"}</p>
            <Progress value={p} />
            {p >= 100 && match && (
              <div className="rounded-xl border-2 border-success bg-card p-3 animate-in zoom-in-95">
                <Pill tone="success"><Sparkles className="h-3 w-3" />96% Visual Match!</Pill>
                <p className="mt-1 text-sm font-bold">{match.title}</p>
                <p className="text-xs text-muted-foreground">Lost report by {match.owner}</p>
                <Button size="sm" className="mt-2 w-full" disabled={notified} onClick={() => setNotified(true)}>{notified ? <><Check className="h-4 w-4" />Sarah notified</> : "Notify Owner Directly"}</Button>
              </div>
            )}
          </div>
        )}
      </Card>
      <SectionTitle>Lost reports nearby</SectionTitle>
      {lostItems.map((l) => (
        <Card key={l.title} className="flex items-center gap-3 p-3">
          <div className="rounded-xl bg-warning/20 p-2"><l.icon className="h-5 w-5 text-warning-foreground" /></div>
          <div className="flex-1"><p className="text-sm font-semibold">{l.title}</p><p className="text-xs text-muted-foreground">{l.owner} · {l.when}</p></div>
        </Card>
      ))}
    </div>
  );
}
