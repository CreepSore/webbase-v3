import MailService from "./MailService.js";

export default class MailRegistry {
    #mailServices = new Map();

    /** @type {MailRegistry} */
    static #instance;

    static get instance() {
        return this.#instance ?? (this.#instance = new this());
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
