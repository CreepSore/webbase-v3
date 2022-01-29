// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

import {XCircleIcon} from "@heroicons/react/solid";

export default function ErrorDialog({onClose, title, message}) {
    return (
        <div className="base-dialog-container">
            <div className="base-dialog">
                <div className="base-dialog-controls">
                    <div className="mb-2">
                        <h1 className="flex flex-row text-2xl text-red-600">{title ? title : <>Error</>}</h1>
                    </div>
                    <button
                        className="text-red hover:brightness-95"
                        onClick={() => onClose()}
                    >
                        <XCircleIcon height={24} width={24} />
                    </button>
                </div>
                <div className="base-dialog-form">
                    <p className="text-red-600">{message}</p>
                </div>
            </div>
        </div>
    );
}

ErrorDialog.propTypes = {
    title: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired
};
