
export default class Exception extends Error {
    /**
     * Creates an instance of Exception.
     * @param {string} message
     * @param {{code: string}} info
     * @memberof Exception
     */
    constructor(message, info) {
        super(message);
        this.text = message;
        this.info = info;
    }

    toApiResponse() {
        return {message: this.message, info: this.info};
    }
}
