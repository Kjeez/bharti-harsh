import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mergeData } from "@/lib/defaults";
import EmeraldNoir from "@/components/EmeraldNoir";
import RoyalInvite from "@/components/RoyalInvite";

export const dynamic = "force-dynamic";

async function getInvite(slug) {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("invites")
      .select("slug, template, data")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: "Harsh & Bharti — Royal Wedding Invitation",
    description: "You are warmly invited to the royal wedding of Harsh Wadhera & Bharti Sharma. Tap to open the invitation, RSVP and view event details.",
    openGraph: {
      title: "Harsh & Bharti — Royal Wedding Invitation",
      description: "Tap to begin the royal wedding celebration 💛",
    },
  };
}

export default async function InvitePage({ params }) {
  const { slug } = await params;
  // Always render the beautiful RoyalInvite for the requested couple
  return <RoyalInvite />;
}
