// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AuthenticationApi from "../../../../../core-authentication/web/src/AuthenticationApi.js";
import SelectorList from "./SelectorList.jsx";
import PermissionGroupEditor from "./PermissionGroupEditor.jsx";

import "../../style.css";

export default function PermissionsPage() {
    let [selectedPermissionGroup, setSelectedPermissionGroup] = React.useState(null);
    let [permissionGroups, setPermissionGroups] = React.useState([]);
    let [permissions, setPermissions] = React.useState([]);

    let fetchPermissionGroups = () => {
        AuthenticationApi.getPermGroups().then(setPermissionGroups).catch(() => {});
    };

    let fetchPermissions = () => {
        AuthenticationApi.getPermissions().then(setPermissions).catch(() => {});
    };

    let fetchData = async() => {
        fetchPermissionGroups();
        fetchPermissions();
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
