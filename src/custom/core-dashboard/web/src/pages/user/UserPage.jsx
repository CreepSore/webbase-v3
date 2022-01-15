// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import {UserAddIcon} from "@heroicons/react/solid";

import UserTable from "./UserTable.jsx";
import UserCreateDialog from "./UserCreateDialog.jsx";
import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";

import "../../style.css";

export default function UserPage() {
    let [users, setUsers] = React.useState([]);
    let [permGroups, setPermGroups] = React.useState([]);
    let [userCreateDialogVisible, setUserCreateDialogVisible] = React.useState(false);

    let fetchUsers = () => {
        AuthenticationApi.getUsers()
            .then(u => setUsers(u))
            .catch(console.error);
    };

    let fetchPermGroups = () => {
        AuthenticationApi.getPermGroups()
            .then(p => setPermGroups(p))
            .catch(console.error);
    };

    let updateUser = async(userdata) => {
        await AuthenticationApi.updateUserInformation(
            userdata.id,
            userdata.email,
            userdata.password,
            userdata.username,
            userdata.tfaKey,
            userdata.active,
            userdata.permissionGroup
        );

        fetchUsers();
        fetchPermGroups();
    };

    let deleteUser = async(userdata) => {
        await AuthenticationApi.deleteUser(userdata.id);

        fetchUsers();
        fetchPermGroups();
    };

    useEffect(() => {
        fetchUsers();
        fetchPermGroups();
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchPermGroups();
    }, [userCreateDialogVisible]);

    return (
        <div className="user-page">
            {userCreateDialogVisible &&
                <UserCreateDialog
                    onClose={() => setUserCreateDialogVisible(false)}
                    onSave={() => setUserCreateDialogVisible(false)}
                    permGroups={permGroups}
                />}

            <div className="flex justify-end px-1 w-full bg-green-600">
                <button
                    className="hover:text-green-300 text-white"
                    onClick={() => setUserCreateDialogVisible(true)}><UserAddIcon height={32} width={32}/></button>
            </div>

            <UserTable
                users={users}
                permGroups={permGroups}
                onSaveClicked={(userdata) => updateUser(userdata)}
                onDeleteClicked={(userdata) => deleteUser(userdata)}/>
        </div>
    );
}