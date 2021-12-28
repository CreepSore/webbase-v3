
export default class ProfilingApi {
    /**
     * @returns {Promise<import("../../../../service/Profiler").Measurement[]>}
     */
    static async fetchProfilingData() {
        let result = await fetch("/api/profiling/")
            .then(response => response.json());

        return result.data || [];
    }
}
