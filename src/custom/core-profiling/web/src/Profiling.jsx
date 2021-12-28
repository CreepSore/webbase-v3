import React from "react";
import ProfilingApi from "./ProfilingApi.js";

export default class Profiling extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };
        this.fetchData();
    }

    render = () => {
        return (
            <div>
                <textarea cols={100} rows={50} value={JSON.stringify(this.state.data, null, 2)}></textarea>
            </div>
        );
    }

    fetchData = async() => {
        let data = await ProfilingApi.fetchProfilingData();
        this.setState({data});
    }
}
