const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Igor Gonchar <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid - to send; mailsac - to receive
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // mailtrap - both sender and receiver
    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in gmail "less secure app" option
    });
  }

  async send(template, subject) {
    // Render HTML
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // create a transport
    const transporter = this.createTransport();
    await transporter.sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family');
  }

  async sendResetPassword() {
    await this.send(
      'password-reset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
}

module.exports = Email;

// const emailOptions = {
//       from: `Igor Gonchar <${process.env.EMAIL_FROM}>`,
//       to: options.email,
//       subject: options.subject,
//       text: options.message,
//       // html:
//     };
//
//   await transporter.sendMail(emailOptions);

// /*await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10 mins)',
//       message,
//     });*/
