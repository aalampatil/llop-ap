import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyPublicLinkButton({
  url,
  variant = "default",
}: {
  url: string;
  variant?: "default" | "compact";
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      className={variant === "compact" ? "icon-button bg-main" : "neo-button bg-white"}
      onClick={copyLink}
      title="Copy public link"
      type="button"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {variant === "default" ? (copied ? "Copied" : "Copy public link") : null}
    </button>
  );
}
