// eslint-disable-next-line no-unused-vars
import * as regeneratorRuntime from "regenerator-runtime";
// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDom from "react-dom";
import Dashboard from "./Dashboard.jsx";

window.addEventListener("load", () => {
    ReactDom.render(<Dashboard />, document.querySelector("#react-container"));
});
