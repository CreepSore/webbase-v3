// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";
import SelectorList from "./SelectorList.jsx";
import PermissionGroupEditor from "./PermissionGroupEditor.jsx";

import {PlusIcon} from "@heroicons/react/solid";

import "../../style.css";
import AddPermissionGroupDialog from "./AddPermissionGroupDialog.jsx";
import AuthPermissions from "../../../../../core-authentication/permissions.js";

export default function PermissionsPage() {
    let [selectedPermissionGroup, setSelectedPermissionGroup] = React.useState(null);
    let [permissionGroups, setPermissionGroups] = React.useState([]);
    let [permissions, setPermissions] = React.useState([]);
    let [myPermissions, setMyPermissions] = React.useState([]);
    let [addPermissionGroupDialogShown, setAddPermissionGroupDialogShown] = React.useState(false);

    let fetchMyPermissions = () => {
        return AuthenticationApi.getMyPermissions()
            .then(setMyPermissions);
    };

    let fetchPermissionGroups = () => {
        return AuthenticationApi.getPermGroups().then(setPermissionGroups).catch(() => {});
    };

    let fetchPermissions = () => {
        return AuthenticationApi.getPermissions().then(perms => setPermissions(perms.sort((a, b) => a.name.localeCompare(b.name)))).catch(() => {});
    };

    let fetchData = async() => {
        Promise.all([
            fetchMyPermissions(),
            fetchPermissionGroups(),
            fetchPermissions()
        ]);
    };

    useEffect(() => {
        fetchData();
    }, [selectedPermissionGroup]);

    let updatePerms = (perms) => {
        setSelectedPermissionGroup(null);
        AuthenticationApi.setPermGroupPerms(selectedPermissionGroup.id, perms.map(p => p.key))
            .then(() => fetchData());
    };

    return (
        <div className="permissions-page">
            {addPermissionGroupDialogShown &&
                <AddPermissionGroupDialog
                    onClose={() => setAddPermissionGroupDialogShown(false)}
                    onSave={() => fetchData().then(() => setAddPermissionGroupDialogShown(false))}
                />}
            <div
                className="add-button bg-blue-400"
                onClick={() => setAddPermissionGroupDialogShown(true)}
                hidden={!myPermissions.some(p => [AuthPermissions.core_all.key, AuthPermissions.core_authentication_permgroups_new.key].includes(p))}>
                <PlusIcon height={48} width={48} />
            </div>
            <div className="sidebar">
                <SelectorList
                    entries={permissionGroups.map(p => {return {key: p.id, label: p.name, tooltip: p.description};})}
                    onSelectionChanged={key => setSelectedPermissionGroup(permissionGroups.find(pg => pg.id === key))}
                    arrowType="right"/>
            </div>
            <div className="permgroup-editor-container">
                {selectedPermissionGroup && <PermissionGroupEditor
                    permissionGroup={selectedPermissionGroup}
                    permissions={permissions.map(p => {return {key: p.id, label: p.name, tooltip: p.description};})}
                    onSaveClicked={(perms) => {updatePerms(perms);}}
                />}
            </div>
        </div>
    );
}
