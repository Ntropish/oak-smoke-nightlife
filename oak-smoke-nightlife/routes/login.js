/* global require: false, module: true */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Bar = mongoose.model('Bar');

//Authenticates using body.username and body.password
router.post(
    '/',
    passport.authenticate('local'),
    function(req, res) {
        if (req.isAuthenticated()) {
            res.send({success: true});
        }
    }
);

//Sends the username and location of the current user
router.get(
    '/',
    function(req, res) {
        var report = {success: false};
        if (req.isAuthenticated()) {
            report.success = true;
            report.username = req.session.passport.user;
            User.findOne({username: report.username}, function(err, user){
                if (err) {
                    console.error('database error:', err);
                }
                if (user) {
                    report.location = user.location;
                    report.visiting = user.visiting;
                }
                res.send(report);
            });
        } else {
            report.isNotAuthenticated = true;
            res.send(report);
        }

    }
);

module.exports = router;
