"use client";

import { useTranslations } from "next-intl";
import { GoogleLogin } from "@react-oauth/google";
import LoginSocialFacebook from "@greatsumini/react-facebook-login";
import AppleSignin from "react-apple-signin-auth";
import { useGoogleSocialLogin, useFacebookSocialLogin, useAppleSocialLogin } from "@/hooks/auth/useSocialLogin";
import { toast } from "sonner";

const btnClass =
  "flex h-12 w-full items-center justify-start gap-4 rounded-lg border border-gray-200 bg-background px-6 text-sm font-normal transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

interface SocialLoginButtonsProps {
  isLoading?: boolean;
}

export function SocialLoginButtons({ isLoading }: SocialLoginButtonsProps) {
  const t = useTranslations("auth");
  const googleMutation = useGoogleSocialLogin();
  const facebookMutation = useFacebookSocialLogin();
  const appleMutation = useAppleSocialLogin();

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative ${isLoading || googleMutation.isPending ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className={`${btnClass} pointer-events-none`}>
          <GoogleIcon />
          <span className="flex-1 text-center">
            {googleMutation.isPending ? "..." : t("signInWithGoogle")}
          </span>
        </div>
        <div className="absolute inset-0 cursor-pointer opacity-0">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const idToken = credentialResponse.credential;
              if (!idToken) {
                toast.error(t("socialLoginError"));
                return;
              }
              googleMutation.mutate(idToken);
            }}
            onError={() => toast.error(t("socialLoginError"))}
            useOneTap={false}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="400"
          />
        </div>
      </div>

      <LoginSocialFacebook
        appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ""}
        onSuccess={(res) => {
          if (res.accessToken) {
            facebookMutation.mutate(res.accessToken);
          } else {
            toast.error(t("socialLoginError"));
          }
        }}
        onFail={() => {
          toast.error(t("socialLoginError"));
        }}
      >
        <button type="button" className={btnClass} disabled={facebookMutation.isPending || isLoading}>
          <FacebookIcon />
          <span className="flex-1 text-center">
            {facebookMutation.isPending ? "..." : t("signInWithFacebook")}
          </span>
        </button>
      </LoginSocialFacebook>

      <AppleSignin
        uiType="light"
        authOptions={{
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "",
          scope: "name email",
          redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? "",
          state: "",
          nonce: "nonce",
          usePopup: true,
        }}
        onSuccess={(response: {
          authorization: { id_token: string; code: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }) => {
          const identityToken = response.authorization.id_token;
          const firstName = response.user?.name?.firstName;
          const lastName = response.user?.name?.lastName;
          appleMutation.mutate({ identityToken, firstName, lastName });
        }}
        onError={() => {
          toast.error(t("socialLoginError"));
        }}
        render={(props: Record<string, unknown>) => (
          <button
            type="button"
            className={btnClass}
            disabled={appleMutation.isPending || isLoading}
            {...props}
          >
            <AppleIcon />
            <span className="flex-1 text-center">
              {appleMutation.isPending ? "..." : t("signInWithApple")}
            </span>
          </button>
        )}
      />
    </div>
  );
}
