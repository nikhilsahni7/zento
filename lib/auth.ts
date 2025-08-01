import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        await resend.emails.send({
          from: "Zento <hello@nikhilsahni.xyz>",
          to: user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8B5CF6, #06B6D4); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 24px;">✨</span>
                  </div>
                  <h1 style="color: #1a202c; margin-bottom: 10px; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                  <p style="color: #718096; font-size: 16px; line-height: 1.5;">We received a request to reset your password for your Zento account</p>
                </div>

                <div style="background: linear-gradient(135deg, #f7fafc, #edf2f7); padding: 24px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #8B5CF6;">
                  <p style="margin: 0; color: #2d3748; font-size: 16px; line-height: 1.6;">Click the button below to create a new password and get back to discovering amazing cultural experiences!</p>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="${url}" style="background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;">Reset Password</a>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 40px;">
                  <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.5;">
                    If you didn't request this password reset, please ignore this email.
                    <br>This link will expire in 1 hour for security reasons.
                  </p>
                  <p style="color: #a0aec0; font-size: 12px; margin-top: 16px; word-break: break-all;">
                    If the button doesn't work, copy and paste this link: ${url}
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
      }
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        await resend.emails.send({
          from: "Zento <hello@nikhilsahni.xyz>",
          to: user.email,
          subject: "Welcome! Verify your email to start your Zento journey",
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8B5CF6, #06B6D4); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 24px;">✨</span>
                  </div>
                  <h1 style="color: #1a202c; margin-bottom: 10px; font-size: 28px; font-weight: 700;">Welcome to Zento!</h1>
                  <p style="color: #718096; font-size: 16px; line-height: 1.5;">Your personal taste-driven travel companion awaits</p>
                </div>

                <div style="background: linear-gradient(135deg, #f0f7ff, #e6fffa); padding: 24px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #06B6D4;">
                  <p style="margin: 0; color: #2d3748; font-size: 16px; line-height: 1.6;">
                    Hi${user.name ? ` ${user.name}` : ""}! 👋
                    <br><br>
                    Thank you for joining our community of cultural explorers. We're excited to help you discover restaurants, plan itineraries, and find experiences that match your unique taste profile.
                    <br><br>
                    Please verify your email address to unlock your personalized cultural journey!
                  </p>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="${url}" style="background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;">Verify Email & Start Exploring</a>
                </div>

                <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">What's Next?</h3>
                  <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Complete your taste profile questionnaire</li>
                    <li>Get personalized restaurant recommendations</li>
                    <li>Create custom cultural itineraries</li>
                    <li>Chat with our AI concierge for instant suggestions</li>
                  </ul>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 40px;">
                  <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.5;">
                    If you didn't create an account with us, please ignore this email.
                  </p>
                  <p style="color: #a0aec0; font-size: 12px; margin-top: 16px; word-break: break-all;">
                    If the button doesn't work, copy and paste this link: ${url}
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Session configuration - CRITICAL FIX
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 1 day
    storeSessionInDatabase: true, // CRITICAL: This ensures sessions are stored in DB
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes to reduce DB calls
    },
  },

  plugins: [
    nextCookies(), // This should be the last plugin
  ],

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
