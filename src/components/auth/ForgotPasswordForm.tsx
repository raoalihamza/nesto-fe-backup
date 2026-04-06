"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NestoLogo } from "@/components/auth/NestoLogo";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutation.mutate({ email: data.email });
  };

  if (mutation.isSuccess) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-foreground">
            {t("resetLinkSent")}
          </h2>
          <p className="text-sm text-muted-foreground">{getValues("email")}</p>
          <Link
            href="/login"
            className="text-sm font-medium text-brand hover:text-brand-dark underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] space-y-6">
      <div className="flex justify-center pb-2">
        <NestoLogo size="lg" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {t("forgotPassword")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t("emailAddress")} <span className="text-brand">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("enterEmail")}
            className="h-12 rounded-lg"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error?.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="btn-brand-shadow h-12 w-full rounded-lg bg-brand text-white hover:opacity-90"
        >
          {mutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("sendResetLink")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-brand hover:text-brand-dark underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
