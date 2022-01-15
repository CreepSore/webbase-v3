// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

import "../../style.css";

function UserTableRow({user, onEditClicked, onDeleteClicked}) {
    let [deleteClickedCount, setDeleteClickedCount] = React.useState(0);

    let clickDelete = () => {
        setDeleteClickedCount(deleteClickedCount + 1);
        if(deleteClickedCount === 3) {
            setDeleteClickedCount(0);
            onDeleteClicked(user);
        }
    };

    return <tr>
        <td>{user.id}</td>
        {/* eslint-disable-next-line react/prop-types */}
        <td>{user.PermissionGroup ? user.PermissionGroup.name : "NONE"}</td>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>**********</td>
        <td>**********</td>
        <td>{user.active ? "Yes" : "No"}</td>
        <td>
            <button className="btn-pill bg-blue-400" onClick={() => onEditClicked(user)}>Edit</button>
            <button className="btn-pill bg-red-400" onClick={() => clickDelete()}>{deleteClickedCount === 0 ? "Delete" : 4 - deleteClickedCount}</button>
        </td>
    </tr>;
}

UserTableRow.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        email: PropTypes.string,
        active: PropTypes.bool.isRequired
    }),
    onEditClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired
};

function EditUserTableRow({user, permGroups, onSaveClicked}) {
    let [username, setUsername] = React.useState(user.username || "");
    let [email, setEmail] = React.useState(user.email || "");
    // eslint-disable-next-line react/prop-types
    let [permGroup, setPermGroup] = React.useState(permGroups.find(p => user.PermissionGroup ? p.id === user.PermissionGroup.id : p.name === "Anonymous").id);
    let [active, setActive] = React.useState(user.active);
    let [tfaKey, setTfaKey] = React.useState("");
    let [password, setPassword] = React.useState("");

    return <tr>
        <td>{user.id}</td>
        <td>
            <select onChange={e => setPermGroup(e.target.value)}>
                {permGroups.map(p => <option key={p.id} value={p.id} selected={p.id === permGroup}>{p.name}</option>)}
            </select>
        </td>
        <td><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} /></td>
        <td><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} /></td>
        <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></td>
        <td><input type="password" value={tfaKey} onChange={(e) => setTfaKey(e.target.value)} /></td>
        <td><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /></td>
        <td><button className="btn-pill bg-green-400" onClick={() => onSaveClicked({
            id: user.id,
            username,
            email,
            active,
            tfaKey,
            password,
            permissionGroup: permGroups.find(p => p.id === permGroup).name
        })}>Save</button></td>
    </tr>;
}

EditUserTableRow.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        email: PropTypes.string,
        active: PropTypes.bool.isRequired
    }),
    permGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    onSaveClicked: PropTypes.func.isRequired
};

export default function UserTable({users, permGroups, onSaveClicked, onDeleteClicked}) {
    let [editingUser, setEditingUser] = React.useState(null);

    return (
        <table className="edit-table">
            <thead>
                <tr>
                    <th scope="col" className="text-left">ID</th>
                    <th scope="col" className="text-left">Permission Group</th>
                    <th scope="col" className="text-left">Username</th>
                    <th scope="col" className="text-left">Email</th>
                    <th scope="col" className="text-left">Password</th>
                    <th scope="col" className="text-left">TFA Key</th>
                    <th scope="col" className="text-left">Active</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => {
                    return editingUser === user ?
                        <EditUserTableRow
                            key={user.id}
                            user={user}
                            permGroups={permGroups}
                            onSaveClicked={(userdata) => {
                                setEditingUser(null);
                                onSaveClicked(userdata);
                            }}
                        />
                        :
                        <UserTableRow
                            key={user.id}
                            user={user}
                            onEditClicked={(u) => setEditingUser(u)}
                            onDeleteClicked={(u) => onDeleteClicked(u)}
                        />;
                })}
            </tbody>
        </table>
    );
}

UserTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        email: PropTypes.string,
        active: PropTypes.bool.isRequired,
        permGroup: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired
        })
    })),
    permGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    })),
    onSaveClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired
};
