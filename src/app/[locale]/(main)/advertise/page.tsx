import { setRequestLocale } from "next-intl/server";
import { ComingSoonCenter } from "@/components/layout/ComingSoonCenter";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdvertisePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ComingSoonCenter />
    </div>
  );
}
