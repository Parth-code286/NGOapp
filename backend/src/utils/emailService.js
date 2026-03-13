import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: (process.env.EMAIL_USER || "").trim(),
    pass: (process.env.EMAIL_PASS || "").trim(),
  }
});

export const sendEmail = async (to, subject, text) => {
  try {
    const user = (process.env.EMAIL_USER || "").trim();
    const pass = (process.env.EMAIL_PASS || "").trim();

    if (!user || !pass) {
      console.log(`[EMAIL EMULATION] To: ${to}\nSubject: ${subject}\nBody: ${text}`);
      return;
    }

    console.log(`[DEBUG] Attempting to send email from: ${user}`);
    console.log(`[DEBUG] App Password Length: ${pass.length} characters`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || user,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};
