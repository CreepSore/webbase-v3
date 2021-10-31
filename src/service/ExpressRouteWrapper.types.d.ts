import { RequestHandler } from "express";

export type ExpressRouteWrapperOptions = {
    permissions?: string[]
    onInvalidPermissions?: RequestHandler
};
