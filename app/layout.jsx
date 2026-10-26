import "./globals.css";

export const metadata = {
  title: "Bharti & Harsh — Royal Wedding Invitation",
  description:
    "You are warmly invited to celebrate the royal wedding of Bharti & Harsh. Tap to open the invitation!",
  openGraph: {
    title: "Bharti & Harsh — Royal Wedding Invitation",
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
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&family=Noto+Serif+Gurmukhi:wght@400;500&family=Tiro+Devanagari+Sanskrit&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

