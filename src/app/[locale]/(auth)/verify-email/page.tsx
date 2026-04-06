import { setRequestLocale } from "next-intl/server";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VerifyEmailScreen />;
}
