var express = require('express');
var router = express.Router();

router.post(
    '/', function(req, res){
        'use strict';
        req.logout();
        res.send({success: true});
    }
);

module.exports = router;
