// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

import {XCircleIcon} from "@heroicons/react/solid";

export default function BaseDialog({onClose, title, children}) {
    return (
        <div className="base-dialog-container">
            <div className="base-dialog">
                <div className="base-dialog-controls">
                    <div className="mb-2">
                        <h1 className="flex flex-row text-2xl">{title ? title : <></>}</h1>
                    </div>
                    <button
                        className="text-red hover:brightness-95"
                        onClick={() => onClose()}
                    >
                        <XCircleIcon height={24} width={24} />
                    </button>
                </div>
                <div className="base-dialog-form">
                    {children}
                </div>
            </div>
        </div>
    );
}

BaseDialog.propTypes = {
    title: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};
