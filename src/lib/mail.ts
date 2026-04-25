import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${token}`;
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );

  // Log link to terminal for easy local testing
  console.log(`\n\n-------------------------`);
  console.log(` Mock Verification Email dispatched to ${email}`);
  console.log(` Verification Link: ${confirmLink}`);
  console.log(`-------------------------\n\n`);

  if (!hasSmtpConfig) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || '"Arel Social" <noreply@arel-social.com>',
      to: email,
      subject: "Verify your Email - Arel Social",
      html: `
        <h2>Welcome to Arel Social!</h2>
        <p>Please click the link below to verify your email and activate your account.</p>
        <p><a href="${confirmLink}">Verify my email</a></p>
      `,
    });
  } catch (err) {
    console.error("Failed to send verification email. (Did you configure SMTP in .env?)", err);
  }
};
