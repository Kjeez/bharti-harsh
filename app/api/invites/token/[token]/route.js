import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mergeData } from "@/lib/defaults";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET: invite data + RSVP inbox (owner view)
export async function GET(_req, { params }) {
  const { token } = params;
  if (!UUID_RE.test(token)) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const db = supabaseAdmin();
  const { data: invite, error } = await db
    .from("invites")
    .select("id, slug, template, data, created_at")
    .eq("edit_token", token)
    .single();

  if (error || !invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: rsvps } = await db
    .from("rsvps")
    .select("name, email, attending, message, created_at")
    .eq("invite_id", invite.id)
    .order("created_at", { ascending: false })
    .limit(500);

  return NextResponse.json({
    slug: invite.slug,
    template: invite.template,
    data: invite.data,
    rsvps: rsvps || [],
  });
}

// PUT: update invitation data
export async function PUT(req, { params }) {
  const { token } = params;
  if (!UUID_RE.test(token)) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  try {
    const body = await req.json();
    const data = mergeData(body.data || {});
    if (!data.groom?.trim() || !data.bride?.trim()) {
      return NextResponse.json({ error: "Groom and bride names are required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: row, error } = await db
      .from("invites")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("edit_token", token)
      .select("slug")
      .single();

    if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, slug: row.slug });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
