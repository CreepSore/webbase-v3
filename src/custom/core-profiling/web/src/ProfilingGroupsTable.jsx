import React from "react";
import PropTypes from "prop-types";
import "./profiling.css";

export default class ProfilingGroupsTable extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <div className="profiling-table-container">
                <table className="profiling-table">
                    <thead>
                        <tr>
                            <th scope="col">Group Name</th>
                            <th scope="col">Entries</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(this.props.keys || []).map(entry => {
                            return (
                                <tr
                                    className="cursor-pointer"
                                    key={entry.name}
                                    onClick={() => this.props.onRowClick?.(entry.name)}>
                                    <th scope="row">{entry.name}</th>
                                    <td>{entry.count}</td>
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
            keys: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired
            })).isRequired,
            onRowClick: PropTypes.func
        };
    }
}
