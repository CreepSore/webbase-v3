import React from "react";
import LoginForm from "./LoginForm.jsx";
import "./login.css";

export default class LoginPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };
        this.fetchData();
    }

    render = () => {
        return (
            <div className="login-form-container bg-gray-900">
                <LoginForm></LoginForm>
            </div>
        );
    }

    fetchData = async() => {

    }
}
