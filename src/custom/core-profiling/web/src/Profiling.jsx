import React from "react";
import * as IconsSolid from "@heroicons/react/solid";

import ProfilingApi from "./ProfilingApi.js";
import ProfilingGroupsTable from "./ProfilingGroupsTable.jsx";
import "./profiling.css";
import ProfilingMeasurementsTable from "./ProfilingMeasurementsTable.jsx";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
import {Bar} from "react-chartjs-2";

export default class Profiling extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            keys: [],
            selectedEntry: null,
            measurements: null,
            selectedMeasurement: null,
            selectedMeasurementText: "",
            selectedMeasurementTextLines: 0
        };
        this.fetchData();
        this.chartRef = React.createRef();
    }

    render = () => {
        let canvas = this.chartRef.current?.canvas;
        if(canvas) {
            canvas.style.backgroundColor = "rgb(255,255,255)";
        }
        return (
            <div className="profiling">
                <div hidden={this.state.measurements !== null}>
                    <div className="profiling-charts-container">
                        <div className="profiling-chart">
                            <Bar
                                ref={this.chartRef}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            axis: "y",
                                            suggestedMax: 20
                                        }
                                    },
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                afterLabel: (ti) => {
                                                    let data = this.chartEntries[ti.dataIndex];
                                                    return `\n${data.key}`;
                                                }
                                            }
                                        }
                                    }
                                }}
                                data={{
                                    labels: this.chartDateLabels,
                                    datasets: [
                                        {
                                            label: "Execution Time",
                                            data: this.chartData,
                                            borderColor: "rgba(255, 0, 0, 1)",
                                            borderWidth: 1,
                                            backgroundColor: "rgba(255, 0, 0, 0.3)",
                                            barPercentage: 0.3
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </div>
                    <ProfilingGroupsTable
                        keys={this.state.keys}
                        onRowClick={e => this.onGroupsRowClick(e)}></ProfilingGroupsTable>
                </div>

                <div hidden={this.state.measurements === null}>
                    <div className="min-h-4 min-w-full py-2 px-2 bg-slate-500 flex justify-between">
                        <IconsSolid.BackspaceIcon
                            className="w-8 h-8 text-gray-50 hover:text-gray-200 cursor-pointer"
                            onClick={() => this.onBackClick()}/>
                        <h1>{this.state.selectedEntry}</h1>
                    </div>

                    <div className="w-100 flex justify-center items-center">
                        <div className="max-h-full" hidden={this.state.selectedMeasurement === null}>
                            <textarea
                                className="text-black font-mono"
                                cols={80}
                                rows={this.state.selectedMeasurementTextLines}
                                value={this.state.selectedMeasurementText} readOnly></textarea>
                        </div>
                    </div>

                    <div hidden={this.state.selectedMeasurement !== null}>
                        <ProfilingMeasurementsTable
                            entries={this.state.measurements}
                            onRowClick={m => this.onMeasurementRowClick(m)}/>
                    </div>
                </div>
            </div>
        );
    }

    onBackClick = () => {
        if(this.state.selectedMeasurement !== null) {
            this.setState({selectedMeasurement: null});
        }
        else {
            this.setState({measurements: null, selectedEntry: null, selectedMeasurement: null});
        }
    }

    onGroupsRowClick = (entryGroup) => {
        this.setState({
            selectedEntry: entryGroup,
            measurements: this.state.data[entryGroup]
        });
    }

    onMeasurementRowClick = (measurement) => {
        let dataText = JSON.stringify(measurement.additionalData, null, 2);
        let dataLines = dataText.split("\n").length;

        this.setState({
            selectedMeasurement: measurement,
            selectedMeasurementText: dataText,
            selectedMeasurementTextLines: dataLines
        });
    }

    get chartDateLabels() {
        return this.chartEntries.map(entry => new Date(entry.startTime));
    }

    get chartData() {
        return this.chartEntries.map(entry => entry.duration);
    }

    get chartEntries() {
        // eslint-disable-next-line no-unused-vars
        return (Object.entries(this.state.data) || []).map(([k, v]) => {
            v.forEach(x => {x.key = k;});
            return v;
        }).flat();
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
