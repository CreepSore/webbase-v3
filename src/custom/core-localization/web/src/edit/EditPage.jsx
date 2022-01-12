// eslint-disable-next-line no-unused-vars
import React from "react";
import {SaveIcon} from "@heroicons/react/solid";

import LocalizationApi from "../LocalizationApi.js";
import Filter from "./components/FilterComponent.jsx";
import TranslationTable from "./components/TranslationEditTable.jsx";

import "./style.css";

const filterPossibilities = [
    {
        name: "All",
        value: "all",
        visible: false
    },
    {
        name: "Missing",
        value: "missing",
        visible: true
    },
    {
        name: "Set",
        value: "set",
        visible: true
    }
];

export default function EditPage() {
    let [filter, setFilter] = React.useState([filterPossibilities[0]]);
    let [missingTranslations, setMissingTranslations] = React.useState([]);
    let [allTranslations, setAllTranslations] = React.useState([]);
    let [visibleTranslations, setVisibleTranslations] = React.useState([]);
    let [saveButtonEnabled, setSaveButtonEnabled] = React.useState(false);
    let editedTranslations = React.useRef([]);

    const removeFromFilter = (id) => {
        let newFilter = filter.filter(f => f.value !== id);
        if(newFilter.length === 0) {
            newFilter = [filterPossibilities[0]];
        }
        setFilter(newFilter);
    };

    const addToFilter = (id) => {
        let newFilter = [...filter, filterPossibilities.find(p => p.value === id)];
        setFilter(newFilter.filter(f => f.value !== "all"));
    };

    const fetchData = async() => {
        let lang = [];
        await LocalizationApi.getLanguages()
            .then(data => {
                lang = data;
            });

        await LocalizationApi.getAllTranslations()
            .then(data => {
                if(!Array.isArray(data)) return;
                setAllTranslations(data);
            });

        await LocalizationApi.getMissingTranslations()
            .then(data => {
                if(!Array.isArray(data)) return;
                setMissingTranslations(data.map(key => {
                    let splitKey = key.split("::");
                    let langId = splitKey[0];
                    let transKey = splitKey[1];
                    let language = lang.find(l => l.id.toLowerCase() === langId.toLowerCase());
                    if(!language) return null;
                    return {
                        key: transKey,
                        value: "",
                        Language: {
                            name: language.name,
                            localeIdentifier: langId
                        }
                    };
                }).filter(Boolean));
            });
    };

    const onTranslationEdited = (langId, key, value) => {
        let existing = editedTranslations.current.find(t => t.key === key && t.langId === langId);
        if(existing) {
            existing.value = value;
        }
        else {
            editedTranslations.current.push({
                langId,
                key,
                value
            });
        }
        setSaveButtonEnabled(true);
    };

    const onSaveButtonClicked = () => {
        Promise.all(editedTranslations.current.map((t) => {
            return LocalizationApi.setTranslation(t.langId, t.key, t.value);
        })).then(() => {
            editedTranslations.current = [];
            setSaveButtonEnabled(false);
            fetchData();
        });
    };

    React.useEffect(() => {
        let newVisible = [];
        let filters = filter.map(f => f.value);

        if(filters.includes("set") || filters.includes("all")) {
            newVisible.push(...allTranslations.sort((a, b) => a.key.localeCompare(b.key)));
        }

        if(filters.includes("missing") || filters.includes("all")) {
            newVisible.push(...missingTranslations.sort((a, b) => a.key.localeCompare(b.key)));
        }

        setVisibleTranslations(newVisible.sort((a, b) => a.Language.localeIdentifier.localeCompare(b.Language.localeIdentifier)));
    }, [allTranslations, missingTranslations]);

    React.useEffect(() => {
        fetchData();
    }, [filter]);

    return (
        <div className="edit-page">
            <div className="edit-controls">
                <button
                    className="btn bg-green-500"
                    disabled={!saveButtonEnabled}
                    onClick={() => onSaveButtonClicked()}>
                    <p>Save</p><SaveIcon height={"1em"} width={"1em"}/>
                </button>
                <Filter
                    filter={filter}
                    filterPossibilities={filterPossibilities}
                    onFilterAdd={id => addToFilter(id)}
                    onFilterRemove={id => removeFromFilter(id)} />
            </div>

            <div className="edit-table-container">
                <TranslationTable
                    rows={visibleTranslations}
                    onTranslationEdited={(langId, key, value) => onTranslationEdited(langId, key, value)}/>
            </div>
        </div>
    );
}
