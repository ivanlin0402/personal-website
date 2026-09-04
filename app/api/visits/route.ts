import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { registerLocalVisit } from "@/lib/visits";

/**
 * POST /api/visits
 *
 * Body: { visitorId: string } — anonymous UUID from the browser (localStorage).
 * Returns: { count: number } — total unique visits.
 *
 * Prefers Supabase `register_visit` when env vars are set.
 * Falls back to a local `.data/visits.json` store so the footer always
 * can show a number during local development.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { visitorId?: unknown };
    const visitorId =
      typeof body.visitorId === "string" ? body.visitorId.trim() : "";

    const isValid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        visitorId,
      );

    if (!isValid) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase.rpc("register_visit", {
        p_visitor_id: visitorId,
      });

      if (!error && data !== null && data !== undefined) {
        const count = typeof data === "number" ? data : Number(data);
        if (Number.isFinite(count) && count >= 0) {
          return NextResponse.json({ count });
        }
      }
      // If Supabase fails, fall through to local store
    }

    const count = await registerLocalVisit(visitorId);
    return NextResponse.json({ count });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
