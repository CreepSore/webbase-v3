
export default class Exception extends Error {
    /**
     * Creates an instance of Exception.
     * @param {string} message
     * @param {{code: string}} info
     * @memberof Exception
     */
    constructor(message, info) {
        super(message);
        this.info = info;
    }
}
