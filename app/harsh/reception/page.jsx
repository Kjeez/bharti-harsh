import RoyalInvite from "@/components/RoyalInvite";

export const metadata = {
  title: "Harsh & Bharti — Wedding Reception Invitation",
  description:
    "You are warmly invited to the wedding reception of Harsh & Bharti on 25 November 2026. Tap to open the invitation!",
  openGraph: {
    title: "Harsh & Bharti — Wedding Reception Invitation",
    description: "Tap to open the reception invitation 💛",
  },
};

export default function HarshReceptionPage() {
  return <RoyalInvite side="groom" event="reception" />;
}
