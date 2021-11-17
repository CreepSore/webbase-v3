import { RequestHandler } from "express";

export type ExpressRouteWrapperOptions = {
    permissions?: string[]
    onInvalidPermissions?: RequestHandler,
    checkApiKey?: boolean,
    checkUser?: boolean
};
