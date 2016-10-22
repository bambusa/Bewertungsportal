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
 * @param callback gets called with query results
 */
var getUserForUsername = function(req, res, next, username, callback) {
    dbConnection.query("SELECT * FROM user WHERE username = ?", [username], function(err, rows, fields) {
        if (err) throw err;
        if (consoleLog) logger.debug(rows[0], "mysql.getUserForUsername");
        callback(req, res, next, rows[0])
    })
};
exports.getUserForUsername = getUserForUsername;

/**
 * Get all user roles in database
 * @param callback gets called with query results
 */
var getAllUserRoles = function(callback) {
    dbConnection.query("SELECT * FROM user_role", function(err, rows, fields) {
        if (err) throw err;
        if (consoleLog) logger.debug(rows, "mysql.getAllUserRoles");
        callback(rows)
    })
};
exports.getAllUserRoles = getAllUserRoles;

/**
 * Get the user and user group specific data for the start page
 * @param user authenticated user object
 * @param callback gets called with query results
 */
var getStartPageData = function (user, callback) {
    if (user) {
        switch (user.user_role_id) {
            case userRoles.admin.id:
                dbConnection.query("SELECT * FROM user ORDER BY created DESC", function(err, rows, fields) {
                    if (err) throw err;
                    var users = rows;

                    dbConnection.query("SELECT * FROM user_group ORDER BY created DESC", function(err, rows, fields) {
                        if (err) throw err;
                        var userGroups = rows;

                        var groupData = {users: users, userGroups: userGroups};
                        if (consoleLog) logger.debug(groupData, "mysql.getStartPageData");
                        callback(groupData)
                    });
                });
                break;

            default:
                callback(false);
                break;
        }
    }
    else {
        callback(false);
    }
};
exports.getStartPageData = getStartPageData