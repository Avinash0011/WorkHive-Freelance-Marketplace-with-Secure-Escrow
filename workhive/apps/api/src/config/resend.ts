import { Resend } from 'resend';
import { env } from '../lib/env';

let resend: Resend | null = null;

if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: 'WorkHive <noreply@workhive.com>',
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    return null;
  }
}

export function getProposalCreatedEmail(jobTitle: string, freelancerName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E8A33D;">New Proposal Received</h2>
      <p>Hello,</p>
      <p>You have received a new proposal for your job: <strong>${jobTitle}</strong></p>
      <p>From: ${freelancerName}</p>
      <p>Log in to your WorkHive dashboard to review the proposal.</p>
      <p style="color: #4A5560; font-size: 14px;">Best regards,<br>WorkHive Team</p>
    </div>
  `;
}

export function getProposalAcceptedEmail(jobTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2E8B57;">Proposal Accepted!</h2>
      <p>Congratulations!</p>
      <p>Your proposal for <strong>${jobTitle}</strong> has been accepted.</p>
      <p>Log in to your WorkHive dashboard to start working on the project.</p>
      <p style="color: #4A5560; font-size: 14px;">Best regards,<br>WorkHive Team</p>
    </div>
  `;
}

export function getPaymentReleasedEmail(jobTitle: string, amount: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2E8B57;">Payment Released</h2>
      <p>Great news!</p>
      <p>Payment of <strong>${amount}</strong> has been released for your work on <strong>${jobTitle}</strong>.</p>
      <p>The amount has been added to your wallet balance.</p>
      <p style="color: #4A5560; font-size: 14px;">Best regards,<br>WorkHive Team</p>
    </div>
  `;
}

export function getDeliverySubmittedEmail(jobTitle: string, freelancerName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3E6B99;">Work Submitted</h2>
      <p>Hello,</p>
      <p><strong>${freelancerName}</strong> has submitted work for your job: <strong>${jobTitle}</strong></p>
      <p>Log in to your WorkHive dashboard to review the delivery and release payment.</p>
      <p style="color: #4A5560; font-size: 14px;">Best regards,<br>WorkHive Team</p>
    </div>
  `;
}
