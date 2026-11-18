const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  // Support both JSON bodies and URL-encoded bodies
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const company = String(body.company || "").trim();

  // Honeypot check (bots fill hidden company field)
  if (company) {
    return res.status(200).json({ ok: true, message: "Thanks — your message has been sent." });
  }

  // Basic validation
  if (!name || name.length < 2) {
    return res.status(422).json({ ok: false, error: "Please enter your name." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ ok: false, error: "Please enter a valid email address." });
  }
  if (!message || message.length < 10) {
    return res.status(422).json({ ok: false, error: "Please add a little more detail to your message." });
  }

  const smtpUser = process.env.SMTP_USER || "vaheedbasha544@gmail.com";
  const smtpPass = (process.env.SMTP_PASS || "ssay zkpi fkfm zjhx").replace(/\s+/g, "");
  const mailTo = process.env.MAIL_TO || "vaheedbasha882@gmail.com";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // 587 uses STARTTLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"Vaheed Basha — Portfolio" <${smtpUser}>`,
      to: mailTo,
      replyTo: `"${name}" <${email}>`,
      subject: `New enquiry from portfolio: ${name}`,
      text: `New enquiry from the portfolio website\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; max-width: 600px; line-height: 1.6;">
          <h2 style="color: #FF8A14; margin-top: 0;">New enquiry from portfolio website</h2>
          <table cellpadding="6" cellspacing="0" style="font-size: 14px; color: #222; margin-bottom: 16px;">
            <tr><td><strong>Name:</strong></td><td>${name.replace(/</g, "&lt;")}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email.replace(/</g, "&lt;")}</a></td></tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; background: #f9f9f9; padding: 12px 16px; border-radius: 6px; border: 1px solid #eee;">${message.replace(/</g, "&lt;")}</div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, message: "Thanks — your message has been sent." });
  } catch (err) {
    console.error("Vercel mail delivery error:", err);
    return res.status(500).json({
      ok: false,
      error: "Your message could not be sent right now. Please email vaheedbasha882@gmail.com directly.",
    });
  }
};
