var config = require('./config')
var logger = require('./logger')

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.configs.dbConfigV1.host,
    user: config.configs.dbConfigV1.user,
    password: config.configs.dbConfigV1.password,
    database: config.configs.dbConfigV1.database,
});

var test = function() {
    connection.connect()

    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
        if (err) throw err

        console.log('The solution is: ', rows[0].solution)
    });

    connection.end()
}
exports.test = test

var getUserForUsername = function(req, res, next, username, callback) {
    connection.connect()
    connection.query("SELECT * FROM user WHERE username = ?", [username], function(err, rows, fields) {
        if (err) throw err
        logger.debug(rows[0], "mysql.getUserForUsername")
        callback(req, res, next, rows[0])
    })
    connection.end()
}
exports.getUserForUsername = getUserForUsername