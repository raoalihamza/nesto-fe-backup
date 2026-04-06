import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordForm />;
}
