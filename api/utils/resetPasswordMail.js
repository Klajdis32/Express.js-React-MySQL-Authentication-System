import { createMailTransporter } from "./createMailTransporter.js";

export const resetPasswordMail = (user) => {
    const transporter = createMailTransporter();

    // Έλεγχος αν ο χρήστης είναι admin μέσω του AdTrOrFa
    const basePort = user.AdTrOrFa ? process.env.ADMIN_PORT : process.env.CLIENT_PORT;

    const mailOptions = {
        from: '"travellens.gr" <travellensgr@gmail.com>',
        to: user.email,
        subject: "Reset password",
        html: `
        <p>Hello 👋 ${user.username}, to reset your password you have to follow the below link:</p>
        <br/>
        <a href="http://localhost:${basePort}/resetPassword?token=${user.ResetToken}">Click here!</a>
        `,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject("Failed to send reset password email");
            } else {
                console.log("Reset password email sent");
                resolve("Reset password email sent successfully");
            }
        });
    });
};