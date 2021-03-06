import fs from "fs";
import path from "path";

export default class ConfigModel {
    constructor(generateDefault = false) {
        if(generateDefault) {
            this.web = {
                host: "localhost",
                port: 1325,
                sessionSecret: "" // leave empty for random one
            };

            this.db = {
                type: "sqlite", // see below
                logging: false,
                sqlite: {
                    file: "storage.db"
                },
                mariadb: { // or mysql
                    host: "localhost",
                    port: "3306",
                    user: "root",
                    password: "",
                    database: "storage"
                }
            };

            this.mail = {
                host: "localhost",
                port: 25,
                user: "",
                password: "",
                alerts: {
                    enabled: false,
                    from: "",
                    subject: "",
                    recipients: []
                }
            };

            this.utils = {
                runProfiling: false,
                unicodeLogging: true
            };

            this.extensions = {};
        }
    }

    static get configPath() {
        return path.resolve(".", "config.json");
    }

    static get templatePath() {
        return path.resolve(".", "config.template.json");
    }

    static import(sourcePath) {
        return JSON.parse(String(fs.readFileSync(sourcePath)));
    }

    static exportModel(targetPath, model) {
        fs.writeFileSync(targetPath, JSON.stringify(model, null, 4));
    }

    static exportDefault(targetPath) {
        let defaultModel = new ConfigModel(true);
        this.exportModel(targetPath, defaultModel);
    }
}
