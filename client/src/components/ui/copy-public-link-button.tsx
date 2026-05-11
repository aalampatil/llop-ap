import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";

export function CopyPublicLinkButton({
  url,
  variant = "default",
  className = "",
  style,
}: {
  url: string;
  variant?: "default" | "compact";
  className?: string;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      className={`${variant === "compact" ? "icon-button bg-main" : "neo-button bg-black text-main"} ${className}`.trim()}
      onClick={copyLink}
      style={style}
      title="Copy public link"
      type="button"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {variant === "default" ? (copied ? "Copied" : "Copy public link") : null}
    </button>
  );
}
