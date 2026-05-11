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
        <span className="font-black text-black/58">{label}</span>
        <span className="grid size-9 place-items-center rounded-full bg-black text-white [&_svg]:size-4">
          {icon}
        </span>
      </div>
      <div className="relative z-10 text-4xl font-black tracking-tight">{value}</div>
    </div>
  );
}
