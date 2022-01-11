import React from "react";
import AuthenticationApi from "../AuthenticationApi.js";
import LocalizationApi from "../../../../core-localization/web/src/LocalizationApi.js";
import "./login.css";

export default class LoginForm extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            translations: {},
            username: "",
            password: "",
            token: "",
            tfaHidden: false,
            error: ""
        };

        this.fetchTranslations();
    }

    render = () => {
        return (
            <div className="login-form">
                <h1>{this.state.translations["LoginForm.Header"]}</h1>
                <p className="error" hidden={this.state.error.length === 0}>{this.state.error}</p>
                <div className="login-form-input">
                    <input
                        onChange={(ev) => this.updateInput(ev.target.value, "username")}
                        type="text"
                        placeholder={this.state.translations["LoginForm.Input.Username"]} />
                    <input
                        onChange={(ev) => this.updateInput(ev.target.value, "password")}
                        type="password"
                        placeholder={this.state.translations["LoginForm.Input.Password"]} />
                    <input
                        className="tfa-input"
                        value={this.state.token}
                        onChange={(ev) => this.updateInput(ev.target.value, "token")}
                        type="text"
                        placeholder={this.state.translations["LoginForm.Input.Token"]}
                        hidden={this.state.tfaHidden}/>
                    <div className="button-container">
                        <button
                            className="login-button"
                            onClick={() => this.loginClick()}>{this.state.translations["LoginForm.Input.LoginButton"]}</button>
                    </div>
                </div>
            </div>
        );
    }

    fetchTranslations = async() => {
        this.setState({
            translations: await LocalizationApi.massTranslate("en", [
                "LoginForm.Header",
                "LoginForm.Input.Username",
                "LoginForm.Input.Password",
                "LoginForm.Input.LoginButton",
                "LoginForm.Input.Token"
            ])
        });
    }

    updateInput = (val, name) => {
        if(name === "token") {
            if(val.length > 6 || String(val).match(/[^0-9]/)) {
                return;
            }
        }

        this.setState({
            [name]: val
        }, () => {
            if(name === "token" && val.length === 6) {
                this.loginClick();
            }
        });
    }

    loginClick = () => {
        AuthenticationApi.login(this.state.username, this.state.password, this.state.token)
            .then(() => {
                this.setState({error: ""});
                location.href = LoginForm.redirectUrl;
            }).catch(ex => {
                console.log(ex);
                if(ex.info.code === "CORE.AUTHENTICATION.ALREADY_LOGGED_IN") {
                    location.href = LoginForm.redirectUrl;
                }
                else if(ex.info.code === "CORE.AUTHENTICATION.NO_TFA_TOKEN") {
                    this.setState({tfaHidden: false});
                }
                else if(ex.info.code === "CORE.AUTHENTICATION.INVALID_TFA_TOKEN") {
                    this.setState({token: "", error: ex.text});
                }
                else {
                    this.setState({error: ex.text});
                }
            });
    }

    static get redirectUrl() {
        return (new URLSearchParams(location.search)).get("redirectTo") || "/";
    }
}
