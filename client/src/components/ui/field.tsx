import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="field-label">
        {label}
      </span>
      {children}
    </label>
  );
}
