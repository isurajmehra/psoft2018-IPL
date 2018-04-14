/*
 // (C)grjoshi 4/14/2018
 routes.js  - handles routing for predictsoft admin service
 */

var PSUtils = require('./PSUtils');
var express = require('express');
var router = express.Router();


var psoftr00t = require('./adminModule');

router.get('/admin_ping', psoftr00t.r00tPing);