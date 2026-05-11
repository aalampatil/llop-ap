import type { ReactNode } from "react";

export function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="premium-metric p-4">
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        <span className="grid size-9 place-items-center border border-main bg-main text-main-foreground [&_svg]:size-4">
          {icon}
        </span>
      </div>
      <div className="relative z-10 text-4xl font-black tracking-tight">{value}</div>
    </div>
  );
}
