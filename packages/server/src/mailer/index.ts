import nodemailer, { TransportOptions } from 'nodemailer';
import Mail from "nodemailer/lib/mailer";

export class Mailer {
    private mailer: Mail;

    constructor(smtpOpts: TransportOptions){
        this.mailer = nodemailer.createTransport(smtpOpts);
    }

    async forgotPassword(user: {email: string, name: string}, token){
        return await this.mailer.sendMail({
                    from: `"WorkHive" <noreply@workhub.services>`,
                    to: user.email,
                    subject: "Password reset",
                    text: `Kia Ora ${user.name},

A password reset request has been made for your WorkHive account, click the link below to reset your password.
If this wasn't you please ignore this email.

https://${process.env.WORKHUB_DOMAIN}/reset?token=${token}

Nga Mihi,
WorkHive
`,
                })
    }
}