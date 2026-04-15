import * as nodemailer from 'nodemailer'

interface ISendMail {
    to: string
    subject: string
    message: string
}

export class MailService {
    async send({ to, subject, message, }: ISendMail) {
        var transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST as string,
          port: Number(process.env.EMAIL_PORT),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      var mailOptions = {
        from: `"ClipSphere" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: message,
      };

      try {
          await transporter.sendMail(mailOptions)
          return true
      } catch(error) {
          console.error("error sending email ", error)
          return false
      }
  }

}

export function welcomeEmailTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to ClipSphere</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-0.5px;">
                Clip<span style="color:#c4b5fd;">Sphere</span>
              </h1>
              <p style="margin:8px 0 0;color:#ddd6fe;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
                Your Creative Space
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#f5f5f5;font-size:24px;margin:0 0 12px;">
                Welcome aboard, ${name}!
              </h2>
              <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 24px;">
                We're thrilled to have you join ClipSphere — the platform where creators share, discover, and connect through video.
              </p>

              <!-- What's next card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#262626;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">
                      What you can do now
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#7c3aed;font-size:18px;vertical-align:middle;">▶</span>
                          <span style="color:#e5e5e5;font-size:14px;margin-left:10px;vertical-align:middle;">Upload and share your videos</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#7c3aed;font-size:18px;vertical-align:middle;">◎</span>
                          <span style="color:#e5e5e5;font-size:14px;margin-left:10px;vertical-align:middle;">Follow creators you love</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#7c3aed;font-size:18px;vertical-align:middle;">★</span>
                          <span style="color:#e5e5e5;font-size:14px;margin-left:10px;vertical-align:middle;">Leave reviews and engage with content</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.CLIENT_URL ?? '#'}"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #2a2a2a;padding:24px 40px;text-align:center;">
              <p style="color:#525252;font-size:12px;margin:0 0 4px;">
                You're receiving this because you just created a ClipSphere account.
              </p>
              <p style="color:#525252;font-size:12px;margin:0;">
                &copy; ${new Date().getFullYear()} ClipSphere. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function verificationEmailTemplate(name: string, code: string): string {
    const digits = code.split('')
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your ClipSphere account</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-0.5px;">
                Clip<span style="color:#c4b5fd;">Sphere</span>
              </h1>
              <p style="margin:8px 0 0;color:#ddd6fe;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
                Verify your account
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#f5f5f5;font-size:22px;margin:0 0 12px;">Hi ${name}, here's your code</h2>
              <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Enter the 6-digit code below to verify your email and activate your account.
                This code expires in <strong style="color:#e5e5e5;">10 minutes</strong>.
              </p>

              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${digits.map(d => `
                        <td style="padding:0 5px;">
                          <div style="width:48px;height:60px;background-color:#262626;border:2px solid #7c3aed;border-radius:10px;text-align:center;line-height:60px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0;">${d}</div>
                        </td>`).join('')}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#737373;font-size:13px;text-align:center;margin:0;">
                Don't share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #2a2a2a;padding:24px 40px;text-align:center;">
              <p style="color:#525252;font-size:12px;margin:0 0 4px;">
                If you didn't create a ClipSphere account, you can safely ignore this email.
              </p>
              <p style="color:#525252;font-size:12px;margin:0;">
                &copy; ${new Date().getFullYear()} ClipSphere. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
