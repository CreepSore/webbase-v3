import path from "path";

import {merge as webpackMerge} from "webpack-merge";

import CustomerLogicFactory from "./src/service/customer-logic/CustomerLogicFactory.js";


const staticPath = path.resolve(".", "src", "web", "static");
const pagesPath = path.resolve(staticPath, "js", "pages");
const compiledPath = path.resolve(staticPath, "js", "compiled");

const defaultPaths = {
    staticPath,
    pagesPath,
    compiledPath,
    pluginPath: CustomerLogicFactory.getCustomerLogicPath()
};

const getDefaultConfig = function() {
    return {
        entry: {
            regeneratorRuntime: "regenerator-runtime/runtime"
        },
        output: {
            path: compiledPath,
            filename: "[name].js"
        },
        devtool: "inline-source-map",
        resolve: {
            extensions: [".js", ".jsx"]
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: "babel-loader",
                    options: { presets: ["@babel/env"] }
                },
                { test: /\.css$/, use: ["vue-style-loader", "css-loader"] }
            ]
        },
        plugins: [ ]
    };
};

export default async() => {
    let config = getDefaultConfig();
    let customerLogicHandler = await CustomerLogicFactory.createAndInitializeCustomerLogicHandler(false);

    for(let customerLogic of customerLogicHandler.sortedCustomerLogic) {
        let result = await customerLogicHandler.runCustomerLogicFunction(customerLogic, "getWebpackConfig", {paths: defaultPaths});
        if(!result) continue;

        config = webpackMerge(config, result);
    }

    return config;
};
