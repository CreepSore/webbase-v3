import React from "react";
import * as IconsSolid from "@heroicons/react/solid";
import Editor from "@monaco-editor/react";

import ProfilingApi from "./ProfilingApi.js";
import SelectorList from "./SelectorList.jsx";
import "./profiling.css";

export default function Profiling() {
    const [profilingData, setData] = React.useState([]);
    const [entries, setEntries] = React.useState([]);
    const [selectedEntry, setSelectedEntry] = React.useState(null);

    React.useEffect(() => {
        (async() => {
            let isEnabled = await ProfilingApi.getIsEnabled();
            if(!isEnabled) {
                location.href = "/";
            }

            let newData = await ProfilingApi.fetchProfilingData();
            let convertedData = Object.entries(newData)
                .map(([key, value]) => {
                    return {
                        key,
                        data: value.filter(entry => Boolean(entry.endTime))
                    };
                }).filter(entry => entry.data.length > 0)
                .sort((a, b) => a.key.localeCompare(b.key));
            setData(convertedData);
        })();
    }, []);

    return (
        <div className="profiling">
            <div className="profiling-bar">
                <div className="logo">
                    <span>
                        <IconsSolid.ChartBarIcon height={32} width={32} className="text-white ml-2 inline" />
                        <h1 className="inline">Profiling</h1>
                    </span>
                </div>
            </div>

            <div className="profiling-container">
                <div className="profiling-container-col">
                    <SelectorList
                        arrowType={"right"}
                        onSelectionChanged={(key) => {setEntries(profilingData.find(entry => entry.key === key).data);}}
                        entries={profilingData.map(d => {return {key: d.key, label: d.key};})}></SelectorList>
                </div>

                <div className="profiling-container-col">
                    <SelectorList
                        arrowType={"right"}
                        onSelectionChanged={(key) => setSelectedEntry(entries.find(e => e.id === key))}
                        entries={entries.map(d => {return {key: d.id, label: `${d.duration} ms`};})}></SelectorList>
                </div>

                <div className="profiling-container-col">
                    <div className="h-full" hidden={!Boolean(selectedEntry)}>
                        <Editor
                            height={`${JSON.stringify(selectedEntry?.additionalData || {}, null, 2).split("\n").length + 10}rem`}
                            value={JSON.stringify(selectedEntry?.additionalData || {}, null, 2)}
                            options={{readOnly: true}}
                            language="json"/>
                    </div>
                </div>
            </div>
        </div>
    );
}
