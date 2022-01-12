// eslint-disable-next-line no-unused-vars
import * as regeneratorRuntime from "regenerator-runtime";
// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDom from "react-dom";
import EditPage from "./EditPage.jsx";

window.addEventListener("load", () => {
    ReactDom.render(<EditPage />, document.querySelector("#react-container"));
});
