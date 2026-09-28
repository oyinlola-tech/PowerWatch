import { env } from '../../../configs/env.config.js';
import { emailStyles, escapeHtml, renderLayout, textFooter, type EmailContent } from './layout.js';

const greetingFor = (firstName?: string | null) => (firstName?.trim() ? `Hi ${firstName.trim()},` : 'Hi,');

function paragraph(text: string, color = emailStyles.INK) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:23px;color:${color};">${text}</p>`;
}

function steps(items: Array<{ title: string; body: string }>) {
  const { BRAND_BLUE, INK, MUTED } = emailStyles;
  const rows = items
    .map(
      (item, index) => `
              <tr>
                <td valign="top" width="36" style="padding:0 12px 16px 0;">
                  <div style="width:28px;height:28px;border-radius:14px;background-color:#EEF4FE;color:${BRAND_BLUE};font-size:14px;line-height:28px;font-weight:700;text-align:center;">${index + 1}</div>
                </td>
                <td valign="top" style="padding:0 0 16px;">
                  <p style="margin:0 0 2px;font-size:15px;line-height:22px;font-weight:600;color:${INK};">${item.title}</p>
                  <p style="margin:0;font-size:14px;line-height:21px;color:${MUTED};">${item.body}</p>
                </td>
              </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">${rows}
            </table>`;
}

function button(label: string, href: string) {
  const { BRAND_BLUE, FONT } = emailStyles;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
              <tr>
                <td style="border-radius:24px;background-color:${BRAND_BLUE};">
                  <a href="${href}" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:24px;">${label}</a>
                </td>
              </tr>
            </table>`;
}

const WELCOME_STEPS = [
  { title: 'Confirm your email', body: 'Enter the 6-digit code we sent in a separate email.' },
  { title: 'Set your area', body: 'Allow location so PowerWatch knows which neighborhood and street to watch for you.' },
  { title: 'Report and get alerts', body: 'Tap ON or OFF when the power changes. We tell you when your neighbors report an outage or the power comes back.' },
];

/** Sent once, when an account is created. */
export function welcomeEmail(params: { firstName?: string | null; isAdmin?: boolean }): EmailContent {
  const { INK } = emailStyles;
  const { webUrl } = env.mailBranding;
  const greeting = greetingFor(params.firstName);
  const intro = params.isAdmin
    ? 'Your PowerWatch administrator account is ready. Sign in to the admin dashboard to manage users, reports and messages.'
    : "Thanks for joining PowerWatch. Together with your neighbors, you'll always know whether the power is on, and when it's likely back.";

  const bodyHtml = `
            ${paragraph(escapeHtml(greeting), emailStyles.MUTED)}
            <h1 style="margin:0 0 12px;font-size:22px;line-height:30px;font-weight:700;color:${INK};">Welcome to PowerWatch</h1>
            ${paragraph(intro)}
            ${params.isAdmin ? '' : steps(WELCOME_STEPS)}
            ${button('Visit PowerWatch', webUrl)}`;

  const text = [
    greeting,
    '',
    'Welcome to PowerWatch',
    intro,
    '',
    ...(params.isAdmin ? [] : WELCOME_STEPS.map((step, i) => `${i + 1}. ${step.title}: ${step.body}`)),
    '',
    `Visit PowerWatch: ${webUrl}`,
    '',
    textFooter(),
  ].join('\n');

  return {
    subject: params.isAdmin ? 'Your PowerWatch admin account is ready' : 'Welcome to PowerWatch',
    text,
    html: renderLayout({ preheader: 'Know when the power is on in your neighborhood.', bodyHtml }),
  };
}

/** Sent after an account is deleted, by its owner or by an administrator. */
export function goodbyeEmail(params: { firstName?: string | null; removedByAdmin?: boolean }): EmailContent {
  const { INK, MUTED } = emailStyles;
  const { supportEmail } = env.mailBranding;
  const greeting = greetingFor(params.firstName);
  const heading = params.removedByAdmin ? 'Your PowerWatch account was removed' : 'Your PowerWatch account is deleted';
  const intro = params.removedByAdmin
    ? 'An administrator has removed your PowerWatch account.'
    : "Your account has been deleted, as you asked. We're sorry to see you go.";
  const erased =
    'Your name, email address, password, home location, devices, sessions, saved places and notifications have been erased. ' +
    'Power reports you made stay in the neighborhood history without your name, exact position or street.';
  const contact = supportEmail
    ? params.removedByAdmin
      ? `If you think this was a mistake, write to ${supportEmail}.`
      : `If you didn't do this, write to ${supportEmail} straight away.`
    : '';
  const comeBack = 'You can create a new account with the same email address at any time.';

  const bodyHtml = `
            ${paragraph(escapeHtml(greeting), MUTED)}
            <h1 style="margin:0 0 12px;font-size:22px;line-height:30px;font-weight:700;color:${INK};">${heading}</h1>
            ${paragraph(intro)}
            ${paragraph(erased, MUTED)}
            ${contact ? paragraph(escapeHtml(contact)) : ''}
            ${paragraph(comeBack, MUTED)}`;

  const text = [greeting, '', heading, intro, '', erased, contact, comeBack, '', textFooter()].filter((line) => line !== undefined).join('\n');

  return {
    subject: heading,
    text,
    html: renderLayout({ preheader: intro, bodyHtml }),
  };
}

/**
 * Sends an account email in the background. A failed send never undoes or delays the
 * account change; the mail service records it for the admin dashboard.
 */
export function sendAccountEmail(to: string, content: EmailContent): void {
  void import('../commands/sendMail.command.js')
    .then(({ MailService }) => new MailService().sendMail({ to, ...content }))
    .catch(() => {});
}
