const nodemailer = require('nodemailer');

module.exports.mailHelper = async (options) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'confirmation@royalmembership.ae',
      pass: '#Hostinger2022',
    },
  });

  await transporter.sendMail(options);
};
