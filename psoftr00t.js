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
var cors = require('cors');
var moment = require('moment');

var schedule = require('node-schedule');
//var moment = require('moment');


//load utility module
var utils =  "";

/*==========================Load config===================================*/

var app_config = "";
var db_config = "";

try {
    utils = require("./api/PS2Utils.js");
    app_config = require('./config/psoft_config.js');          //application config
    db_config = require('./config/dbconfig.js');                 //database config
}
catch(e){
    if(utils == "") {
        console.log(e);
    }
    else {
        utils.logMe(e);
    }
    return;
}

var port = app_config.r00t_port;         //port that predictsoft r00t will run on
var app_name = app_config.app_name;
var app_version = app_config.app_version;

var app = express();

var lock_threshold = app_config.match_lock_threshold_in_minutes;        //look-ahead time in minutes

var admin_user_name = "N/A";    //global var to track user information  TODO: convert to JSON object if moar r00t parms need to be tracked

/*==========================DB definitions================================*/

var sqlConn = new Sequelize(
    db_config.database,    //prod DB
    db_config.user,          //user
    db_config.password,      //pass
    {
        host: db_config.host,
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


/* ========================== MIDDLEWARE LAYER =============================*/

var router = express.Router();

//middleware to use for all requests...
router.use(function (req, res, next) {

    if(!req.body || !req.body.token){
        res.json("Invalid request received");
        res.end();
        return;
    }
    //validate user

    var playerToken = req.body.token;
    var midwr_ret_object = {
        message: "",
        success: false
    };
    // 1. Validate administrator access

    var getr00t_query = "SELECT name FROM users WHERE auth_key = '" + playerToken + "' AND isr00t = 1";
    sqlConn.query(
        getr00t_query,
        { type: sqlConn.QueryTypes.SELECT })
        .then(function (adminObject) {
            if (adminObject.length <= 0) {
                //could not validate as admin user
                midwr_ret_object.message = "ERR_ACCESS_DENIED - User with token " + playerToken + " was not found in the administrator group.";
                midwr_ret_object.success = false;
                //utils.logMe(resObj.message);
                throw (midwr_ret_object.message);
            }
            admin_user_name = adminObject[0].name;
        }).then(function(){
        utils.logMe("### ADMIN_AUTH:: Logged in as " + admin_user_name);
        next();         //move on...
    })
    .catch(function (err) {
        midwr_ret_object.message = "ERR_USER_NOT_VERIFIED:: Error trying to validate permissions for user '" + req.query.token + "'. See log for more details.";
        midwr_ret_object.success = false;
        utils.logMe(midwr_ret_object.message + " [Details: " + err + " ]");        //only log error details, don't send to post
        res.json(midwr_ret_object);
        res.end();
        return;
    });
});

app.use(bodyParser.json());                 		//this lets Express handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cors());            //cross browser origin support

app.use(router);

/*========================== SCHEDULER =====================================*/
//function to check and lock matches; runs two times, as according to IPL 2018 times (2000 hrs and 1600 hrs IST/server times are in EST)
//also remember to change value for 'match_lock_threshold_in_minutes' in config file
var lockFirstMatchIPL2018 = schedule.scheduleJob('30 9 * * *',function(){      //1 hour prior to 10:30 am EST
    lockMatch(lock_threshold)
        .then(function () {
            var lock_done_msg = "*** Upcoming match has been locked successfully at 10:15 AM EDST by psoft scheduler.";
            utils.logMe(lock_done_msg);

            getPredictionList()
                .then(function (pred_list) {
                    sendEmailWithPredictions(pred_list);
                    return;
                })
        })
        .error(function(err){
            utils.logMe("Error trying to lock match by schedule at 9:30 AM EDST. Description: ",err);
            return;
        });
});

var lockSecondMatchIPL2018 = schedule.scheduleJob('30 5 * * *',function(){     //15 min prior to 6:30 am EST

    lockMatch(lock_threshold)
        .then(function () {
            var lock_done_msg = "*** Upcoming match has been locked successfully at 5:30 AM EDST by psoft scheduler.";
            utils.logMe(lock_done_msg);
            getPredictionList()
                .then(function (pred_list) {
                    sendEmailWithPredictions(pred_list);
                    return;
                })
        })
        .error(function(err){
            utils.logMe("Error trying to lock match at 5:30 AM EDST. Description: ",err);
            return;
        });
});

/*=========================== ADMIN API FUNCTIONS ==========================*/

app.post("/api/lockNextMatch",function (req, res) {

    lockMatch(lock_threshold)
        .then(function () {
            var lock_done_msg = "Match locked by API successfully (LOCK_THRESHOLD = " + lock_threshold + " minutes)";
            utils.logMe(lock_done_msg);
            res.json(lock_done_msg);

            getPredictionList()
                .then(function (pred_list) {
                    sendEmailWithPredictions(pred_list);
                    return res;
                })
        })
        .error(function(err){
            res.json("Error trying to lock match by API call. Description: ",err);
            return res;
        });
});

app.post("/api/adminActivateNextMatch", function (req, res) {

    activateNextMatch()
        .then(function(){
           var activated_msg = "Ran stored procedure to activate next day's match. Please validate in browser.";
            utils.logMe(activated_msg);
            res.json(activated_msg);
            return res;
        });
});

app.post("/api/FixTables",function (req,res) {

    //regenerate user scores by calculating from prediction and match history (run to fix scores in user table)
    fixUserScores()
        .then(function(){

            //add any additional check and fix conditions here

            var msg = "Ran stored procedure to fix database tables";
            utils.logMe(msg);
            res.json(msg);
            return res;
        });
});

app.post("/api/adminUpdateAfterMatch",function (req,res) {

    //update scores and next day's match
    var resObj = {
        message: "",
        success: false
    };

    if(!req.body){
        resObj.message= "ADMIN_UPDATE_ERROR: IMPROPERLY FORMED POST REQUEST";
        resObj.success = false;
        utils.logMe(resObj.message);
        res.json(resObj);
        res.end();
    }

    if(!req.body.matchID || !req.body.winningTeamID)
    {
        resObj.message = "ADMIN_UPDATE_ERROR:: Insufficient number of parameters specified in request";
        resObj.success = false;
        res.json(resObj);
        res.end();
    }

    var matchID = req.body.matchID;
    var winningTeamID = req.body.winningTeamID;

    var SP_update_query = "CALL update_scores('" + matchID + "','" + winningTeamID + "');";

    sqlConn.query(SP_update_query)
        .then(function (){

            var success_message = "***  { ADMIN_USER : " + admin_user_name + " } Match scores successfully updated for matchID " + matchID + " [Winning TeamID: " + winningTeamID + "]";
            resObj.message = success_message;
            resObj.success = true;
            console.log(resObj.message);

            // Activate next day's match(es)
            activateNextMatch()
                .then(function(){
                    //all steps so far have been successful!
                    utils.logMe("*** Activated next day's match");
                    res.json(resObj);
                    res.end();
                });
        })
        .catch(function (err) {
            resObj.message = "ERR_USER_NOT_VERIFIED:: Error trying to validate permissions for user '" + req.query.token + "'. Please check admin log for more details.";
            resObj.success = false;
            utils.logMe(resObj.message + " [Details: " + err + " ]");        //only log error details, don't send to post
            res.json(resObj);
            res.end();
        });
});

app.post("/api/r00tSendAdminEmail", function (req, res) {

    console.log(req.body);
    if (!req.body) {
        res.json({Message: "Invalid admin request, aborting..."});
        return;
    }

    var subject= req.body.subject;

    utils.sendConfirmation(new Date(), "You have chosen England as your team", "Khal Drogo", 'grv2k6@gmail.com');


    /*
    var bodyText = req.body.message;


    sendEmail(
        playerEmail,                //To
        title,                      //Title of email
        messageBody                 //Message Body
    );
   */

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
};

var activateNextMatch = function(){
    utils.logMe("Running stored procedure to activate next match(es)");
    var SP_activate_query = "CALL sp_activate_next_match();";
    return sqlConn.query(SP_activate_query);
};

var fixUserScores = function () {
    //TODO: stored procedure to fix user tables
    return;
};
    
/*
create HTML table of predictions
 */
var buildPredictionTable = function (json) {
    var tr;
    var HTMLTable = "<table>";

    HTMLTable += "<tr bgcolor='#87cefa'><th>Player</th><th>Predicted Team</th></tr>";

    for(var i=0;i<json.length; i++){
        tr = '<tr>';
        tr += "<td>" + json[i].name + "</td>";
        tr += "<td>" + json[i].PredictedTeam + "</td>";
        tr += "</tr>";
        HTMLTable += tr;
    }
    HTMLTable += "</table>";

    return HTMLTable;
};

var createPredictionEmailBody = function(next_match_date, prediction_table) {
    var email_body = "<html>";

    var email_header_line = "<h2>Predictions for the next match at " + next_match_date + ": </h2>";

    email_body += email_header_line;
    email_body += prediction_table;

    /*var messageBody = "<h1>Thank you " + nameOfPlayer + "!</h1><h2>We have received your submission for " + moment(matchdate).format("MMMM Do YYYY, h:mm a") + ".</h2>"
     + "<p>&nbsp;</p>"+ confirmSnippet +"<p>&nbsp;</p>"
     + "<p><strong>Good luck!</strong></p>"
     + "<p><strong>The Predictsoft team</strong></p>"
     + "<p>&nbsp;</p><p><strong>&nbsp;</strong></p>";*/
    //confirmSnippet is sth like "You chose [TEAM] for the next match.";
    return email_body;
};

/* Sends email with a list of predictions for the recently locked match to all players */
var sendEmailWithPredictions = function(prediction_list){
    //1. create HTML table of predictions
    var next_match_date =  moment(prediction_list[0].MatchDate).format("MMMM Do YYYY, h:mm a");
    var title = "Prediction list for next upcoming match at " + next_match_date;
    var email_body = createPredictionEmailBody(next_match_date,buildPredictionTable(prediction_list));

    //2. send email to EVERY player with prediction table for next match
    getEmailList()
        .then(function(email_list){
            for(var i=0;i<email_list.length;i++){
                utils.sendMessage(
                    email_list[i].email,         //To
                    title,                      //Title of email
                    email_body                 //Message Body
                );
            }
            //console.log("****THIS IS THE DISTRO: \n" + email_list);
            //console.log("****THIS IS THE PREDICTION TABLE: \n" + email_body)
            return;
        })
        .error(function(err){
            res.json("Error trying to send email with prediction list. Description: ",err);
            return;
        });

};

/* Runs query to find the list of the match that was just locked (the immediate next match coming up)*/
var getPredictionList = function(){
            var get_predictions_query = "SELECT u.name, u.email, m.MatchDate, (SELECT Name FROM teams WHERE teamID = p.predictedTeamID) As PredictedTeam FROM prediction p, users u, teams t, `match` m WHERE p.playerID = u.userID AND p.matchID IN (SELECT * FROM (SELECT matchID FROM `match` WHERE isActive =1 AND isLocked = 1 ORDER BY matchID DESC LIMIT 1) AS mID) AND p.matchID = m.matchID AND t.teamID IN (m.Team1ID, m.Team2ID, 50) AND p.predictedTeamID = t.teamID";
            //console.log(get_predictions_query);
            return sqlConn.query(get_predictions_query, {type: sqlConn.QueryTypes.SELECT});
};

/*
Return array of email addresses from prediction list object
 */
var getEmails = function(pred_list) {

    var distro_list = [];

    for(var i=0;i<pred_list.length;i++){
        distro_list.push(pred_list[i].email);
    }

    return distro_list;
}

/* Scrapes and fetches all email addresses from users table */
var getEmailList = function () {
    var scrape_email_IDs_query = "SELECT email FROM users;"
    return sqlConn.query(scrape_email_IDs_query, {type: sqlConn.QueryTypes.SELECT});
}

/*app starts here....*/

app.listen(port);
utils.logMe("psoftr00t service started on port " + port);
utils.logMe("Started scheduler for auto-locking 10:30 AM EDST match " + lockFirstMatchIPL2018.name);
lockFirstMatchIPL2018.name = "LockFirstMatch";
utils.logMe("Started scheduler for auto-locking 6:30 AM EDST match " + lockSecondMatchIPL2018.name);