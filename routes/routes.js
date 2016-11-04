var express = require('express');
var logger = require('../logger');

var user = require('./user');
var admin = require('./admin');
var expert = require('./expert');
var auditor = require('./auditor');



/**
 * routes
 */
var router = express.Router();
// Index
router.route('/')
    .get(user.getIndex);
router.route('/login')
    .get(user.getLogin)
    .post(user.postLogin);
router.route('/logout')
    .get(user.getLogout);

// Admin
router.route('/admin/createUserCandidate')
    .get(function(req, res) {user.isUserRole(req, res, admin.getCreateUserCandidate, USER_ROLES.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postCreateUserCandidate, USER_ROLES.admin)});
router.route('/admin/createUserGroup')
    .get(function(req, res) {user.isUserRole(req, res, admin.getCreateUserGroup, USER_ROLES.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postCreateUserGroup, USER_ROLES.admin)});
router.route('/admin/manageUserGroup/:userGroupId')
    .get(function(req, res) {user.isUserRole(req, res, admin.getManageUserGroup, USER_ROLES.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postManageUserGroup, USER_ROLES.admin)});
router.route('/admin/manageUser/:userId')
    .get(function(req, res) {user.isUserRole(req, res, admin.getManageUser, USER_ROLES.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postManageUser, USER_ROLES.admin)});

// Experte
router.route('/expert/createIndicatorSet')
    .get(function(req, res) {user.isUserRole(req, res, expert.getCreateIndicatorSet, USER_ROLES.expert)})
    .post(function(req, res) {user.isUserRole(req, res, expert.postCreateIndicatorSet, USER_ROLES.expert)});
router.route('/expert/createIndicator')
    .get(function(req, res) {user.isUserRole(req, res, expert.getCreateIndicator, USER_ROLES.expert)})
    .post(function(req, res) {user.isUserRole(req, res, expert.postCreateIndicator, USER_ROLES.expert)});
router.route('/expert/manageIndicator/:indicatorId')
    .get(function(req, res) {user.isUserRole(req, res, expert.getManageIndicator, USER_ROLES.expert)})
    .post(function(req, res) {user.isUserRole(req, res, expert.postManageIndicator, USER_ROLES.expert)});
router.route('/expert/manageIndicatorSet/:setId')
    .get(function(req, res) {user.isUserRole(req, res, expert.getManageIndicatorSet, USER_ROLES.expert)})
    .post(function(req, res) {user.isUserRole(req, res, expert.postManageIndicatorSet, USER_ROLES.expert)});

// Auditor
router.route('/auditor/createAssessment')
    .get(function(req, res) {user.isUserRole(req, res, auditor.getCreateAssessment, USER_ROLES.auditor)})
    .post(function(req, res) {user.isUserRole(req, res, auditor.postCreateAssessment, USER_ROLES.auditor)});
router.route('/auditor/manageAssessment/:assessmentId')
    .get(function(req, res) {user.isUserRole(req, res, auditor.getManageAssessment, USER_ROLES.auditor)})
    .post(function(req, res) {user.isUserRole(req, res, auditor.postManageAssessment, USER_ROLES.auditor)});
router.route('/auditor/assessAssessment/:assessmentId')
    .get(function(req, res) {user.isUserRole(req, res, auditor.getAssessAssessment, USER_ROLES.auditor)})
    .post(function(req, res) {user.isUserRole(req, res, auditor.postAssessAssessment, USER_ROLES.auditor)});

// Nutzer
router.route('/registration/:token')
    .get(user.getRegisterUser)
    .post(user.postRegisterUser);
router.route('/user/viewAssessment/:assessmentId')
    .get(user.getPublicAssessment);



module.exports.router = router;



// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404).render('index', {errMessage: '404 Not Found (' + req.url + ')'})
};
module.exports.notFound404 = notFound404;