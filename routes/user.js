/*
 Modules
 */
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');
var helper = require('../helper');



/*
 Start Page
 */

var getIndex = function (req, res) {
    var user = verifyToken(req.cookies.auth, function (user) {
        if (user) {
            //logger.debug("user: ", user, "user.getIndex");
            //logger.debug("USER_ROLES: ", USER_ROLES, "user.getIndex");
            if (user.user_role_id == USER_ROLES.publicUser.id || user.user_role_id == USER_ROLES.privateUser.id || user.user_role_id == USER_ROLES.admin.id || user.user_role_id == USER_ROLES.auditor.id || user.user_role_id == USER_ROLES.expert.id) {
                var userRole;

                if (user.user_role_id == USER_ROLES.admin.id) {
                    userRole = USER_ROLES.admin;
                } else if (user.user_role_id == USER_ROLES.expert.id) {
                    userRole = USER_ROLES.expert;
                } else if (user.user_role_id == USER_ROLES.auditor.id) {
                    userRole = USER_ROLES.auditor;
                } else if (user.user_role_id == USER_ROLES.privateUser.id) {
                    userRole = USER_ROLES.privateUser;
                } else if (user.user_role_id == USER_ROLES.publicUser.id) {
                    userRole = USER_ROLES.publicUser;
                }

                if (userRole)  {
                    logger.debug("Load start page for ", userRole.name, "user.getIndex");
                    var userRoleTitle = ' (' + userRole.name + ')';
                }

                mysql.getStartPageData(user, function (groupData) {
                    res.render('index', {title: 'Start' + userRoleTitle, user: user, userRoles: USER_ROLES, groupData: groupData, errMessage: req.flash('errMessage'), succMessage: req.flash('succMessage')});
                });
            }
            else {
                logger.error("User role not valid", user.user_role_id, "user.getIndex");
                res.render('index', {title: 'Start', user: user, errMessage: "Ungültige Nutzerdaten"});
            }
        }
        else {
            logger.debug("no user authenticated", "user.getIndex");
            mysql.getStartPageData(null, function (groupData) {
                res.render('index', {title: 'Start', groupData: groupData, errMessage: req.flash('errMessage'), succMessage: req.flash('succMessage')});
            });
        }
    });
};
exports.getIndex = getIndex;



/*
 User Pages
 */

var getLogin = function (req, res) {
    res.render('login', {title: "Login", errMessage: req.flash('errMessage'), succMessage: req.flash('succMessage')});
};
exports.getLogin = getLogin;

var postLogin = function (req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.getUserForUsername(req, res, next, req.body.username, function (req, res, next, result) {
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

var getRegisterUser = function(req, res) {
    res.clearCookie('auth');
    var token = req.params.token;
    if (token) {
        mysql.selectUserCandidateForToken(token, function (userCandidate) {
            if (userCandidate && typeof userCandidate === 'object' && typeof userCandidate !== '[object Array]') {
                var roleName = "-";
                var role = helper.getUserRoleForId(userCandidate.user_role_id);
                if (role) roleName = role.name;
                res.render('registerUser', {title: "Registrieren", userCandidate: userCandidate, roleName: roleName, token: token, errMessage: req.flash('errMessage'), succMessage: req.flash('succMessage')});
            }
            else {
                logger.error(userCandidate, "user.getRegisterUser");
                req.flash('errMessage', 'Ungültiger Token');
                res.redirect('/');
            }
        });
    }
    else {
        logger.error("No token provided", "user.getRegisterUser");
        req.flash('errMessage', 'Ungültiger Token');
        res.redirect('/');
    }
};
exports.getRegisterUser = getRegisterUser;

var postRegisterUser = function(req, res) {
    var token = req.body.token;
    logger.debug(token);
    if (token) {
        if (req.body.username) {
            var user = mysql.selectUserForUsername(req.body.username, function (user) {
                if (!user) {
                    if (req.body.password1 == req.body.password2) {
                        var user = validateUser(req.body);
                        if (user) {
                            mysql.insertUser(user, function (results) {
                                if (results) {
                                    logger.info("New user registered", user, "user.postRegisterUser");
                                    mysql.updateUserCandidateRegistered(token, function (results) {
                                        if (results) {
                                            var hostAdress = config.configs.serverConfig.hostAddress;
                                            var smtpConfig = config.configs.smtpConfig;
                                            var transporter = nodemailer.createTransport(smtpConfig);

                                            var mailOptions = {
                                                from: '"Bewertungsportal"<' + smtpConfig.auth.user + '>', // sender address
                                                to: user.email,
                                                subject: 'Willkommen beim Bewertungsportal ' + user.username,
                                                text: 'Herzlich willkommen ' + user.username + ', Ihr Account wurde erfolgreich erstellt. Besuchen Sie das Bewertungsportal über folgende Adresse: ' + hostAdress,
                                                html: 'Herzlich willkommen ' + user.username + ',<br/><br/>Ihr Account wurde erfolgreich erstellt. Besuchen Sie das Bewertungsportal über folgende Adresse:<br/><a href="' + hostAdress + '">' + hostAdress + '</a>'
                                            };

                                            transporter.sendMail(mailOptions, function (error, info) {
                                                logger.debug(mailOptions, "user.postRegisterUser");
                                                if (error) {
                                                    logger.error(error, "user.postRegisterUser");
                                                }
                                                else {
                                                    logger.debug('Welcome mail sent: ' + info.response, "user.postRegisterUser");
                                                    mysql.updateUserCandidateSent(token, function(results) {});
                                                }
                                            });

                                            req.flash('succMessage', 'Registrierung erfolgreich, bitte melden Sie sich an.');
                                            res.redirect('/login');
                                        } else {
                                            req.flash('errMessage', 'Server Error');
                                            res.redirect('/registration/' + token);
                                        }
                                    });
                                } else {
                                    req.flash('errMessage', 'Server Error');
                                    res.redirect('/registration/' + token);
                                }
                            });
                        }
                        else {
                            req.flash('errMessage', 'Nutzerdaten nicht valide');
                            res.redirect('/registration/' + token);
                        }
                    }
                    else {
                        req.flash('errMessage', 'Passwörter müssen übereinstimmen');
                        res.redirect('/registration/' + token);
                    }
                }
                else {
                    req.flash('errMessage', 'Username bereits registriert');
                    res.redirect('/registration/' + token);
                }
            });
        }
        else {
            req.flash('errMessage', 'Ungültiger Username');
            res.redirect('/registration/' + token);
        }
    }
    else {
        req.flash('errMessage', 'Ungültiger Token');
        res.redirect('/');
    }
};
exports.postRegisterUser = postRegisterUser;

var getPublicAssessment = function(req, res) {
    var assessmentId = req.params.assessmentId;
    if (assessmentId) {
        mysql.selectAssessmentForId(assessmentId, function(assessment) {
            mysql.selectSetsAndIndicatorsForAssessmentByMmei(assessmentId, function(indicators) {
                //logger.debug(indicators, "indicators")
                var cells = {c11: [], c12: [], c13: [], c14: [], c21: [], c22: [], c23: [], c24: [], c31: [], c32: [], c33: [], c34: []};
                for (var key in indicators) {
                    var indicator = indicators[key];
                    //logger.debug(indicator, "indicator");
                    var cellName = "c";
                    cellName += indicator.mmei_x;
                    cellName += indicator.mmei_y;
                    if (cells.hasOwnProperty(cellName)) {
                        cells[cellName].push(indicator);
                    }
                    else {
                        logger.error("Unknown cellName ", cellName, "user.getPublicAssessment");
                    }
                }
                logger.debug(cells, "cells")
                var results = getAggregation(cells);
                logger.debug(results, "results")
                res.render('viewAssessment', {title: "Bewertung", user: req.user, userRoles: USER_ROLES, assessment: assessment, strategies: config.configs.assessmentStrategies, assessmentResults: results, indicators: indicators, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')})
            });
        });
    }
    else {
        req.flash('errMessage', 'Assessment ID ungültig');
        res.redirect('/');
    }
};
exports.getPublicAssessment = getPublicAssessment;



/*
Authentication functions
 */

var basicAuth = function (req, res, next) {
    if (req.body.username && req.body.password) {
        mysql.getUserForUsername(req, res, next, req.body.username, basicAuthCallback)
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
    if (authCookie) {
        var decoded = false;
        try {
            decoded = jwt.verify(authCookie, config.configs.serverConfig.secret, {algorithms: "HS256"});
            mysql.selectUserGroupsForUserId(decoded.user_id, function (user_groups) {
                if (user_groups && user_groups.length > 0) decoded.user_group_id = user_groups[0].user_group_id;
                callback(decoded);
            });
        } catch (err) {
            logger.error(err, "user.verifyToken");
            callback(null);
        }
    }
    else {
        callback(null);
    }
};
exports.verifyToken = verifyToken;

var isUserRole = function (req, res, next, isRole) {
    if (isRole && isRole.id) {
        verifyToken(req.cookies.auth, function (user) {
            if (user) {
                if (user.user_role_id == isRole.id) {
                    req.user = user;
                    next(req, res);
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
            logger.error("No user roles found", "user.initializeUserRoles");
            callback(false);
        }
    });
};
exports.initializeUserRoles = initializeUserRoles;



/*
Assessment Strategy Functions
 */

var getAggregation = function(cells) {
    var str = config.configs.assessmentStrategies;
    var results = {c11: null, c12: null, c13: null, c14: null, c21: null, c22: null, c23: null, c24: null, c31: null, c32: null, c33: null, c34: null};
    for (var key in cells) {
        var cell = cells[key];
        if (cell && cell.length > 0) {
            var strategy = cell[0].set_strategy;
            logger.debug(cell, strategy, "cell")

            switch (strategy) {
                case str.relative.id:
                    results[key] = aggregateRelative(cell);
                    break;
                case str.contributive.id:
                    results[key] = aggregateContributive(cell);
                    break;
                case str.events.id:
                    results[key] = aggregateEvents(cell);
                    break;
                default:
                    logger.error("Unknown strategy", strategy, "user.getAggregation");
                    results[key] = null;
            }
        }
    }
    return results;
};

var aggregateRelative = function(cell) {
    var weights = 0;
    var grade = 0;
    for (var it in cell) {
        var assessment = cell[it];
        weights += assessment.indi_target_factor;
        if (assessment.grade_grade) grade += (assessment.grade_grade * assessment.indi_target_factor);
        //logger.debug(assessment.grade_grade, assessment.indi_target_factor, (assessment.grade_grade * assessment.indi_target_factor), "grade")
    }
    var result = grade / weights;
    if (isNaN(result)) return "-";
    else return (Math.floor(result * 100) + "%");
    //logger.debug(grade, weights, results[key], "result")
};

var aggregateContributive = function(cell) {
    var grade = 0;
    for (var it in cell) {
        var assessment = cell[it];
        if (assessment.grade_grade) grade += (assessment.grade_grade * assessment.indi_target_factor);
    }
    if (isNaN(grade)) return "-";
    else {
        var percentage = Math.floor(grade * 100);
        if (percentage > 100) percentage = 100;
    } return (percentage + "%");
};

var aggregateEvents = function(cell) {
    var grade = 0;
    for (var it in cell) {
        var assessment = cell[it];
        if (assessment.grade_grade && assessment.grade_grade > 0) grade += assessment.indi_target_factor;
    }
    if (isNaN(grade)) return "-";
    else {
        var percentage = Math.floor(grade * 100);
        if (percentage > 100) percentage = 100;
    } return (percentage + "%");
};



/*
Validation
 */

var validateUser = function(user) {
    logger.debug(user, "user.validateUser");
    if (!user.email || !user.user_role_id || !user.username || !user.password1 || !user.password2) {
        logger.warn("Required fields not found", user, "user.validateUser");
        return null;
    }

    user.user_role_id = helper.tryParseInt(user.user_role_id);
    if (!user.user_role_id) {
        logger.warn("user_role_id invalid", "user.validateUser");
        return false;
    }

    if (user.password1 != user.password2) {
        logger.warn("passwords do not match", "user.validateUser");
        return false;
    }
    else {
        user.password = bcrypt.hashSync(user.password1);
        delete user.password1;
        delete user.password2;
        delete user.token;
    }

    var validKeys = ["email", "user_role_id", "username", "password"];
    for (var key in user) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, user[key], "user.validateUser");
            delete(user[key])
        }
    }

    return user;
};
exports.validateUser = validateUser;