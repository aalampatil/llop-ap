import { useAuth } from "@clerk/react";
import type { ReactNode } from "react";

export function SignedInView({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOutView({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && !isSignedIn ? <>{children}</> : null;
}
