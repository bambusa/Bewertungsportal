/*
 Modules
 */
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');



/*
 Start Page
 */
var getIndex = function (req, res) {
    var user = verifyToken(req.cookies.auth, function (user) {
        if (user) {
            //logger.debug("user: ", user, "user.getIndex");
            //logger.debug("userRoles: ", userRoles, "user.getIndex");
            if (user.user_role_id == userRoles.publicUser.id || user.user_role_id == userRoles.privateUser.id || user.user_role_id == userRoles.admin.id || user.user_role_id == userRoles.auditor.id || user.user_role_id == userRoles.expert.id) {
                var userRole;
                if (user.user_role_id == userRoles.admin.id) {
                    userRole = userRoles.admin;
                }

                logger.debug("Load start page for ", userRole.name, "user.getIndex");
                var userRoleTitle = ' (' + userRole.name + ')';

                mysql.getStartPageData(user, function (groupData) {
                    logger.debug(groupData)
                    res.render('index', {title: 'Start' + userRoleTitle, user: user, userRoles: userRoles, groupData: groupData, errMessage: req.flash('errMessage')});
                });
            }
            else {
                logger.error("User role not valid", user.user_role_id, "user.getIndex");
                res.render('index', {title: 'Start', user: user, errMessage: "Ungültige Nutzerdaten"});
            }
        }
        else {
            logger.debug("no user authenticated", "user.getIndex");
            res.render('index', {title: 'Start', user: user, errMessage: req.flash('errMessage')});
        }
    })
};
exports.getIndex = getIndex;



/*
 Authentication
 */
var getLogin = function (req, res) {
    res.render('login', {errMessage: req.flash('errMessage')});
};
exports.getLogin = getLogin;

var postLogin = function (req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.selectUserForUsername(req, res, next, req.body.username, function (req, res, next, result) {
            if (result) {
                if (bcrypt.compareSync(req.body.password, result.password)) {
                    logger.debug("Basic authenticated", "app.BasicStrategy");
                    var authCookieExpiration = "" + config.configs.serverConfig.authCookieExpiration + "h";
                    var authCookieExpirationMs = config.configs.serverConfig.authCookieExpiration * 1000 * 3600;

                    var encode = {
                        user_id: result.user_id,
                        user_role_id: result.user_role_id,
                        username: result.username,
                        email: result.email,
                        created: result.created
                    };
                    var token = jwt.sign(encode, config.configs.serverConfig.secret, {expiresIn: authCookieExpiration});
                    logger.info("Signed new token", "user.basicAuthCallback");
                    res.cookie('auth', token, {maxAge: authCookieExpirationMs, httpOnly: true}); // TODO , secure: true
                    res.redirect('/')
                } else {
                    logger.debug("Wrong password");
                    res.render('login', {errMessage: "Username oder Passwort falsch"})
                }
            }
            else {
                logger.debug("No result");
                res.render('login', {errMessage: "Username oder Passwort falsch"})
            }
        })
    }
    else {
        res.render('login', {errMessage: "Bitte Username und Passwort eingeben"})
    }
};
exports.postLogin = postLogin;

var getLogout = function (req, res) {
    res.clearCookie('auth');
    res.redirect('/')
};
exports.getLogout = getLogout;

var basicAuth = function (req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.selectUserForUsername(req, res, next, req.body.username, basicAuthCallback)
    }
    else {
        logger.debug("No body data");
        res.render('login', {message: "Bitte Username und Passwort eingeben"})
    }
};
exports.basicAuth = basicAuth;

var tokenAuth = function (req, res, next) {
    if (req && req.cookies && req.cookies.auth) {
        var token = req.cookies.auth;
        if (token) {
            var user = verifyToken(token, function (user) {
                if (user) {
                    req.user = user;
                    next(req, res)
                }
                else {
                    logger.debug("Token not verified", "user_auth.tokenAuth");
                    res.render('login', {message: "Verifikation ungültig"})
                }
            })
        }
        else {
            logger.debug("Token not found", "user_auth.tokenAuth");
            res.render('login', {message: "Login abgelaufen"})
        }
    }
    else {
        logger.debug("Cookie not found", "user_auth.tokenAuth");
        res.render('login', {message: "Login abgelaufen"})
    }
};
exports.tokenAuth = tokenAuth;

var verifyToken = function (authCookie, callback) {
    var decoded = false;
    try {
        decoded = jwt.verify(authCookie, config.configs.serverConfig.secret, {algorithms: "HS256"})
    } catch (err) {
        logger.error(err, "user.verifyToken")
    }

    if (decoded && decoded.username) {
        logger.debug("search user", "user.verifyToken");
        mysql.selectUserForUsername(null, null, null, decoded.username, function (req, res, next, user) {
            if (user && user.username) {
                callback(user)
            }
            else {
                callback(false)
            }
        })
    }
    else {
        callback(false)
    }
};
exports.verifyToken = verifyToken;

var isUserRole = function (req, res, next, isRole) {
    if (isRole && isRole.id) {
        var user = verifyToken(req.cookies.auth, function (user) {
            if (user) {
                req.user = user;
                if (user.user_role_id == isRole.id) {
                    next(req, res)
                }
                else {
                    logger.warn("Wrong user role", user, isRole, "user.isUserRole");
                    req.flash('errMessage', 'Zugriff verweigert');
                    res.redirect('/');
                }
            }
            else {
                logger.debug("no user authenticated", "user.isUserRole");
                req.flash('errMessage', 'Zugriff verweigert');
                res.redirect('/');
            }
        });
    }
    else {
        logger.error("no valid isRole object provided", "user.isUserRole");
        req.flash('errMessage', 'Zugriff verweigert');
        res.redirect('/');
    }
};
exports.isUserRole = isUserRole;



/*
 Functions
 */
var initializeUserRoles = function (callback) {
    var userRoleNames = config.configs.dataConfig.userRoleNames;
    var userRoles = {publicUser: null, privateUser: null, admin: null, auditor: null, expert: null};
    mysql.selectAllUserRoles(function (rows) {
        if (rows) {
            rows.forEach(function (row) {
                if (row.user_role_id || row.name) {
                    var roleEntry = {};
                    roleEntry.id = row.user_role_id;
                    roleEntry.name = row.name;
                    roleEntry.description = row.description;

                    if (row.name == userRoleNames.publicUser) {
                        userRoles.publicUser = roleEntry;
                    } else if (row.name == userRoleNames.privateUser) {
                        userRoles.privateUser = roleEntry;
                    } else if (row.name == userRoleNames.admin) {
                        userRoles.admin = roleEntry;
                    } else if (row.name == userRoleNames.auditor) {
                        userRoles.auditor = roleEntry;
                    } else if (row.name == userRoleNames.expert) {
                        userRoles.expert = roleEntry;
                    } else {
                        logger.warn("Unrecognized user role found", row, "user.initializeUserRoles")
                    }
                }
            });
            //logger.debug(userRoles)
            callback(userRoles);
        }
        else {
            logger.error("No user roles found", "user.initializeUserRoles")
            callback(false);
        }
    });
};
exports.initializeUserRoles = initializeUserRoles;