
export default class AuthenticationApi {
    static async login(username, password, tfaToken = null) {
        let result = await fetch("/core.authentication/login", {
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
    }

    static async logout() {
        let result = await fetch("/core.authentication/logout", {
            method: "POST"
        }).then(response => response.json());

        if(!result.success) throw result.error;
    }

    static async register(username, password, email = null) {
        let result = await fetch("/core.authentication/login", {
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
