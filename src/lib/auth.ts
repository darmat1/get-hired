import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailOTP } from "better-auth/plugins";
import { sendTelegramNotification } from "@/lib/telegram";

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendTelegramNotification(
            `🚀 <b>New User Registered!</b>\n\n` +
              `📧 <b>Email:</b> ${user.email}\n` +
              `👤 <b>Name:</b> ${user.name || "N/A"}\n` +
              `🆔 <b>ID:</b> ${user.id}\n` +
              `📅 <b>Date:</b> ${new Date().toLocaleString()}`,
          );
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "linkedin" && account.accessToken) {
            await syncLinkedInAvatar(account.userId, account.accessToken);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await syncAvatarOnLogin(session.userId);
        },
      },
    },
  },
});

async function syncAvatarOnLogin(userId: string) {
  try {
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "linkedin",
      },
    });

    if (!linkedInAccount?.accessToken) {
      return;
    }

    await syncLinkedInAvatar(userId, linkedInAccount.accessToken);
  } catch (e) {
    console.error("[Auth] Error syncing avatar on login:", e);
  }
}

async function syncLinkedInAvatar(userId: string, accessToken: string) {
  try {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.warn("[Auth] Failed to fetch LinkedIn avatar:", response.status);
      return;
    }

    const data = await response.json();
    const newAvatarUrl = data.picture;

    if (!newAvatarUrl) {
      return;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return;
    }

    const currentInfo = (profile.personalInfo as any) || {};
    const currentAvatarUrl = currentInfo.avatarUrl;

    if (currentAvatarUrl === newAvatarUrl) {
      return;
    }

    const isCurrentExpired = isAvatarUrlExpired(currentAvatarUrl);

    if (!isCurrentExpired && currentAvatarUrl) {
      return;
    }

    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        personalInfo: {
          ...currentInfo,
          avatarUrl: newAvatarUrl,
        },
      },
    });

    console.log("[Auth] LinkedIn avatar updated");
  } catch (e) {
    console.error("[Auth] Error syncing LinkedIn avatar:", e);
  }
}

function isAvatarUrlExpired(url: string | null | undefined): boolean {
  if (!url) return true;
  
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("e");
    
    if (!expiresParam) {
      return true;
    }
    
    const expiresAt = parseInt(expiresParam, 10);
    if (isNaN(expiresAt)) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return now > expiresAt;
  } catch {
    return true;
  }
}
