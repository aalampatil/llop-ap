import { SignInButton } from "@clerk/react";
import { Lock } from "lucide-react";

export function AuthWall() {
  return (
    <div className="neo-panel grid gap-5 bg-white/72 p-6 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <h3 className="text-2xl font-black tracking-tight">Sign in to unlock the builder</h3>
        <p className="mt-2 font-semibold text-black/56">
          Clerk powers creator accounts, protected dashboards, and authenticated response mode.
        </p>
      </div>
      <SignInButton mode="modal">
        <button className="neo-button bg-main" type="button">
          <Lock className="size-4" /> Sign in
        </button>
      </SignInButton>
    </div>
  );
}
