// eslint-disable-next-line no-unused-vars
import React from "react";
import {useEffect, useState} from "react";
import {CheckIcon, XIcon} from "@heroicons/react/solid";

import "./style.css";

export default function ExtensionsPage() {
    let [extensions, setExtensions] = useState([]);

    useEffect(() => {
        fetch("/api/core.dashboard/extensions")
            .then(response => response.json())
            .then(data => {
                setExtensions(data
                    .sort((a) => a.dependencies.additionalDependencies.metadata.name.startsWith("Core") ? -1 : 1)
                    .sort((a, b) => a.dependencies.additionalDependencies.metadata.name.localeCompare(b.dependencies.additionalDependencies.metadata.name)));
            });
    }, []);


    return (
        <div className="extensions-container">
            <div className="table-container">
                <table className="extensions-table">
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Dependencies</td>
                            <td>Npm Dependencies</td>
                            <td>Enabled</td>
                        </tr>
                    </thead>
                    <tbody>
                        {extensions.map(extension => {
                            let rows = {};
                            let meta = extension.dependencies.additionalDependencies.metadata;
                            return (
                                <tr key={meta.name} className={`${meta.enabled === false ? "disabled" : ""}`} data-name={meta.name}>
                                    <td>
                                        <div
                                            className="cursor-pointer"
                                            onMouseEnter={() => {
                                                let deps = extensions
                                                    .filter(e => (e.dependencies.additionalDependencies.metadata.dependencies || []).includes(meta.name))
                                                    .map(d => document.querySelector(`tr[data-name="${d.dependencies.additionalDependencies.metadata.name}"]`))
                                                    .filter(Boolean);
                                                deps.forEach(d => d.classList.add("selected"));
                                            }}
                                            onMouseLeave={() => {
                                                let deps = extensions
                                                    .filter(e => (e.dependencies.additionalDependencies.metadata.dependencies || []).includes(meta.name))
                                                    .map(d => document.querySelector(`tr[data-name="${d.dependencies.additionalDependencies.metadata.name}"]`))
                                                    .filter(Boolean);
                                                deps.forEach(d => d.classList.remove("selected"));
                                            }}>{meta.name}</div>
                                    </td>
                                    <td className="flex gap-4 flex-row">
                                        {(meta.dependencies || []).map(ext => {
                                            let row = rows[ext];
                                            if (!row) {
                                                row = rows[ext] = document.querySelector(`tr[data-name="${ext}"]`);
                                            }
                                            return (<div key={ext}
                                                className="cursor-pointer"
                                                onMouseEnter={() => {
                                                    row = rows[ext];
                                                    if (!row) {
                                                        row = rows[ext] = document.querySelector(`tr[data-name="${ext}"]`);
                                                    }
                                                    row?.classList?.add?.("selected");
                                                }}
                                                onMouseLeave={() => {
                                                    row = rows[ext];
                                                    if (!row) {
                                                        row = rows[ext] = document.querySelector(`tr[data-name="${ext}"]`);
                                                    }
                                                    row?.classList?.remove?.("selected");
                                                }}>{ext}
                                            </div>);
                                        })}
                                    </td>
                                    <td>{(meta.npmDependencies || []).join(", ")}</td>
                                    <td>
                                        {meta.enabled === false ? <XIcon height={"1em"} style={{display: "inline"}}/> : <CheckIcon height={"1em"} style={{display: "inline"}} />}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
