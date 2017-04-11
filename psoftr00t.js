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

var port = 8090;                //port that psoft admin server runs on
var lock_threshold = 15;        //look-ahead time in minutes TODO: get from config file...also create config file!

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

//function to check and lock matches; runs two times, as according to IPL 2017 times (1020 hrs and 1420 hrs UTC/server times are in EST)
var lockFirstMatchIPL2017 = schedule.scheduleJob('25 6 * * *',function(){      //6:25 am EST

    lockMatch(lock_threshold)
        .then(function (sp_response) {
            var lock_done_msg = "*** Upcoming match has been locked successfully at 6:25 AM EDST by psoft scheduler.";
            utils.logMe(lock_done_msg);
            return;
        })
        .error(function(err){
            utils.logMe("Error trying to lock match by schedule at 6:25 AM EDST. Description: ",err);
            return;
        });
});

var lockSecondMatchIPL2017 = schedule.scheduleJob('25 10 * * *',function(){     //10:25 am EST

    lockMatch(lock_threshold)
        .then(function (sp_response) {
            var lock_done_msg = "*** Upcoming match has been locked successfully at 10:25 AM EDST by psoft scheduler.";
            utils.logMe(lock_done_msg);
            return;
        })
        .error(function(err){
            utils.logMe("Error trying to lock match at 10:25 AM EDST. Description: ",err);
            return;
        });
});

app.post("/api/lockNextMatch",function (req, res) {

    lockMatch(lock_threshold)
        .then(function (sp_response) {
            var lock_done_msg = "Match locked by API successfully (LOCK_THRESHOLD = " + lock_threshold + " minutes)";
            utils.logMe(lock_done_msg);
            res.json(lock_done_msg);
            return res;
        })
        .error(function(err){
            res.json("Error trying to lock match by API call. Description: ",err);
            return res;
        });
})

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

/* private methods */

var lockMatch = function(threshold){
    utils.logMe("Running stored procedure to lock matches within the next "+threshold+" minutes...");
    var SP_query = "CALL lock_tables('" + threshold + "');";
    return sqlConn.query(SP_query);
}

/*app starts here....*/

app.listen(port);
utils.logMe("psoftr00t started on port " + port);
utils.logMe("Running scheduler: ",lockFirstMatchIPL2017);
utils.logMe("Running scheduler: ",lockSecondMatchIPL2017);