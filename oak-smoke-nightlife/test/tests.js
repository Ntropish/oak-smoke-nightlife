var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
//var config = require('./config-debug');

describe('Routing', function() {
    var url = 'localhost:3000';

    describe('User', function(){
        it('should return failure trying to login with wrong password', function(done){
            var data = {
                username: 'cat',
                password: 'pin'
            };

            request(url).post('/login').send(data).end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.equal(res.body.success, false);
                done();
            });
        });
    });

});