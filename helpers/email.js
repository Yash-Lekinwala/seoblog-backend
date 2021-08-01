import nodeMailer from 'nodemailer';
 
export const sendEmailWithNodemailer = (req, res, emailData) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
        user: process.env.GMAIL_EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
        pass: process.env.GMAIL_APP_PASSWORD, // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED EARLIER
        },
        tls: {
        ciphers: "SSLv3",
        },
    });

    return transporter
        .sendMail(emailData)
        .then((info) => {
        console.log(`Message sent: ${info.response}`);
        return res.json({
            success: true,
        });
        })
        .catch((err) => console.log(`Problem sending email: ${err}`));
};