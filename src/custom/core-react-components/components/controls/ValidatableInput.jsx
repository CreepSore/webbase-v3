// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/solid";

export default function ValidatableInput({value, onChange, invalidText, showIcon, showText, containerClasses, inputProps}) {
    return (
        <div className={`validatable-input-container ${containerClasses ?? ""}`}>
            <div className="validatable-input">
                <input {...inputProps} value={value} onChange={onChange} />
                <div
                    className={`validation-icon ${!invalidText ? "valid" : "invalid"}`}
                    title={invalidText}
                    hidden={!showIcon}>
                    {!invalidText ? <CheckCircleIcon width={"1em"} height={"1em"} /> : <XCircleIcon width={"1em"} height={"1em"} />}
                </div>
            </div>
            <div className="validation-text" hidden={!showText}>
                {invalidText ? invalidText : <></>}
            </div>
        </div>
    );
}

ValidatableInput.propTypes = {
    invalidText: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    showIcon: PropTypes.bool,
    showText: PropTypes.bool,
    containerClasses: PropTypes.string,
    inputProps: PropTypes.any
};
