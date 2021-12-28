// eslint-disable-next-line no-unused-vars
import * as regeneratorRuntime from "regenerator-runtime";
// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDom from "react-dom";
import LoginPage from "./LoginPage";

window.addEventListener("load", () => {
    ReactDom.render(<LoginPage />, document.querySelector("#react-container"));
});
