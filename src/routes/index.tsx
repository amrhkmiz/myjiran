import { createFileRoute } from "@tanstack/react-router";
import { Building2, Home, Shield, ShieldCheck, UserPlus, Zap } from "lucide-react";
import { JiranProvider, useJiran, type Role } from "@/lib/jiran-store";
import { ResidentView } from "@/components/jiran/Resident";
import { AdminView } from "@/components/jiran/Admin";
import { GuardView } from "@/components/jiran/Guard";
import { Onboarding } from "@/components/jiran/Onboarding";
import { Pill } from "@/components/jiran/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JiranHub AI — Smart Township Community & Security SuperApp" },
      { name: "description", content: "Verified-resident alerts, privacy-first home status, fast-lane visitor QR and AI lost & found for Elmina township." },
      { property: "og:title", content: "JiranHub AI — Township of Tomorrow" },
      { property: "og:description", content: "Smart township community & security superapp prototype." },
    ],
  }),
  component: () => (
    <JiranProvider>
      <App />
    </JiranProvider>
  ),
});

const roles: { id: Role; label: string; sub: string; icon: typeof Home }[] = [
  { id: "resident", label: "Resident", sub: "Amirrul · Unit 12", icon: Home },
  { id: "admin", label: "JMB / RA", sub: "Chairman", icon: Building2 },
  { id: "guard", label: "Guardhouse", sub: "Patrol team", icon: Shield },
];

function App() {
  const { role, setRole, setOnboardOpen } = useJiran();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-1.5 font-extrabold"><span className="rounded-lg bg-gradient-to-br from-primary to-primary-glow p-1 text-primary-foreground shadow-elegant"><ShieldCheck className="h-4 w-4" /></span>JiranHub<span className="text-primary">AI</span></div>
          <span className="hidden text-[11px] font-semibold text-muted-foreground sm:inline">Hackathon Demo Role Switcher</span>
          <div className="order-last flex w-full gap-1 rounded-xl bg-muted p-1 sm:order-none sm:ml-auto sm:w-auto">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition", role === r.id ? "bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
                <r.icon className="h-3.5 w-3.5" />{r.label}
              </button>
            ))}
          </div>
          <button onClick={() => setOnboardOpen(true)} className="ml-auto flex items-center gap-1 rounded-lg border border-primary/40 px-2 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5 sm:ml-0"><UserPlus className="h-3.5 w-3.5" />Verify New Resident</button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl items-start justify-center gap-6 sm:p-6">
        <div className="relative h-[calc(100vh-92px)] w-full max-w-[420px] overflow-hidden bg-background sm:h-[820px] sm:rounded-[2.5rem] sm:border-8 sm:border-foreground sm:shadow-elegant">
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-foreground sm:block" />
          <div className="flex items-center justify-between border-b bg-card/90 px-4 py-2 text-xs backdrop-blur sm:pt-9">
            <span className="font-semibold">{roles.find((r) => r.id === role)!.sub}</span>
            <Pill tone="success"><ShieldCheck className="h-3 w-3" />Elmina Green · Precinct A</Pill>
          </div>
          <div key={role} className="h-[calc(100%-37px)] animate-in fade-in">
            {role === "resident" && <ResidentView />}
            {role === "admin" && <AdminView />}
            {role === "guard" && <GuardView />}
          </div>
        </div>
        <DemoPanel />
      </main>
      <Onboarding />
    </div>
  );
}

function DemoPanel() {
  const { setRole, setHomeStatus, homeStatus, houses, notices, calendar, gate } = useJiran();
  const steps = [
    { t: "1. Set Unit 12 to On Vacation", run: () => { setRole("resident"); setHomeStatus("vacation"); }, done: homeStatus === "vacation" },
    { t: "2. See it light up for Guardhouse", run: () => setRole("guard"), done: false },
    { t: "3. Publish a notice as JMB", run: () => setRole("admin"), done: false },
    { t: "4. Check Resident alerts & calendar", run: () => setRole("resident"), done: false },
  ];
  return (
    <aside className="sticky top-20 hidden w-72 space-y-3 lg:block">
      <div className="rounded-2xl border bg-card p-4">
        <p className="flex items-center gap-1 text-sm font-bold"><Zap className="h-4 w-4 text-primary" />Live Hackathon Demo Controls</p>
        <p className="mb-3 text-xs text-muted-foreground">State is shared live across all 3 views.</p>
        <div className="space-y-1.5">
          {steps.map((s) => (
            <button key={s.t} onClick={s.run} className={cn("w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition hover:border-primary", s.done && "border-success bg-success/10")}>{s.t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        {[
          ["Vacant homes", houses.filter((h) => h.status === "vacation").length],
          ["Notices", notices.length],
          ["Calendar", calendar.length],
          ["Gate entries", gate.length],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border bg-card p-3"><b className="block text-xl">{v}</b><span className="text-muted-foreground">{l}</span></div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Sime Darby Property University Hackathon · Township of Tomorrow</p>
    </aside>
  );
}
