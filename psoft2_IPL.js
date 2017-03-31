/*
(C)grjoshi 3/30/2016
psoft2.js - Main server code for PredictSoft v2
			Handles database operations and APIs for reading/writing data
      Forked off of NoFApp v1 built for Twenty 20 Cricket 2016
*/

var express = require('express');
var app = express();
var morgan = require('morgan');
var Sequelize = require('sequelize');
var bodyParser = require('body-parser');      //for letting Express handle POST data
var favicon = require('serve-favicon');

var dbconfig = require('./api/dbconfig.js');        //load config module

//load API modules
var utils = require("./api/PS2Utils.js");
//var users = require("./api/userModule.js")

//define port that server will run on
var port = 8888;

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

var Users = sqlConn.import(__dirname + "/models/userModel");
var Prediction = sqlConn.import(__dirname + "/models/predictionModel");
var Match = sqlConn.import(__dirname + "/models/matchModel");
//var Team = sqlConn.import(__dirname + "/models/teamModel");

//var admin = require("./api/PS2Admin.js");

//define relations
//Match.hasMany(Team, {foreignKey: 'teamID'});
//Team.belongsTo(Match, {foreignKey: 'team1ID'});
//Team.belongsTo(Match, {foreignKey: 'team2ID'});

sqlConn.sync();

utils.logMe("Loaded Sequelize modules...");


app.use(express.static(__dirname));
app.use(favicon(__dirname + '/assets/img/favicon.ico'));

app.use(bodyParser.json());                 		//this lets Express handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

var router = express.Router();

var userModule = require("./api/userModule.js");
var gameModule = require("./api/gameModule.js");

//middleware to use for all requests...
router.use(function (req, res, next) {
    utils.logMe("Middleware layer entered...") ;
    next();             //move on...
});

/*=====================================Routing and APIs=====================================*/

//default route
app.get("/", function (req, res) {
    res.redirect('/src/index.html');
});

//return the next match(es) information
app.get("/api/nextmatch", function (req, res) {
    var resObj = {
        count: 0,
        rem_predictions:0,
        matchData: [],
        message: "",
        success: false
    };

    //Using isActive column to determine which matches are to be shown
    sqlConn.query(
        "SELECT team1.teamID as t1ID,team1.name as t1Name, team1.logoURL as t1logoURL, " +
        "team2.teamID as t2ID,team2.name as t2Name, team2.logoURL as t2logoURL, " +
        "match.matchID as matchID, " +
        "match.isLocked as locked, " +
        "match.MatchDate as date " +
        "FROM " +
        "`match` LEFT JOIN (teams as team1, teams as team2) " +
        "ON (team1.teamID = `match`.Team1ID AND team2.teamID = `match`.Team2ID) " +
        "WHERE " +
        "isActive=1",           //todo: use date calculation fu to figure out which is the list of upcoming matches the same day or next day
        { type: sqlConn.QueryTypes.SELECT })
        .then(function (matches) {
            //fill response object and return
            resObj.success = true;
            resObj.count = matches.length;

            for (var n = 0; n < matches.length; n++) {

                //TODO: update query to also select current predictions for user

                resObj.matchData.push({
                    matchID: matches[n].matchID,
                    team1ID: matches[n].t1ID,
                    team1Name: matches[n].t1Name,
                    team1LogoPath: matches[n].t1logoURL,
                    //team1Group: matches[n].t1Group,
                    team2ID: matches[n].t2ID,
                    team2Name: matches[n].t2Name,
                    team2LogoPath: matches[n].t2logoURL,
                    //team2Group: matches[n].t2Group,
                    locked: (matches[n].locked != 0),        //this will enable/disable prediction for particular match
                    date: matches[n].date
                });
            }

            //console.log(JSON.stringify(resObj.matchData));
        })
        .then(function () {
            //also get remaining number of predictions
            var getRemPredsQRY = "SELECT ((SELECT COUNT(*) FROM users) - COUNT(*)) as rem_preds from prediction p, `match` m WHERE m.matchID = p.matchID AND m.isActive = 1";
            sqlConn.query(getRemPredsQRY,
                {type: sqlConn.QueryTypes.SELECT})
                .then(function (remPredictions) {
                    //console.log(JSON.stringify(remPredictions,true));
                    resObj.rem_predictions = remPredictions[0].rem_preds;
                    resObj.success = true;
                    res.json(resObj);
                    res.end();
                })
        })
        .catch(function (err) {
            //match find failed. Reply with message
            utils.logMe("Error trying to fetch match details.Message:\n" + err);
            resObj.success = false;
            resObj.message = err;

            res.json(resObj);
            res.end();
        })
});

//return the next match(es) information
app.get("/api/nextmatchOLDIPL", function (req, res) {
    var resObj = {
        count: 0,
        matchData: [],
        message: "",
        success: false
    };
    //Using isActive column to determine which matches are to be shown
    sqlConn.query(
        "SELECT team1.teamID as t1ID,team1.name as t1Name,team1.groupID as t1Group, team2.teamID as t2ID,team2.name as t2Name, team2.groupID as t2Group, match.matchID as matchID, match.isLocked as locked, match.MatchDate as date FROM `match` LEFT JOIN (teams as team1, teams as team2) ON (team1.teamID = `match`.Team1ID AND team2.teamID = `match`.Team2ID) WHERE isActive=1",
        { type: sqlConn.QueryTypes.SELECT })
        .then(function (matches) {
        //fill response object and return
        resObj.success = true;
        resObj.count = matches.length;
        
        for (var n = 0; n < matches.length; n++) {
            
            //TODO: update query to also select current predictions for user            
            
            resObj.matchData.push({
                matchID: matches[n].matchID,
                team1ID: matches[n].t1ID,
                team1Name: matches[n].t1Name,
                //team1Group: matches[n].t1Group,
                team2ID: matches[n].t2ID,
                team2Name: matches[n].t2Name,
                //team2Group: matches[n].t2Group,
                locked: (matches[n].locked == 0)?false:true,        //this will enable/disable prediction for particular match
                date: matches[n].date
            });
        }
        res.json(resObj);
        res.end();
        return;
    })
        .catch(function (err) {
        //match find failed. Reply with message
        utils.logMe("Error trying to fetch match details.Message:\n" + err);
        resObj.success = false;
        resObj.message = err;
        
        res.json(resObj);
        res.end();
        return;
    })
})

//list predictions for upcoming match from submitted players
app.get("/api/getPredictions", function (req, res) {
    var resObj = {
        predictData: [],
        message: "",
        success: false
    };
    
    var query = "";
    var tokenID = req.query.token;
    
    //check if match is locked, in which case only return current user's prediction
    Match.find({ where: { isActive: 1 } })
        .then(function (active_rows) {
        if (active_rows == null) {
            return;
        }
        if (active_rows.isHidden == 1) {
            //show only current user's prediction
            query = "SELECT u.name as name, (SELECT Name FROM teams WHERE teamID = p.predictedTeamID) As PredictedTeam FROM prediction p, users u WHERE p.playerID = u.userID AND u.userID = (SELECT userID from users where auth_key = '" + tokenID + "') AND p.matchID IN ( SELECT matchID FROM `match` WHERE isActive =1)";
        }
        else {
            //show everyone's predictions
            query = "SELECT u.name as name, (SELECT Name FROM teams WHERE teamID = p.predictedTeamID) As PredictedTeam FROM prediction p, users u WHERE p.playerID = u.userID AND p.matchID IN ( SELECT matchID FROM `match` WHERE isActive =1 AND isHidden=0)";
        }
        
        sqlConn.query(query, { type: sqlConn.QueryTypes.SELECT })
            .then(function (predictions) {
            for (var n = 0; n < predictions.length; n++) {
                
                resObj.predictData.push({
                    Name: predictions[n].name,
                    Team: predictions[n].PredictedTeam
                })
            }
            //utils.logMe(JSON.stringify(resObj));            
            resObj.success = true;
            res.json(resObj);
            res.end();
            return;
        })
            .catch(function (err) {
            utils.logMe("Error trying to fill in prediction data. Details:\n" + err);
            resObj.success = false;
            resObj.message = err;
            res.json(resObj);
            res.end();
            return;
        })
    })
});

//get leaderboard scores, sorted by points
app.get("/api/getScores", function (req, res) {
    var resObj = {
        scoreData: [],
        message: "",
        success: false
    };
    
    sqlConn.query(
        "SELECT u.name, u.points FROM users u ORDER BY points DESC",
      { type: sqlConn.QueryTypes.SELECT })
      .then(function (scores) {
        
        resObj.success = true;
        
        for (var n = 0; n < scores.length; n++) {
            //console.log(JSON.stringify(scores));
            resObj.scoreData.push({
                Name: scores[n].name,
                Points: scores[n].points
            });
        }
        
        res.json(resObj);
        res.end();
        return;
    })
      .catch(function (err) {
        utils.logMe("Error trying to fill in score data. Details:\n" + err);
        //get player prediction for upcoming match
        resObj.success = false;
        resObj.message = err;
        res.json(resObj);
        return;
    })
})

//check if user has already predicted
app.get("/api/checkIfPredicted", function (req, res) {
    var resObj = {
        message: "",
        hasPredicted: false
    };
    
    var tokenID = req.query.token;
    
    sqlConn.query(
        "SELECT * FROM prediction p WHERE playerID = (SELECT userID FROM users WHERE auth_key = '" + tokenID + "') AND matchID IN (SELECT matchID FROM `match` WHERE isActive = 1)",
    { type: sqlConn.QueryTypes.SELECT })
    .then(function (predictionCount) {
        if (predictionCount.length > 0) {
            resObj.hasPredicted = true;
        }
        else {
            resObj.hasPredicted = false;
        }
        
        res.json(resObj);
        res.end();
        return;
    })
    .catch(function (err) {
        utils.logMe(err);
        resObj.message = err;
        resObj.hasPredicted = true;
        res.json(resObj);
        return;
    })
})

//get user's game history
app.get("/api/getHistory", function (req, res) {
    var resObj = {
        count: 0,
        historyData: [],
        message: "",
        success: false
    };
    
    var playerToken = req.query.token;
    
    sqlConn.query(
        "SELECT m.MatchDate as match_date,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team1ID) as team1,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team2ID) as team2,(SELECT teams.Name FROM teams WHERE teams.teamID = p.predictedTeamID) as predicted_team,(SELECT teams.Name FROM teams WHERE teams.teamID = m.WinningTeamID) as winning_team FROM prediction p, users u, teams t, `match` m where p.playerID = (SELECT userID FROM users WHERE auth_key = '" + playerToken + "' ) and u.userid = p.playerID and t.teamID = p.predictedTeamID and m.matchID = p.matchID and m.isActive=0",
  { type: sqlConn.QueryTypes.SELECT })
    .then(function (matches) {
        
        //fill response object and return
        resObj.success = true;
        resObj.count = matches.length;
        
        for (var n = 0; n < matches.length; n++) {
            var outcome = (matches[n].predicted_team == null)?"[TBD]":((matches[n].predicted_team == matches[n].winning_team)?"WIN":"LOSS");
            
            resObj.historyData.push({
                team1Name: matches[n].team1,
                team2Name: matches[n].team2,
                matchDate: matches[n].match_date,
                predictedTeam: matches[n].predicted_team,
                winningTeam: matches[n].winning_team,
                result: outcome
            });
        }
        //console.log("\n&&&&&USER_HISTORY::\n"+JSON.stringify(resObj)+"\n&&&&&&&&&\n");
        res.json(resObj);
        res.end();
        return;
    })
    .catch(function (err) {
        //match find failed. Reply with message
        utils.logMe("Error trying to fetch user match history. Details:\n" + err);
        resObj.success = false;
        resObj.message = err;
        
        res.json(resObj);
        res.end();
        return;
    })
})

//get score for user
app.get("/api/getScore", function (req, res) {
    var resObj = {
        score: 0,
        message: "",
        success: false
    };
    
    var playerToken = req.query.token;

    sqlConn.query(
        "SELECT points FROM users WHERE auth_key = '"+playerToken+"'",
      { type: sqlConn.QueryTypes.SELECT })
      .then(function (usrScore) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ score: usrScore[0].points }));
    })
      .catch(function (err) {
        utils.logMe("Error trying to get user score data for token: "+req.query.token+". Details:\n" + err);
        //get player prediction for upcoming match
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ score: -1 }));
        return;
    })
});

//get points for user
app.get("/api/getUserPoints", function (req, res) {
    userModule.getUserPoints(req, res, Users);
});

//get leaderboard scores, sorted by points
app.get("/api/getLeaderboardScores", function (req, res) {
    gameModule.getScoreBoard(req, res, Users);
});

//try to login and get user info API
app.post("/api/login", function (req, res) {
    
    var resObj = {
        usrData: {},
        message: "",
        success: false
    };
    
    if (req.body.email == "" || req.body.password == "") {
        resObj.message = "Invalid email/password";
        resObj.success = false;
    }
    Users.find({
        where: {
            email: req.body.email,
            password: req.body.password
        }
    })
  .then(function (usrObj) {
        
        if (usrObj == null) {
            throw "User not found. Please check username/password and try again";
        }
        
        //populate user data
        resObj.success = true;
        resObj.usrData = {
            userID: usrObj.userID,
            email: usrObj.email,
            user: usrObj.name,
            token: usrObj.auth_key,
            points: usrObj.points
        };
        
        res.json(resObj);
        res.end();
        return;
    })
  .catch(function (err) {
        //user find failed
        utils.logMe("Error trying to fetch user with email " + req.body.email + ". Details: " + err);
        resObj.success = false;
        resObj.message = err;
        
        res.json(resObj);
        res.end();
        return;
    });
});

//add new user API
app.post("/api/adduser", function (req, res) {
    
    //uncomment the following after registration period expires
    // utils.logMe("Registration period has expired. Unable to register account for " + req.body.email);
    // res.json({ success: false, message: "Registration period has ended. New accounts will not be added!" });
    // return;
    /////////////////////////////////////////    
    
    //Password hashing has been taken care of on the client side
    if (req.body.name == "" || req.body.email == "" || req.body.password == "") {
        utils.logMe("Blank values trying to add user(email given: " + req.body.email + "). Not registering!");
        return;
    }
    
    var resObj = {
        message: "",
        success: false
    };
    
    
    //check if email ID already exists
    Users.find({
        where: {
            email: req.body.email,
        }
    }).then(function (usrObj) {
        if (usrObj == null) {
            //email has not been taken; add this user
            var user = Users.build({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                auth_key: req.body.token,
                points: 0
            });
            
            user.save()
            .then(function () {
                resObj.success = true;
                res.json(resObj);
                return;
            })
            .catch(function (err) {
                utils.logMe("Error adding user {" + req.body.name + "/" + req.body.email + "/" + "}. Details: \n" + err + ")");
                resObj.success = false;
                resObj.message = err;
                res.json(resObj);
                return;
            });
        }
        else {
            throw "That email address has already been registered.";
        }
    })
    .catch(function (err) {
        utils.logMe("[" + req.body.email + "]" + err);
        resObj.success = false;
        resObj.message = err;
        res.json(resObj);
        return;
    });
});

//create/update prediction for user
app.post("/api/submitPredictionOLDIPL", function (req, res) {
    
    var resObj = {
        message: "",
        success: false
    };
    
    //utils.logMe("predObj::" + JSON.stringify(req.body.predObj));
    var rows = req.body.predObj.length;
    var userID = 0;
    var team_id = 0;
    var match_id = 0;
    var team_id2 = 0;
    var match_id2 = 0;
    
    sqlConn.query(
        "SELECT userID from users WHERE auth_key = '" + req.body.token + "'",
    { type: sqlConn.QueryTypes.SELECT })
    .then(function (user_row) {
        
        userID = user_row[0].userID;
        team_id = req.body.predObj[0].teamID;
        match_id = req.body.predObj[0].matchID;
        
        return Match.find({ where: { matchID: match_id, isLocked: 0 } })
            .then(function (active_rows) {
            
            //check if this match has been locked                
            if (active_rows == null) {
                
                utils.logMe("UserID " + userID + " has tried predicting " + match_id + " after lockdown period. This has been logged!");
                throw "Sorry, the game has been locked! Prediction is not allowed at this time.";
            }
            //not locked, so prediction change is allowed
            return Prediction
                    .findOrCreate({ where: { playerID: userID, matchID: match_id }, defaults: { predictedTeamID: team_id } })
                    .spread(function (prediction, created) {
                if (!created) {
                    //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id);
                    //utils.logMe("EXISTING prediction object:" + JSON.stringify(prediction));
                    
                    //prediction exists; update it
                    sqlConn.query(
                        "UPDATE prediction SET predictedTeamID=" + team_id + " WHERE playerID=" + userID + " AND matchID=" + match_id,
                            { type: sqlConn.QueryTypes.UPDATE })
                            .then(function (updated) {
                        utils.logMe("Updated for user " + userID + " for matchID: " + match_id + "; new team: " + team_id);
                        resObj.success = true;
                    })
                }
                else {
                    //new row has been created
                    utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id + "; new team: " + team_id);
                    resObj.success = true;
                }
            });
            //return resObj;
            resObj.success = true;
        })
            .catch(function (err) {
            //console.log("\n\nCAUGHT, NOW RETURNING resObj!");
            //throw err;
            //utils.logMe("PRED_EXCEPTION::" + err);
            resObj.message = err;
            resObj.success = false;
            res.json(resObj);
            return;
        })
    })
    .then(function () {
        //utils.logMe("userID from second row is: " + userID);
        if (rows > 1) {
            //update second game if exists
            team_id2 = req.body.predObj[1].teamID;
            match_id2 = req.body.predObj[1].matchID;
            
            Match.find({ where: { matchID: match_id2, isLocked: 0 } })
            .then(function (active_rows) {
                //check if this match has been locked                
                if (active_rows == null) {
                    utils.logMe("UserID " + userID + " has tried predicting matchID " + match_id2 + " after lockdown period. This has been logged!");
                    throw "Sorry, the game has been locked! Prediction is not allowed at this time.";
                }
                //not locked, so prediction change is allowed            
                return Prediction
                    .findOrCreate({ where: { playerID: userID, matchID: match_id2 }, defaults: { predictedTeamID: team_id2 } })
                    .spread(function (prediction2, created) {
                    if (!created) {
                        //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id2);
                        //utils.logMe("EXISTING prediction object:" + JSON.stringify(prediction2));
                        
                        //prediction exists; update it
                        sqlConn.query(
                            "UPDATE prediction SET predictedTeamID=" + team_id2 + " WHERE playerID=" + userID + " AND matchID=" + match_id2,
                                { type: sqlConn.QueryTypes.UPDATE })
                                .then(function (updated2) {
                            utils.logMe("Updated for user " + userID + " for matchID: " + match_id2 + "; new team: " + team_id2);
                            resObj.success = true;
                        })
                    }
                    else {
                        //new row has been created
                        utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id2 + "; new team: " + team_id2);
                        resObj.success = true;
                    }
                })
            })
            .catch(function (err) {
                //utils.logMe("PRED_EXCEPTION::" + err);
                resObj.message = err;
                resObj.success = false;
                res.json(resObj);
                return;
            })
        }
        res.json(resObj);
        return;
    })
    .then(function(){
        utils.sendConfirmation(match_date, "<p><strong>You have updated your prediction to:</strong></p><ul>" + selectionList + "</ul>", playerFullName, playerEmail);
    })
    .catch(function (err) {
        //utils.logMe("PRED_EXCEPTION::" + err);
        resObj.message = err;
        resObj.success = false;
        return resObj;
    })
});

//create/update prediction for user
app.post("/api/submitPrediction", function (req, res) {

    var resObj = {
        message: "",
        success: false
    };

    utils.logMe("predObj::" + JSON.stringify(req.body.predObj));
    if (!req.body || !req.body.predObj) {
        res.json({Message: "Invalid request, aborting..."});
        return;
    }

    var rows = req.body.predObj.length;
    var userID = 0;
    var team_id = 0;
    var match_id = 0;
    var team_id2 = 0;
    var match_id2 = 0;
    var team_id3 = 0;
    var match_id3 = 0;
    var playerFullName = '';
    var playerEmail = '';

    var match_date = '';
    var selectionList = "";             //list of teams selected by user

    var game_locked_message = "Sorry! Prediction for one (or more) game(s) might not have been added because the game was locked. Please refresh your browser to continue with other predictions.";

    sqlConn.query(
        "SELECT userID, name, email from users WHERE auth_key = '" + req.body.token + "'",
        {type: sqlConn.QueryTypes.SELECT})
        .then(function (user_row) {

            userID = user_row[0].userID;
            team_id = req.body.predObj[0].teamID;
            match_id = req.body.predObj[0].matchID;
            selectionList = "<li><strong>" + req.body.predObj[0].teamName + "</strong></li>";              //add team to selection list

            //fetch the following for sending user details with email
            playerFullName = user_row[0].name;
            playerEmail = user_row[0].email;

            return Match.find({where: {matchID: match_id, isLocked: 0}})
                .then(function (active_rows) {

                    //console.log("returning active rows for match:: %o",active_rows);

                    //check if this match has been locked
                    if (active_rows == null) {

                        utils.logMe("UserID " + userID + " has tried predicting " + match_id + " after lockdown period. This has been logged!");
                        //throw game_locked_message;
                        resObj.message = game_locked_message;
                        resObj.success = false;
                        return resObj;
                    }
                    match_date = active_rows.MatchDate;
                    //not locked, so prediction change is allowed
                    return Prediction
                        .findOrCreate({
                            where: {playerID: userID, matchID: match_id},
                            defaults: {predictedTeamID: team_id}
                        })
                        .spread(function (prediction, created) {
                            if (!created) {
                                //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id);
                                //console.log("EXISTING prediction object:" ,prediction);

                                //prediction exists; update it
                                sqlConn.query(
                                    "UPDATE prediction SET predictedTeamID=" + team_id + " WHERE playerID=" + userID + " AND matchID=" + match_id,
                                    {type: sqlConn.QueryTypes.UPDATE})
                                    .then(function (updated) {
                                        utils.logMe("Updated for user " + userID + " for matchID: " + match_id + "; new team: " + team_id);
                                        //console.log(JSON.stringify(updated));
                                        //send email confirming change
                                        //utils.sendConfirmation(new Date(),"You have updated your team to ??????????????????????????????????????????????????????","Khal Drogo",'grv2k6@gmail.com');
                                        resObj.success = true;
                                    })
                            }
                            else {
                                //new row has been created
                                utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id + "; new team: " + team_id);
                                resObj.success = true;
                            }
                        });

                    //return resObj;
                    resObj.success = true;
                })
                .catch(function (err) {
                    //console.log("\n\nCAUGHT, NOW RETURNING resObj!");
                    //throw err;
                    utils.logMe("PREDICTION_EXCEPTION::" + err);
                    resObj.message = err;
                    resObj.success = false;
                    res.json(resObj);
                })
        })
        .then(function () {
            //utils.logMe("userID from second row is: " + userID);
            if (rows > 1) {
                //update second game if exists
                team_id2 = req.body.predObj[1].teamID;
                match_id2 = req.body.predObj[1].matchID;
                selectionList = selectionList + "<li><strong>" + req.body.predObj[1].teamName + "</strong></li>";
                ;              //add team to selection list

                Match.find({where: {matchID: match_id2, isLocked: 0}})
                    .then(function (active_rows) {
                        //check if this match has been locked
                        if (active_rows == null) {
                            utils.logMe("UserID " + userID + " has tried predicting matchID " + match_id2 + " after lockdown period. This has been logged!");
                            //throw "Sorry, the game has been locked! Prediction is not allowed at this time.";
                            resObj.message = game_locked_message;
                            resObj.success = false;
                            return resObj;
                        }
                        //not locked, so prediction change is allowed
                        return Prediction
                            .findOrCreate({
                                where: {playerID: userID, matchID: match_id2},
                                defaults: {predictedTeamID: team_id2}
                            })
                            .spread(function (prediction2, created) {
                                if (!created) {
                                    //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id2);
                                    //utils.logMe("EXISTING prediction object:" + JSON.stringify(prediction2));

                                    //prediction exists; update it
                                    sqlConn.query(
                                        "UPDATE prediction SET predictedTeamID=" + team_id2 + " WHERE playerID=" + userID + " AND matchID=" + match_id2,
                                        {type: sqlConn.QueryTypes.UPDATE})
                                        .then(function (updated2) {
                                            utils.logMe("Updated for user " + userID + " for matchID: " + match_id2);
                                            resObj.success = true;
                                        })
                                }
                                else {
                                    //new row has been created
                                    utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id2);
                                    resObj.success = true;
                                }
                            })
                    })
                    .catch(function (err) {
                        //utils.logMe("PRED_EXCEPTION::" + err);
                        resObj.message = err;
                        resObj.success = false;
                        res.json(resObj);
                        return;
                    })
            }
            res.json(resObj);
            return;
        })
        .then(function () {
            if (rows > 2) {
                //update second game if exists
                team_id3 = req.body.predObj[2].teamID;
                match_id3 = req.body.predObj[2].matchID;
                selectionList = selectionList + "<li><strong>" + req.body.predObj[2].teamName + "</strong></li>";              //add team to selection list

                Match.find({where: {matchID: match_id3, isLocked: 0}})
                    .then(function (active_rows) {
                        //check if this match has been locked
                        if (active_rows == null) {
                            utils.logMe("UserID " + userID + " has tried predicting matchID " + match_id3 + " after lockdown period. This has been logged!");
                            //throw "Sorry, the game has been locked! Prediction is not allowed at this time.";
                            resObj.message = game_locked_message;
                            resObj.success = false;
                            return resObj;
                        }
                        //not locked, so prediction change is allowed
                        return Prediction
                            .findOrCreate({
                                where: {playerID: userID, matchID: match_id3},
                                defaults: {predictedTeamID: team_id3}
                            })
                            .spread(function (prediction3, created) {
                                if (!created) {
                                    //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id2);
                                    //utils.logMe("EXISTING prediction object:" + JSON.stringify(prediction2));

                                    //prediction exists; update it
                                    sqlConn.query(
                                        "UPDATE prediction SET predictedTeamID=" + team_id3 + " WHERE playerID=" + userID + " AND matchID=" + match_id3,
                                        {type: sqlConn.QueryTypes.UPDATE})
                                        .then(function (updated3) {
                                            utils.logMe("Updated for user " + userID + " for matchID: " + match_id3);
                                            resObj.success = true;
                                        })
                                }
                                else {
                                    //new row has been created
                                    utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id3);
                                    resObj.success = true;
                                }
                            })
                    })
                    .catch(function (err) {
                        //utils.logMe("PRED_EXCEPTION::" + err);
                        resObj.message = err;
                        resObj.success = false;
                        res.json(resObj);
                        return;
                    })
            }
            //res.json(resObj);
            //return;
        })
        .then(function () {
            if (rows > 3) {
                //update second game if exists
                team_id4 = req.body.predObj[3].teamID;
                match_id4 = req.body.predObj[3].matchID;
                selectionList = selectionList + "<li><strong>" + req.body.predObj[3].teamName + "</strong></li>";              //add team to selection list

                Match.find({where: {matchID: match_id4, isLocked: 0}})
                    .then(function (active_rows) {
                        //check if this match has been locked
                        if (active_rows == null) {
                            utils.logMe("UserID " + userID + " has tried predicting matchID " + match_id4 + " after lockdown period. This has been logged!");
                            //throw "Sorry, the game has been locked! Prediction is not allowed at this time.";
                            resObj.message = game_locked_message;
                            resObj.success = false;
                            return resObj;
                        }
                        //not locked, so prediction change is allowed
                        return Prediction
                            .findOrCreate({
                                where: {playerID: userID, matchID: match_id4},
                                defaults: {predictedTeamID: team_id4}
                            })
                            .spread(function (prediction4, created) {
                                if (!created) {
                                    //utils.logMe("TEAMID INSIDE findOrCreate is: " + team_id2);
                                    //utils.logMe("EXISTING prediction object:" + JSON.stringify(prediction2));

                                    //prediction exists; update it
                                    sqlConn.query(
                                        "UPDATE prediction SET predictedTeamID=" + team_id4 + " WHERE playerID=" + userID + " AND matchID=" + match_id4,
                                        {type: sqlConn.QueryTypes.UPDATE})
                                        .then(function (updated4) {
                                            utils.logMe("Updated for user " + userID + " for matchID: " + match_id4);
                                            resObj.success = true;
                                        })
                                }
                                else {
                                    //new row has been created
                                    utils.logMe("New row has been created for user " + userID + " for matchID: " + match_id4);
                                    resObj.success = true;
                                }
                            })
                    })
                    .catch(function (err) {
                        //utils.logMe("PRED_EXCEPTION::" + err);
                        resObj.message = err;
                        resObj.success = false;
                        res.json(resObj);
                        return;
                    })
            }
            //res.json(resObj);
            //return;
        })
        .then(function () {
            //notify user via email about submission confirmation
            utils.sendConfirmation(match_date, "<p><strong>You have updated your prediction to:</strong></p><ul>" + selectionList + "</ul>", playerFullName, playerEmail);
        })
        .catch(function (err) {
            //utils.logMe("PRED_EXCEPTION::" + err);
            resObj.message = err;
            resObj.success = false;
            return resObj;
        })

});

/*=====================================Admin functions===============================*/

app.get("/api/adminUpdateScores", function (req, res) {
    var resObj = {
        message: "",
        success: false
    };
    
    var playerToken = req.query.token;
    var matchID = req.query.matchID;
    var winningTeamID = req.query.winningTeamID;
    var scoreIncBy = req.query.scoreIncBy;
    
    //check if admin user
    sqlConn.query(
        "SELECT * FROM users WHERE auth_key = '" + playerToken + "' AND isAdmin = 1",
        { type: sqlConn.QueryTypes.SELECT })
        .then(function (isAdmin) { 
            
        if (!isAdmin) {
            //not an admin
            resObj.message = "Specified user is not an admin";
            resObj.success = false;
            res.json(resObj);
            res.end();
        }

        //TODO:: success....now update the scores list
        utils.logMe("This is where teamID " + winningTeamID + " is to be updated as winner for matchID " + matchID + ", and score will be incremented by " + scoreIncBy);
    })
      .catch(function (err) {
        utils.logMe("Error trying to update scores for user " + req.query.token + ". Details:\n" + err);
        resObj.message = "Error trying to update scores. Details: "+err;
        resObj.success = false;
        res.json(resObj);
        res.end();
        return;
    })
})

app.get("/api/uTestEmail", function (req, res) {
    utils.sendConfirmation(new Date(), "You have chosen England as your team", "Khal Drogo", 'grv2k6@gmail.com');
    res.json({message: 'OK'});
})

/*=====================================Init app=====================================*/

app.listen(port);

utils.logMe("PredictSoft v2.10 started on port " + port);
