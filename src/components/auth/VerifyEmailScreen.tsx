"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { useResendVerification } from "@/hooks/auth/useResendVerification";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { NestoLogo } from "@/components/auth/NestoLogo";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildLoginHrefWithReturnContext } from "@/lib/utils/pendingRentListingStorage";

export function VerifyEmailScreen() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const loginHref = useMemo(
    () => buildLoginHrefWithReturnContext(searchParams.get("returnUrl")),
    [searchParams]
  );
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const calledRef = useRef(false);

  useEffect(() => {
    if (token && !calledRef.current) {
      calledRef.current = true;
      verifyMutation.mutate(
        { token },
        {
          onSuccess: () => toast.success(t("emailVerified")),
          onError: (err) => toast.error(err.message),
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (verifyMutation.isSuccess) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-foreground">
            {t("emailVerified")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("emailVerifiedSubtitle")}
          </p>
          <Link href={loginHref}>
            <Button className="btn-brand-shadow bg-brand text-white hover:opacity-90">
              {t("goToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">
            {t("verifyingEmail")}
          </p>
        </div>
      </div>
    );
  }

  const showError = verifyMutation.isError || !token;

  if (showError) {
    return (
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex justify-center pb-2">
          <NestoLogo size="lg" />
        </div>
        <div className="flex flex-col items-center space-y-4 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">
            {t("verificationFailed")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("verificationFailedSubtitle")}
          </p>

          {email && (
            <div className="space-y-3">
              {resendMutation.isSuccess ? (
                <p className="text-sm text-green-600">
                  {t("verificationResent")}
                </p>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    resendMutation.mutate(
                      { email },
                      {
                        onSuccess: () => toast.success(t("verificationResent")),
                        onError: (err) => toast.error(err.message),
                      }
                    )
                  }
                  disabled={resendMutation.isPending}
                  className="border-brand text-brand hover:bg-brand/5"
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("resendVerification")
                  )}
                </Button>
              )}
              
            </div>
          )}

          <Link
            href={loginHref}
            className="text-sm font-medium text-brand hover:text-brand-dark underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
