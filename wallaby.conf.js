"use strict";

// eslint-disable-next-line no-unused-vars
module.exports = function(wallaby) {
    return {
        files: [
            "src/**/*.js",
            "!src/**/web/static/**/*"
        ],
        tests: [
            "test/**/*.js"
        ],
        env: {
            type: "node"
        }
    };
};
