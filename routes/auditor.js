/*
 Modules
 */
var mysql = require('../mysql');
var logger = require('../logger');
var config = require('../config');
var helper = require('../helper');



/*
 Auditor Pages
 */

/**
 * Render view with create assessment form, prepare indicators for each mmei cell
 */
var getCreateAssessment = function(req, res) {
    var mmeiSets = {other: null, c11: null, c12: null, c13: null, c14: null, c21: null, c22: null, c23: null, c24: null, c31: null, c32: null, c33: null, c34: null};
    mysql.selectAllIndicatorSetsForCellNotInAssessment(null, null, function(sets) {
        mmeiSets.other = sets;
        mysql.selectAllIndicatorSetsForCellNotInAssessment(8, null, function(sets) {
            mmeiSets.c11 = sets;
            mysql.selectAllIndicatorSetsForCellNotInAssessment(9, null, function(sets) {
                mmeiSets.c12 = sets;
                mysql.selectAllIndicatorSetsForCellNotInAssessment(10, null, function(sets) {
                    mmeiSets.c13 = sets;
                    mysql.selectAllIndicatorSetsForCellNotInAssessment(11, null, function(sets) {
                        mmeiSets.c14 = sets;
                        mysql.selectAllIndicatorSetsForCellNotInAssessment(12, null, function(sets) {
                            mmeiSets.c21 = sets;
                            mysql.selectAllIndicatorSetsForCellNotInAssessment(13, null, function(sets) {
                                mmeiSets.c22 = sets;
                                mysql.selectAllIndicatorSetsForCellNotInAssessment(14, null, function(sets) {
                                    mmeiSets.c23 = sets;
                                    mysql.selectAllIndicatorSetsForCellNotInAssessment(15, null, function(sets) {
                                        mmeiSets.c24 = sets;
                                        mysql.selectAllIndicatorSetsForCellNotInAssessment(16, null, function(sets) {
                                            mmeiSets.c32 = sets;
                                            mysql.selectAllIndicatorSetsForCellNotInAssessment(17, null, function(sets) {
                                                mmeiSets.c33 = sets;
                                                mysql.selectAllIndicatorSetsForCellNotInAssessment(18, null, function(sets) {
                                                    mmeiSets.c34 = sets;
                                                    mysql.selectAllIndicatorSetsForCellNotInAssessment(19, null, function(sets) {
                                                        mmeiSets.c31 = sets;
                                                        res.render('createAssessment', {title: "Neue Bewertung starten", user: req.user, userRoles: USER_ROLES, mmeiSets: mmeiSets, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')});
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};
exports.getCreateAssessment = getCreateAssessment;

/**
 * Post function from create assessment form, save to database and add sets to assessment
 */
var postCreateAssessment = function(req, res) {
    var assessment = req.body;
    var addSets = assessment.addSets;
    var removeSets = assessment.removeSets;
    delete assessment.addSets;
    delete assessment.removeSets;

    var assessment = validateAssessment(assessment);
    if (assessment) {
        mysql.insertAssessment(assessment, function(result) {
            if (result) {
                var id = result.insertId;
                addSetsToAssessment(id, addSets, function (result) {
                    if (result) {
                        removeSetsFromAssessment(id, removeSets, function (result) {
                            if (result) {
                                req.flash('succMessage', 'Nutzergruppe gespeichert');
                                res.redirect('/');
                            }
                            else {
                                req.flash('errMessage', 'Server Error');
                                res.redirect('/auditor/createAssessment');
                            }
                        });
                    }
                    else {
                        req.flash('errMessage', 'Server Error');
                        res.redirect('/auditor/createAssessment');
                    }
                });
            }
            else {
                req.flash('errMessage', 'Server Error');
                res.redirect('/auditor/createAssessment');
            }
        });
    }
    else {
        req.flash('errMessage', 'Daten nicht valide');
        res.redirect('/auditor/createAssessment');
    }
};
exports.postCreateAssessment = postCreateAssessment;

/**
 * Render view with change assessment form, prepare indicators for each mmei cell
 */
var getManageAssessment = function(req, res) {
    if (req.params.assessmentId) {
        var assessmentId = req.params.assessmentId;
        mysql.selectAssessmentForId(assessmentId, function(assessment) {
            var mmeiSets = {
                other: null,
                c11: null,
                c12: null,
                c13: null,
                c14: null,
                c21: null,
                c22: null,
                c23: null,
                c24: null,
                c31: null,
                c32: null,
                c33: null,
                c34: null
            };
            mysql.selectAllIndicatorSetsForCellNotInAssessment(null, assessmentId, function (sets) {
                mmeiSets.other = sets;
                mysql.selectAllIndicatorSetsForCellNotInAssessment(8, assessmentId, function (sets) {
                    mmeiSets.c11 = sets;
                    mysql.selectAllIndicatorSetsForCellNotInAssessment(9, assessmentId, function (sets) {
                        mmeiSets.c12 = sets;
                        mysql.selectAllIndicatorSetsForCellNotInAssessment(10, assessmentId, function (sets) {
                            mmeiSets.c13 = sets;
                            mysql.selectAllIndicatorSetsForCellNotInAssessment(11, assessmentId, function (sets) {
                                mmeiSets.c14 = sets;
                                mysql.selectAllIndicatorSetsForCellNotInAssessment(12, assessmentId, function (sets) {
                                    mmeiSets.c21 = sets;
                                    mysql.selectAllIndicatorSetsForCellNotInAssessment(13, assessmentId, function (sets) {
                                        mmeiSets.c22 = sets;
                                        mysql.selectAllIndicatorSetsForCellNotInAssessment(14, assessmentId, function (sets) {
                                            mmeiSets.c23 = sets;
                                            mysql.selectAllIndicatorSetsForCellNotInAssessment(15, assessmentId, function (sets) {
                                                mmeiSets.c24 = sets;
                                                mysql.selectAllIndicatorSetsForCellNotInAssessment(16, assessmentId, function (sets) {
                                                    mmeiSets.c32 = sets;
                                                    mysql.selectAllIndicatorSetsForCellNotInAssessment(17, assessmentId, function (sets) {
                                                        mmeiSets.c33 = sets;
                                                        mysql.selectAllIndicatorSetsForCellNotInAssessment(18, assessmentId, function (sets) {
                                                            mmeiSets.c34 = sets;
                                                            mysql.selectAllIndicatorSetsForCellNotInAssessment(19, assessmentId, function (sets) {
                                                                mmeiSets.c31 = sets;
                                                                mysql.selectAllIndicatorSetsInAssessment(assessmentId, function(sets) {
                                                                    res.render('manageAssessment', {
                                                                        title: "Bewertungsprojekt ändern",
                                                                        user: req.user,
                                                                        userRoles: USER_ROLES,
                                                                        mmeiSets: mmeiSets,
                                                                        assessmentSets: sets,
                                                                        manageAssessment: assessment,
                                                                        succMessage: req.flash('succMessage'),
                                                                        errMessage: req.flash('errMessage')
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    else {
        req.flash('errMessage', 'Assessment ID ungültig');
        res.redirect('/');
    }
};
exports.getManageAssessment = getManageAssessment;

/**
 * Post function from change assessment form, save to database and add or remove sets
 */
var postManageAssessment = function(req, res) {
    var assessmentId = req.params.assessmentId;
    var assessment = req.body;
    assessment.assessment_id = assessmentId;
    var addSets = assessment.addSets;
    var removeSets = assessment.removeSets;
    delete assessment.addSets;
    delete assessment.removeSets;

    mysql.updateAssessment(assessment, function(result) {
        if (result) {
            var id = result.insertId;
            addSetsToAssessment(assessmentId, addSets, function (result1) {
                removeSetsFromAssessment(assessmentId, removeSets, function (result2) {
                    if (result1 || result2) {
                        req.flash('succMessage', 'Nutzergruppe gespeichert');
                        res.redirect('/');
                    }
                    else {
                        req.flash('errMessage', 'Keine Änderungen gespeichert');
                        res.redirect('/auditor/manageAssessment/'+assessmentId);
                    }
                });
            });
        }
        else {
            addSetsToAssessment(assessmentId, addSets, function (result1) {
                removeSetsFromAssessment(assessmentId, removeSets, function (result2) {
                    if (result1 || result2) {
                        req.flash('succMessage', 'Nutzergruppe gespeichert');
                        res.redirect('/');
                    }
                    else {
                        req.flash('errMessage', 'Keine Änderungen gespeichert');
                        res.redirect('/auditor/manageAssessment/'+assessmentId);
                    }
                });
            });
        }
    });
};
exports.postManageAssessment = postManageAssessment;

/**
 * Render view with assess assessment form, pass indicators in assessment
 */
var getAssessAssessment = function(req, res) {
    var assessmentId = req.params.assessmentId;
    if (assessmentId) {
        mysql.selectAssessmentForId(assessmentId, function(assessment) {
            mysql.selectSetsAndIndicatorsForAssessmentByMmei(assessmentId, function(indicators) {
                res.render('assessAssessment', {title: "Bewertung", user: req.user, userRoles: USER_ROLES, assessment: assessment, strategies: config.configs.assessmentStrategies, indicators: indicators, succMessage: req.flash('succMessage'), errMessage: req.flash('errMessage')})
            });
        });
    }
    else {
        req.flash('errMessage', 'Assessment ID ungültig');
        res.redirect('/');
    }
};
exports.getAssessAssessment = getAssessAssessment;

/**
 * Post function from assess assessment form, save to database and add, remove or change indicator assessments
 */
var postAssessAssessment = function(req, res) {
    var assessmentId = req.params.assessmentId;
    if (assessmentId) {
        var should = req.body.indiAssessment.length
        if (should > 0) {
            for (var i = 0; i < should; i++) {
                var assessment = JSON.parse(req.body.indiAssessment[i]);
                assessment.assessment_id = assessmentId;
                if (assessment.grade_id != assessment.previous) {
                    if (!assessment.previous && assessment.grade_id != "NULL") {
                        delete assessment.previous;
                        mysql.insertIndicatorAssessment(assessment, function (result) {
                            logger.debug(should, (i + 1), should == (i + 1), "callback")
                            if (should == i) {
                                req.flash('succMessage', 'Bewertung gespeichert');
                                res.redirect('/auditor/assessAssessment/' + assessmentId);
                            }
                        });
                    }
                    else if (assessment.previous && assessment.grade_id == "NULL") {
                        delete assessment.previous;
                        mysql.deleteIndicatorAssessment(assessment, function (result) {
                            logger.debug(should, (i + 1), should == (i + 1), "callback")
                            if (should == i) {
                                req.flash('succMessage', 'Bewertung gespeichert');
                                res.redirect('/auditor/assessAssessment/' + assessmentId);
                            }
                        });
                    }
                    else {
                        delete assessment.previous;
                        mysql.updateIndicatorAssessment(assessment, function (result) {
                            logger.debug(should, (i + 1), should == (i + 1), "callback")
                            if (should == i) {
                                req.flash('succMessage', 'Bewertung gespeichert');
                                res.redirect('/auditor/assessAssessment/' + assessmentId);
                            }
                        });
                    }
                }
                else if (should == i) {
                    req.flash('succMessage', 'Bewertung gespeichert');
                    res.redirect('/auditor/assessAssessment/' + assessmentId);
                }
            }
        }
        else {
            req.flash('errMessage', 'Keine Änderungen');
            res.redirect('/auditor/assessAssessment/'+assessmentId);
        }
    }
    else {
        req.flash('errMessage', 'Assessment ID ungültig');
        res.redirect('/');
    }
};
exports.postAssessAssessment = postAssessAssessment;



/*
 Expert Functions
 */

/**
 * Add sets to assessment, iterate through sets
 * @param assessmentId new assessment for set
 * @param addSets array of sets for assessment
 * @param callback true after array is processed
 */
var addSetsToAssessment = function(assessmentId, addSets, callback) {
    if (addSets && addSets.length > 0) {
        logger.debug("Add sets: ", addSets, "auditor.addSetsToAssessment");
        var is = 0;
        var should = addSets.length;
        for (key in addSets) {
            logger.debug(addSets[key], assessmentId, "addSets[key]")
            mysql.insertSetInAssessment(addSets[key], assessmentId, function(results) {
                is++;
                if (should == is) callback(true);
            })
        }
    }
    else {
        callback(true);
    }
};

/**
 * Remove sets from assessment, iterate through sets
 * @param assessmentId old assessment of sets
 * @param removeSets array of sets for removal
 * @param callback true after array is processed
 */
var removeSetsFromAssessment = function(assessmentId, removeSets, callback) {
    if (removeSets && removeSets.length > 0) {
        logger.debug("Remove sets: ", removeSets, assessmentId, "auditor.removeSetsFromAssessment");
        var is = 0;
        var should = removeSets.length;
        for (key in removeSets) {
            mysql.deleteSetFromAssessment(removeSets[key], assessmentId, function(results) {
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

/**
 * Validate mandatory and number fields
 * @param assessment
 * @returns assessment if validated successfully
 */
var validateAssessment = function(assessment) {
    //logger.debug(assessment, "admin.validateUserCandidate");
    if (!assessment.user_id || !assessment.name) {
        logger.warn("Required fields not found", assessment, "auditor.validateAssessment");
        return null;
    }

    var validKeys = ["user_id", "user_group_id", "name", "description", "target_factor", "source"];
    for (var key in assessment) {
        if (validKeys.indexOf(key) < 0) {
            logger.warn("Found unknown Key: ", key, assessment[key], "auditor.validateAssessment");
            delete(assessment[key])
        }
    }

    return assessment;
};