import { SignInButton } from "@clerk/react";
import { Lock } from "lucide-react";

export function AuthRequiredPanel() {
  return (
    <div className="neo-panel bg-white/72 p-6">
      <h2 className="text-3xl font-black tracking-tight">Sign in required</h2>
      <p className="mt-2 font-semibold leading-7 text-black/56">
        The creator requires authenticated responses for this poll.
      </p>
      <SignInButton mode="modal">
        <button className="neo-button mt-5 bg-main" type="button">
          <Lock className="size-4" /> Sign in to respond
        </button>
      </SignInButton>
    </div>
  );
}
