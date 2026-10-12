import RoyalInvite from "@/components/RoyalInvite";

export async function generateMetadata() {
  return {
    title: "Harsh & Bharti — Royal Wedding Invitation",
    description: "You are warmly invited to the royal wedding of Harsh Wadhera & Bharti Sharma. Tap to open the invitation, RSVP and view event details.",
    openGraph: {
      title: "Harsh & Bharti — Royal Wedding Invitation",
      description: "Tap to begin the royal wedding celebration 💛",
    },
  };
}

export default function InvitePage() {
  return <RoyalInvite />;
}
