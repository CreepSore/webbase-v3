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
        await fetch("/api/core.authentication/logout", {
            method: "GET"
        });
    }

    /**
     * @throws {Exception}
     */
    static async register(username, password, email = null) {
        let result = await fetch("/api/core.authentication/register", {
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

        return {
            uid: result.uid,
            active: result.active
        };
    }

    static async updateUserInformation(uid, email, password, username, tfaKey, active, permissionGroup) {
        let result = await fetch(`/api/core.authentication/user/${uid}`, {
            method: "PUT",
            body: JSON.stringify({
                uid,
                email,
                password,
                username,
                tfaKey,
                active,
                permissionGroup
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json());

        if(!result.success) throw result.error;
    }

    static async getUsers() {
        let result = await fetch("/api/core.authentication/users", {
            method: "GET"
        }).then(response => response.json());

        if(!result.success) throw result.error;
        return result.data;
    }

    static async deleteUser(uid) {
        let result = await fetch(`/api/core.authentication/user/${uid}`, {
            method: "DELETE"
        }).then(response => response.json());

        if(!result.success) throw result.error;
        return result.data;
    }

    static async getPermGroups() {
        let result = await fetch("/api/core.authentication/permGroups", {
            method: "GET"
        }).then(response => response.json());

        if(!result.success) throw result.error;
        return result.data;
    }
}
