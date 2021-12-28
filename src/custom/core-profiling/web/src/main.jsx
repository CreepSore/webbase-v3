// eslint-disable-next-line no-unused-vars
import * as regeneratorRuntime from "regenerator-runtime";
// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDom from "react-dom";
import Profiling from "./Profiling.jsx";

window.addEventListener("load", () => {
    ReactDom.render(<Profiling />, document.querySelector("#react-container"));
});
