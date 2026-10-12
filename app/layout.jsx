import "./globals.css";

export const metadata = {
  title: "Harsh & Bharti — Royal Wedding Invitation",
  description:
    "You are warmly invited to celebrate the royal wedding of Harsh Wadhera & Bharti Sharma. Tap to open the invitation!",
  openGraph: {
    title: "Harsh & Bharti — Royal Wedding Invitation",
    description: "Tap to begin the royal wedding celebration 💛",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Rozha+One&family=MonteCarlo&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

