let tailwindcss = require("tailwindcss");
let tailwindNesting = require("tailwindcss/nesting");

module.exports = {
    plugins: [
        "postcss-preset-env",
        tailwindNesting,
        tailwindcss
    ]
};
