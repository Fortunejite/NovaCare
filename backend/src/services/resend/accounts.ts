import config from "@/config";
import { resend } from ".";

export const sendStaffAccountCreationEmail = async (payload: {
  email: string,
  name: string,
  role: string,
  password: string,
}) => {
  const { data, error } = await resend.emails.send({
    from: `Novacare <no-reply@${config.domain}>`,
    to: payload.email,
    subject: 'Your Novacare Account Has Been Created',
    html: `
      <p>Dear ${payload.name},</p>
      <p>Your account has been created with the following details:</p>
      <ul>
        <li>Email: ${payload.email}</li>
        <li>Role: ${payload.role}</li>
        <li>Password: ${payload.password}</li>
      </ul>
      <p>Please log in to your account and change your password as soon as possible.</p>
      <p>Best regards,<br/>The Novacare Team</p>
    `,
  });

  if (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send account creation email');
  }

  return data;
};

export const sendPatientAccountCreationEmail = async (payload: {
  email: string,
  name: string,
  role: string,
  password: string,
}) => {
  const { data, error } = await resend.emails.send({
    from: `Novacare <no-reply@${config.domain}>`,
    to: payload.email,
    subject: 'Your Novacare Patient Account Has Been Created',
    html: `
      <p>Dear ${payload.name},</p>
      <p>Your patient account has been created with the following details:</p>
      <ul>
        <li>Email: ${payload.email}</li>
        <li>Role: ${payload.role}</li>
        <li>Password: ${payload.password}</li>
      </ul>
      <p>Please log in to your account and change your password as soon as possible.</p>
      <p>Best regards,<br/>The Novacare Team</p>
    `,
  });

  if (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send account creation email');
  }

  return data;
};
