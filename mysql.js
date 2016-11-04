var config = require('./config');
var logger = require('./logger');

var mysql = require('mysql');
var connectionConfig = {
    host: config.configs.dbConfig.host,
    user: config.configs.dbConfig.user,
    password: config.configs.dbConfig.password,
    database: config.configs.dbConfig.database,
};
var logSql = config.configs.debugConfig.logSql;

/**
 * Open database connection once on server startup,
 * add handler in case of database disconnects that opens the connection again
 * @returns {Connection} Database connection to query on
 */
function initializeConnection() {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    logger.error(error.stack, "mysql.initializeConnection");
                    logger.info("Lost database connection. Reconnecting...", "mysql.initializeConnection");

                    initializeConnection(connectionConfig);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }

    var connection = mysql.createConnection(connectionConfig);

    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}
exports.initializeConnection = initializeConnection;

/**
 * Test function if database connection is working
 */
var test = function () {
    dbConnection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
        if (err) throw err;
        console.log('The solution is: ', rows[0].solution, "mysql.test")
    });

};
exports.test = test;


/*
 SELECT
 */

/**
 * Look for user in database for given username
 * @param username for checking database
 * @param callback gets called with query result rows
 */
var selectUserForUsername = function (username, callback) {
        if (username && typeof username != "function") {
            dbConnection.query("SELECT * FROM user WHERE username = ?", [username], function (err, rows, fields) {
                if (err) {
                    logger.error(err, "mysql.getUserForUsername");
                    callback(null);
                } else if (rows.length == 0) {
                    logger.warn("No results found", username, "mysql.selectUserForUsername");
                    callback(null);
                } else {
                    //if (logSql) logger.debug(rows[0], "mysql.getUserForUsername");
                    callback(rows[0]);
                }
            });
        }
        else {
            logger.error("No username provided", "mysql.selectUserForUsername");
            callback(null);
        }
    };
exports.selectUserForUsername = selectUserForUsername;

/**
 * Look for user in database for given ID
 * @param userId for checking database
 * @param callback gets called with query result rows
 */
var selectUserForUserId = function (userId, callback) {
    if (userId && typeof userId != "function") {
        dbConnection.query("SELECT * FROM user WHERE user_id = ?", [userId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserForUserId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", userId, "mysql.selectUserForUserId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserForUserId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No username provided", "mysql.selectUserForUserId");
        callback(null);
    }
};
exports.selectUserForUserId = selectUserForUserId;

/**
 * Get all user roles in database
 * @param callback gets called with query result rows
 */
var selectAllUserRoles = function (callback) {
    dbConnection.query("SELECT * FROM user_role", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserRoles");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUserRoles");
            callback(null);
        } else {
            //if (logSql) logger.debug(rows, "mysql.selectAllUserRoles");
            callback(rows);
        }
    });
};
exports.selectAllUserRoles = selectAllUserRoles;

/**
 * Get all otherUsers in database, order by date, newest first
 * @param callback gets called with query result rows
 */
var selectAllUsersByDate = function (callback) {
    dbConnection.query("SELECT * FROM user ORDER BY created DESC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUsersByDate");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUsersByDate");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUsersByDate");
            callback(rows);
        }
    });
};
exports.selectAllUsersByDate = selectAllUsersByDate;

/**
 * Get all otherUsers in database, order by date, newest first
 * @param callback gets called with query result rows
 */
var selectAllUsersByName = function (callback) {
    dbConnection.query("SELECT * FROM user ORDER BY username ASC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUsersByName");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUsersByName");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUsersByName");
            callback(rows);
        }
    });
};
exports.selectAllUsersByName = selectAllUsersByName;

/**
 * Get all user groups in database
 * @param callback gets called with query result rows
 */
var selectAllUserGroupsByDate = function (callback) {
    dbConnection.query("SELECT * FROM user_group ORDER BY created DESC", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllUserGroupsByDate");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", "mysql.selectAllUserGroupsByDate");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllUserGroupsByDate");
            callback(rows);
        }
    });
};
exports.selectAllUserGroupsByDate = selectAllUserGroupsByDate;

/**
 * Get all user groups for the given user ID
 * @param callback gets called with query result rows
 */
var selectUserGroupsForUserId = function (user_id, callback) {
    if (user_id && typeof user_id != "function") {
        dbConnection.query("SELECT * FROM user_in_group LEFT JOIN user_group ON user_in_group.user_group_id = user_group.user_group_id " +
            "WHERE user_in_group.user_id = ? ORDER BY user_group.name ASC", [user_id], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserGroupsForUserId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectUserGroupsForUserId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectUserGroupsForUserId");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No userId provided", "mysql.selectUserGroupsForUserId");
        callback(null);
    }
};
exports.selectUserGroupsForUserId = selectUserGroupsForUserId;

/**
 * Get all user in database that are registered in the specified user group
 * @param callback gets called with query result rows
 */
var selectAllUsersInGroup = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user_in_group LEFT JOIN user ON user_in_group.user_id = user.user_id WHERE user_in_group.user_group_id = ? ORDER BY user.username ASC", [userGroupId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllUsersInGroup");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", userGroupId, "mysql.selectAllUsersInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllUsersInGroup");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectAllUsersInGroup");
        callback(null);
    }
};
exports.selectAllUsersInGroup = selectAllUsersInGroup;

/**
 * Get all user in database that are not registered in the specified user group
 * @param callback gets called with query result rows
 */
var selectAllUsersNotInGroup = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user WHERE NOT EXISTS (SELECT user_id FROM user_in_group WHERE user_in_group.user_group_id = ? AND user.user_id = user_in_group.user_id) ORDER BY user.username ASC", [userGroupId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllUsersNotInGroup");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllUsersNotInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllUsersNotInGroup");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectAllUsersInGroup");
        callback(null);
    }
};
exports.selectAllUsersNotInGroup = selectAllUsersNotInGroup;

/**
 * Get all indicators in database that are registered in the specified set
 * @param callback gets called with query result rows
 */
var selectAllIndicatorsInSet = function (setId, callback) {
    if (setId && typeof setId != "function") {
        dbConnection.query("SELECT * FROM indicator_in_set LEFT JOIN indicator ON indicator_in_set.indicator_id = indicator.indicator_id " +
            "WHERE indicator_in_set.indicator_set_id = ? ORDER BY indicator.name ASC", [setId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllIndicatorsInSet");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", setId, "mysql.selectAllIndicatorsInSet");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllIndicatorsInSet");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No setId provided", "mysql.selectAllIndicatorsInSet");
        callback(null);
    }
};
exports.selectAllIndicatorsInSet = selectAllIndicatorsInSet;

/**
 * Get all indicator sets in database that are registered in the specified assessment
 * @param callback gets called with query result rows
 */
var selectAllIndicatorSetsInAssessment = function (assessmentId, callback) {
    if (assessmentId && typeof assessmentId != "function") {
        dbConnection.query("SELECT * FROM set_in_assessment LEFT JOIN indicator_set ON set_in_assessment.indicator_set_id = indicator_set.indicator_set_id " +
            "WHERE set_in_assessment.assessment_id = ? ORDER BY indicator_set.name ASC", [assessmentId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllIndicatorSetsInAssessment");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", assessmentId, "mysql.selectAllIndicatorSetsInAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllIndicatorSetsInAssessment");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No assessmentId provided", "mysql.selectAllIndicatorSetsInAssessment");
        callback(null);
    }
};
exports.selectAllIndicatorSetsInAssessment = selectAllIndicatorSetsInAssessment;

/**
 * Get all indicators in database that are not registered in the specified set
 * @param callback gets called with query result rows
 */
var selectAllIndicatorsNotInSet = function (setId, callback) {
    if (setId && typeof setId != "function") {
        dbConnection.query("SELECT * FROM indicator WHERE NOT EXISTS " +
            "(SELECT indicator_id FROM indicator_in_set WHERE indicator_in_set.indicator_set_id = ? AND indicator.indicator_id = indicator_in_set.indicator_id) " +
            "ORDER BY indicator.name ASC", [setId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllIndicatorsNotInSet");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllIndicatorsNotInSet");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllIndicatorsNotInSet");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No setId provided", "mysql.selectAllIndicatorsNotInSet");
        callback(null);
    }
};
exports.selectAllIndicatorsNotInSet = selectAllIndicatorsNotInSet;

/**
 * Look for user group in database for given id
 * @param callback gets called with query result rows
 */
var selectUserGroupForId = function (userGroupId, callback) {
    if (userGroupId && typeof userGroupId != "function") {
        dbConnection.query("SELECT * FROM user_group WHERE user_group_id = ?", [userGroupId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserGroupForId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", rows, userGroupId, "mysql.selectUserGroupForId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserGroupForId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No userGroupId provided", "mysql.selectUserGroupForId");
        callback(null);
    }
};
exports.selectUserGroupForId = selectUserGroupForId;

/**
 * Get all user candidate entries without an email sent timestamp
 * @param callback gets called with query result rows
 */
var selectNewUserCandidates = function (callback) {
    dbConnection.query("SELECT * FROM user_candidate WHERE email_sent IS NULL AND registered = 0", function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectNewUserCandidates");
            callback(null);
        } else if (rows.length == 0) {
            //logger.debug("No results found", "mysql.selectNewUserCandidates");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectNewUserCandidates");
            callback(rows);
        }
    });
};
exports.selectNewUserCandidates = selectNewUserCandidates;

/**
 * Get user candidate for given token
 * @param callback gets called with query result rows
 */
var selectUserCandidateForToken = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("SELECT * FROM user_candidate WHERE token = ? AND registered = 0", [token], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectUserCandidateForToken");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", token, "mysql.selectUserCandidateForToken");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectUserCandidateForToken");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.selectUserCandidateForToken");
        callback(null);
    }
};
exports.selectUserCandidateForToken = selectUserCandidateForToken;

/**
 * Get all indicators for given user group
 * @param callback gets called with query result rows
 */
var selectAllIndicatorsByName = function (user_id, user_group_id, callback) {
    if (typeof user_id != "function" && typeof user_group_id != "function") {
        var where = "";
        if (user_id) where = "WHERE user_id = " + user_id;
        if (user_group_id) where = "WHERE user_group_id = " + user_group_id;
        dbConnection.query("SELECT * FROM indicator " + where + " ORDER BY name ASC", function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllIndicatorsByName");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllIndicatorsByName");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllIndicatorsByName");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No name provided", "mysql.selectUserGroupForName");
        callback(null);
    }
};
exports.selectAllIndicatorsByName = selectAllIndicatorsByName;

/**
 * Get all indicator sets for given user group
 * @param callback gets called with query result rows
 */
var selectAllIndicatorSetsByName = function (user_id, user_group_id, callback) {
    if (typeof user_id != "function" && typeof user_group_id != "function") {
        var where = "";
        if (user_id) where = "WHERE user_id = " + user_id;
        if (user_group_id) where = "WHERE user_group_id = " + user_group_id;
        dbConnection.query("SELECT * FROM indicator_set " + where + " ORDER BY created ASC", function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllIndicatorSetsByName");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllIndicatorSetsByName");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllIndicatorSetsByName");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No name provided", "mysql.selectUserGroupForName");
        callback(null);
    }
};
exports.selectAllIndicatorSetsByName = selectAllIndicatorSetsByName;

/**
 * Look for indicator set in database for given id
 * @param callback gets called with query result rows
 */
var selectIndicatorSetForId = function (setId, callback) {
        if (setId && typeof setId != "function") {
            dbConnection.query("SELECT * FROM indicator_set WHERE indicator_set_id = ?", [setId], function (err, rows, fields) {
                if (err) {
                    logger.error(err, "mysql.selectIndicatorSetForId");
                    callback(null);
                } else if (rows.length == 0) {
                    logger.warn("No results found", rows, setId, "mysql.selectIndicatorSetForId");
                    callback(null);
                } else {
                    if (logSql) logger.debug(rows[0], "mysql.selectIndicatorSetForId");
                    callback(rows[0]);
                }
            });
        }
        else {
            logger.error("No setId provided", "mysql.selectIndicatorSetForId");
            callback(null);
        }
    };
exports.selectIndicatorSetForId = selectIndicatorSetForId;

/**
 * Look for all indicator sets in database for given mmei cell id
 * @param callback gets called with query result rows
 */
var selectAllIndicatorSetsForCell = function (mmeiId, callback) {
    var where = "WHERE mmei_cell_id IS NULL";
    if (mmeiId && typeof mmeiId != "function") {
        where = "WHERE mmei_cell_id = ?";
    }
    dbConnection.query("SELECT * FROM indicator_set "+where, [mmeiId], function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllIndicatorSetsForCell");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", rows, mmeiId, "mysql.selectAllIndicatorSetsForCell");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllIndicatorSetsForCell");
            callback(rows);
        }
    });
};
exports.selectAllIndicatorSetsForCell = selectAllIndicatorSetsForCell;

/**
 * Look for all indicator sets in database for given mmei cell id and not in assessment
 * @param callback gets called with query result rows
 */
var selectAllIndicatorSetsForCellNotInAssessment = function (mmeiId, assessmentId, callback) {
    var where = "AND mmei_cell_id IS NULL";
    if (mmeiId && typeof mmeiId != "function") {
        where = "AND mmei_cell_id = ?";
    }
    dbConnection.query("SELECT * FROM indicator_set WHERE NOT EXISTS " +
        "(SELECT indicator_set_id FROM set_in_assessment WHERE set_in_assessment.assessment_id = ? AND set_in_assessment.indicator_set_id = indicator_set.indicator_set_id) " +
        where, [assessmentId, mmeiId], function (err, rows, fields) {
        if (err) {
            logger.error(err, "mysql.selectAllIndicatorSetsForCellNotInAssessment");
            callback(null);
        } else if (rows.length == 0) {
            logger.warn("No results found", rows, mmeiId, "mysql.selectAllIndicatorSetsForCellNotInAssessment");
            callback(null);
        } else {
            if (logSql) logger.debug(rows, "mysql.selectAllIndicatorSetsForCellNotInAssessment");
            callback(rows);
        }
    });
};
exports.selectAllIndicatorSetsForCellNotInAssessment = selectAllIndicatorSetsForCellNotInAssessment;

/**
 * Look for indicator in database for given id
 * @param callback gets called with query result rows
 */
var selectIndicatorForId = function (indicatorId, callback) {
    if (indicatorId && typeof indicatorId != "function") {
        dbConnection.query("SELECT * FROM indicator WHERE indicator_id = ?", [indicatorId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectIndicatorForId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", rows, indicatorId, "mysql.selectIndicatorForId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectIndicatorForId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No indicatorId provided", "mysql.selectIndicatorForId");
        callback(null);
    }
};
exports.selectIndicatorForId = selectIndicatorForId;

/**
 * Get all assessments for given user group
 * @param callback gets called with query result rows
 */
var selectAllAssessmentsByName = function (user_id, user_group_id, callback) {
    if (typeof user_id != "function" && typeof user_group_id != "function") {
        var where = "";
        if (user_id) where = "WHERE user_id = " + user_id;
        if (user_group_id) where = "WHERE user_group_id = " + user_group_id;
        dbConnection.query("SELECT * FROM assessment " + where + " ORDER BY name ASC", function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAllAssessmentsByName");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAllAssessmentsByName");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectAllAssessmentsByName");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.selectAllAssessmentsByName");
        callback(null);
    }
};
exports.selectAllAssessmentsByName = selectAllAssessmentsByName;

/**
 * Get all assessments for public user
 * @param callback gets called with query result rows
 */
var selectPublicAssessmentsByName = function (callback) {
    if (typeof user_id != "function" && typeof user_group_id != "function") {
        dbConnection.query("SELECT * FROM assessment ORDER BY name ASC", function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectPublicAssessmentsByName");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectPublicAssessmentsByName");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectPublicAssessmentsByName");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.selectPublicAssessmentsByName");
        callback(null);
    }
};
exports.selectPublicAssessmentsByName = selectPublicAssessmentsByName;

/**
 * Get assessment from database for provided id
 * @param callback gets called with query result rows
 */
var selectAssessmentForId = function (assessmentId, callback) {
    if (assessmentId && typeof assessmentId != "function") {
        dbConnection.query("SELECT * FROM assessment WHERE assessment_id = ?", [assessmentId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectAssessmentForId");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", "mysql.selectAssessmentForId");
                callback(null);
            } else {
                if (logSql) logger.debug(rows[0], "mysql.selectAssessmentForId");
                callback(rows[0]);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.selectAssessmentForId");
        callback(null);
    }
};
exports.selectAssessmentForId = selectAssessmentForId;

/**
 * Get all sets in given assessement, join with indicators, mmei_matrix and grade, order by
 * @param callback gets called with query result rows
 */
var selectSetsAndIndicatorsForAssessmentByMmei = function (assessmentId, callback) {
    if (assessmentId && typeof assessmentId != "function") {
        dbConnection.query("SELECT iset.name AS set_name, iset.description AS set_description, iset.maturity_level AS set_maturity_level, iset.strategy AS set_strategy, " +
            "mmei_matrix.x AS mmei_x, mmei_matrix.y AS mmei_y, " +
            "indi.name AS indi_name, indi.description AS indi_description, indi.target_factor AS indi_target_factor, indi.indicator_id AS indi_indicator_id, " +
            "iass.grade_id AS iass_grade_id, grade.name AS grade_name, grade.description AS grade_description, grade.grade AS grade_grade FROM set_in_assessment " +
            "LEFT JOIN indicator_set iset ON set_in_assessment.indicator_set_id = iset.indicator_set_id " +
            "LEFT JOIN indicator_in_set ON iset.indicator_set_id = indicator_in_set.indicator_set_id " +
            "LEFT JOIN indicator indi ON indicator_in_set.indicator_id = indi.indicator_id " +
            "LEFT JOIN mmei_matrix ON iset.mmei_cell_id = mmei_matrix.mmei_cell_id " +
            "LEFT JOIN indicator_assessment iass ON iass.assessment_id = ? AND iass.indicator_id = indi.indicator_id " +
            "LEFT JOIN grade ON iass.grade_id = grade.grade_id " +
            "WHERE set_in_assessment.assessment_id = ? AND iset.visibility_id = 2 AND (iset.state_id = 3 OR iset.state_id = 4) " +
            "ORDER BY mmei_matrix.x, mmei_matrix.y, iset.name, indi.name", [assessmentId, assessmentId], function (err, rows, fields) {
            if (err) {
                logger.error(err, "mysql.selectSetsAndIndicatorsForAssessmentByMmei");
                callback(null);
            } else if (rows.length == 0) {
                logger.warn("No results found", rows, assessmentId, "mysql.selectSetsAndIndicatorsForAssessmentByMmei");
                callback(null);
            } else {
                if (logSql) logger.debug(rows, "mysql.selectSetsAndIndicatorsForAssessmentByMmei");
                callback(rows);
            }
        });
    }
    else {
        logger.error("No indicatorId provided", "mysql.selectSetsAndIndicatorsForAssessmentByMmei");
        callback(null);
    }
};
exports.selectSetsAndIndicatorsForAssessmentByMmei = selectSetsAndIndicatorsForAssessmentByMmei;



/*
 INSERT
 */

/**
 * Inser new user candidate in database
 * @param callback gets called with success result or error
 */
var insertUserCandidate = function (userCandidate, callback) {
    if (userCandidate && typeof userCandidate != "function") {
        dbConnection.query("INSERT INTO user_candidate SET ?", userCandidate, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserCandidate");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserCandidate");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserCandidate");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertUserCandidate");
        callback(null);
    }
};
exports.insertUserCandidate = insertUserCandidate;

/**
 * Inser new user in database
 * @param callback gets called with success result or error
 */
var insertUser = function (user, callback) {
    if (user && typeof user != "function") {
        dbConnection.query("INSERT INTO user SET ?", user, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUser");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUser");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUser");
                callback(results);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.insertUser");
        callback(null);
    }
};
exports.insertUser = insertUser;

/**
 * Inser new user group in database
 * @param callback gets called with success result or error
 */
var insertUserGroup = function (userGroup, callback) {
    if (userGroup && typeof userGroup != "function") {
        dbConnection.query("INSERT INTO user_group SET ?", userGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroup provided", "mysql.insertUserGroup");
        callback(null);
    }
};
exports.insertUserGroup = insertUserGroup;

/**
 * Inser new user in group
 * @param callback gets called with success result or error
 */
var insertUserInGroup = function (userGroupId, userId, callback) {
    if (userGroupId && typeof userGroupId != "function" && userId && typeof userId != "function") {
        var userInGroup = {user_group_id: userGroupId, user_id: userId};
        dbConnection.query("INSERT INTO user_in_group SET ?", userInGroup, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertUserInGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertUserInGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertUserInGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroupId or userId provided", "mysql.insertUserInGroup");
        callback(null);
    }
};
exports.insertUserInGroup = insertUserInGroup;

/**
 * Inser new indicator in set
 * @param callback gets called with success result or error
 */
var insertIndicatorInSet = function (setId, indicatorId, callback) {
    if (indicatorId && typeof indicatorId != "function" && setId && typeof setId != "function") {
        var indicatorInSet = {indicator_id: indicatorId, indicator_set_id: setId};
        dbConnection.query("INSERT INTO indicator_in_set SET ?", indicatorInSet, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertIndicatorInSet");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertIndicatorInSet");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertIndicatorInSet");
                callback(results);
            }
        });
    }
    else {
        logger.error("No indicatorId or setId provided", "mysql.insertIndicatorInSet");
        callback(null);
    }
};
exports.insertIndicatorInSet = insertIndicatorInSet;

/**
 * Inser new set in assessment
 * @param callback gets called with success result or error
 */
var insertSetInAssessment = function (setId, assessmentId, callback) {
    if (setId && typeof setId != "function" && assessmentId && typeof assessmentId != "function") {
        var setInAssessment = {indicator_set_id: setId, assessment_id: assessmentId};
        dbConnection.query("INSERT INTO set_in_assessment SET ?", setInAssessment, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertSetInAssessment");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertSetInAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertSetInAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No setId or assessmentId provided", "mysql.insertSetInAssessment");
        callback(null);
    }
};
exports.insertSetInAssessment = insertSetInAssessment;

/**
 * Inser new indicator in database
 * @param callback gets called with success result or error
 */
var insertIndicator = function (indicator, callback) {
    if (indicator && typeof indicator != "function") {
        dbConnection.query("INSERT INTO indicator SET ?", indicator, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertIndicator");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertIndicator");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertIndicator");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertIndicator");
        callback(null);
    }
};
exports.insertIndicator = insertIndicator;

/**
 * Inser new indicator assessment in database
 * @param callback gets called with success result or error
 */
var insertIndicatorAssessment = function (assessment, callback) {
    if (assessment && typeof assessment != "function") {
        dbConnection.query("INSERT INTO indicator_assessment SET ?", assessment, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertIndicatorAssessment");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertIndicatorAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertIndicatorAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertIndicatorAssessment");
        callback(null);
    }
};
exports.insertIndicatorAssessment = insertIndicatorAssessment;

/**
 * Inser new indicator set in database
 * @param callback gets called with success result or error
 */
var insertIndicatorSet = function (indicator_set, callback) {
    if (indicator_set && typeof indicator_set != "function") {
        dbConnection.query("INSERT INTO indicator_set SET ?", indicator_set, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertIndicatorSet");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertIndicatorSet");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertIndicatorSet");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertIndicatorSet");
        callback(null);
    }
};
exports.insertIndicatorSet = insertIndicatorSet;

/**
 * Inser new assessment in database
 * @param callback gets called with success result or error
 */
var insertAssessment = function (assessment, callback) {
    if (assessment && typeof assessment != "function") {
        dbConnection.query("INSERT INTO assessment SET ?", assessment, function (err, results) {
            if (err) {
                logger.error(err, "mysql.insertAssessment");
                callback(null);
            } else if (results.affectedRows == 0) {
                logger.warn("Nothing got inserted", results, "mysql.insertAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.insertAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userCandidate provided", "mysql.insertAssessment");
        callback(null);
    }
};
exports.insertAssessment = insertAssessment;



/*
 DELETE
 */

/**
 * Remove user from group in database
 * @param callback gets called with success result or error
 */
var deleteUserFromGroup = function (userGroupId, userId, callback) {
    if (userGroupId && typeof userGroupId != "function" && userId && typeof userId != "function") {
        dbConnection.query("DELETE FROM user_in_group WHERE user_group_id = ? AND user_id = ?", [userGroupId, userId], function (err, results) {
            if (err) {
                logger.error(err, "mysql.deleteUserFromGroup");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got deleted", results, "mysql.deleteUserFromGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.deleteUserFromGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroupId or userId provided", "mysql.deleteUserFromGroup");
        callback(null);
    }
};
exports.deleteUserFromGroup = deleteUserFromGroup;

/**
 * Remove indicator from set in database
 * @param callback gets called with success result or error
 */
var deleteIndicatorFromSet = function (setId, indicatorId, callback) {
    if (indicatorId && typeof indicatorId != "function" && setId && typeof setId != "function") {
        dbConnection.query("DELETE FROM indicator_in_set WHERE indicator_id = ? AND indicator_set_id = ?", [indicatorId, setId], function (err, results) {
            if (err) {
                logger.error(err, "mysql.deleteIndicatorFromSet");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got deleted", results, "mysql.deleteIndicatorFromSet");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.deleteIndicatorFromSet");
                callback(results);
            }
        });
    }
    else {
        logger.error("No indicatorId or setId provided", "mysql.deleteIndicatorFromSet");
        callback(null);
    }
};
exports.deleteIndicatorFromSet = deleteIndicatorFromSet;

/**
 * Remove set from assessment in database
 * @param callback gets called with success result or error
 */
var deleteSetFromAssessment = function (setId, assessmentId, callback) {
    if (assessmentId && typeof assessmentId != "function" && setId && typeof setId != "function") {
        dbConnection.query("DELETE FROM set_in_assessment WHERE assessment_id = ? AND indicator_set_id = ?", [assessmentId, setId], function (err, results) {
            if (err) {
                logger.error(err, "mysql.deleteSetFromAssessment");
                callback(null);
            } else if (!results.affectedRows || results.affectedRows == 0) {
                logger.warn("Nothing got deleted", results, "mysql.deleteSetFromAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.deleteSetFromAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No assessmentId or setId provided", "mysql.deleteSetFromAssessment");
        callback(null);
    }
};
exports.deleteSetFromAssessment = deleteSetFromAssessment;

/**
 * Delete indicator assessment from database
 * @param callback gets called with success result or error
 */
var deleteIndicatorAssessment = function (assessment, callback) {
    if (assessment && typeof assessment != "function") {
        dbConnection.query("DELETE FROM indicator_assessment WHERE assessment_id = ? AND indicator_id = ?", [assessment.assessment_id, assessment.indicator_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.deleteIndicatorAssessment");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.deleteIndicatorAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.deleteIndicatorAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No assessment provided", "mysql.deleteIndicatorAssessment");
        callback(null);
    }
};
exports.deleteIndicatorAssessment = deleteIndicatorAssessment;



/*
 UPDATE
 */

/**
 * Update user candidate with email sent timestamp
 * @param token of the user candidate
 * @param callback gets called with query result rows
 */
var updateUserCandidateSent = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("UPDATE user_candidate SET email_sent = FROM_UNIXTIME(?) WHERE token = ?", [Math.floor(Date.now() / 1000), token], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserCandidateSent");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserCandidateSent");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserCandidateSent");
                callback(results);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.updateUserCandidateSent");
        callback(null);
    }
};
exports.updateUserCandidateSent = updateUserCandidateSent;

/**
 * Update user group with data
 * @param userGroup changes for user group
 * @param callback gets called with query result rows
 */
var updateUserGroup = function (userGroup, callback) {
    if (userGroup && typeof userGroup != "function") {
        dbConnection.query("UPDATE user_group SET ? WHERE user_group_id = ?", [userGroup, userGroup.user_group_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserGroup");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserGroup");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserGroup");
                callback(results);
            }
        });
    }
    else {
        logger.error("No userGroup provided", "mysql.updateUserGroup");
        callback(null);
    }
};
exports.updateUserGroup = updateUserGroup;


/**
 * Update user candidate with registered is true
 * @param token of the user candidate
 * @param callback gets called with query result rows
 */
var updateUserCandidateRegistered = function (token, callback) {
    if (token && typeof token != "function") {
        dbConnection.query("UPDATE user_candidate SET registered = 1 WHERE token = ?", [token], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUserCandidateRegistered");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUserCandidateRegistered");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUserCandidateRegistered");
                callback(results);
            }
        });
    }
    else {
        logger.error("No token provided", "mysql.updateUserCandidateRegistered");
        callback(null);
    }
};
exports.updateUserCandidateRegistered = updateUserCandidateRegistered;

/**
 * Update user with data
 * @param user changes for user
 * @param callback gets called with query result rows
 */
var updateUser = function (user, callback) {
    if (user && typeof user != "function") {
        dbConnection.query("UPDATE user SET ? WHERE user_id = ?", [user, user.user_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUser");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateUser");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateUser");
                callback(results);
            }
        });
    }
    else {
        logger.error("No user provided", "mysql.updateUser");
        callback(null);
    }
};
exports.updateUser = updateUser;

/**
 * Update indicator set with data
 * @param set changes for indicator set
 * @param callback gets called with query result rows
 */
var updateIndicatorSet = function (set, callback) {
    if (set && typeof set != "function") {
        dbConnection.query("UPDATE indicator_set SET ? WHERE indicator_set_id = ?", [set, set.indicator_set_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateUser");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateIndicatorSet");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateIndicatorSet");
                callback(results);
            }
        });
    }
    else {
        logger.error("No set provided", "mysql.updateIndicatorSet");
        callback(null);
    }
};
exports.updateIndicatorSet = updateIndicatorSet;

/**
 * Update indicator assessment with data
 * @param assessment changes for indicator assessment
 * @param callback gets called with query result rows
 */
var updateIndicatorAssessment = function (assessment, callback) {
    if (assessment && typeof assessment != "function") {
        dbConnection.query("UPDATE indicator_assessment SET ? WHERE assessment_id = ? AND indicator_id = ?", [assessment, assessment.assessment_id, assessment.indicator_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateIndicatorAssessment");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateIndicatorAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateIndicatorAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No assessment provided", "mysql.updateIndicatorAssessment");
        callback(null);
    }
};
exports.updateIndicatorAssessment = updateIndicatorAssessment;

/**
 * Update assessment with data
 * @param assessment changes for asessment
 * @param callback gets called with query result rows
 */
var updateAssessment = function (assessment, callback) {
    logger.debug(assessment, "assessment")
    if (assessment && typeof assessment != "function") {
        dbConnection.query("UPDATE assessment SET ? WHERE assessment_id = ?", [assessment, assessment.assessment_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateAssessment");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateAssessment");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateAssessment");
                callback(results);
            }
        });
    }
    else {
        logger.error("No assessment provided", "mysql.updateAssessment");
        callback(null);
    }
};
exports.updateAssessment = updateAssessment;

/**
 * Update indicator with data
 * @param indicator changes for indicator
 * @param callback gets called with query result rows
 */
var updateIndicator = function (indicator, callback) {
    if (indicator && typeof indicator != "function") {
        dbConnection.query("UPDATE indicator SET ? WHERE indicator_id = ?", [indicator, indicator.indicator_id], function (err, results) {
            if (err) {
                logger.error(err, "mysql.updateIndicator");
                callback(null);
            } else if (results.changedRows == 0) {
                logger.warn("Nothing got updated", results, "mysql.updateIndicator");
                callback(null);
            } else {
                if (logSql) logger.debug(results, "mysql.updateIndicator");
                callback(results);
            }
        });
    }
    else {
        logger.error("No indicator provided", "mysql.updateIndicator");
        callback(null);
    }
};
exports.updateIndicator = updateIndicator;


/*
 MIDDLEWARE
 */

/**
 * Middleware function
 * Look for user row in database for given username
 * @param req express framework request object
 * @param res express framework response object
 * @param next express framework next function if used as middleware
 * @param username for checking database
 * @param callback gets called with query result rows
 */
var getUserForUsername = function (req, res, next, username, callback) {
    selectUserForUsername(username, function (user) {
        callback(req, res, next, user);
    });
};
exports.getUserForUsername = getUserForUsername;


/*
 OTHER
 */

/**
 * Get the user and user group specific data for the start page
 * @param user authenticated user object
 * @param callback gets called with query result rows
 */
var getStartPageData = function (user, callback) {
    if (user) {
        switch (user.user_role_id) {
            case USER_ROLES.admin.id:
                selectAllUsersByDate(function (users) {
                    selectAllUserGroupsByDate(function (userGroups) {
                        var groupData = {users: users, userGroups: userGroups};
                        if (logSql) logger.debug(groupData, "mysql.getStartPageData");
                        callback(groupData);
                    });
                });
                break;

            case USER_ROLES.expert.id:
                selectUserGroupsForUserId(user.user_id, function(user_groups) {
                    var user_group_id = null;
                    if (user_groups && user_groups.length > 0) user_group_id = user_groups[0].user_group_id;
                    selectAllIndicatorsByName(user.user_id, user_group_id, function (indicators) {
                        selectAllIndicatorSetsByName(user.user_id, user_group_id, function (sets) {
                            var groupData = {indicators: indicators, sets: sets};
                            if (logSql) logger.debug(groupData, "mysql.getStartPageData");
                            callback(groupData);
                        });
                    });
                });
                break;

            case USER_ROLES.auditor.id:
                selectAllAssessmentsByName(user.user_id, user.user_group_id, function(assessments) {
                    var groupData = {assessments: assessments};
                    if (logSql) logger.debug(groupData, "mysql.getStartPageData");
                    callback(groupData);
                });
                break;

            case USER_ROLES.privateUser.id:
                selectPublicAssessmentsByName(function(assessments) {
                    var groupData = {publicAssessments: assessments};
                    if (logSql) logger.debug(groupData, "mysql.getStartPageData");
                    callback(groupData);
                });
                break;

            default:
                callback(null);
                break;
        }
    }
    else {
        selectPublicAssessmentsByName(function(assessments) {
            var groupData = {publicAssessments: assessments};
            if (logSql) logger.debug(groupData, "mysql.getStartPageData");
            callback(groupData);
        });
    }
};
exports.getStartPageData = getStartPageData;