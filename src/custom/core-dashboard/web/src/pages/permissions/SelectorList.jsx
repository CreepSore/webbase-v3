// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {XCircleIcon, ArrowRightIcon, ArrowLeftIcon} from "@heroicons/react/solid";
import PerfectScrollbar from "react-perfect-scrollbar";

import "../../style.css";
import "react-perfect-scrollbar/dist/css/styles.css";

export default function SelectorList({entries, onSelectionChanged, arrowType, noSelectionHandling, style}) {
    let [selected, setSelected] = React.useState(null);
    let [filteredEntries, setFilteredEntries] = React.useState(entries);
    let [filterText, setFilterText] = React.useState("");

    let updateSelected = (key) => {
        if(!noSelectionHandling) setSelected(key);
        onSelectionChanged(key);
    };

    useEffect(() => {
        setFilteredEntries(entries.filter(e => e.label.toLowerCase().includes(filterText.toLowerCase())));
    }, [entries, filterText]);

    return (
        <div className="selector-list">
            <div className="selector-search">
                <input
                    type="text"
                    placeholder="Search ..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)} />
                <div
                    className="clear-icon"
                    onClick={() => setFilterText("")}
                    hidden={filterText?.length === 0}>
                    <XCircleIcon height={16} width={16}/>
                </div>
            </div>
            <PerfectScrollbar className="entries">
                {filteredEntries.map(e =>
                    <div
                        key={e.key}
                        className={`selector-child ${selected === e.key ? "selected" : ""}`}
                        onClick={() => updateSelected(e.key)}
                    >
                        {arrowType === "left" && <ArrowLeftIcon height={16} width={16} />}
                        {e.label}
                        {arrowType === "right" && <ArrowRightIcon height={16} width={16} />}
                    </div>
                )}
            </PerfectScrollbar>
        </div>
    );
}

SelectorList.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    onSelectionChanged: PropTypes.func.isRequired,
    arrowType: PropTypes.string,
    noSelectionHandling: PropTypes.bool,
    style: PropTypes.object
};
