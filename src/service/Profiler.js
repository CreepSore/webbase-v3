import * as uuid from "uuid";

import KvpStorage from "./KvpStorage.js";

export class Measurement {
    constructor(additionalData = {}) {
        this.id = uuid.v4();
        this.startTime = Date.now();
        this.additionalData = additionalData;
    }

    end() {
        this.endTime = Date.now();
        this.duration = this.endTime - this.startTime;
    }
}

export default class Profiler {
    static #instance;
    /** @type {Profiler} */
    static get instance() {
        return this.#instance || (this.#instance = new Profiler());
    }

    constructor() {
        /** @type {Map<string, Array<Measurement>>} */
        this.measurements = new Map();
    }

    get measurementList() {
        let result = {};
        for(let [name, measurements] of this.measurements) {
            result[name] = measurements;
        }

        return result;
    }

    measureRuntime(name, executingFunction) {
        if(!KvpStorage.instance.wrapper.getConfig().utils.runProfiling) {
            return executingFunction();
        }

        let id = this.startMeasurement(name);
        let result = executingFunction();
        if(result.then) {
            result.then(() => this.endMeasurement(id));
        }
        else {
            this.endMeasurement(id);
        }

        return result;
    }

    getMeasurementCount(name) {
        return this.measurements.get(name).length;
    }

    getMeasurementById(id) {
        return [...this.measurements.entries()].map(x => x[1]).flat().find(x => x.id === id);
    }

    addMeasurementData(id, data) {
        let measurement = this.getMeasurementById(id);
        if(!measurement) return this;
        Object.entries(data).forEach(([key, value]) => {
            measurement.additionalData[key] = value;
        });
        return this;
    }

    startMeasurement(name, additionalData) {
        if(!KvpStorage.instance.wrapper.getConfig().utils.runProfiling
        || name === null) {
            return null;
        }

        if(!this.measurements.has(name)) {
            this.measurements.set(name, []);
        }
        let measurement = new Measurement(additionalData);
        this.measurements.get(name).push(measurement);
        return measurement.id;
    }

    endMeasurement(id) {
        if(!KvpStorage.instance.wrapper.getConfig().utils.runProfiling
        || id === null) {
            return;
        }

        // eslint-disable-next-line no-unused-vars
        let measurement = [...this.measurements.entries()].map(x => x[1]).flat().find(x => x.id === id);
        if(!measurement) return;

        measurement.end();
    }
}
