import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
