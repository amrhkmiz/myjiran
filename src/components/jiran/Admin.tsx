import { useState } from "react";
import { CalendarDays, Check, Copy, FileText, Megaphone, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeNotice, useJiran, type Priority } from "@/lib/jiran-store";
import { Card, Pill, SectionTitle, inputCls } from "./ui";
import { cn } from "@/lib/utils";

const SAMPLES = [
  "URGENT: TNB scheduled power disruption at Jalan Elmina 3/1 – 3/4 on 28 Oct from 9am to 3pm. Please switch off sensitive appliances.",
  "Precinct A Family Fun Run & Carnival on 22 Nov 7am at Taman Tasik Elmina. Free t-shirt for first 100 residents!",
  "Reminder: Please do not park on the grass verge. Bins collection days are Mon, Wed, Fri.",
];

export function AdminView() {
  const { applicants, approve, addNotice } = useJiran();
  const [text, setText] = useState<string>(SAMPLES[1] ?? "");
  const [preview, setPreview] = useState<ReturnType<typeof analyzeNotice> | null>(null);
  const [override, setOverride] = useState<Priority | null>(null);
  const final = preview ? { ...preview, priority: override ?? preview.priority } : null;

  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 p-4 text-background shadow-elegant">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-primary/40 blur-2xl" />
        <p className="text-xs opacity-70">JMB / RA Admin · Precinct Chairman</p>
        <h1 className="text-lg font-bold">Tuan Haji Rosli</h1>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-background/10 p-2"><b className="block text-lg">248</b>Verified</div>
          <div className="rounded-xl bg-background/10 p-2"><b className="block text-lg">{applicants.filter((a) => !a.code).length}</b>Pending</div>
          <div className="rounded-xl bg-background/10 p-2"><b className="block text-lg">0</b>Outsiders</div>
        </div>
      </div>

      <SectionTitle icon={<UserCheck className="h-4 w-4" />}>Resident Verification & 1-Time Codes</SectionTitle>
      <div className="space-y-2">
        {applicants.map((a) => (
          <Card key={a.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-sm font-bold">{a.name}</p><p className="text-xs text-muted-foreground">{a.unit}</p></div>
              <Pill tone={a.confidence >= 95 ? "success" : "warning"}>{a.confidence}% Match</Pill>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><FileText className="h-3 w-3" />AI OCR on {a.doc}</p>
            {a.code ? (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-success/10 p-2 animate-in fade-in">
                <div><p className="font-mono text-base font-bold tracking-widest text-success">{a.code}</p><p className="text-[10px] text-muted-foreground">1 device · expires in 15 mins</p></div>
                <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard?.writeText(a.code!); toast.success("Code copied"); }}><Copy className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button size="sm" className="mt-2 w-full" onClick={() => { approve(a.id); toast.success(`${a.name.split(" ")[0]} approved`); }}>Approve & Generate 1-Time Precinct Code</Button>
            )}
          </Card>
        ))}
      </div>

      <SectionTitle icon={<Megaphone className="h-4 w-4" />}>AI Smart Broadcast Composer</SectionTitle>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {["Emergency", "Event", "General"].map((l, i) => (
            <button key={l} onClick={() => { setText(SAMPLES[i] ?? ""); setPreview(null); }} className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">Sample: {l}</button>
          ))}
          <label className="cursor-pointer rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">
            Upload .txt
            <input type="file" accept=".txt,text/plain" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setText(await f.text()); setPreview(null); } }} />
          </label>
        </div>
        <textarea className={cn(inputCls, "h-28")} value={text} onChange={(e) => { setText(e.target.value); setPreview(null); }} />
        <Button variant="outline" className="w-full" onClick={() => { setPreview(analyzeNotice(text)); setOverride(null); }}><Sparkles className="h-4 w-4" />Categorize with AI</Button>
        {final && (
          <div className="space-y-2 rounded-xl border p-3 animate-in fade-in">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">AI priority</p>
            <div className="grid grid-cols-3 gap-1">
              {(["Emergency", "Event", "General"] as Priority[]).map((p) => (
                <button key={p} onClick={() => setOverride(p)} className={cn("rounded-lg py-1.5 text-xs font-semibold", final.priority === p ? (p === "Emergency" ? "bg-primary text-primary-foreground" : p === "Event" ? "bg-success text-success-foreground" : "bg-foreground text-background") : "bg-muted")}>{p}</button>
              ))}
            </div>
            <p className="text-sm font-bold">{final.title}</p>
            <p className="text-xs text-muted-foreground">{final.summary}</p>
            {final.priority === "Event" && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-2 text-xs text-success">
                <CalendarDays className="h-4 w-4" />
                {final.date ? `Will auto-populate residents' calendars: ${final.date} ${final.time ?? ""} · ${final.location ?? "TBC"}` : "No date detected — won't be added to calendars."}
              </div>
            )}
            <Button className="w-full" onClick={() => { addNotice(final); toast.success("Published to all Precinct A residents"); setPreview(null); }}><Check className="h-4 w-4" />Publish to Residents</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
