import minimist from "minimist";

export type MainApplicationStartOptions = {

};

export type InstallerApplicationStartParams = {
    drop?: boolean;
    setup?: boolean;
};

export type CliApplicationStartParams = {
    parsedArgs: minimist.ParsedArgs
};
