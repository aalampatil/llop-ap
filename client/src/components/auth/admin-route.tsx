import { Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useCurrentUser } from "../../hooks/use-current-user";
import { ProtectedRoute } from "./protected-route";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useCurrentUser();

  return (
    <ProtectedRoute>
      {loading ? (
        <main className="db-root">
          <div className="db-layout db-center">
            <Loader2 size={32} className="db-spinner" />
          </div>
        </main>
      ) : isAdmin ? (
        children
      ) : (
        <main className="db-root">
          <div className="db-layout" style={{ paddingTop: "3rem" }}>
            <div className="neo-panel p-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-6" />
                <h1 className="text-4xl font-black tracking-tight">Admin access required</h1>
              </div>
              <p className="mt-3 text-sm font-semibold leading-7 text-muted-foreground">
                This area is restricted to platform administrators.
              </p>
            </div>
          </div>
        </main>
      )}
    </ProtectedRoute>
  );
}
