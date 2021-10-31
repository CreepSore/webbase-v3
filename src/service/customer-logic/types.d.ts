"use strict";

import express from "express";
import { Sequelize } from "sequelize/types";
import CommandHandler from "../command-handler/CommandHandler.js";
import KvpStorage from "../KvpStorage.js";

export type CustomerLogicDependencies = {
    sharedObjects: Map<string, any>,
    storage: KvpStorage,
    extensionsPath: string
};

export type StartCliApplicationParams = {
    commandHandler: CommandHandler
};

export type SequelizeParams = {
    sequelize: Sequelize
};

export type ExpressParams = {
    app: express.Application
};
