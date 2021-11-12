import MailService from "./MailService.js";
import KvpStorage from "../KvpStorage.js";

export default class MailRegistry {
    #mailServices = new Map();
    /** @type {MailService} */
    #defaultService;

    /** @type {MailRegistry} */
    static #instance;

    static get instance() {
        if(!this.#instance) {
            this.#instance = new MailRegistry();
            try {
                let config = KvpStorage.instance.wrapper.getConfig().mail;
                this.#instance.#defaultService = this.#instance.getOrCreateMailService(config.user, config.password, config.host, config.port);
            }
            catch(error) { console.log("ERROR", `Failed to initialize default mailer: ${error}`); }
        }
        return this.#instance;
    }

    get defaultService() {
        return this.#defaultService;
    }

    /**
     * Sends a alert mail to all configured recipients
     * @param {string} subject
     * @param {string} text
     * @param {boolean} [asHtml=false]
     * @param {boolean} [forceSend=false] - If true, the mail will be sent even if the alerts are disabled
     * @return {Promise<void>}
     * @memberof MailRegistry
     */
    async sendAlertMail(subject, text, asHtml = false, forceSend = false) {
        let mailConfig = KvpStorage.instance.wrapper.getConfig().mail;
        let defaultService = this.#defaultService;
        if(!defaultService || (!mailConfig.alertsEnabled && !forceSend)) {
            return;
        }

        await Promise.all(mailConfig.alerts.recipients.map(recipient => {
            return defaultService.sendMail(
                mailConfig.alerts.from,
                recipient,
                text,
                `${mailConfig.alerts.subject}${subject ? ` - ${subject}` : ""}`,
                asHtml
            );
        })).catch(err => {
            console.log("ERROR", `Failed to send alert mail: ${err}`);
        });
    }

    /**
     * @param {string} email
     * @return {MailService}
     * @memberof MailRegistry
     */
    getMailService(email) {
        return this.#mailServices.get(email);
    }

    /**
     * @param {string} email
     * @param {string} password
     * @param {string} host
     * @param {number} port
     * @return {MailService}
     * @memberof MailRegistry
     */
    getOrCreateMailService(email, password, host, port = 587) {
        let mailService = this.getMailService(email);
        if(mailService) return mailService;

        mailService = new MailService(email, password, host, port);
        this.#mailServices.set(email, mailService);
        return mailService;
    }
}
