import RoyalInvite from "@/components/RoyalInvite";

export async function generateMetadata() {
  return {
    title: "Bharti & Harsh — Royal Wedding Invitation",
    description: "You are warmly invited to the royal wedding of Bharti & Harsh. Tap to open the invitation, RSVP and view event details.",
    openGraph: {
      title: "Bharti & Harsh — Royal Wedding Invitation",
      description: "Tap to begin the royal wedding celebration 💛",
    },
  };
}

export default function InvitePage() {
  return <RoyalInvite />;
}
