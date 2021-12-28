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
            token: null,
            tfaHidden: true,
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
                    <input onChange={(ev) => this.updateInput(ev.target.value, "username")} type="text" placeholder={this.state.translations["LoginForm.Input.Username"]} />
                    <input onChange={(ev) => this.updateInput(ev.target.value, "password")} type="text" placeholder={this.state.translations["LoginForm.Input.Password"]} />
                    <input onChange={(ev) => this.updateInput(ev.target.value, "token")} type="text" placeholder={this.state.translations["LoginForm.Input.Token"]} hidden={this.state.tfaHidden}/>
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
                "LoginForm.Input.LoginButton"
            ])
        });
    }

    updateInput = (val, name) => {
        this.setState({
            [name]: val
        });
    }

    loginClick = () => {
        AuthenticationApi.login(this.state.username, this.state.password, this.state.token)
            .then(() => {
                this.setState({error: ""});
                location.reload();
            }).catch(ex => {
                console.log(ex);
                if(ex.info.code === "CORE.AUTHENTICATION.ALREADY_LOGGED_IN") {
                    location.reload();
                }
                else {
                    this.setState({error: ex.text});
                }
            });
    }
}
