"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

const STORAGE_KEY = "site_visitor_id";

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = createVisitorId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return createVisitorId();
  }
}

function formatCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

/**
 * Unique-visitor count for the footer.
 * Calls Supabase directly from the browser (works on static GitHub Pages).
 * Hides itself if Supabase is not configured or the request fails.
 */
export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) return;

        const visitorId = getOrCreateVisitorId();
        const { data, error } = await supabase.rpc("register_visit", {
          p_visitor_id: visitorId,
        });

        if (error || data === null || data === undefined) return;

        const next = typeof data === "number" ? data : Number(data);
        if (!cancelled && Number.isFinite(next) && next >= 0) {
          setCount(next);
        }
      } catch {
        // Fail silently
      }
    }

    register();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <span className="text-[13px] text-muted">
      {" "}
      · {formatCount(count)} visits
    </span>
  );
}
