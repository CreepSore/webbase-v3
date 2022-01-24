/** @typedef {import("./ExpressRouteWrapper.types").ExpressRouteWrapperOptions} ExpressRouteWrapperOptions */

import ApiKeyService from "../custom/core-authentication/service/ApiKeyService.js";
import PermissionService from "../custom/core-authentication/service/PermissionService.js";
import UserService from "../custom/core-authentication/service/UserService.js";
import Exception from "../custom/core/Exception.js";
import Profiler from "./Profiler.js";

export default class ExpressRouteWrapper {
    /**
     * @param {import("express").RequestHandler} callback
     * @param {ExpressRouteWrapperOptions} options
     */
    constructor(callback, options = {}) {
        this.options = options;
        this.options.permissions ??= [];
        this.options.onInvalidPermissions ??= function(req, res) {
            res.json({success: false, error: new Exception("Invalid Permissions", {code: "CORE.API.INVALID_PERMISSIONS"})});
        };
        this.options.checkApiKey ??= true;
        this.options.checkUser ??= true;
        this.wrapped = callback;
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    wrapper = async(req, res, next) => {
        let profilingToken = null;
        if(this.options.profilingName) {
            profilingToken = Profiler.instance.startMeasurement(this.options.profilingName);
        }
        else {
            profilingToken = Profiler.instance.startMeasurement(req.originalUrl);
        }
        // Api Key Check
        if(this.options.checkApiKey && req.query.apiKey) {
            let decodedApiKey = decodeURIComponent(String(req.query.apiKey));
            let apiKey = null;
            try {
                apiKey = await ApiKeyService.getApiKey(decodedApiKey);
            }
            catch { /** Ignore */}
            if(
                apiKey &&
                (
                    !(await ApiKeyService.isValidApiKey(decodedApiKey))
                    // @ts-ignore
                    || (await Promise.all(this.options.permissions.map(perm => ApiKeyService.hasPermission(decodedApiKey, perm)))).some(p => !Boolean(p))
                )
            ) {
                return await this.options.onInvalidPermissions(req, res, next);
            }
        }
        else {
            let hasAnonymPerm = !res.locals.user && (await Promise.all(this.options.permissions.map(x => PermissionService.isAnonymousPermission(x)))).some(x => x === false);
            let hasPerm = res.locals.user && (await Promise.all(this.options.permissions.map(x => UserService.hasPermission(res.locals.user.id, x)))).some(x => x === false);
            // User check
            if(
                this.options.checkUser && (hasAnonymPerm || hasPerm)
            ) {
                return await this.options.onInvalidPermissions(req, res, next);
            }
        }


        let result = await this.wrapped(req, res, next);
        Profiler.instance.endMeasurement(profilingToken);
        return result;
    }

    /**
     * @param {import("express").RequestHandler} callback
     * @param {ExpressRouteWrapperOptions} options
     */
    static create(callback, options = {}) {
        let wrapper = new ExpressRouteWrapper(callback, options);
        return wrapper.wrapper;
    }
}
