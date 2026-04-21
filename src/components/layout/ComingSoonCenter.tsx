import { getTranslations } from "next-intl/server";

export async function ComingSoonCenter() {
  const t = await getTranslations("comingSoonPage");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        {t("subtitle")}
      </p>
    </div>
  );
}
