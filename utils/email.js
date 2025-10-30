const mailer = require("nodemailer");
EMAIL_USER="vishalsharma@igtechso.com"
EMAIL_PASS="mhxanyoxyrgvqool";
const transporter = mailer.createTransport({
    service : "gmail",
    auth:{
        user:EMAIL_USER,
        pass:EMAIL_PASS

    },
});


async function sendEmail (to , subject , text ){
    await transporter.sendMail({
        from:EMAIL_USER,
        to,
        subject,
        text,
    });
console.log(`email sent to ${to}`);
}

module.exports = sendEmail;