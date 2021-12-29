
export default class ProfilingApi {
    /**
     * @returns {Promise<Object<string, import("../../../../service/Profiler").Measurement[]>>}
     */
    static async fetchProfilingData() {
        let result = await fetch("/api/core.profiling/measurements")
            .then(response => response.json());

        return result.data || {};
    }
}
