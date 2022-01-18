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
        <div className="dialog-container">
            <div className="dialog">
                <div className="dialog-controls">
                    <div className="mb-2">
                        <h1 className="flex flex-row text-2xl"><UserGroupIcon height={32} width={32}/> Add Permission Group</h1>
                    </div>
                    <button
                        className="text-red hover:brightness-95"
                        onClick={() => onClose()}
                    >
                        <XCircleIcon height={24} width={24} />
                    </button>
                </div>
                <div className="dialog-form">
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Name"
                            onChange={e => setName(e.target.value)}
                            value={name}/>

                        <div className="w-full h-[10em] mb-2">
                            <p>Description</p>
                            <textarea
                                className="w-full h-full border border-gray-400"
                                value={description}
                                onChange={e => setDescription(e.target.value)}></textarea>
                        </div>

                        {/*
                        <select onChange={e => setPermGroup(e.target.value)}>
                            <option value="NONE">NONE</option>
                            {permGroups.map(pg => <option key={pg.id} value={pg.name}>{pg.name}</option>)}
                        </select>
                        */}

                        <div className="mt-2">
                            <div className="mb-2 text-red-500" hidden={!error}>{error}</div>
                            <button
                                className="bg-green-300 text-black px-4 py-1 rounded-full w-full"
                                onClick={() => runSaveLogic()}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

AddPermissionGroupDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};
