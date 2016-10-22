/**
 * modules
 */
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');
var passport = require('passport');
var flash = require('connect-flash');
var https = require('https');    // module for https
var fs = require('fs');          // required to read certs and keys


/**
 * custom modules
 */
var routes = require('./routes/routes');
var logger = require('./logger');
var config = require('./config');
var mysql = require('./mysql');
var user = require('./routes/user');


/**
 * response
 */
var app = express();

app.set('port', process.env.PORT || config.configs.serverConfig.port);
app.set('views', config.configs.serverConfig.baseDir + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.configs.serverConfig.secret,
    path: '/*',
    cookie: {
        httpOnly: true
        // TODO secure: true
    }
}));
app.use(flash());
app.use(passport.initialize());
//app.use(passport.session())
app.use(require('morgan')('combined', {"stream": logger.stream}));


// HTTP only
var server = app.listen(app.get('port'), function (err) {
    if (err) throw err;
    var message = 'Server is running @ http://localhost:' + server.address().port;
    logger.info(message, "app.listen");
    global.dbConnection = mysql.initializeConnection();
    user.initializeUserRoles(function(userRoles) {
        global.userRoles = userRoles;
    });

    //var timer = 60000 // 1min
    //var verificationExpirationCheck = setInterval(verification.checkVerification, timer)
    //var reportInterval = setInterval(mail.createReports, timer)
});

// HTTPS
/*var ssl_options = {
 key:    fs.readFileSync('/root/ssl/bb-cloud_com.key'),
 cert:   fs.readFileSync('/root/ssl/public.crt'),
 ca:     fs.readFileSync('/root/ssl/intermediate.crt'),
 requestCert:        true,
 rejectUnauthorized: false
 };
 var server = https.createServer(ssl_options, app).listen(app.get('port'), function (err) {
 if (err) throw err
 var message = 'Server is running @ https://www.bb-cloud.com:' + server.address().port
 logger.info(message, "app.listen")

 var timer = 60000 // 1min
 var verificationExpirationCheck = setInterval(verification.checkVerification, timer)
 //var reportInterval = setInterval(mail.createReports, timer)
 //verification.checkVerification()
 })*/


app.use('/', routes.router);

// 404 not found
app.use(routes.notFound404);