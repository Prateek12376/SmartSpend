"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react, attachments = [] }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "SmartSpend App <onboarding@resend.dev>",
      to,
      subject,
      react,
       // Map your binary buffers directly into Resend's structural schema
      attachments, 
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(error instanceof Error ? error.message : "Email transmission failed");
  }
}