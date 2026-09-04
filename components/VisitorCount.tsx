"use client";

import { useEffect, useState } from "react";

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
 * Unique-visitor count shown in the footer as: · 1,284 visits
 */
export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      try {
        const visitorId = getOrCreateVisitorId();
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });

        if (!response.ok || response.status === 204) return;

        const data = (await response.json()) as { count?: number };
        if (
          !cancelled &&
          typeof data.count === "number" &&
          Number.isFinite(data.count)
        ) {
          setCount(data.count);
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
