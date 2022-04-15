// eslint-disable-next-line no-unused-vars
export default function(wallaby) {
    return {
        files: [
            "config.json",
            "package.json",
            "src/**/*.js",
            "src/**/*.json",
            "!src/**/web/static/**/*"
        ],
        tests: [
            "test/**/*.js"
        ],
        env: {
            type: "node",
            params: {
                runner: "--experimental-vm-modules"
            }
        },
        symlinkNodeModules: true,
        workers: {restart: true}
    };
};
