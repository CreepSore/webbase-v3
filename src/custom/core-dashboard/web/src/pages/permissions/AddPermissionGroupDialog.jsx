// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import {XCircleIcon, UserGroupIcon} from "@heroicons/react/solid";

import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";

import "../../style.css";

export default function AddPermissionGroupDialog({onClose, onSave}) {
    let [name, setName] = React.useState("");
    let [description, setDescription] = React.useState("");
    let [error, setError] = React.useState(null);

    let runSaveLogic = async() => {
        try {
            await AuthenticationApi.newPermGroup(name, description);
            onSave();
        }
        catch(ex) {
            setError(ex.text);
        }
    };

    return (
        <div className="modal-container">
            <div className="glass-modal w-[500px] m-1">
                <h1 className="glass-modal-header">Create Permission Group</h1>

                <div className="input-group">
                    <label>Name</label>
                    <input
                        className="glass-input"
                        type="text"
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                </div>

                <div className="input-group">
                    <label>Description</label>
                    <textarea
                        className="glass-input"
                        cols={30}
                        rows={10}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="input-group gap-[0.2rem]">
                    <button className="glass-button success" onClick={() => runSaveLogic()}>Save</button>
                    <button className="glass-button danger outlined" onClick={() => onClose()}>Close</button>
                </div>
            </div>
        </div>
    );
}

AddPermissionGroupDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};
