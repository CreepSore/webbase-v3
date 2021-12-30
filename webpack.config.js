import path from "path";

import {merge as webpackMerge} from "webpack-merge";

import CustomerLogicFactory from "./src/service/customer-logic/CustomerLogicFactory.js";


const staticPath = path.resolve(".", "src", "web", "static", "js");

const defaultPaths = {
    staticPath,
    pluginPath: CustomerLogicFactory.getCustomerLogicPath()
};

const getDefaultConfig = function() {
    return {
        entry: {
            regeneratorRuntime: "regenerator-runtime/runtime"
        },
        output: {
            path: staticPath,
            filename: "[name].comp.js"
        },
        devtool: "inline-source-map",
        resolve: {
            extensions: [".js", ".jsx"]
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/i,
                    exclude: /(node_modules|bower_components)/,
                    loader: "babel-loader",
                    options: { presets: ["@babel/env"] }
                },
                { test: /\.(css)$/i, use: ["style-loader", "css-loader", "postcss-loader"] }
            ]
        },
        plugins: [ ]
    };
};

export default async(env, options) => {
    process.env.NODE_ENV = options.mode;
    let config = getDefaultConfig();
    let customerLogicHandler = await CustomerLogicFactory.createAndInitializeCustomerLogicHandler(false);

    for(let customerLogic of customerLogicHandler.sortedCustomerLogic) {
        let result = await customerLogicHandler.runCustomerLogicFunction(customerLogic, "getWebpackConfig", {paths: defaultPaths});
        if(!result) continue;

        config = webpackMerge(config, result);
    }

    return config;
};
