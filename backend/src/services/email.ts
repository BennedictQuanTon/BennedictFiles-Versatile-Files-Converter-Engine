import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const emailFromName = process.env.EMAIL_FROM_NAME || 'BennedictFiles';

let transporter: nodemailer.Transporter | null = null;

if (gmailUser && gmailPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

export class EmailService {
  static async sendFileEmail(recipient: string, fileBuffer: Buffer, originalName: string) {
    if (transporter && gmailUser) {
      const mailOptions = {
        from: `"${emailFromName}" <${gmailUser}>`,
        to: recipient,
        subject: `Your Converted File: ${originalName}`,
        text: `Hello,\n\nPlease find attached your converted file "${originalName}" from BennedictFiles.\n\nThank you for using BennedictFiles!`,
        attachments: [
          {
            filename: originalName,
            content: fileBuffer,
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('--- EMAIL SIMULATION (SMTP Not Configured) ---');
      console.log(`To: ${recipient}`);
      console.log(`Subject: Your Converted File: ${originalName}`);
      console.log(`Attachment: ${originalName} (${fileBuffer.length} bytes)`);
      console.log('--------------------------------------------');
      return { success: true, simulated: true };
    }
  }
}
