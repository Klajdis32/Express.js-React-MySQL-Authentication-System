import { createMailTransporter } from "./createMailTransporter.js";

export const sendVerificationMail = (user) => {
    const transporter = createMailTransporter();

    const mailOptions = {
        from: '"travellens.gr" <travellensgr@gmail.com>',
        to: user.email,
        subject: "Account verification",
        html: `
        <p>Hello 👋 ${user.username}, your verification code is:</p>
        <div style="text-align: center;">
            <h1>${user.verificationCode}</h1>
        </div>
        `,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject("Failed to send verification email");
            } else {
                console.log("Verification email sent");
                resolve("Verification email sent successfully");
            }
        });
    });
};