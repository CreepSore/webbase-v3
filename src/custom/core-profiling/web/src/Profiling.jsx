import React from "react";
import * as IconsSolid from "@heroicons/react/solid";
import Editor from "@monaco-editor/react";

import ProfilingApi from "./ProfilingApi.js";
import "./profiling.css";

export default class Profiling extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            keys: [],
            selectedEntry: null,
            measurements: null,
            measurement: null
        };
        this.fetchData();
    }

    render = () => {
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
                        <div className="profiling-table-container">
                            <table className="profiling-table font-[Roboto Mono]">
                                <tbody>
                                    {this.measurementGroups.map(group => (
                                        <tr
                                            key={group}
                                            className="cursor-pointer"
                                            onClick={() => this.setMeasurements(group)}>
                                            <td>{group}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="profiling-container-col">
                        <div className="profiling-table-container">
                            <table className="profiling-table font-[Roboto Mono]">
                                <tbody>
                                    {(this.state.measurements || []).map(measurement => {
                                        return (
                                            <tr
                                                key={measurement.id}
                                                className="cursor-pointer"
                                                onClick={() => this.setMeasurement(measurement)}>
                                                <td>{measurement.duration} ms</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="profiling-container-col">
                        <div hidden={!Boolean(this.state.measurement?.additionalData)}>
                            <Editor
                                height={`${this.monacoText.split("\n").length + 10}rem`}
                                value={this.monacoText}
                                options={{readOnly: true}}
                                language="json"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    setMeasurement = (measurement) => {
        this.setState({measurement});
    }

    setMeasurements = (measurementKey) => {
        this.setState({measurements: this.state.data[measurementKey], measurement: null});
    }

    get monacoText() {
        if(!this.state.measurement) return "";
        return JSON.stringify(this.state.measurement?.additionalData, null, 2);
    }

    get measurementGroups() {
        return Object.keys(this.state.data || {});
    }

    fetchData = async() => {
        let isEnabled = await ProfilingApi.getIsEnabled();
        if(!isEnabled) {
            location.href = "/";
        }

        let data = await ProfilingApi.fetchProfilingData();
        this.setState({data, keys: Object.entries(data).map(([k, v]) => {return {name: k, count: v.length};})});
    }
}
