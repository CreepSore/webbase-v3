import React from "react";
import PropTypes from "prop-types";
import "./profiling.css";

export default class ProfilingMeasurementsTable extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <div className="profiling-table-container">
                <table className="profiling-table">
                    <thead>
                        <tr>
                            <th scope="col">id</th>
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
                                    <th scope="row">{entry.id}</th>
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
        );
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
