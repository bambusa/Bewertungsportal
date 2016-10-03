/*
Modules
 */
var bcrypt = require('bcrypt-nodejs')
var jwt = require('jsonwebtoken')
var mysql = require('../mysql')
var logger = require('../logger')
var config = require('../config')



/*
Start Page
 */
var getIndex = function(req, res) {
    var decoded = null
    if (req && req.cookies && req.cookies.auth) {
        logger.debug(req.cookies)
        var encoded = req.cookies.auth
        decoded = jwt.verify(encoded, config.configs.serverConfig.secret, {
            algorithms: "HS256"
        })
    }
    res.render('index', { title: 'Start', user: decoded })
}
exports.getIndex = getIndex



/*
Authentication
 */
var getLogin = function(req, res) {
    res.render('login')
}
exports.getLogin = getLogin

var postLogin = function(req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.getUserForUsername(req, res, next, req.body.username, basicAuthCallback)
    }
    else {
        res.render('login', {message: "Bitte Username und Passwort eingeben"})
    }
}
exports.postLogin = postLogin

var getLogout = function(req, res) {
    res.clearCookie('auth')
    res.redirect('/')
}
exports.getLogout = getLogout

var basicAuth = function (req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.getUserForUsername(req, res, next, req.body.username, basicAuthCallback)
    }
    else {
        logger.debug("No body data")
        res.render('login', {message: "Bitte Username und Passwort eingeben"})
    }
}
exports.basicAuth = basicAuth

var basicAuthCallback = function(req, res, next, result) {
    if (result) {
        if (bcrypt.compareSync(req.body.password, result.password)) {
            logger.debug("Basic authenticated", "app.BasicStrategy")
            var encode = {user_id: result.user_id, user_role_id: result.user_role_id, username: result.username, email: result.email, created: result.created}
            var token = jwt.sign(encode, config.configs.serverConfig.secret, {expiresIn: "12h"})
            logger.info("Signed new token", "user.basicAuthCallback")
            res.cookie('auth', token, {maxAge: 3600 * 12000, httpOnly: true}) // TODO , secure: true
            res.redirect('/')
        } else {
            logger.debug("Wrong password")
            res.render('login', {message: "Username oder Passwort falsch"})
        }
    }
    else {
        logger.debug("No result")
        res.render('login', {message: "Username oder Passwort falsch"})
    }
}

var tokenAuth = function (req, res, next) {
    if (req && req.cookies && req.cookies.auth) {
        var token = req.cookies.auth
        if (token) {
            var decoded = false
            try {
                decoded = jwt.verify(token, config.configs.serverConfig.secret, {
                    algorithms: "HS256"
                })
            } catch (err) {
                logger.error(err, "user_auth.tokenAuth")
                res.render('login', {message: "Login abgelaufen"})
            }
            if (decoded) {
                req.user = decoded
                next(req, res)
            }
        }
        else {
            logger.debug("Token not verified", "user_auth.tokenAuth")
            res.render('login', {message: "Login abgelaufen"})
        }
    }
    else {
        logger.debug("Cookie not found", "user_auth.tokenAuth")
        res.render('login', {message: "Login abgelaufen"})
    }
}
exports.tokenAuth = tokenAuth