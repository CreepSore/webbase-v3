/** @typedef {import("./ExpressRouteWrapper.types").ExpressRouteWrapperOptions} ExpressRouteWrapperOptions */

import ApiKeyService from "../custom/core-authentication/service/ApiKeyService.js";
import PermissionService from "../custom/core-authentication/service/PermissionService.js";
import UserService from "../custom/core-authentication/service/UserService.js";
import Exception from "../custom/core/Exception.js";

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
        // Api Key Check
        if(this.options.checkApiKey && req.query.apiKey) {
            if(
                await ApiKeyService.getApiKey(req.query.apiKey) &&
                (
                    !(await ApiKeyService.isValidApiKey(req.query.apiKey))
                    // @ts-ignore
                    || !await ApiKeyService.hasPermission(req.query.apiKey, this.options.permissions)
                )
            ) {
                return await this.options.onInvalidPermissions(req, res, next);
            }
        }

        // User check
        if(
            this.options.checkUser && (
                (
                    !res.locals.user &&
                    (await Promise.all(this.options.permissions.map(x => PermissionService.isAnonymousPermission(x)))).some(x => x === false)
                ) || (
                    res.locals.user &&
                    (await Promise.all(this.options.permissions.map(x => UserService.hasPermission(res.locals.user.id, x)))).some(x => x === false)
                )
            )
        ) {
            return await this.options.onInvalidPermissions(req, res, next);
        }

        return await this.wrapped(req, res, next);
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
