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
Expert Pages
 */

var getCreateIndicator = function(req, res) {
    res.render('createIndicator', {title: "Neuen Indikator erstellen", succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});

};
exports.getCreateIndicator = getCreateIndicator;

var postCreateIndicator = function(req, res) {
    var indicator = validateIndicator(req.body);
    if (indicator) {
        mysql.insertIndicator(candidate, function(results) {
            if (results) {
                logger.info("New indicator created", candidate, "admin.postCreateIndicator");
                req.flash('succMessage', 'Indikator gespeichert');
                res.redirect('/expert/createIndicator');
            } else {
                req.flash('errMessage', 'Server Error');
                res.redirect('/expert/createIndicator');
            }
        })
    }
    else {
        req.flash('errMessage', 'Daten nicht valide');
        res.redirect('/expert/createIndicator');
    }
};
exports.postCreateIndicator = postCreateIndicator;



/*
 Validation
 */

var validateUserCandidate = function(indicator) {
    //logger.debug(indicator, "admin.validateUserCandidate");
    if (!indicator.name || !indicator.factorName || !indicator.targetFactor) {
        logger.warn("Required fields not found", "expert.validateUserCandidate");
        return null;
    }

    indicator.targetFactor = helper.tryParseFloat(indicator.targetFactor);
    if (!indicator.targetFactor) {
        logger.warn("targetFactor invalid", "admin.validateUserCandidate");
        return false;
    }

    var validKeys = ["name", "description", "factorName", "factorDescription", "targetFactor", "source", "sets"];
    for (var key in indicator) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, indicator[key], "admin.validateUserCandidate");
            delete(indicator[key])
        }
    }

    indicator.token = uuid.v4();

    return indicator;
};