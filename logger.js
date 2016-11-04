var winston = require('winston');
var config = require('./config');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
       /* new winston.transports.File({
            name: 'info',
            level: 'info',
            filename: config.configs.serverConfig.baseDir + "/log/info.log",
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.File({
            name: 'debug',
            level: 'debug',
            filename: config.configs.serverConfig.baseDir + "/log/debug.log",
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),*/
        new winston.transports.Console({
            level: config.configs.debugConfig.consoleLevel,
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.log = function () {
    var args = arguments;
    if (args.length > 2) {
        args[args.length - 1] = "[" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + " | " + args[args.length - 1] + "]"
    }
    else {
        args[args.length] = "[" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + "]"
    }
    winston.Logger.prototype.log.apply(this, args)
};


module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message)
    }
};