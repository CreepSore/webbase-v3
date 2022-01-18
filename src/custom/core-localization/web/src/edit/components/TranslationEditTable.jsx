// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import PropTypes from "prop-types";

export default function TranslationEditTable({rows, onTranslationEdited}) {
    let [filteredRows, setFilteredRows] = React.useState([]);
    let [languageFilter, setLanguageFilter] = React.useState("all");
    let [keyFilter, setKeyFilter] = React.useState("");
    let [valueFilter, setValueFilter] = React.useState("");
    let languages = React.useRef([]);

    useEffect(() => {
        languages.current = [];
        rows.forEach(row => {
            if(languages.current.find(l => l.name === row.Language.name)) return;
            languages.current.push(row.Language);
        });

        setFilteredRows(rows.filter(row =>
            (languageFilter === "all" || row.Language.name === languageFilter) &&
            (keyFilter === "" || row.key.toLowerCase().includes(keyFilter.toLowerCase())) &&
            (valueFilter === "" || row.value.toLowerCase().includes(valueFilter.toLowerCase()))
        ));
    }, [rows, languageFilter, keyFilter, valueFilter]);

    return (
        <>
            <table className="edit-table">
                <thead>
                    <tr>
                        <th scope="col">Language</th>
                        <th scope="col">Key</th>
                        <th scope="col"></th>
                    </tr>
                    <tr>
                        <td>
                            <select onChange={(e) => setLanguageFilter(e.target.value)}>
                                <option value="all">All</option>
                                {languages.current.map(language => {
                                    return (
                                        <option key={language.id} value={language.name}>{language.name}</option>
                                    );
                                })}
                            </select>
                        </td>
                        <td><input type="text" onChange={(e) => setKeyFilter(e.target.value)}/></td>
                        <td><input type="text" onChange={(e) => setValueFilter(e.target.value)}/></td>
                    </tr>
                </thead>
                <tbody>
                    {filteredRows.map(row => {
                        return (
                            <tr key={`${row.Language.localeIdentifier}:${row.key}`}>
                                <th scope="row">{row.Language.name}</th>
                                <th scope="row">{row.key}</th>
                                <td><input
                                    type="text"
                                    defaultValue={row.value}
                                    onChange={(e) => onTranslationEdited(row.Language.localeIdentifier, row.key, e.target.value)}/></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}

TranslationEditTable.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        key: PropTypes.string.isRequired,
        value: PropTypes.string,
        createdAt: PropTypes.any,
        updatedAt: PropTypes.any,
        LanguageId: PropTypes.string,
        Language: PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string.isRequired,
            localeIdentifier: PropTypes.string.isRequired,
            createdAt: PropTypes.any,
            updatedAt: PropTypes.any
        })
    })).isRequired,
    onTranslationEdited: PropTypes.func.isRequired
};
