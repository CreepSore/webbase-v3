import Exception from "../core/Exception.js";

export default {
    invalidContainer: "EORG.INVALID_CONTAINER",
    invalidItem: "EORG.INVALID_ITEM",
    invalidCodeType: "EORG.INVALID_CODE_TYPE",
    invalidSequelizeObject: "EORG.INVALID_SEQUELIZE_OBJECT",
    invalidCodeResolveType: "EORG.INVALID_CODE_RESOLVE_TYPE",
    invalidQuantityUnit: "EORG.INVALID_QUANTITY_UNIT",
    invalidArguments: "EORG.INVALID_ARGUMENTS",
    invalidAction: "EORG.INVALID_ACTION",

    construct(type = "", message = "") {
        return new Exception(message || type, {code: type});
    }
};

