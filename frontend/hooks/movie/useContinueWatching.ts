import { useState, useEffect } from "react";
import { getContinueWatching } from "@/services/watch.api";
import { WatchHistory } from "@/types/watch.types";
import { useAuth } from "@/context/AuthContext";

export const useContinueWatching = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchHistory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetch = async () => {
      try {
        const res = await getContinueWatching();
        // Guard against orphaned history rows whose movie was deleted.
        setItems((res.data.movies as WatchHistory[]).filter((h) => h.movie));
      } catch {
        setItems([]);
      } finally {
        setLoaded(true);
      }
    };
    fetch();
  }, [authLoading, user]);

  const isLoading = !authLoading && !!user && !loaded;
  const effectiveItems = user ? items : [];

  return { items: effectiveItems, isLoading };
};
