import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PropertyGridSection } from "@/components/home/PropertyGridSection";
import { FeatureCardsSection } from "@/components/home/FeatureCardsSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PropertyGridSection page={1} limit={8} showHeading />
        <FeatureCardsSection />
        <PropertyGridSection page={2} limit={8} showHeading={false} />
      </main>
      <Footer />
    </div>
  );
}
