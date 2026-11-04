
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Gmail environment variables are missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const result = await transporter.sendMail({
    from: `"Pet Adoption Platform" <${GMAIL_USER}>`,
    to: GMAIL_USER,
    subject: "Pet Adoption Platform - Email Test",
    text: "Success! Your Pet Adoption Platform backend can send emails through Gmail.",
  });

  console.log("Test email sent successfully!");
  console.log("Message ID:", result.messageId);
}

testEmail().catch((error) => {
  console.error("Email sending failed:", error.message);
  process.exitCode = 1;
});
