import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getRequiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function toInt(s: string): number {
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n)) throw new Error("Invalid SMTP_PORT");
  return n;
}

export async function sendSmtpMail(input: MailInput) {
  const host = getRequiredEnv("SMTP_HOST");
  const port = toInt(getRequiredEnv("SMTP_PORT"));
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const from = getRequiredEnv("ADMIN_EMAIL");

  const secure =
    process.env.SMTP_SECURE?.trim().toLowerCase() === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

