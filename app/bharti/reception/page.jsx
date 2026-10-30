import RoyalInvite from "@/components/RoyalInvite";

export const metadata = {
  title: "Bharti & Harsh — Wedding Reception Invitation",
  description:
    "You are warmly invited to the wedding reception of Bharti & Harsh on 25 November 2026. Tap to open the invitation!",
  openGraph: {
    title: "Bharti & Harsh — Wedding Reception Invitation",
    description: "Tap to open the reception invitation 💛",
  },
};

export default function BhartiReceptionPage() {
  return <RoyalInvite side="bride" event="reception" />;
}
