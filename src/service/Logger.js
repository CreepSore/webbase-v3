const linuxTerminalColors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    fgblack: "\x1b[30m",
    fgred: "\x1b[31m",
    fggreen: "\x1b[32m",
    fgyellow: "\x1b[33m",
    fgblue: "\x1b[34m",
    fgmagenta: "\x1b[35m",
    fgcyan: "\x1b[36m",
    fgwhite: "\x1b[37m",
    bgblack: "\x1b[40m",
    bgred: "\x1b[41m",
    bggreen: "\x1b[42m",
    bgyellow: "\x1b[43m",
    bgblue: "\x1b[44m",
    bgmagenta: "\x1b[45m",
    bgcyan: "\x1b[46m",
    bgwhite: "\x1b[47m"
};

const logLevelMapping = {
    INFO: {date: `${linuxTerminalColors.bgblue}${linuxTerminalColors.fgwhite}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgblue}`},
    WEBINFO: {date: `${linuxTerminalColors.bgblue}${linuxTerminalColors.fgwhite}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgblue}`},
    ERROR: {date: `${linuxTerminalColors.bgred}${linuxTerminalColors.fgwhite}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgred}`},
    WARN: {date: `${linuxTerminalColors.bgyellow}${linuxTerminalColors.fgblack}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgyellow}`},
    CRITICAL: {date: `${linuxTerminalColors.bgred}${linuxTerminalColors.fgwhite}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgred}`},
    SQL: {date: `${linuxTerminalColors.bgyellow}${linuxTerminalColors.fgblack}`, text: `${linuxTerminalColors.reset}${linuxTerminalColors.fgyellow}`}
};

const logLevelUnicodeMapping = {
    INFO: "i",
    WEBINFO: "🌐",
    ERROR: "E",
    WARN: "!",
    CRITICAL: "🚨",
    SQL: "🔎"
};

export default class Logger {
    static formatToUnicode = true;
    static loggedEntries = [];

    static getFormattedLog(level, ...data) {
        let color = null;
        if(data.length > 0 && level) {
            color = logLevelMapping[String(level).toUpperCase()];
        }

        let toPrint = data;
        if(data.length === 0) toPrint = [level];

        let formattedLevel = data.length !== 0 && level ? `[${level.toUpperCase().padStart(8, " ")}]` : "";
        if(this.formatToUnicode && logLevelUnicodeMapping[String(level).toUpperCase()]) formattedLevel = ` ${logLevelUnicodeMapping[String(level).toUpperCase()]} `;

        toPrint = toPrint.join(" ").split("\n").map(x => {
            return `${color ? color.date : ""}[${new Date().toISOString()}]${formattedLevel}${color ? color.text : ""} ${x}${linuxTerminalColors.reset}`;
        });

        return toPrint.join("\n");
    }

    static doLog(level, ...data) {
        if(this.loggedEntries.length > 1000) this.loggedEntries = this.loggedEntries.slice(0, 1000);
        this.loggedEntries.push(Logger.getFormattedLog(level, ...data));
    }

    static replaceConsoleLog() {
        this.originalLog = console.log;
        let {originalLog} = this;
        console.log = (level, ...data) => {
            originalLog(Logger.getFormattedLog(level, ...data));
            this.doLog(level, ...data);
        };
    }

    static restoreConsoleLog() {
        console.log = this.originalLog;
    }
}

