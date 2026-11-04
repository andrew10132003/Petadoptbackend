
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail environment variables are not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: `"Pet Adoption Platform" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
