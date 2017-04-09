/**
 * psoftr00t.js - NodeJS script for admin functionality for PredictSoft v2.10 (2017 IPL)
 * Created by G (ever3stmomo@gmail.com) on 4/8/2017.
 *
 */
var express = require('express');
var app = express();
var morgan = require('morgan');
var Sequelize = require('sequelize');
var bodyParser = require('body-parser');      //for letting Express handle POST data
var favicon = require('serve-favicon');

var schedule = require('node-schedule');
//var moment = require('moment');

//load API modules
var dbconfig = require('./api/dbconfig.js');        //load config module
var utils = require("./api/PS2Utils.js");
//var users = require("./api/userModule.js")

//define port that psoft admin server will run on
var port = 8090;

/*==========================DB definitions================================*/

var sqlConn = new Sequelize(
    dbconfig.database,    //prod DB
    dbconfig.user,          //user
    dbconfig.password,      //pass
    {
        host: dbconfig.host,
        //host: 'gubuntu.duckdns.org',
        dialect: 'mysql',
        logging: false,
        define: {
            freezeTableName: true          //so table names won't be assumed pluralized by the ORM
        },
        pool: {
            max: 50,
            min: 0,
            idle: 10000
        }
    });


/*========================== SCHEDULER =====================================*/

//function to lock matches based on match schedule. Runs on the 50th minute of every hour, checking to see if there's a
// match scheduled in the next 10 minutes, and then locks it

var lockMatchesHourly = schedule.scheduleJob('50 * * * *', function(){
    console.log('Scheduled log testing at '+utils.getNow());
});


//function to check and lock matches; runs two times, as according to IPL 2017 times (1020 hrs and 1420 hrs UTC)
var lockMatchesIPL2017 = schedule.scheduledJob('20 10 * * *',function(){
   console.log("I should check and log a match at " + utils.getNow());
});

var lockMatchesIPL2017 = schedule.scheduledJob('20 14 * * *',function(){
    console.log("I should check and log a match at " + utils.getNow());
});

app.post("/api/r00tSendAdminEmail", function (req, res) {

    console.log(req.body);
    if (!req.body) {
        res.json({Message: "Invalid admin request, aborting..."});
        return;
    }

    var subject= req.body.subject;

    utils.sendConfirmation(new Date(), "You have chosen England as your team", "Khal Drogo", 'grv2k6@gmail.com');


    var bodyText = req.body.message;


    sendEmail(
        playerEmail,                //To
        title,                      //Title of email
        messageBody                 //Message Body
    );


    res.json({message: 'OK'});
})

app.post("/api/r00tSendEmail", function (req, res) {

    console.log("This is your bau!");

    console.log(req);
    if (!req.body) {
        res.json({Message: "Invalid admin request, aborting..."});
        return;
    }

    //var subject= req.body.subject;

    /*utils.sendConfirmation(new Date(), "You have chosen England as your team", "Khal Drogo", 'grv2k6@gmail.com');


    var bodyText = req.body.message;


    sendEmail(
        playerEmail,                //To
        title,                      //Title of email
        messageBody                 //Message Body
    );

*/
    res.json({message: 'OK'});
})


/*app starts here....*/

app.listen(port);

utils.logMe("psoftr00t started on port " + port);