/*
Modules
 */
var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');
var helper = require('../helper');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');



/*
Admin Pages
 */
var getCreateUserCandidate = function(req, res) {
    mysql.selectAllUserGroups(function(userGroups) {
        res.render('createUserCandidate', {user: req.user, userRoles: userRoles, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
    });
};
exports.getCreateUserCandidate = getCreateUserCandidate;

var postCreateUserCandidate = function(req, res) {
    var candidate = validateUserCandidate(req.body);
    if (candidate) {
        mysql.insertUserCandidate(candidate, function(results) {
            if (results) {
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
    mysql.selectAllUserGroups(function(userGroups) {
        res.render('createUserGroup', {user: req.user, userRoles: userRoles, userGroups: userGroups});
    });
};
exports.getCreateUserGroup = getCreateUserGroup;

var postCreateUserGroup = function(req, res) {
    mysql.selectAllUserGroups(function(userGroups) {
        res.render('createUserGroup', {user: req.user, userRoles: userRoles, userGroups: userGroups});
    });
};
exports.postCreateUserGroup = postCreateUserGroup;



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
    logger.debug(candidate)
    if (!candidate.email || candidate.email.length == 0 || !candidate.user_role_id) {
        logger.warn("Required fields not found");
        return null;
    }

    var validKeys = ["email", "user_role_id"];
    for (var key in candidate) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, candidate[key], "ebox.validateUserCandidate");
            delete(candidate[key])
        }
    }

    candidate.token = uuid.v4();

    return candidate;
};