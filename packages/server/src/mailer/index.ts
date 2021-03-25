import nodemailer, { TransportOptions } from 'nodemailer';
import Mail from "nodemailer/lib/mailer";
import moment from 'moment';
import { Enquiry } from '../router';

export class Mailer {
    private mailer: Mail;

    private fromName: string = process.env.SMTP_NAME || "WorkHive"
    private fromEmail: string =  `${this.fromName} <${process.env.SMTP_FROM || 'noreply@workhub.services'}>`;

    constructor(smtpOpts: TransportOptions){
        this.mailer = nodemailer.createTransport(smtpOpts);
    }

    async inviteUser(user: {name: string, email: string}, token: string) {
        return await this.mailer.sendMail({
          from: this.fromEmail,
          to: user.email,
          subject: `Invite to ${this.fromName}`,
          text: `Kia Ora ${user.name},

You've been invited to join a ${this.fromName} organisation, click the link below to set up your account.

https://${process.env.WORKHUB_DOMAIN}/signup?token=${token}

Nga Mihi,
${this.fromName}`
        })
    }

    async contactMessage(contact_info: Enquiry){
        let received = new Date().getTime();
        return await this.mailer.sendMail({
            from: this.fromEmail,
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
            
            Powered by ${this.fromName}

            `
        })
    }

    async forgotPassword(user: {email: string, name: string}, token){
        return await this.mailer.sendMail({
                    from: this.fromEmail,
                    to: user.email,
                    subject: "Password reset",
                    text: `Kia Ora ${user.name},

A password reset request has been made for your ${this.fromName} account, click the link below to reset your password.
If this wasn't you please ignore this email.

https://${process.env.WORKHUB_DOMAIN}/reset?token=${token}

Nga Mihi,
${this.fromName}
`,
                })
    }
}