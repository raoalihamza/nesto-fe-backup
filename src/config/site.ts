export const siteConfig = {
  name: "Nesto",
  description: "Find your perfect home — buy, sell, or rent properties in Uzbekistan",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://nesto.uz",
  ogImage: "/images/og.png",
  links: {
    twitter: "https://twitter.com/nesto",
    instagram: "https://instagram.com/nesto",
    telegram: "https://t.me/nesto",
  },
  contactEmail: "support@nesto.uz",
} as const;
