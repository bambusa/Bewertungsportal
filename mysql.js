var config = require('./config');
var logger = require('./logger');

var mysql = require('mysql');
var connectionConfig = {
    host: config.configs.dbConfig.host,
    user: config.configs.dbConfig.user,
    password: config.configs.dbConfig.password,
    database: config.configs.dbConfig.database,
};
var logSql = config.configs.debugConfig.logSql;

/**
 * Open database connection once on server startup,
 * add handler in case of database disconnects that opens the connection again
 * @returns {Connection} Database connection to query on
 */
function initializeConnection() {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    logger.error(error.stack, "mysql.initializeConnection");
                    logger.info("Lost database connection. Reconnecting...", "mysql.initializeConnection");

                    initializeConnection(connectionConfig);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(connectionConfig);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}
exports.initializeConnection = initializeConnection;

/**
 * Test function if database connection is working
 */
var test = function () {
    dbConnection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
        if (err) throw err;
        console.log('The solution is: ', rows[0].solution, "mysql.test")
    });

};
exports.test = test;


/*
 SELECT
 */

/**
 * Look for user in database for given username
 * @param username for checking database
 * @param callback gets called with query result rows
 */
var selectUserForUsername = function (username, callback) {
    if (username && typeof username != "function") {
        dbConnection.query("SELECT * FROM user WHERE username = ?", [username], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.getUserForUsername");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", username, "mysql.selectUserForUsername");
                callback(null);
            } else {
                //if (logSql) logger.debug(rows[0], "mysql.getUserForUsername");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No username provided", "mysql.selectUserForUsername");
        callback(null);
    }
};
exports.selectUserForUsername = selectUserForUsername;

/**
 * Get all user roles in database
 * @param callback gets called with query result rows
 */
var selectAllUserRoles = function (callback) {
    dbConnection.query("SELECT * FROM user_role", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserRoles");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUserRoles");
            callback(null);
        } else {
            //if (logSql) logger.debug(rows, "mysql.selectAllUserRoles");
            callback(rows);
        }
    });
};
exports.selectAllUserRoles = selectAllUserRoles;

/**
 * Get all otherUsers in database, order by date, newest first
 * @param callback gets called with query result rows
 */
var selectAllUsersByDate = function (callback) {
    dbConnection.query("SELECT * FROM user ORDER BY created DESC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUsersByDate");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUsersByDate");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUsersByDate");
            callback(rows);
        }
    });
};
exports.selectAllUsersByDate = selectAllUsersByDate;

/**
 * Get all otherUsers in database, order by date, newest first
 * @param callback gets called with query result rows
 */
var selectAllUsersByName = function (callback) {
    dbConnection.query("SELECT * FROM user ORDER BY username ASC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUsersByName");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUsersByName");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUsersByName");
            callback(rows);
        }
    });
};
exports.selectAllUsersByName = selectAllUsersByName;

/**
 * Get all user groups in database
 * @param callback gets called with query result rows
 */
var selectAllUserGroupsByDate = function (callback) {
    dbConnection.query("SELECT * FROM user_group ORDER BY created DESC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserGroupsByDate");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUserGroupsByDate");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUserGroupsByDate");
            callback(rows);
        }
    });
};
exports.selectAllUserGroupsByDate = selectAllUserGroupsByDate;

/**
 * Get all user in database that are registered in the specified user group
 * @param callback gets called with query result rows
 */
var selectAllUsersInGroup = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user_in_group LEFT JOIN user ON user_in_group.user_id = user.user_id WHERE user_in_group.user_group_id = ? ORDER BY user.username ASC", [userGroupId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllUsersInGroup");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", userGroupId, "mysql.selectAllUsersInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllUsersInGroup");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectAllUsersInGroup");
        callback(null);
    }
};
exports.selectAllUsersInGroup = selectAllUsersInGroup;

/**
 * Get all user in database that are not registered in the specified user group
 * @param callback gets called with query result rows
 */
var selectAllUsersNotInGroup = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user WHERE NOT EXISTS (SELECT user_id FROM user_in_group WHERE user_in_group.user_group_id = ? AND user.user_id = user_in_group.user_id) ORDER BY user.username ASC", [userGroupId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllUsersNotInGroup");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllUsersNotInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllUsersNotInGroup");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectAllUsersInGroup");
        callback(null);
    }
};
exports.selectAllUsersNotInGroup = selectAllUsersNotInGroup;

/**
 * Look for user group in database for given id
 * @param callback gets called with query result rows
 */
var selectUserGroupForId = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user_group WHERE user_group_id = ?", [userGroupId], function (err, rows, fields) {
            logger.debug(rows, "mysql.selectUserGroupForId");
            if (err) {
                logger.error(err, "mysql.selectUserGroupForId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", rows, userGroupId, "mysql.selectUserGroupForId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserGroupForId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectUserGroupForId");
        callback(null);
    }
};
exports.selectUserGroupForId = selectUserGroupForId;

/**
 * Look for user group in database for given id
 * @param callback gets called with query result rows
 */
var selectUserGroupForName = function (name, callback) {
    if (name && typeof name != "function") {
        dbConnection.query("SELECT * FROM user_group WHERE name = ?", [name], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserGroupForId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", name, "mysql.selectUserGroupForId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserGroupForId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No name provided", "mysql.selectUserGroupForName");
        callback(null);
    }
};
exports.selectUserGroupForName = selectUserGroupForName;

/**
 * Get all user candidate entries without an email sent timestamp
 * @param callback gets called with query result rows
 */
var selectNewUserCandidates = function (callback) {
    dbConnection.query("SELECT * FROM user_candidate WHERE email_sent IS NULL AND registered = 0", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectNewUserCandidates");
            callback(null);
        } else if (rows.length == 0) {
            logger.debug("No results found", "mysql.selectNewUserCandidates");
            callback(null);
        } else {
            //if (logSql) logger.debug(rows, "mysql.selectNewUserCandidates");
            callback(rows);
        }
    });
};
exports.selectNewUserCandidates = selectNewUserCandidates;

/**
 * Get user candidate for given token
 * @param callback gets called with query result rows
 */
var selectUserCandidateForToken = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("SELECT * FROM user_candidate WHERE token = ? AND registered = 0", [token], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserCandidateForToken");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", token, "mysql.selectUserCandidateForToken");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserCandidateForToken");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.selectUserCandidateForToken");
        callback(null);
    }
};
exports.selectUserCandidateForToken = selectUserCandidateForToken;


/*
 INSERT
 */

var insertUserCandidate = function (userCandidate, callback) {
    if (userCandidate && typeof userCandidate != "function") {
        dbConnection.query("INSERT INTO user_candidate SET ?", userCandidate, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserCandidate");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserCandidate");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserCandidate");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertUserCandidate");
        callback(null);
    }
};
exports.insertUserCandidate = insertUserCandidate;

var insertUser = function (user, callback) {
    if (user && typeof user != "function") {
        dbConnection.query("INSERT INTO user SET ?", user, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUser");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUser");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUser");
                callback(results);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.insertUser");
        callback(null);
    }
};
exports.insertUser = insertUser;

var insertUserGroup = function (userGroup, callback) {
    if (userGroup && typeof userGroup != "function") {
        dbConnection.query("INSERT INTO user_group SET ?", userGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroup provided", "mysql.insertUserGroup");
        callback(null);
    }
};
exports.insertUserGroup = insertUserGroup;

var insertUserInGroup = function (userGroupId, userId, callback) {
    if (userGroupId && typeof userGroupId != "function" && userId && typeof userId != "function") {
        var userInGroup = {user_group_id: userGroupId, user_id: userId};
        dbConnection.query("INSERT INTO user_in_group SET ?", userInGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserInGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserInGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroupId or userId provided", "mysql.insertUserInGroup");
        callback(null);
    }
};
exports.insertUserInGroup = insertUserInGroup;

var insertIndicator = function (indicator, callback) {
    if (indicator && typeof indicator != "function") {
        dbConnection.query("INSERT INTO indicator SET ?", indicator, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertIndicator");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertIndicator");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertIndicator");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertIndicator");
        callback(null);
    }
};
exports.insertIndicator = insertIndicator;


/*
 DELETE
 */
var deleteUsersFromGroup = function (userGroupId, userId, callback) {
    if (userGroupId && typeof userGroupId != "function" && userId && typeof userId != "function") {
        var userInGroup = {user_group_id: userGroupId, user_id: userId};
        dbConnection.query("DELETE FROM user_in_group WHERE ?", userInGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.deleteUserFromGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got deleted", results, "mysql.deleteUsersFromGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.deleteUsersFromGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroupId or userId provided", "mysql.deleteUsersFromGroup");
        callback(null);
    }
};
exports.deleteUsersFromGroup = deleteUsersFromGroup;


/*
 UPDATE
 */

/**
 * Update user candidate with email sent timestamp
 * @param token of the user candidate
 * @param callback gets called with query result rows
 */
var updateUserCandidateSent = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("UPDATE user_candidate SET email_sent = FROM_UNIXTIME(?) WHERE token = ?", [Math.floor(Date.now() / 1000), token], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserCandidateSent");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserCandidateSent");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserCandidateSent");
                callback(results);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.updateUserCandidateSent");
        callback(null);
    }
};
exports.updateUserCandidateSent = updateUserCandidateSent;

var updateUserGroup = function (userGroup, callback) {
    if (userGroup && typeof userGroup != "function") {
        dbConnection.query("UPDATE user_group SET ?", userGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserGroup");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroup provided", "mysql.updateUserGroup");
        callback(null);
    }
};
exports.updateUserGroup = updateUserGroup;


/**
 * Update user candidate with registered is true
 * @param token of the user candidate
 * @param callback gets called with query result rows
 */
var updateUserCandidateRegistered = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("UPDATE user_candidate SET registered = 1 WHERE token = ?", [token], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserCandidateRegistered");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserCandidateRegistered");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserCandidateRegistered");
                callback(results);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.updateUserCandidateRegistered");
        callback(null);
    }
};
exports.updateUserCandidateRegistered = updateUserCandidateRegistered;


/*
 MIDDLEWARE
 */

/**
 * Middleware function
 * Look for user row in database for given username
 * @param req express framework request object
 * @param res express framework response object
 * @param next express framework next function if used as middleware
 * @param username for checking database
 * @param callback gets called with query result rows
 */
var getUserForUsername = function (req, res, next, username, callback) {
    selectUserForUsername(username, function (user) {
        callback(req, res, next, user);
    });
};
exports.getUserForUsername = getUserForUsername;


/*
 OTHER
 */

/**
 * Get the user and user group specific data for the start page
 * @param user authenticated user object
 * @param callback gets called with query result rows
 */
var getStartPageData = function (user, callback) {
    if (user) {
        switch (user.user_role_id) {
            case userRoles.admin.id:
                selectAllUsersByDate(function (users) {
                    selectAllUserGroupsByDate(function (userGroups) {
                        var groupData = {users: users, userGroups: userGroups};
                        if (logSql) logger.debug(groupData, "mysql.getStartPageData");
                        callback(groupData);
                    });
                });
                break;

            default:
                callback(null);
                break;
        }
    }
    else {
        callback(null);
    }
};
exports.getStartPageData = getStartPageData;