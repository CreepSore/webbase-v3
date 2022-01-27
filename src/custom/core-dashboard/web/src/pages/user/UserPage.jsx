// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import {UserAddIcon} from "@heroicons/react/solid";

import UserTable from "./UserTable.jsx";
import UserCreateDialog from "./UserCreateDialog.jsx";
import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";

import AuthPermissions from "../../../../../core-authentication/permissions.js";
import "../../style.css";

export default function UserPage() {
    let [users, setUsers] = React.useState([]);
    let [permGroups, setPermGroups] = React.useState([]);
    let [myPermissions, setMyPermissions] = React.useState([]);
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

    let impersonateUser = async(userdata) => {
        await AuthenticationApi.impersonateUser(userdata.id);
        location.reload();
    };

    useEffect(() => {
        fetchUsers();
        fetchPermGroups();
        AuthenticationApi.getMyPermissions().then(setMyPermissions);
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchPermGroups();
    }, [userCreateDialogVisible]);

    let hasPermissionsForCreation = () => {
        if(myPermissions.includes(AuthPermissions.core_all.key)) return true;

        return myPermissions.includes(AuthPermissions.core_authentication_register.key)
            && myPermissions.includes(AuthPermissions.core_authentication_edit_user_basic.key)
            && myPermissions.includes(AuthPermissions.core_authentication_edit_user_advanced.key);
    };

    return (
        <div className="user-page">
            {userCreateDialogVisible &&
                <UserCreateDialog
                    onClose={() => setUserCreateDialogVisible(false)}
                    onSave={() => setUserCreateDialogVisible(false)}
                    permGroups={permGroups}
                />}

            <div className="flex justify-end px-1 w-full bg-blue-600">
                <button
                    className="hover:text-green-300 text-white"
                    onClick={() => setUserCreateDialogVisible(true)}
                    hidden={!hasPermissionsForCreation()}><UserAddIcon height={32} width={32}/></button>
            </div>

            <UserTable
                users={users}
                permGroups={permGroups}
                onSaveClicked={(userdata) => updateUser(userdata)}
                onDeleteClicked={(userdata) => deleteUser(userdata)}
                onImpersonateClicked={(userdata) => impersonateUser(userdata)}/>
        </div>
    );
}
