const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const Transport = require('nodemailer-brevo-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ashik Sarkar <${process.env.EMAIL_FROM}>`;
  }

  newTransport = function () {
    if (process.env.NODE_ENV === 'production') {
      //SendinBlue now called brevo
      return nodemailer.createTransport(
        new Transport({
          apiKey: `${process.env.BREVO_API}`,
        })
      );
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  };

  send = async function (template, subject) {
    //1 Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2 Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  };

  sendWelcome = async function () {
    await this.send('welcome', 'Welcome to the natours family!');
  };

  passwordReset = async function () {
    await this.send(
      'passwordReset',
      'Your password reset token(Vald for only ten minutes!)'
    );
  };
};
