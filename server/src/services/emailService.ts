import nodemailer from 'nodemailer';

export interface SendReplyParams {
  toEmail: string;
  toName: string;
  subject: string;
  replyText: string;
  originalSubject?: string;
  originalMessage?: string;
}

export const isEmailConfigured = (): boolean => {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
};

export const createTransporter = async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && pass.trim().length > 0) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      }),
      isTest: false,
      fromAddress: process.env.SMTP_FROM || `"Shahzod.site" <${user}>`,
    };
  }

  // Instant local JSON transport that NEVER hangs on external API calls
  return {
    transporter: nodemailer.createTransport({
      jsonTransport: true,
    }),
    isTest: true,
    fromAddress: process.env.SMTP_FROM || `"Shahzod.site" <${user || 'shahuztech@gmail.com'}>`,
  };
};

export const generateReplyHtml = (params: SendReplyParams): string => {
  const { toName, replyText, originalSubject, originalMessage } = params;
  
  // Format replyText newlines to HTML paragraphs/breaks
  const formattedReply = replyText
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #e4e4e7;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Javob xati - Shahzod.site</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d0e; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #141517; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #18191c 0%, #1c1e22 100%); border-bottom: 1px solid #27272a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 12px; background-color: #d6f779; color: #0c0d0e; font-size: 11px; font-weight: 800; font-family: monospace; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Shahzod.site
                    </div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Shahzod • Portfolio & Software Engineering
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 18px 0; font-size: 15px; color: #a1a1aa;">
                Assalomu alaykum <strong style="color: #ffffff;">${toName}</strong>,
              </p>

              <!-- Admin Reply Message Body -->
              <div style="font-size: 15px; color: #e4e4e7; margin-bottom: 28px;">
                ${formattedReply}
              </div>

              <!-- Original Message Quote Box -->
              ${
                originalMessage
                  ? `
              <div style="margin-top: 24px; padding: 18px; background-color: #0c0d0e; border-left: 3px solid #d6f779; border-radius: 0 8px 8px 0; border-top: 1px solid #27272a; border-right: 1px solid #27272a; border-bottom: 1px solid #27272a;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa;">
                  Sizning xabaringiz${originalSubject ? ` (${originalSubject})` : ''}:
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a; font-style: italic;">
                  "${originalMessage.replace(/\n/g, '<br/>')}"
                </p>
              </div>
              `
                  : ''
              }

              <!-- Signature -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #ffffff;">
                  Hurmat bilan,
                </p>
                <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #d6f779;">
                  Shahzod
                </p>
                <p style="margin: 0; font-size: 12px; color: #71717a; font-family: monospace;">
                  Full-Stack Software Engineer • <a href="https://shahzod.site" target="_blank" style="color: #d6f779; text-decoration: none;">shahzod.site</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e0f11; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                Ushbu xat <a href="https://shahzod.site" target="_blank" style="color: #a1a1aa; text-decoration: underline;">Shahzod.site</a> orqali qoldirilgan murojaatingizga javoban yuborildi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const sendReplyEmail = async (
  params: SendReplyParams
): Promise<{ messageId: string; isTest: boolean; previewUrl?: string | false }> => {
  const { transporter, isTest, fromAddress } = await createTransporter();
  const htmlContent = generateReplyHtml(params);

  const info = await transporter.sendMail({
    from: fromAddress,
    to: params.toEmail,
    subject: params.subject,
    text: params.replyText,
    html: htmlContent,
  });

  const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : false;
  if (previewUrl) {
    console.log(`✉️ Test Email Preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, isTest, previewUrl };
};
