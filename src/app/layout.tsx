import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Nesto - Real Estate Marketplace",
    template: "%s | Nesto",
  },
  description:
    "Find your perfect home — buy, sell, or rent properties in Uzbekistan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
