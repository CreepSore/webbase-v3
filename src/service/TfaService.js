import totp from "totp-generator";

export default class TfaService {
    /**
     * @param {string} key The base32 encoded key
     * @param {string} code The code specified by the user
     * @param {number} timeoffset The time offset (in the future and in the present) in ms
     * @returns {boolean}
     */
    static verify = function(key, code, timeoffset = 30000) {
        let normalizedOffset = Math.abs(timeoffset);
        let totpPresent = this.getTOTP(key, -normalizedOffset);
        let totpNow = this.getTOTP(key, 0);
        let totpFuture = this.getTOTP(key, normalizedOffset);
        return [totpPresent, totpNow, totpFuture].includes(code);
    }

    static getTOTP = function(key, timeoffset) {
        return totp(key, {
            period: 30,
            // @ts-ignore
            timestamp: Date.now() + timeoffset
        });
    };
}
