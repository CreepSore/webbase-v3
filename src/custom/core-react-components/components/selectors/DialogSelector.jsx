// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

export default function DialogSelector({onEntrySelected, entries, showDescription, showTooltip, confirmButton}) {
    let [selectedEntry, setSelectedEntry] = React.useState(null);

    React.useEffect(() => {
        if (selectedEntry && !confirmButton) {
            onEntrySelected(selectedEntry);
        }
    }, [selectedEntry]);

    return (
        <div className="base-dialog-container">
            <div className="dialog-selector">
                <div className="dialog-selector-list">
                    {entries.map((entry) => (
                        <div
                            key={entry.key}
                            className={`dialog-selector-entry ${selectedEntry?.key === entry.key ? "selected" : ""}`}
                            onClick={() => setSelectedEntry(entry)}
                            title={showTooltip ? entry.tooltip : ""}>
                            <p>{entry.label}</p>
                            {showDescription && <div className="dialog-selector-entry-description">
                                {entry.description}
                            </div>}
                        </div>
                    ))}
                </div>
                <div>
                    {confirmButton && <button className="confirm-button" onClick={() => onEntrySelected(selectedEntry)}>Confirm Selection</button>}
                </div>
            </div>
        </div>
    );
}

DialogSelector.propTypes = {
    onEntrySelected: PropTypes.func.isRequired,
    showDescription: PropTypes.bool,
    showTooltip: PropTypes.bool,
    confirmButton: PropTypes.bool,
    entries: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        tooltip: PropTypes.string
    }))
};
