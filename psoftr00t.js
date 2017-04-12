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


/* ========================== MIDDLEWARE LAYER =============================*/

app.use(bodyParser.json());                 		//this lets Express handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


var router = express.Router();

//middleware to use for all requests...
router.use(function (req, res, next) {
    if(req.body){
        utils.logMe("Middleware layer entered with ",req.body) ;
    }
    next();             //move on...
});


/*========================== SCHEDULER =====================================*/
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

/*=========================== ADMIN API FUNCTIONS ==========================*/

app.post("/api/lockNextMatch",function (req, res) {

    //TODO:: add authentication layer to further secure this

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
});

app.post("/api/adminActivateNextMatch", function (req, res) {

    //TODO:: add authentication layer to further secure this

    activateNextMatch()
        .then(function(){
           var activated_msg = "Ran stored procedure to activate next day's match. Please validate in browser.";
            utils.logMe(activated_msg);
            res.json(activated_msg);
            return res;
        });
});

//update scores and next day's match
app.post("/api/adminUpdateAfterMatch",function (req,res) {

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

    if(!req.body.token || !req.body.matchID || !req.body.winningTeamID)
    {
        resObj.message = "ADMIN_UPDATE_ERROR:: Insufficient number of parameters specified in request";
        resObj.success = false;
        res.json(resObj);
        res.end();
    }

    var playerToken = req.body.token;
    var matchID = req.body.matchID;
    var winningTeamID = req.body.winningTeamID;
    var admin_user_name = "N/A";
    //var scoreIncBy = req.body.scoreIncBy;

    // 1. Validate administrator access

    var getr00t_query = "SELECT name, isr00t FROM users WHERE auth_key = '" + playerToken + "' AND isr00t = 1";
    sqlConn.query(
        getr00t_query,
        { type: sqlConn.QueryTypes.SELECT })
        .then(function (adminObject) {
            if (adminObject.length <= 0) {
                //could not validate as admin user
                resObj.message = "ERR_ACCESS_DENIED - User with token " + playerToken + " was not found in the administrator group.";
                resObj.success = false;
                //utils.logMe(resObj.message);
                //res.json(resObj);
                //res.end();
                throw (resObj.message);
            }
            admin_user_name = adminObject[0].name;
            //utils.logMe("ADMIN_SCORE_UPDATE:: Logged in as " + admin_user_name);          //TODO: move to middleware
            //console.log("1");
        })
        .then(function () {
            //2 and 3: Call stored procedure that will:
            //          2. Update match results in match table
            //          3. Deactivate last match (isActive = 0)
            //          4. Update user scores
            var SP_update_query = "CALL update_scores('" + matchID + "','" + winningTeamID + "');";
            sqlConn.query(SP_update_query)
                .then(function (){
                // 5. Activate next day's match(es)
                    activateNextMatch()
                        .then(function(){
                            //6. return successful message result
                            //console.log("6");
                            var success_message = "***  { ADMIN_USER : " + admin_user_name + " } Match scores successfully updated for matchID " + matchID + " [Winning TeamID: " + winningTeamID + "]";
                            resObj.message = success_message;
                            resObj.success = true;
                            console.log(resObj.message);
                            res.json(resObj);
                            res.end();
                        })
            })
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
};

var activateNextMatch = function(){
    utils.logMe("Running stored procedure to activate next match(es)");
    var SP_activate_query = "CALL sp_activate_next_match();";
    return sqlConn.query(SP_activate_query);
}

/*app starts here....*/

app.listen(port);
utils.logMe("psoftr00t started on port " + port);
utils.logMe("Started scheduler for auto-locking 5:30 AM CST match " + lockFirstMatchIPL2017.name);
utils.logMe("Started scheduler for auto-locking 9:30 AM CST match " + lockSecondMatchIPL2017.name);