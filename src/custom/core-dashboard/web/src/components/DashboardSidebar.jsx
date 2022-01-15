// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import "../style.css";

export default function DashboardSidebar({entries, active, onEntryClick}) {
    return (
        <div className="dashboard-sidebar">
            {entries.map(entry => {
                return (
                    <div
                        className={`sidebar-entry ${active === entry.key ? "active" : ""}`}
                        key={entry.key}
                        onClick={() => onEntryClick(entry)}>{entry.icon} {entry.label}</div>
                );
            })}
        </div>
    );
}

DashboardSidebar.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.any
    })),
    active: PropTypes.string.isRequired,
    onEntryClick: PropTypes.func.isRequired
};
