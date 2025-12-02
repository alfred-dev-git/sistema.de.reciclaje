import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "no-reply@example.com",
} = process.env;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    } else {
      // modo dev: no envía mail, sólo log
      transporter = null;
    }
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const t = getTransporter();
  const subject = "Código para restablecer tu contraseña";
  const text = `Usá este código para restablecer tu contraseña: ${code}
 El código vence en 15 minutos.`;

  if (!t) {
    // Dev / sin SMTP: logueamos
    console.log(`[DEV] Enviar a ${to}: ${subject}\n${text}`);
    return;
  }

  await t.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
  });
}