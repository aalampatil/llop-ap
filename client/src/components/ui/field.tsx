import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.14em] text-black/60">
        {label}
      </span>
      {children}
    </label>
  );
}
