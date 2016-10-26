var config = require('./config');
var logger = require('./logger');

var mysql = require('mysql');
var connectionConfig = {
    host: config.configs.dbConfig.host,
    user: config.configs.dbConfig.user,
    password: config.configs.dbConfig.password,
    database: config.configs.dbConfig.database,
};
var consoleLog = config.configs.debugConfig.logSql;

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
var test = function() {
    dbConnection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
        if (err) throw err;
        console.log('The solution is: ', rows[0].solution, "mysql.test")
    });

};
exports.test = test;

/**
 * Look for user row in database for given username
 * @param req express framework request object
 * @param res express framework response object
 * @param next express framework next function if used as middleware
 * @param username for checking database
 * @param callback gets called with query result rows
 */
var selectUserForUsername = function(req, res, next, username, callback) {
    dbConnection.query("SELECT * FROM user WHERE username = ?", [username], function(err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectUserForUsername");
            callback(req, res, next, null);
        }
        else {
            if (consoleLog) logger.debug(rows[0], "mysql.selectUserForUsername");
            callback(req, res, next, rows[0]);
        }
    });
};
exports.selectUserForUsername = selectUserForUsername;

/**
 * Get all user roles in database
 * @param callback gets called with query result rows
 */
var selectAllUserRoles = function(callback) {
    dbConnection.query("SELECT * FROM user_role", function(err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserRoles");
            callback(null);
        }
        else {
            if (consoleLog) logger.debug(rows, "mysql.selectAllUserRoles");
            callback(rows);
        }
    });
};
exports.selectAllUserRoles = selectAllUserRoles;

/**
 * Get all users in database
 * @param callback gets called with query result rows
 */
var selectAllUsers = function(callback) {
    dbConnection.query("SELECT * FROM user ORDER BY created DESC", function(err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUsers");
            callback(null);
        }
        else {
            if (consoleLog) logger.debug(rows, "mysql.selectAllUsers");
            callback(rows);
        }
    });
};
exports.selectAllUsers = selectAllUsers;

/**
 * Get all user groups in database
 * @param callback gets called with query result rows
 */
var selectAllUserGroups = function(callback) {
    dbConnection.query("SELECT * FROM user_group ORDER BY created DESC", function(err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserGroups");
            callback(null);
        }
        else {
            if (consoleLog) logger.debug(rows, "mysql.selectAllUserGroups");
            callback(rows);
        }
    });
};
exports.selectAllUserGroups = selectAllUserGroups;

/**
 * Get the user and user group specific data for the start page
 * @param user authenticated user object
 * @param callback gets called with query result rows
 */
var getStartPageData = function (user, callback) {
    if (user) {
        switch (user.user_role_id) {
            case userRoles.admin.id:
                selectAllUsers(function(users) {
                    selectAllUserGroups(function(userGroups) {
                        var groupData = {users: users, userGroups: userGroups};
                        if (consoleLog) logger.debug(groupData, "mysql.getStartPageData");
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

var insertUserCandidate = function(userCandidate, callback) {
    logger.debug(userCandidate)
    dbConnection.query("INSERT INTO user_candidate SET ?", userCandidate, function(err, results) {
        if (err) {
            logger.error(err, "mysql.insertUserCandidate");
            callback(false);
        }
        else {
            if (consoleLog) logger.debug(results, "mysql.insertUserCandidate");
            callback(true);
        }
    });
};
exports.insertUserCandidate = insertUserCandidate;

/**
 * Get all user candidate entries without an email sent timestamp
 * @param callback gets called with query result rows
 */
var selectNewUserCandidates = function(callback) {
    dbConnection.query("SELECT * FROM user_candidate WHERE email_sent IS NULL", function(err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectNewUserCandidates");
            callback(null);
        }
        else {
            if (consoleLog) logger.debug(rows, "mysql.selectNewUserCandidates");
            callback(rows);
        }
    });
};
exports.selectNewUserCandidates = selectNewUserCandidates;

/**
 * Update user candidate with email sent timestamp
 * @param token of the user candidate
 * @param callback gets called with query result rows
 */
var updateUserCandidateSent = function(token, callback) {
    dbConnection.query("UPDATE user_candidate SET email_sent = FROM_UNIXTIME(?) WHERE token = ?", [Math.floor(Date.now() / 1000), token], function(err, results) {
        if (err) {
            logger.error(err, "mysql.updateUserCandidateSent");
            callback(false);
        }
        else {
            if (consoleLog) logger.debug(results, "mysql.updateUserCandidateSent");
            callback(true);
        }
    });
};
exports.updateUserCandidateSent = updateUserCandidateSent;