import { env } from '../../../configs/env.config.js';

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const BRAND_BLUE = '#0663EA';
const INK = '#1B3A4B';
const MUTED = '#5B7282';
const PAGE = '#F1F5FA';
const FONT = "Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps a message body in the branded PowerWatch layout. Tables and inline styles only,
 * because that is all Gmail, Outlook and Apple Mail agree on. `preheader` is the grey
 * preview line inbox lists show next to the subject.
 */
export function renderLayout({ preheader, bodyHtml }: { preheader: string; bodyHtml: string }): string {
  const { webUrl, supportEmail } = env.mailBranding;
  const year = new Date().getFullYear();
  const support = supportEmail
    ? `Questions? Write to <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND_BLUE};text-decoration:none;">${escapeHtml(supportEmail)}</a>.<br>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>PowerWatch</title>
</head>
<body style="margin:0;padding:0;background-color:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE};font-size:1px;line-height:1px;">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td align="left" style="padding:0 4px 20px;">
            <a href="${webUrl}" style="text-decoration:none;">
              <img src="${webUrl}/brand/logo-horizontal.png" width="168" height="37" alt="PowerWatch" style="display:block;border:0;width:168px;height:auto;">
            </a>
          </td>
        </tr>
        <tr>
          <td style="background-color:#FFFFFF;border-radius:16px;border-top:4px solid ${BRAND_BLUE};padding:32px 28px;font-family:${FONT};color:${INK};">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 8px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};text-align:center;">
            ${support}You received this email because this address was used with PowerWatch.<br>
            <a href="${webUrl}/privacy/" style="color:${MUTED};">Privacy Policy</a>
            &nbsp;&middot;&nbsp;
            <a href="${webUrl}/terms/" style="color:${MUTED};">Terms</a>
            &nbsp;&middot;&nbsp;
            <a href="${webUrl}" style="color:${MUTED};">${escapeHtml(webUrl.replace(/^https?:\/\//, ''))}</a>
            <br>&copy; ${year} PowerWatch
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Plain-text footer matching the HTML one, for clients that show text only. */
export function textFooter(): string {
  const { webUrl, supportEmail } = env.mailBranding;
  return [
    '--',
    'PowerWatch',
    supportEmail ? `Questions? Write to ${supportEmail}` : '',
    `Privacy Policy: ${webUrl}/privacy/`,
    `Terms: ${webUrl}/terms/`,
  ]
    .filter(Boolean)
    .join('\n');
}

export const emailStyles = { BRAND_BLUE, INK, MUTED, PAGE, FONT };
