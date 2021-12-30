import React from "react";
import PropTypes from "prop-types";

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

import "./profiling.css";

export default class ProfilingMeasurementsTable extends React.PureComponent {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
    }

    render = () => {
        let canvas = this.chartRef.current?.canvas;
        if(canvas) {
            canvas.style.backgroundColor = "rgb(255,255,255)";
        }

        return (
            <div>
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
                <div className="profiling-table-container">
                    <table className="profiling-table">
                        <thead>
                            <tr>
                                <th scope="col" className="hidden md:table-cell">id</th>
                                <th scope="col">Start-Time</th>
                                <th scope="col">End-Time</th>
                                <th scope="col">Total Duration</th>
                                <th scope="col">Additional Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(this.props.entries || []).map(entry => {
                                return (
                                    <tr key={entry.id}
                                        className="cursor-pointer"
                                        onClick={() => this.props.onRowClick(entry)}>
                                        <th className="hidden md:table-cell" scope="row">{entry.id}</th>
                                        <td>{new Date(entry.startTime).toLocaleString()}</td>
                                        <td>{new Date(entry.endTime).toLocaleString()}</td>
                                        <td>{entry.duration}ms</td>
                                        <td>{JSON.stringify(entry.additionalData)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    get chartDateLabels() {
        return this.chartEntries.map(entry => new Date(entry.startTime));
    }

    get chartData() {
        return this.chartEntries.map(entry => entry.duration);
    }

    get chartEntries() {
        return this.props.entries || [];
    }

    static get propTypes() {
        return {
            entries: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string.isRequired,
                startTime: PropTypes.number.isRequired,
                endTime: PropTypes.number,
                duration: PropTypes.number,
                additionalData: PropTypes.object
            })),
            onRowClick: PropTypes.func
        };
    }
}
