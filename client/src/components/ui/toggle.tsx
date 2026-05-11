import type { ReactNode } from "react";

export function Toggle({
  label,
  checked,
  onChange,
  icon,
  compact = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      className={`toggle-button ${checked ? "is-on" : ""} ${compact ? "is-compact" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className="[&_svg]:size-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
