"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase";

const VISITOR_ID_KEY = "site_visitor_id";
const SESSION_HIT_KEY = "site_visit_hit_session";

/** Public hit counter used when Supabase is not configured (works on GitHub Pages). */
const TALLY_COUNTER_URL =
  "https://tally.yuki.sh/hits/ivanlin0402-personal-website/site-visits.json";

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

function formatCount(count: number, locale: string): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-Hant-TW" : "en-US").format(
    count,
  );
}

async function registerSupabaseVisit(): Promise<number | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const visitorId = getOrCreateVisitorId();
  const { data, error } = await supabase.rpc("register_visit", {
    p_visitor_id: visitorId,
  });

  if (error || data === null || data === undefined) return null;

  const next = typeof data === "number" ? data : Number(data);
  return Number.isFinite(next) && next >= 0 ? next : null;
}

/**
 * Global page-view counter via Tally (no API key).
 * Increments once per browser tab session; later navigations only read.
 */
async function registerTallyVisit(): Promise<number | null> {
  let alreadyHit = false;
  try {
    alreadyHit = sessionStorage.getItem(SESSION_HIT_KEY) === "1";
  } catch {
    alreadyHit = false;
  }

  const url = alreadyHit ? `${TALLY_COUNTER_URL}?mode=read` : TALLY_COUNTER_URL;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    visit?: number;
    visitor?: number;
  };
  const next = Number(payload.visit);

  if (!Number.isFinite(next) || next < 0) return null;

  if (!alreadyHit) {
    try {
      sessionStorage.setItem(SESSION_HIT_KEY, "1");
    } catch {
      // ignore
    }
  }

  return next;
}

/**
 * Site visit count for the footer.
 * Prefers Supabase unique visitors when configured; otherwise uses a public
 * global counter so the number actually updates on GitHub Pages.
 */
export function VisitorCount() {
  const { t, locale } = useLanguage();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      try {
        const supabaseCount = await registerSupabaseVisit();
        if (!cancelled && supabaseCount !== null) {
          setCount(supabaseCount);
          return;
        }
      } catch {
        // Fall through to Tally
      }

      try {
        const tallyCount = await registerTallyVisit();
        if (!cancelled && tallyCount !== null) {
          setCount(tallyCount);
          return;
        }
      } catch {
        // Hide counter if both backends fail
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
