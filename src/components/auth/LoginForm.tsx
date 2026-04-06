"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NestoLogo } from "@/components/auth/NestoLogo";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useLogin } from "@/hooks/auth/useLogin";
import { toast } from "sonner";

export function LoginForm() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  const handleSocialLogin = () => {
    toast.info(t("comingSoon"));
  };

  return (
    <div className="w-full max-w-[400px] space-y-6">
      <div className="flex justify-center pb-2">
        <NestoLogo size="lg" />
      </div>

      <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        {t("signIn")}
      </h1>

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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-12 rounded-lg pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-brand hover:text-brand-dark"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        {loginMutation.isError && (
          <p className="text-sm text-destructive">
            {loginMutation.error?.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn-brand-shadow h-12 w-full rounded-lg bg-brand text-white hover:opacity-90"
        >
          {loginMutation.isPending ? "..." : t("continue")}
        </Button>
      </form>

      <p className="text-left text-sm text-accent-foreground">
        {t("newToNesto")}{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:text-brand-dark underline"
        >
          {t("createAccountLink")}
        </Link>
      </p>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-400" />
        <span className="text-sm text-accent-foreground">{t("or")}</span>
        <div className="h-px flex-1 bg-gray-400" />
      </div>

      <SocialLoginButtons
        onSocialLogin={handleSocialLogin}
        isLoading={loginMutation.isPending}
      />
    </div>
  );
}
