import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mergeData, slugify } from "@/lib/defaults";

export async function POST(req) {
  try {
    const body = await req.json();
    const data = mergeData(body.data || {});

    if (!data.groom?.trim() || !data.bride?.trim()) {
      return NextResponse.json({ error: "Groom and bride names are required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    let slug = slugify(data.groom, data.bride);

    // retry once on the (rare) slug collision
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: row, error } = await db
        .from("invites")
        .insert({ slug, template: "emerald-noir", data })
        .select("slug, edit_token")
        .single();

      if (!error) {
        return NextResponse.json({ slug: row.slug, editToken: row.edit_token });
      }
      if (error.code === "23505") {
        slug = slugify(data.groom, data.bride);
        continue;
      }
      console.error(error);
      return NextResponse.json({ error: "Could not create invitation" }, { status: 500 });
    }
    return NextResponse.json({ error: "Could not create invitation" }, { status: 500 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
