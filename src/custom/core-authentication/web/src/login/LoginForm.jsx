import React from "react";
import AuthenticationApi from "../AuthenticationApi.js";
import "./login.css";

export default class LoginForm extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };
    }

    render = () => {
        return (
            <div>
                <p className="text-red-500">Bruh</p>
            </div>
        );
    }
}
