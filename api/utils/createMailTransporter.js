import nodemailer from "nodemailer";

export const createMailTransporter = () => {

    const Usern =  process.env.SMTP_MAIL;
    const Passw =  process.env.SMTP_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: "587",
        secure: false,
        auth: {
            user: Usern,
            pass: Passw,
        },
    });

    return transporter;
};