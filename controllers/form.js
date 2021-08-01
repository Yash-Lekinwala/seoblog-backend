import { sendEmailWithNodemailer } from "../helpers/email.js";

export const contactForm = (req, res) => {
    const {email, name, message} = req.body;

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `Contact form - ${process.env.APP_NAME}`,
        text: `Email received from contact form \n Sender Name: ${name} \n Sender email: ${email} \n Sender Message: ${message}`,
        html: `
            <h4>Email received from contact form:</h4>
            <p>Sender Name: ${name}</p>
            <p>Sender Email: ${email}</p>
            <p>Sender Message: ${message}</p>
            <hr/>
            <p>This email may contain sensitive information</p>`
    };

    // send mail
    sendEmailWithNodemailer(req, res, emailData).then(sent => {
        return res.json({
            success: true
        });
    });
}

export const contactBlogAuthorForm = (req, res) => {
    const {authorEmail, email, name, message} = req.body;

    let maillist = [authorEmail, process.env.EMAIL_TO];

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: maillist,
        subject: `Someone messaged you from ${process.env.APP_NAME}`,
        text: `Email received from contact form \n Sender Name: ${name} \n Sender email: ${email} \n Sender Message: ${message}`,
        html: `
            <h4>Message received from:</h4>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr/>
            <p>This email may contain sensitive information</p>`
    };

    // send mail
    sendEmailWithNodemailer(req, res, emailData).then(sent => {
        return res.json({
            success: true
        });
    });
}