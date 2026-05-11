import { SignInButton, useAuth } from "@clerk/react";
import { Loader2, Lock } from "lucide-react";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main className="db-root">
        <div className="db-layout db-center">
          <Loader2 size={32} className="db-spinner" />
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="db-root">
        <div className="db-layout" style={{ paddingTop: "3rem" }}>
          <div className="neo-panel grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Sign in required</h1>
              <p className="mt-2 text-sm font-semibold leading-7 text-muted-foreground">
                Creator tools are protected. Sign in to build polls and view analytics.
              </p>
            </div>
            <SignInButton mode="modal">
              <button className="neo-button bg-main" type="button">
                <Lock className="size-4" /> Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
