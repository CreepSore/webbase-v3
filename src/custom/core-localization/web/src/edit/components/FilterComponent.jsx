// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import {ArrowDownIcon, ArrowUpIcon} from "@heroicons/react/solid";

export default function Filter({
    filter,
    filterPossibilities,
    onFilterAdd,
    onFilterRemove,
    onSelectorClosed
}) {
    let [filterOpen, setFilterOpen] = React.useState(false);

    let oldOpen = setFilterOpen;
    setFilterOpen = (state) => {
        oldOpen(state);
        if(!state && state !== filterOpen) {
            onSelectorClosed?.();
        }
    };

    return (
        <div
            className="jsx-filter"
            onBlur={() => setFilterOpen(false)}>
            <div
                className="jsx-filter-component"
                onClick={() => setFilterOpen(!filterOpen)}>
                <p>{filter?.length > 0 ? filter.map(f => f.name).join(", ") : "None"}</p>
                {!filterOpen ? <ArrowDownIcon height={"1em"} width={"1em"}/> : <ArrowUpIcon height={"1em"} width={"1em"}/>}
            </div>
            <div className="jsx-filter-selector" hidden={!filterOpen}>
                {filterPossibilities.filter(p => p.visible).map(p => {
                    let isSelected = filter.some(f => f.value === p.value);
                    return (
                        <div
                            className={`jsx-filter-selector-child ${isSelected ? "selected" : ""}`}
                            key={p.value}
                            data-selected={isSelected}
                            onClick={() => {
                                if (isSelected) {
                                    onFilterRemove(p.value);
                                }
                                else {
                                    onFilterAdd(p.value);
                                }
                            }}>{p.name}</div>
                    );
                })}
                <button onClick={() => {
                    setFilterOpen(false);
                }}>Close</button>
            </div>
        </div>
    );
}

Filter.propTypes = {
    filter: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.string,
        visible: PropTypes.bool
    })).isRequired,
    filterPossibilities: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.string,
        visible: PropTypes.bool
    })).isRequired,
    onFilterAdd: PropTypes.func.isRequired,
    onFilterRemove: PropTypes.func.isRequired,
    onSelectorClosed: PropTypes.func
};
