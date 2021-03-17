import nodemailer, { TransportOptions } from 'nodemailer';
import Mail from "nodemailer/lib/mailer";
import moment from 'moment';
import { Enquiry } from '../router';

export class Mailer {
    private mailer: Mail;

    constructor(smtpOpts: TransportOptions){
        this.mailer = nodemailer.createTransport(smtpOpts);
    }

    async contactMessage(contact_info: Enquiry){
        let received = new Date().getTime();
        return await this.mailer.sendMail({
            from: process.env.SMTP_FROM || `"Workhive" <noreply@workhub.services>`,
            to: process.env.SMTP_CONTACT || 'professional.balbatross@gmail.com',
            replyTo: `"${contact_info.name}" <${contact_info.email}>`,
            subject: `Contact Message from ${contact_info.source}`,
            text: `
            A new message was received from ${contact_info.source} at ${moment(new Date(received)).format('HH:mma DD/MM/YYYY')}

            Details
            ---

            Name: ${contact_info.name}
            Company: ${contact_info.company}

            Email: ${contact_info.email}
            Phone: ${contact_info.phone}

            Preferred Contact: ${(contact_info.preferred_contact || []).join(', ')}

            City: ${contact_info.city}
            Country: ${contact_info.country}

            Message: ${contact_info.message}

            
            Replies to this message will be sent to the contact with the details above.
            
            Powered by Workhub

            `
        })
    }

    async forgotPassword(user: {email: string, name: string}, token){
        return await this.mailer.sendMail({
                    from: process.env.SMTP_FROM || `"WorkHive" <noreply@workhub.services>`,
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