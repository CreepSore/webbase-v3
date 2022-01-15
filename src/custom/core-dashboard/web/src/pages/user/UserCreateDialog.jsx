// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {XCircleIcon, UserAddIcon} from "@heroicons/react/solid";

import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";

import "../../style.css";

export default function UserCreateDialog({onClose, onSave, permGroups}) {
    let [username, setUsername] = React.useState("");
    let [email, setEmail] = React.useState("");
    let [password, setPassword] = React.useState("");
    let [active, setActive] = React.useState(false);
    let [permGroup, setPermGroup] = React.useState("NONE");
    let [error, setError] = React.useState(null);

    let runSaveLogic = async() => {
        try {
            let result = await AuthenticationApi.register(
                username,
                "abcABC09!§$1234", // Literally the most whackiest workaround ever
                email
            );

            await AuthenticationApi.updateUserInformation(
                result.uid,
                email,
                password,
                username,
                null,
                active,
                permGroup === "NONE" ? null : permGroup
            );
        }
        catch(ex) {
            setError(ex.text);
            return;
        }

        setUsername("");
        setEmail("");
        setPassword("");
        setActive(false);
        onSave();
    };

    return (
        <div className="user-create-dialog-container">
            <div className="user-create-dialog">
                <div className="user-create-dialog-controls">
                    <button
                        className="text-red hover:brightness-95"
                        onClick={() => onClose()}
                    >
                        <XCircleIcon height={24} width={24} />
                    </button>
                </div>
                <div className="user-create-dialog-form">
                    <div className="mb-2">
                        <h1 className="flex flex-row text-2xl"><UserAddIcon height={32} width={32}/> Add User</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Username"
                            onChange={e => setUsername(e.target.value)}
                            value={username}/>
                        <input
                            type="text"
                            placeholder="Email"
                            onChange={e => setEmail(e.target.value)}
                            value={email}/>
                        <input
                            type="text"
                            placeholder="Password"
                            onChange={e => setPassword(e.target.value)}
                            value={password}/>
                        <select onChange={e => setPermGroup(e.target.value)}>
                            <option value="NONE">NONE</option>
                            {permGroups.map(pg => <option key={pg.id} value={pg.name}>{pg.name}</option>)}
                        </select>

                        <div className="mt-2 flex gap-2 items-center">
                            <input
                                type="checkbox"
                                name="set-active"
                                id="set-active"
                                checked={active}
                                onChange={e => setActive(e.target.checked)}
                            />
                            <label htmlFor="set-active">Set Active</label>
                        </div>

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

UserCreateDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    permGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    }))
};
