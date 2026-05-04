import nodemailer from "nodemailer";
import config from "../config/env";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface MailParams {
  to: string;
  subject: string;
  title: string;
  content: string;
}

export const sendMail = async ({ to, subject, title, content }: MailParams) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }
          .header { background-color: #f8f9fa; padding: 15px; border-bottom: 2px solid #007bff; border-radius: 8px 8px 0 0; }
          .title { margin: 0; color: #007bff; font-size: 24px; }
          .content { padding: 20px; font-size: 16px; color: #444; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ClipSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html: htmlTemplate,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Nodemailer Error:", error);
    throw error;
  }
};
