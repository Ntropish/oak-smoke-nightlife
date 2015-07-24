/* global require: false, module: true */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Bar = mongoose.model('Bar');
var key = require('../secret/apiKey');



// Get the bars in a city
router.get(
    '/',
    function(req, res) {

        // Request data from places api and handle data/send response
        function makeRequest() {
            request.get({
                url:url,
                qs: {
                    key: key,
                    location: location,
                    types: 'bar',
                    rankby: 'distance'
                }
            }, function(err, resp){
                if (err) {
                    console.error('search error:', err);
                }

                // Check for existing bar and add it if non-existent
                function checkBar(googlesBar, index) {
                    Bar.findOne({googleId: googlesBar.id}, function(err, bar){
                        if (err) {
                            console.error(err);
                        }
                        if (bar) {
                            outputBars.push({name: bar.name, attending: bar.numberVisiting, id: bar.googleId});
                        } else {
                            var newBar = new Bar({name: googlesBar.name, numberVisiting: 0, googleId: googlesBar.id});
                            newBar.save(function(err){
                                console.error('error saving bar:', err);
                            });
                            outputBars.push({name: googlesBar.name, attending: 0, id: googlesBar.id});
                        }

                        // Send the output when the last bar is checked
                        if (index+1 === numberOfBars) {
                            res.send(outputBars);
                        }
                    });
                }
                var barsFromGoogle = JSON.parse(resp.body).results;
                var numberOfBars = barsFromGoogle.length;
                var outputBars = [];
                barsFromGoogle.forEach(checkBar);
            });
        }
        var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        var report = {success: false};
        var username = '';
        var location = '';
        var sentLocation = req.query.location;

        // If no location was given and user is authenticated, check for saved location
        if (req.isAuthenticated() && !sentLocation) {
            username = req.passport.session.user;
            User.findOne({username: username}, function(err, user){
                if (err) {
                    console.error('database error(city, GET, findOne, username):',err);
                }
                // If a user was found set usersLocation to the found user's location
                var usersLocation = user && user.location;

                // If usersLocation is truthy, set location to that value
                // Not setting location directly to usersLocation because it might
                // be useful to keep location as an empty string
                if (usersLocation) {
                    location = usersLocation;
                    makeRequest();
                }
            });

        } else if (sentLocation) {
            location = sentLocation;
            makeRequest();
        } else {
            // If program gets here there was no location to search for
            report.isNoLocation = true;
            res.send(report);
        }
    }
);

// Set the user's attendance
router.post(
    '/',
    function(req, res) {
        var report = {success: false};
        var newPlaceId = req.body.id;

        if (!newPlaceId) {
            report.isNoId = true;
        }
        if (!req.isAuthenticated()) {
            report.isAuthenticated = false;
        }

        if (req.isAuthenticated() && newPlaceId) {
            User.findOne({username: req.session.passport.user}, function(err, user) {

                if (err) {
                    console.error('database error(city, POST, user, findOne):',err);
                }
                if (user) {
                    if(user.visiting === newPlaceId) {
                        report.success = true;
                        res.send(report);
                    } else {
                        Bar.findOne({googleId: user.visiting}, function (err, bar) {
                            if (err) {
                                console.error('database error(city, POST, bar, findOne, user.visiting):', err);
                            }
                            if (bar) {
                                bar.numberVisiting -= 1;
                                bar.save(function (err) {
                                    if (err) {
                                        console.error('database error:(city, POST, findOne, newPlaceId, saving', err);
                                    }
                                });
                            }
                        });
                        Bar.findOne({googleId: newPlaceId}, function (err, bar) {
                            if (err) {
                                console.error('database error(city, POST, bar, findOne, newPlaceId):', err);
                            }
                            if (bar) {
                                bar.numberVisiting += 1;
                                bar.save(function (err) {
                                    if (err) {
                                        console.error('database error:(city, POST, findOne, newPlaceId, saving', err);
                                    }
                                });
                            }
                        });
                        user.visiting = newPlaceId;
                        user.save(function (err) {
                            if (err) {
                                console.error('database error(city, POST, user, save):', err);
                            }
                        });
                        res.send(report);
                    }
                } else {
                    report.userNotFound = true;
                    res.send(report);
                }
            });
            report.success = true;
        } else {
            res.send(report);
        }
    }
);

module.exports = router;
