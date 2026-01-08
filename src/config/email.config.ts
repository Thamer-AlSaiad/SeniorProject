export default () => {
  if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST is required');
  if (!process.env.SMTP_PORT) throw new Error('SMTP_PORT is required');
  if (!process.env.SMTP_USER) throw new Error('SMTP_USER is required');
  if (!process.env.SMTP_PASS) throw new Error('SMTP_PASS is required');
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is required');

  return {
    email: {
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      verificationTokenExpiresIn: '24h',
      passwordResetTokenExpiresIn: '1h',
    },
  };
};
