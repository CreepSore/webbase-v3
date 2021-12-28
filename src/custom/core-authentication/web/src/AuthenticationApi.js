/**
 * @typedef {Object} Exception
 * @property {{code: string}} info
 * @property {string} text
 */

export default class AuthenticationApi {
    /**
     * @throws {Exception}
     */
    static async login(username, password, tfaToken = null) {
        let result = await fetch("/api/core.authentication/login", {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                token: tfaToken
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json());

        if(!result.success) throw result.error;
        return result.data;
    }

    /**
     * @throws {Exception}
     */
    static async logout() {
        let result = await fetch("/api/core.authentication/logout", {
            method: "POST"
        }).then(response => response.json());

        if(!result.success) throw result.error;
    }

    /**
     * @throws {Exception}
     */
    static async register(username, password, email = null) {
        let result = await fetch("/api/core.authentication/login", {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                email
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json());

        if(!result.success) throw result.error;
    }
}
