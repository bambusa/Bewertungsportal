/*
 Modules
 */
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');

var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');
var helper = require('../helper');



/*
Expert Pages
 */

var getCreateIndicator = function(req, res) {
    res.render('createIndicator', {title: "Neuen Indikator erstellen", user: req.user, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});

};
exports.getCreateIndicator = getCreateIndicator;

var postCreateIndicator = function(req, res) {
    var indicator = req.body;
    var sets;
    if (indicator.sets) {
        sets = indicator.sets;
        delete indicator.sets;
    }

    var indicator = validateIndicator(indicator);
    if (indicator) {
        mysql.insertIndicator(indicator, function(results) {
            if (results) {
                logger.info("New indicator created", indicator, "admin.postCreateIndicator");
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

var getCreateIndicatorSet = function(req, res) {
    res.render('createIndicatorSet', {title: "Neues Indikatoren-Set erstellen", user: req.user, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
};
exports.getCreateIndicatorSet = getCreateIndicatorSet;

var postCreateIndicatorSet = function(req, res) {
    logger.debug("postCreateIndicatorSet")
    var set = req.body;
    var set = validateIndicatorSet(set);
    if (set) {
        mysql.insertIndicatorSet(set, function(results) {
            if (results) {
                req.flash('succMessage', 'Indikatoren-Set gespeichert');
                res.redirect('/expert/createIndicatorSet');
            } else {
                req.flash('errMessage', 'Server Error');
                res.redirect('/expert/createIndicatorSet');
            }
        });
    }
    else {
        req.flash('errMessage', 'Daten nicht valide');
        res.redirect('/expert/createIndicatorSet');
    }
};
exports.postCreateIndicatorSet = postCreateIndicatorSet;

var getManageIndicator = function(req, res) {
    if (req.params.indicatorId) {
        mysql.selectIndicatorForId(req.params.indicatorId, function(indicator) {
            if (indicator) {
                res.render('manageIndicator', {title: "Indikator bearbeiten", user: req.user, manageIndicator: indicator, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
            }
            else {
                req.flash('errMessage', 'Indikator nicht gefunden');
                res.redirect('/');
            }
        })
    }
    else {
        req.flash('errMessage', 'Indikator ID ungültig');
        res.redirect('/');
    }
};
exports.getManageIndicator = getManageIndicator;

var postManageIndicator = function(req, res) {
    if (req.params.indicatorId) {
        var indicator = req.body;

        if (indicator) {
            mysql.updateIndicator(indicator, function(results) {
                if (results) {
                    logger.info("Indicator updated", indicator, "expert.postManageIndicator");
                    req.flash('succMessage', 'Indikator gespeichert...');
                    res.redirect('/');
                } else {
                    req.flash('errMessage', 'Server Error');
                    res.redirect('/expert/manageIndicator/'+req.params.indicatorId);
                }
            })
        }
        else {
            req.flash('errMessage', 'Daten nicht valide');
            res.redirect('/expert/manageIndicator/'+req.params.indicatorId);
        }
    }
    else {
        req.flash('errMessage', 'Indikator ID ungültig');
        res.redirect('/');
    }
};
exports.postManageIndicator = postManageIndicator;

var getManageIndicatorSet = function(req, res) {
    var id = req.params.setId;
    if (id) {
        mysql.selectIndicatorSetForId(id, function(set) {
            if (set) {
                logger.debug(set, "expert.getManageIndicatorSet");
                mysql.selectAllIndicatorsNotInSet(id, function (otherIndicators) {
                    mysql.selectAllIndicatorsInSet(id, function (setIndicators) {
                        res.render('manageIndicatorSet', {title: "Nutzergruppe verwalten", user: req.user, set: set, otherIndicators: otherIndicators, setIndicators: setIndicators, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
                    });
                });
            }
            else {
                req.flash('errMessage', 'Set Id ungültig');
                res.redirect('/');
            }
        });
    }
    else {
        req.flash('errMessage', 'Set Id ungültig');
        res.redirect('/');
    }
};
exports.getManageIndicatorSet = getManageIndicatorSet;

var postManageIndicatorSet = function(req, res) {
    var id = req.params.setId;
    if (id) {
        var set = req.body;
        var addIndicators = req.body.addIndicators;
        var removeIndicators = req.body.removeIndicators;
        delete set.addIndicators;
        delete set.removeIndicators;

        updateIndicatorSet(id, set, function(result) {
            if (result) {
                addIndicatorsToSet(id, addIndicators, function (result) {
                    if (result) {
                        removeIndicatorsFromSet(id, removeIndicators, function (result) {
                            if (result) {
                                req.flash('succMessage', 'Nutzergruppe gespeichert');
                                res.redirect('/');
                            } else {
                                req.flash('errMessage', 'Server Error');
                                res.redirect('/admin/manageUserGroup/'+id);
                            }
                        });
                    } else {
                        req.flash('errMessage', 'Server Error');
                        res.redirect('/admin/manageUserGroup/'+id);
                    }
                });
            } else {
                req.flash('errMessage', 'Server Error');
                res.redirect('/admin/manageUserGroup/'+id);
            }
        });
    }
    else {
        req.flash('errMessage', 'Nutzergruppen Id ungültig');
        res.redirect('/');
    }
};
exports.postManageIndicatorSet = postManageIndicatorSet;



/*
Expert Functions
 */

var addIndicatorsToSet = function(setId, addIndicators, callback) {
    if (addIndicators && addIndicators.length > 0) {
        logger.debug("Add indicators: ", addIndicators, "admin.addIndicatorsToSet");
        var is = 0;
        var should = addIndicators.length;
        for (key in addIndicators) {
            mysql.insertIndicatorInSet(addIndicators[key], setId, function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};

var removeIndicatorsFromSet = function(setId, removeIndicators, callback) {
    if (removeIndicators && removeIndicators.length > 0) {
        logger.debug("Remove indicators: ", removeIndicators, "admin.removeIndicatorsFromSet");
        var is = 0;
        var should = removeIndicators.length;
        for (key in removeIndicators) {
            mysql.deleteIndicatorFromSet(removeIndicators[key], setId, function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};



/*
 Helper functions
 */

var updateIndicatorSet = function(setId, set, callback) {
    if (set && (set.name || set.description)) {
        mysql.selectIndicatorSetForId(setId, function(dbSet) {
                logger.debug("Change indicator set data: ", set, "admin.updateIndicatorSet");
                mysql.update(set, function(results) {
                    if (results) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });
        });
    }
    else {
        callback(true);
    }
};

var addIndicatorsToSet = function(setId, addSets, callback) {
    if (addSets && addSets.length > 0) {
        logger.debug("Add indicators: ", addSets, "admin.addIndicatorsToSet");
        var is = 0;
        var should = addSets.length;
        for (key in addSets) {
            mysql.insertIndicatorInSet(setId, addSets[key], function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};

var removeIndicatorsFromSet = function(setId, removeSets, callback) {
    if (removeSets && removeSets.length > 0) {
        logger.debug("Remove indicators: ", removeSets, "admin.removeIndicatorsFromSet");
        var is = 0;
        var should = removeSets.length;
        for (key in removeSets) {
            mysql.deleteIndicatorFromSet(setId, removeSets[key], function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};



/*
 Validation
 */

var validateIndicator = function(indicator) {
    //logger.debug(indicator, "admin.validateUserCandidate");
    if (!indicator.user_id || !indicator.name || !indicator.target_factor) {
        logger.warn("Required fields not found", indicator, "expert.validateIndicator");
        return null;
    }

    indicator.target_factor = helper.tryParseFloat(indicator.target_factor);
    if (!indicator.target_factor) {
        logger.warn("target_factor invalid", "admin.validateIndicator");
        return false;
    }

    var validKeys = ["user_id", "user_group_id", "name", "description", "target_factor", "source"];
    for (var key in indicator) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, indicator[key], "admin.validateIndicator");
            delete(indicator[key])
        }
    }

    return indicator;
};

var validateIndicatorSet = function(set) {
    logger.debug(set, "admin.validateIndicatorSet");
    if (!set.user_id || !set.name) {
        logger.warn("Required fields not found", set, "expert.validateIndicatorSet");
        return null;
    }

    set.mmei_cell_id = helper.tryParseInt(set.mmei_cell_id);
    if (!set.mmei_cell_id) {
        logger.warn("mmei_cell_id invalid", "admin.validateIndicatorSet");
        return false;
    }

    set.visibility_id = helper.tryParseInt(set.visibility_id);
    if (!set.visibility_id) {
        logger.warn("visibility_id invalid", "admin.validateIndicatorSet");
        return false;
    }

    set.state_id = helper.tryParseInt(set.state_id);
    if (!set.state_id) {
        logger.warn("state_id invalid", "admin.validateIndicatorSet");
        return false;
    }

    set.maturity_level = helper.tryParseInt(set.maturity_level);
    if (!set.maturity_level) {
        logger.warn("maturity_level invalid", "admin.validateIndicatorSet");
        return false;
    }

    var validKeys = ["user_id", "user_group_id", "name", "description", "mmei_cell_id", "visibility_id", "state_id", "maturity_level"];
    for (var key in set) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, set[key], "admin.validateIndicatorSet");
            delete(set[key])
        }
    }

    return set;
};