import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { slug, name, email, attending, message } = await req.json();

    if (!slug || !name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: invite, error } = await db
      .from("invites")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error || !invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const { error: insErr } = await db.from("rsvps").insert({
      invite_id: invite.id,
      name: String(name).slice(0, 120),
      email: email ? String(email).slice(0, 200) : null,
      attending: attending ? String(attending).slice(0, 20) : null,
      message: message ? String(message).slice(0, 2000) : null,
    });

    if (insErr) {
      console.error(insErr);
      return NextResponse.json({ error: "Could not save" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
