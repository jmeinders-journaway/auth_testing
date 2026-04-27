import nodemailer, { Transporter } from 'nodemailer';
import { InternalServerError } from '../cores/error.core';
import { SendEmailInput } from '~/features/user/models/auth.model';

class MailProvider {
  private transporter: Transporter;

  constructor() {
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (!host || !port || !user || !pass) {
      throw new InternalServerError('Mail configuration is missing');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass
      }
    });
  }

  public async sendEmail(input: SendEmailInput) {
    const from = input.from || process.env.MAIL_FROM || process.env.MAIL_USER;
    if (!from) {
      throw new InternalServerError('Sender email is missing');
    }

    return this.transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });
  }
}

export const mailProvider: MailProvider = new MailProvider();
