var logger = require('./logger');


var tryParseJSON = function (jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object" && o !== null) {
            return o
        }
    }
    catch (e) {
        logger.error(e)
    }
    return false
};
module.exports.tryParseJSON = tryParseJSON;


var tryParseInt = function (str) {
    var retValue = false;
    if (str) {
        if (typeof str === "number") return str;
        if (typeof str === "string" && str.length > 0) {
            if (!isNaN(str)) {
                try {
                    retValue = parseInt(str)
                }
                catch (e) {
                    logger.error(e)
                }
            }
        }
    }
    return retValue
};
module.exports.tryParseInt = tryParseInt;

var tryParseFloat = function (str) {
    var retValue = false;
    if (str) {
        if (typeof str === "number") return str;
        if (typeof str === "string" && str.length > 0) {
            if (!isNaN(str)) {
                str = str.replace(/,/, ".");
                try {
                    retValue = parseFloat(str)
                }
                catch (e) {
                    logger.error(e)
                }
            }
        }
    }
    return retValue
};
module.exports.tryParseFloat = tryParseFloat;

var tryParseString = function (str) {
    var retValue = false;
    if (str) {
        if (typeof str === "string") return str;
        try {
            retValue = String(str)
        }
        catch (e) {
            logger.error(e)
        }
    }
    return retValue
};
module.exports.tryParseString = tryParseString;

var tryParseBoolean = function (str) {
    var retValue = null;
    if (str) {
        if (typeof str === "boolean") return str;
        try {
            retValue = Boolean(str)
        }
        catch (e) {
            logger.error(e)
        }
    }
    return retValue
};
module.exports.tryParseBoolean = tryParseBoolean;

var tryParseDate = function (str) {
    var retValue = false;
    if (str && (typeof str === "object" || typeof str === "string")) {
        try {
            var d = new Date(str);
            if (!isNaN(d)) retValue = d
        }
        catch (e) {
            logger.error(e)
        }
    }
    return retValue
};
module.exports.tryParseDate = tryParseDate;

var getUserRoleForId = function (userRoleId) {
    for (var key in USER_ROLES) {
        if (USER_ROLES[key].id == userRoleId) {
            return USER_ROLES[key];
        }
    }
    logger.error("User role does not exist:", userRoleId, "helper.getUserRoleForId");
    return null;
};
exports.getUserRoleForId = getUserRoleForId;