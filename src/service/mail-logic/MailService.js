import nodemailer from "nodemailer";

export default class MailService {
    #transporter;

    /**
     * Creates an instance of MailService.
     * @param {string} email
     * @param {string} password
     * @param {string} host
     * @param {number} [port=587]
     * @memberof MailService
     */
    constructor(email, password, host, port = 587) {
        this.email = email;
        this.password = password;
        this.#transporter = nodemailer.createTransport({
            host,
            auth: {
                user: email,
                pass: password
            },
            port,
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    /**
     * @param {string} from
     * @param {string} to
     * @param {string} content
     * @param {boolean} [asHtml=false]
     * @return {any}
     * @memberof MailService
     */
    sendMail(from, to, content, asHtml = false) {
        return this.#transporter.sendMail({
            from,
            to,
            text: !asHtml ? content : null,
            html: asHtml ? content : null
        });
    }
}
