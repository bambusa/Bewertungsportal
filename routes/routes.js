var bcrypt = require('bcrypt-nodejs');
var express = require('express');
var logger = require('../logger');



var user = require('./user');
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



module.exports.router = router;

// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404).render('error', {message: '404 Not Found (' + req.url + ')'})
};
module.exports.notFound404 = notFound404;