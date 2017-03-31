// (C)grjoshi 5/29/2016
// gameModule.js - Match related functions
var utils = require("./PS2Utils.js");
var exports = module.exports;

//API function implementation

//get current scoreboard
exports.getScoreBoard = function(req,res,userModel) {
    var resObj = {
        scoreData: [],
        message: "",
        success: false
    };

    userModel.findAll({
        attributes: ['userID','name', 'points'],
        order: 'points DESC'
    })
        .then(function (scores) {
            //console.log(JSON.stringify(scores));
            resObj.success = true;
            for (var n = 0; n < scores.length; n++) {

                //purge [admin] entry from board
                if(scores[n].name == "[admin]")
                    continue;

                resObj.scoreData.push({
                    uid: scores[n].userID,
                    Name: scores[n].name,
                    Points: scores[n].points
                });
            }

            res.json(resObj);
            res.end();
        })
        .catch(function (err) {
            utils.logMe("Error trying to fetch score data. Details:\n" + err);
            //get player prediction for upcoming match
            resObj.success = false;
            resObj.message = err;
            res.json(resObj);
        })
};

//return the next active match information
exports.getNextMatchDONOTCALLYET = function (req,res,sqlConx) {

    var resObj = {
        count: 0,
        matchData: [],
        message: "",
        success: false
    };
    //Using isActive column to determine which matches are to be shown
    sqlConx.query(
        "SELECT team1.teamID as t1ID,team1.name as t1Name,team1.group as t1Group, team2.teamID as t2ID,team2.name as t2Name, team2.group as t2Group, match.matchID as matchID, match.isLocked as locked, match.MatchDate as date FROM `match` LEFT JOIN (teams as team1, teams as team2) ON (team1.teamID = `match`.Team1ID AND team2.teamID = `match`.Team2ID) WHERE isActive=1",
        {type: sqlConx.QueryTypes.SELECT})
        .then(function (matches) {
            //fill response object and return
            resObj.success = true;
            resObj.count = matches.length;

            for (var n = 0; n < matches.length; n++) {
                resObj.matchData.push({
                    matchID: matches[n].matchID,
                    team1ID: matches[n].t1ID,
                    team1Name: matches[n].t1Name,
                    //team1Group: matches[n].t1Group,
                    team2ID: matches[n].t2ID,
                    team2Name: matches[n].t2Name,
                    //team2Group: matches[n].t2Group,
                    locked: (matches[n].locked == 0) ? false : true,        //this will enable/disable prediction for particular match
                    date: matches[n].date
                });
            }
            res.json(resObj);
            res.end();
        })
        .catch(function (err) {
            //match find failed. Reply with message
            utils.logMe("Error trying to fetch match details.Message:\n" + err);
            resObj.success = false;
            resObj.message = err;

            res.json(resObj);
            res.end();
        });
};

exports.getPredictionListDONOTCALLYET = function(req,res,userModel,predictionModel,sqlConn){
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
}