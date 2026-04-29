"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface DbUser {
  id: string;
  email: string;
  name?: string;
}

export function useUser() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!authUser) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        const user = await api.post<DbUser>("/api/users/sync", {
          id: authUser.id,
          email: authUser.email,
        });
        setDbUser(user);
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
      setLoading(false);
    };

    if (!authLoading) {
      syncUser();
    }
  }, [authUser, authLoading]);

  return { user: dbUser, loading: loading || authLoading };
}
