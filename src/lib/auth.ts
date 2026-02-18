import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, request) {
        let subject = "Verification Code";
        let message = "Your verification code is:";

        if (type === "forget-password") {
          subject = "Reset Password Code";
          message = "Your password reset code is:";
        }

        await sendEmail({
          to: email,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h1 style="color: #1e293b; margin-bottom: 24px;">${subject}</h1>
              <p style="color: #475569; font-size: 16px; line-height: 24px;">${message}</p>
              <div style="margin: 32px 0; background-color: #f8fafc; padding: 24px; border-radius: 8px; text-align: center;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #2563eb;">${otp}</span>
              </div>
              <p style="color: #475569; font-size: 14px;">This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              <p style="color: #94a3b8; font-size: 12px;">Welcome to GetHired!</p>
            </div>
          `,
        });
      },
      // Use OTP for email verification upon sign up
      sendVerificationOnSignUp: true,
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      scope: ["openid", "profile", "email"],
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
