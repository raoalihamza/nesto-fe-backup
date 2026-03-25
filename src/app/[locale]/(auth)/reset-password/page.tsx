import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-md">
      <p className="text-center text-muted-foreground">Reset password — coming soon</p>
    </div>
  );
}
