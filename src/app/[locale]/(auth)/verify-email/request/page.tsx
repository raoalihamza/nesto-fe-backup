import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { RequestVerificationEmailForm } from "@/components/auth/RequestVerificationEmailForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyEmailRequestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <RequestVerificationEmailForm />
    </Suspense>
  );
}
