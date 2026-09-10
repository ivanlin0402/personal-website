"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase";

const VISITOR_ID_KEY = "site_visitor_id";
const LOCAL_COUNT_KEY = "site_local_visit_count";
const LOCAL_MARKED_KEY = "site_local_visit_marked";

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
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = createVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return createVisitorId();
  }
}

/** Local fallback when Supabase is unavailable (per-browser unique visits). */
function registerLocalVisit(): number {
  try {
    const raw = localStorage.getItem(LOCAL_COUNT_KEY);
    let total = Number(raw);
    if (!Number.isFinite(total) || total < 0) total = 0;

    const marked = localStorage.getItem(LOCAL_MARKED_KEY);
    if (!marked) {
      total += 1;
      localStorage.setItem(LOCAL_COUNT_KEY, String(total));
      localStorage.setItem(LOCAL_MARKED_KEY, "1");
    }

    return Math.max(total, 1);
  } catch {
    return 1;
  }
}

function formatCount(count: number, locale: string): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-Hant-TW" : "en-US").format(
    count,
  );
}

/**
 * Unique-visitor count for the footer.
 * Prefers Supabase; falls back to a local count so the footer always shows visits.
 */
export function VisitorCount() {
  const { t, locale } = useLanguage();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      const localCount = registerLocalVisit();

      try {
        const supabase = getSupabaseBrowser();
        if (supabase) {
          const visitorId = getOrCreateVisitorId();
          const { data, error } = await supabase.rpc("register_visit", {
            p_visitor_id: visitorId,
          });

          if (!error && data !== null && data !== undefined) {
            const next = typeof data === "number" ? data : Number(data);
            if (!cancelled && Number.isFinite(next) && next >= 0) {
              setCount(next);
              return;
            }
          }
        }
      } catch {
        // Fall through to local count
      }

      if (!cancelled) {
        setCount(localCount);
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
      · {formatCount(count, locale)} {t.footer.visits}
    </span>
  );
}
