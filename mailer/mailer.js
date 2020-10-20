// DESARROLLO
const nodemailer = require('nodemailer');
// PRODUCCION
const sgTransport = require('nodemailer-sendgrid-transport');

let mailConfig;

if (process.env.NODE_ENV === 'production'){
  const options = {
    auth: {
      api_key: process.env.SENDGRID_API_SECRET
    }
  }
  
  mailConfig = sgTransport(options);
} 

else if (process.env.NODE_ENV === 'staging'){
    console.log('XXXXXXXXXXXXXX');
    const options = {
      auth: {
        api_key: process.env.SENDGRID_API_SECRET
      }
    }
    mailConfig = sgTransport(options)
}
else{
  mailConfig = {

    host: "smtp.ethereal.email",
    port: 465,
    auth: {
      user: process.env.ethereal_user,
      pass: process.env.ethereal_pwd
    }

    }
}


module.exports = nodemailer.createTransport(mailConfig);