import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Lock, ScanLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJiran } from "@/lib/jiran-store";
import { Card, Pill, Progress, Sheet, inputCls } from "./ui";

export function Onboarding() {
  const { onboardOpen, setOnboardOpen } = useJiran();
  const [step, setStep] = useState(1);
  const [doc, setDoc] = useState<string | null>(null);
  const [scan, setScan] = useState(0);
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!doc || scan >= 100) return;
    const t = setTimeout(() => setScan((s) => Math.min(100, s + 7)), 90);
    return () => clearTimeout(t);
  }, [doc, scan]);

  const close = () => { setOnboardOpen(false); setStep(1); setDoc(null); setScan(0); setCode(""); setDone(false); };

  return (
    <Sheet open={onboardOpen} onClose={close} title="Verify New Resident">
      <div className="mb-4 flex gap-2">
        {[1, 2].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />)}
      </div>
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Step 1 · Upload proof of residency</p>
          <div className="grid grid-cols-2 gap-2">
            {["TNB Utility Bill", "Tenancy Agreement"].map((d) => (
              <button key={d} onClick={() => { setDoc(d); setScan(0); }} className={`rounded-2xl border-2 border-dashed p-4 text-left text-sm font-medium transition ${doc === d ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                <FileText className="mb-2 h-6 w-6 text-primary" />{d}
              </button>
            ))}
          </div>
          {doc && (
            <Card className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><ScanLine className="h-4 w-4 animate-pulse text-primary" />AI OCR Scanner {scan < 100 ? "reading…" : "complete"}</div>
              <Progress value={scan} />
              {scan >= 100 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm animate-in fade-in">
                  <dt className="text-muted-foreground">Name</dt><dd className="font-semibold">Amirrul Hakimi</dd>
                  <dt className="text-muted-foreground">Unit</dt><dd className="font-semibold">No. 12, Jalan Elmina 3/1</dd>
                  <dt className="text-muted-foreground">Status</dt><dd><Pill tone="success"><CheckCircle2 className="h-3 w-3" />{doc === "TNB Utility Bill" ? "Verified Owner" : "Verified Tenant · exp 31 Dec 2027"}</Pill></dd>
                  <dt className="text-muted-foreground">Confidence</dt><dd className="font-semibold">99.2%</dd>
                </dl>
              )}
            </Card>
          )}
          <Button className="w-full" disabled={scan < 100} onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}
      {step === 2 && !done && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Step 2 · Enter 1-Time Dynamic Precinct Access Code from your RA Chairman</p>
          <input className={`${inputCls} text-center font-mono text-lg tracking-widest`} placeholder="ELM-XXXX-X" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="text-sm font-semibold text-primary underline" onClick={() => setCode("ELM-9482-X")}>Use Demo Code: ELM-9482-X</button>
          <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-xs text-success"><Lock className="mt-0.5 h-4 w-4 shrink-0" />Code locks to 1 device & expires in 15 mins — 100% Outsider-Free Community.</div>
          <Button className="w-full" disabled={!/^ELM-\d{4}-[A-Z]$/.test(code)} onClick={() => setDone(true)}>Verify & Join Precinct</Button>
        </div>
      )}
      {done && (
        <div className="space-y-3 py-6 text-center animate-in zoom-in-95">
          <ShieldCheck className="mx-auto h-16 w-16 text-success" />
          <h4 className="text-xl font-bold">Welcome to Elmina Green Precinct A!</h4>
          <p className="text-sm text-muted-foreground">Device bound. You're now a verified resident.</p>
          <Button className="w-full" onClick={close}>Enter JiranHub</Button>
        </div>
      )}
    </Sheet>
  );
}
