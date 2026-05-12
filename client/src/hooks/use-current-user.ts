import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { getApiError, useApiClient } from "../lib/api";
import type { CurrentUser } from "../types/poll";

let cachedCurrentUser: CurrentUser | null | undefined;
let cachedUserId: string | null = null;
let currentUserRequest: Promise<CurrentUser | null> | null = null;

export function useCurrentUser() {
  const api = useApiClient();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        cachedCurrentUser = undefined;
        cachedUserId = null;
        currentUserRequest = null;
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const currentUser =
          cachedCurrentUser !== undefined && cachedUserId === userId
            ? cachedCurrentUser
            : await (currentUserRequest ??= api
                .get<{ user: CurrentUser | null }>("/api/user/me")
                .then((data) => {
                  cachedCurrentUser = data.user;
                  cachedUserId = userId;
                  return data.user;
                })
                .finally(() => {
                  currentUserRequest = null;
                }));
        if (mounted) setUser(currentUser);
      } catch (err) {
        if (mounted) setError(getApiError(err, "Could not load user"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [api, isLoaded, isSignedIn, userId]);

  return {
    user,
    loading: loading || !isLoaded,
    error,
    isAdmin: user?.role === "admin",
  };
}
