var express = require('express');
var logger = require('../logger');

var user = require('./user');
var admin = require('./admin');
var expert = require('./expert');



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
    .get(function(req, res) {user.isUserRole(req, res, admin.getCreateUserCandidate, userRoles.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postCreateUserCandidate, userRoles.admin)});
router.route('/admin/createUserGroup')
    .get(function(req, res) {user.isUserRole(req, res, admin.getCreateUserGroup, userRoles.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postCreateUserGroup, userRoles.admin)});
router.route('/admin/manageUserGroup/:userGroupId')
    .get(function(req, res) {user.isUserRole(req, res, admin.getManageUserGroup, userRoles.admin)})
    .post(function(req, res) {user.isUserRole(req, res, admin.postManageUserGroup, userRoles.admin)});
router.route('/registration/:token')
    .get(user.getRegisterUser)
    .post(user.postRegisterUser);
router.route('/expert/createIndicator')
    .get(function(req, res) {user.isUserRole(req, res, expert.getCreateIndicator, userRoles.expert)});
router.route('/expert/createIndicator/:action')
    .get(function(req, res) {user.isUserRole(req, res, expert.postCreateIndicator, userRoles.expert)});



module.exports.router = router;



// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404).render('index', {errMessage: '404 Not Found (' + req.url + ')'})
};
module.exports.notFound404 = notFound404;