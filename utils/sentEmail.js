const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    // ✅ ENV CHECK
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL ENV NOT SET");
      return false;
    }

    // ✅ BREVO SMTP CONFIG
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,            // STARTTLS
      secure: false,        // must be false for 587
      auth: {
        user: process.env.EMAIL_USER, // e.g. 9f781a001@smtp-brevo.com
        pass: process.env.EMAIL_PASS, // xsmtpsib-xxxx
      },
    });

    // ✅ VERIFY CONNECTION
    await transporter.verify();
    console.log("✅ Brevo SMTP Ready");

    // ✅ SEND EMAIL
    const info = await transporter.sendMail({
      from: `"Rentora" <rentorabooking@gmail.com>`, // MUST be verified in Brevo
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error.message);
    return false;
  }
};

module.exports = sendEmail;
