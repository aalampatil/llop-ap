import type { ReactNode } from "react";

export function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-current/20 pb-3">
      <div className="flex items-center gap-2 font-black">
        <span className="[&_svg]:size-4">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-right font-bold opacity-70">{value}</span>
    </div>
  );
}
