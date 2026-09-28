import { emailStyles, escapeHtml, renderLayout, textFooter, type EmailContent } from './layout.js';

const COPY = {
  EMAIL_VERIFICATION: {
    subject: (code: string) => `${code} is your PowerWatch verification code`,
    heading: 'Confirm your email',
    intro: 'Enter this code in the PowerWatch app to finish creating your account.',
    ignore: "If you didn't sign up for PowerWatch, you can ignore this email. The address won't be confirmed.",
  },
  PASSWORD_RESET: {
    subject: (code: string) => `${code} is your PowerWatch password reset code`,
    heading: 'Reset your password',
    intro: 'Enter this code in the PowerWatch app to choose a new password.',
    ignore: "If you didn't ask to reset your password, you can ignore this email. Your password stays the same.",
  },
} as const;

export function otpEmail(params: {
  type: keyof typeof COPY;
  code: string;
  firstName?: string | null;
  expiryMinutes: number;
}): EmailContent {
  const copy = COPY[params.type];
  const { BRAND_BLUE, INK, MUTED } = emailStyles;
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : 'Hi,';
  const expiry = `This code expires in ${params.expiryMinutes} minutes.`;

  const bodyHtml = `
            <p style="margin:0 0 8px;font-size:15px;line-height:22px;color:${MUTED};">${escapeHtml(greeting)}</p>
            <h1 style="margin:0 0 12px;font-size:22px;line-height:30px;font-weight:700;color:${INK};">${copy.heading}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:22px;color:${INK};">${copy.intro}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background-color:#EEF4FE;border:1px solid #D6E4FC;border-radius:12px;padding:20px 12px;">
                  <span style="font-family:'SFMono-Regular',Menlo,Consolas,'Courier New',monospace;font-size:34px;line-height:40px;font-weight:700;letter-spacing:10px;color:${BRAND_BLUE};">${escapeHtml(params.code)}</span>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 24px;font-size:14px;line-height:20px;color:${MUTED};text-align:center;">${expiry}</p>
            <p style="margin:0 0 12px;font-size:14px;line-height:21px;color:${INK};"><strong>Never share this code.</strong> PowerWatch will never ask you for it by phone, chat or email.</p>
            <p style="margin:0;font-size:14px;line-height:21px;color:${MUTED};">${copy.ignore}</p>`;

  const text = [
    greeting,
    '',
    copy.heading,
    copy.intro,
    '',
    `Your code: ${params.code}`,
    expiry,
    '',
    'Never share this code. PowerWatch will never ask you for it by phone, chat or email.',
    copy.ignore,
    '',
    textFooter(),
  ].join('\n');

  return {
    subject: copy.subject(params.code),
    text,
    html: renderLayout({ preheader: `${params.code} · ${expiry}`, bodyHtml }),
  };
}
