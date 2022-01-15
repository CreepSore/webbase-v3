// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import PropTypes from "prop-types";

import "../../style.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import SelectorList from "./SelectorList.jsx";

export default function PermissionGroupEditor({permissionGroup, permissions, onSaveClicked}) {
    let [assignedPermissions, setAssignedPermissions] = React.useState([]);
    let [unassignedPermissions, setUnassignedPermissions] = React.useState([]);

    useEffect(() => {
        setAssignedPermissions(permissionGroup.Permissions.map(p => {return {key: p.id, label: p.name};}));
    }, [permissions, permissionGroup]);

    useEffect(() => {
        let unassigned = permissions.filter(p => !assignedPermissions.some(pgp => pgp.key === p.key));

        setUnassignedPermissions(unassigned);
    }, [assignedPermissions]);

    let assignPermission = (key) => {
        let permission = permissions.find(p => p.key === key);
        setAssignedPermissions(assignedPermissions.concat(permission));
    };

    let unassignPermission = (key) => {
        setAssignedPermissions(assignedPermissions.filter(p => p.key !== key));
    };

    return (
        <div className="permgroup-editor">
            <div className="permgroup-editor-header">
                <p>{permissionGroup.name}</p>
                <div className="permgroup-editor-header-actions">
                    <button
                        className="btn-pill bg-green-200 hover:bg-green-300"
                        onClick={() => onSaveClicked(assignedPermissions)}>Save</button>
                </div>
            </div>
            <div className="permgroup-editor-body">
                <div className="unassigned">
                    <div>Not assigned</div>
                    <div>
                        <SelectorList
                            entries={unassignedPermissions}
                            onSelectionChanged={(key) => assignPermission(key)}
                            arrowType="right"
                            noSelectionHandling={true} />
                    </div>
                </div>
                <div className="assigned">
                    <div>Assigned</div>
                    <div>
                        <SelectorList
                            entries={assignedPermissions}
                            onSelectionChanged={(key) => unassignPermission(key)}
                            arrowType="left"
                            noSelectionHandling={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

PermissionGroupEditor.propTypes = {
    permissionGroup: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        Permissions: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string
        })).isRequired
    }),
    permissions: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    onSaveClicked: PropTypes.func.isRequired
};
