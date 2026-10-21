import { useEffect, useState } from "react";
import { Activity, BookX, Car, CheckCircle2, Radio, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useJiran } from "@/lib/jiran-store";
import { Card, Pill, SectionTitle } from "./ui";
import { cn } from "@/lib/utils";

const traffic = [
  { plate: "WQE 1180", name: "Shopee Express", unit: "Unit 11" },
  { plate: "BRT 5521", name: "Mr. Lee (Plumber)", unit: "Unit 16" },
  { plate: "VDF 9033", name: "Foodpanda Rider", unit: "Unit 20" },
  { plate: "PKN 3324", name: "Aunty Mary", unit: "Unit 8" },
];

export function GuardView() {
  const { houses, logPatrol, gate, addGate } = useJiran();
  const [live, setLive] = useState(true);
  useEffect(() => {
    if (!live) return;
    let i = 0;
    const t = setInterval(() => { const v = traffic[i++ % traffic.length]; addGate({ ...v, seconds: +(1.6 + Math.random() * 1.2).toFixed(1) }); }, 7000);
    return () => clearInterval(t);
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  const vacant = houses.filter((h) => h.status === "vacation");
  const avg = (gate.reduce((s, g) => s + g.seconds, 0) / gate.length).toFixed(1);

  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 p-4 text-background shadow-elegant">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-primary/40 blur-2xl" />
        <p className="flex items-center gap-1 text-xs opacity-70"><Radio className="h-3 w-3 animate-pulse" />Guardhouse · Auxiliary Police Patrol</p>
        <h1 className="text-lg font-bold">Precinct A Command</h1>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground"><b className="block text-lg">{vacant.length}</b>Priority</div>
          <div className="rounded-xl bg-background/10 p-2"><b className="block text-lg">{avg}s</b>Avg gate</div>
          <div className="rounded-xl bg-background/10 p-2"><b className="block text-lg">0</b>Logbooks</div>
        </div>
      </div>

      <SectionTitle icon={<ShieldAlert className="h-4 w-4 text-primary" />}>Smart Patrol Priority Map</SectionTitle>
      <Card className="p-3">
        <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Jalan Elmina 3/1</p>
        <div className="grid grid-cols-4 gap-2">
          {houses.map((h) => {
            const v = h.status === "vacation";
            return (
              <div key={h.unit} className={cn("relative rounded-xl border-2 p-2 text-center transition-all duration-500", v ? "border-primary bg-primary/10 shadow-md" : "border-transparent bg-muted")}>
                {v && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-primary" />}
                <p className={cn("text-lg font-bold", v && "text-primary")}>{h.unit}</p>
                <p className="truncate text-[9px] text-muted-foreground">{v ? "VACANT" : "Occupied"}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="mt-2 space-y-2">
        {vacant.map((h) => (
          <Card key={h.unit} className="border-primary/40 bg-warning/10 p-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-bold">Unit {h.unit} · No. {h.unit}, Jalan Elmina 3/1</p><Pill tone="primary">Vacant – Priority Patrol Required</Pill></div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{h.lastPatrol ? `Last check-in ${h.lastPatrol}` : "No check-in tonight"}</p>
            <Button size="sm" className="mt-2 w-full" onClick={() => { logPatrol(h.unit); toast.success(`Patrol check-in logged for Unit ${h.unit}`); }}>
              <CheckCircle2 className="h-4 w-4" />Log Patrol Check-In
            </Button>
          </Card>
        ))}
        {vacant.length === 0 && <p className="text-center text-xs text-muted-foreground">No vacant homes tonight.</p>}
      </div>

      <SectionTitle icon={<Activity className="h-4 w-4 text-success" />}>Fast-Lane Boom Gate Live Monitor</SectionTitle>
      <div className="mb-2 flex items-center justify-between">
        <Pill tone="success"><BookX className="h-3 w-3" />QR + LPR · 0 manual logbooks</Pill>
        <button onClick={() => setLive(!live)} className="text-xs font-semibold text-primary">{live ? "Pause feed" : "Resume feed"}</button>
      </div>
      <div className="space-y-2">
        {gate.slice(0, 8).map((g) => (
          <Card key={g.id} className="flex items-center gap-3 p-3 animate-in fade-in slide-in-from-top-2">
            <div className="rounded-lg bg-success/15 p-2"><Car className="h-4 w-4 text-success" /></div>
            <div className="flex-1"><p className="font-mono text-sm font-bold">{g.plate}</p><p className="text-xs text-muted-foreground">{g.name} → {g.unit} · {g.at}</p></div>
            <Pill tone={g.seconds < 3 ? "success" : "warning"}>{g.seconds}s</Pill>
          </Card>
        ))}
      </div>
    </div>
  );
}
