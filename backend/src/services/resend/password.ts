import config from "@/config";
import { resend } from "."

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const { data, error } = await resend.emails.send({
    from: `Moorafrika <noreply@${config.domain}>`,
    to: [email],
    subject: "Password Reset Request",
    html: `<p>You have requested a password reset. Click the link below to reset your password:</p>
            <p><a href="${config.clientUrl}/reset-password?token=${resetToken}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>`,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error('Failed to send password reset email');
  }

  return { data };
};