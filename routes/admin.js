/*
Modules
 */
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt-nodejs')

var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');
var helper = require('../helper');



/*
Admin Pages
 */

/**
 * Render view with user candidate form, pass user, user roles and user groups
 */
var getCreateUserCandidate = function(req, res) {
    mysql.selectAllUserGroupsByDate(function(userGroups) {
        res.render('createUserCandidate', {title: "Neuen Nutzer erstellen", user: req.user, userRoles: userRoles, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
    });
};
exports.getCreateUserCandidate = getCreateUserCandidate;

/**
 * Post function from user candidate form, validate user candidate data and save to database
 */
var postCreateUserCandidate = function(req, res) {
    var candidate = validateUserCandidate(req.body);
    if (candidate) {
        mysql.insertUserCandidate(candidate, function(results) {
            if (results) {
                logger.info("New user candidate created", candidate, "admin.postCreateUserCandidate");
                req.flash('succMessage', 'Nutzer gespeichert und wird benachrichtigt...');
                res.redirect('/admin/createUserCandidate');
            } else {
                req.flash('errMessage', 'Server Error');
                res.redirect('/admin/createUserCandidate');
            }
        })
    }
    else {
        req.flash('errMessage', 'Nutzerdaten nicht valide');
        res.redirect('/admin/createUserCandidate');
    }
};
exports.postCreateUserCandidate = postCreateUserCandidate;

var getCreateUserGroup = function(req, res) {
    res.render('createUserGroup', {title: "Neue Nutzergruppe erstellen", succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
};
exports.getCreateUserGroup = getCreateUserGroup;

var postCreateUserGroup = function(req, res) {
    mysql.selectUserGroupForId(req.body.name, function(results) {
        if (!results) {
            var userGroup = validateUserGroup(req.body);
            if (userGroup) {
                mysql.deleteUserInGroup(userGroup, function (results) {
                    if (results) {
                        logger.info("New user group created", userGroup, "admin.postCreateUserGroup");
                        req.flash('succMessage', 'Nutzergruppe erstellt');
                        res.redirect('/admin/manageUserGroup/' + results.insertId);
                    } else {
                        req.flash('errMessage', 'Server Error');
                        res.redirect('/admin/createUserGroup');
                    }
                });
            }
            else {
                req.flash('errMessage', 'Daten nicht valide');
                res.redirect('/admin/createUserGroup');
            }
        }
        else {
            req.flash('errMessage', 'Name existiert bereits');
            res.redirect('/admin/createUserGroup');
        }
    });
};
exports.postCreateUserGroup = postCreateUserGroup;

var getManageUserGroup = function(req, res) {
    var id = req.params.userGroupId;
    if (id) {
        mysql.selectUserGroupForId(id, function(userGroup) {
            if (userGroup) {
                logger.debug(userGroup, "admin.getManageUserGroup");
                mysql.selectAllUsersNotInGroup(id, function (otherUsers) {
                    mysql.selectAllUsersInGroup(id, function (groupUsers) {
                        res.render('manageUserGroup', {title: "Nutzergruppe verwalten", userGroup: userGroup, otherUsers: otherUsers, groupUsers: groupUsers, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
                    });
                });
            }
            else {
                req.flash('errMessage', 'Nutzergruppen Id ungültig');
                res.redirect('/');
            }
        });
    }
    else {
        req.flash('errMessage', 'Nutzergruppen Id ungültig');
        res.redirect('/');
    }
};
exports.getManageUserGroup = getManageUserGroup;

var postManageUserGroup = function(req, res) {
    var id = req.params.userGroupId;
    if (id) {
        var userGroup = {name: req.body.name, description: req.body.description};
        updateUserGroup(userGroup, function(result) {
            addUsersToGroup(id, req.body.addUser, function(result) {
                removeUsersFromGroup(id, req.body.removeUsers, function(result) {

                });
            });
        });
    }
    else {
        req.flash('errMessage', 'Nutzergruppen Id ungültig');
        res.redirect('/');
    }
};
exports.postManageUserGroup = postManageUserGroup;



/*
Helper functions
 */

var updateUserGroup = function(userGroup, callback) {
    if (userGroup && (userGroup.name || userGroup.description)) {
        logger.debug("Change user group data: ", userGroup, "admin.updateUserGroup");
        mysql.updateUserGroup(userGroup, function(results) {
            if (results) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    else {
        callback(true);
    }
};

var addUsersToGroup = function(userGroupId, addUsers, callback) {
    if (addUsers && addUsers.length > 0) {
        logger.debug("Add otherUsers: ", addUsers, "admin.addUsersToGroup");
        var is = 1;
        var should = addUsers.length;
        for (key in addUsers) {
            mysql.insertUserInGroup(userGroupId, addUsers[key], function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};

var removeUsersFromGroup = function(userGroupId, removeUsers, callback) {
    if (removeUsers && removeUsers.length > 0) {
        logger.debug("Remove users: ", removeUsers, "admin.removeUsersFromGroup");
        var is = 1;
        var should = removeUsers.length;
        for (key in removeUsers) {
            mysql.deleteUsersFromGroup(userGroupId, removeUsers[key], function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
}



/*
Admin Functions
 */
var checkNewUserCandidates = function() {
    mysql.selectNewUserCandidates(function(candidates) {
        if (candidates) {
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                var hostAdress = config.configs.serverConfig.hostAddress;
                var smtpConfig = config.configs.smtpConfig;
                var transporter = nodemailer.createTransport(smtpConfig);

                var verificationUrl = hostAdress + "registration/" + candidate.token;
                var mailOptions = {
                    from: '"Bewertungsportal"<' + smtpConfig.auth.user + '>', // sender address
                    to: candidate.email,
                    subject: 'Account Registrierung',
                    text: 'Guten Tag, bitte vervollständigen Sie Ihren Bewertungsportal Account über folgende Adresse: ' + verificationUrl,
                    html: 'Guten Tag,<br/><br/>bitte vervollständigen Sie Ihren Bewertungsportal Account über folgende Adresse:<br/><a href="' + verificationUrl + '">' + verificationUrl + '</a>'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    logger.debug(mailOptions, "mail.createVerificationMail");
                    if (error) {
                        logger.error(error, "mail.createVerificationMail");
                    }
                    else {
                        logger.info('Verification mail sent: ' + info.response, "mail.createVerificationMail");
                        mysql.updateUserCandidateSent(candidate.token, function(results) {});
                    }
                });
            }
        }
    })
};
exports.checkNewUserCandidates = checkNewUserCandidates;



/*
Validation
 */

var validateUserCandidate = function(candidate) {
    //logger.debug(candidate, "admin.validateUserCandidate");
    if (!candidate.email || !candidate.user_role_id) {
        logger.warn("Required fields not found", "admin.validateUserCandidate");
        return null;
    }

    candidate.user_role_id = helper.tryParseInt(candidate.user_role_id);
    if (!candidate.user_role_id) {
        logger.warn("user_role_id invalid", "admin.validateUserCandidate");
        return false;
    }

    var validKeys = ["email", "user_role_id"];
    for (var key in candidate) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, candidate[key], "admin.validateUserCandidate");
            delete(candidate[key])
        }
    }

    candidate.token = uuid.v4();

    return candidate;
};

var validateUserGroup = function(userGroup) {
    //logger.debug(candidate, "admin.validateUserCandidate");
    if (!userGroup.name) {
        logger.warn("Required fields not found", "admin.validateUserGroup");
        return null;
    }

    var validKeys = ["name", "description"];
    for (var key in userGroup) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, userGroup[key], "admin.validateUserGroup");
            delete(userGroup[key])
        }
    }

    return userGroup;
};