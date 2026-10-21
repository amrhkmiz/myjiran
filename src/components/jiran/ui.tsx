import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-4 shadow-card transition-shadow", className)}>{children}</div>;
}

export function Pill({ tone = "muted", children }: { tone?: "primary" | "success" | "warning" | "info" | "muted"; children: ReactNode }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
    muted: "bg-muted text-muted-foreground",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md animate-in slide-in-from-bottom-8 overflow-y-auto rounded-t-3xl bg-background p-5 shadow-elegant sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return <h2 className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{icon}{children}</h2>;
}

export const inputCls = "w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
