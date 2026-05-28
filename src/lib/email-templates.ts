function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type ResetEmailInput = {
  playerName?: string | null;
  resetUrl: string;
  appName?: string;
};

type PasswordChangedEmailInput = {
  playerName?: string | null;
  appName?: string;
};

const defaultAppName = "Backgammon Scoreboard";

export function renderResetPasswordEmail(input: ResetEmailInput) {
  const appName = input.appName ?? defaultAppName;
  const name = (input.playerName ?? "").trim();
  const hello = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const resetUrl = input.resetUrl;

  const subject = `Reset your password (${appName})`;
  const text = [
    hello,
    "",
    "Someone requested a password reset for this account.",
    "",
    `Set a new password: ${resetUrl}`,
    "",
    "This link expires in one hour and works only once.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#fff7ed; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #fde68a; border-radius:16px; padding:24px;">
        <div style="font-weight:800; font-size:18px; color:#7c2d12; margin-bottom:8px;">${escapeHtml(
          appName,
        )}</div>
        <div style="color:#1c1917; font-size:14px; line-height:1.6;">
          <p style="margin:0 0 12px 0;">${hello}</p>
          <p style="margin:0 0 12px 0;">Someone requested a password reset for this account.</p>
          <p style="margin:0 0 18px 0;">
            <a href="${resetUrl}"
               style="display:inline-block; background:#f59e0b; color:#ffffff; text-decoration:none; font-weight:800; padding:10px 14px; border-radius:12px;">
              Set a new password
            </a>
          </p>
          <p style="margin:0 0 6px 0; color:#57534e; font-size:12px;">
            This link expires in one hour and works only once.
          </p>
          <p style="margin:0; color:#57534e; font-size:12px;">
            If you did not request this, you can ignore this email.
          </p>
          <hr style="border:none; border-top:1px solid #fef3c7; margin:18px 0;" />
          <p style="margin:0; color:#57534e; font-size:12px;">
            If the button doesn’t work, copy and paste this URL:
            <br />
            <span style="word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, html, text };
}

export function renderPasswordChangedEmail(input: PasswordChangedEmailInput) {
  const appName = input.appName ?? defaultAppName;
  const name = (input.playerName ?? "").trim();
  const hello = name ? `Hi ${escapeHtml(name)},` : "Hi,";

  const subject = `Your password was changed (${appName})`;
  const text = [
    hello,
    "",
    "Your password was changed.",
    "If you did not do this, reset it immediately.",
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#fff7ed; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #fde68a; border-radius:16px; padding:24px;">
        <div style="font-weight:800; font-size:18px; color:#7c2d12; margin-bottom:8px;">${escapeHtml(
          appName,
        )}</div>
        <div style="color:#1c1917; font-size:14px; line-height:1.6;">
          <p style="margin:0 0 12px 0;">${hello}</p>
          <p style="margin:0 0 12px 0;">Your password was changed.</p>
          <p style="margin:0; color:#57534e; font-size:12px;">
            If you did not do this, reset it immediately.
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, html, text };
}

