export const authConfig = {
  sessionMaxAge: 30 * 24 * 60 * 60,
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "",
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
} as const;
