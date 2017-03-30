// (C)grjoshi 5/29/2016
// userModule.js - User related functions
var utils = require("./PS2Utils.js");
var exports = module.exports = {};

//API function implementation
exports.logIn = function(req,res,userModel) {

    var resObj = {
        usrData: {},
        message: "",
        success: false
    };

    if (req.body.email == "" || req.body.password == "") {
        resObj.message = "Invalid email/password";
        resObj.success = false;
    }
    userModel.find({
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
                //userID: usrObj.userID,            //not sending this due to security concerns (token should suffice)
                email: usrObj.email,
                name: usrObj.name,
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
};

exports.addUser = function(req,res,userModel){
    /////////uncomment the following after registration period expires
    utils.logMe("Registration period has expired. Unable to register account for " + req.body.email);
    res.json({ success: false, message: "Registration period has ended. New accounts will not be added!" });
    return;
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
    userModel.find({
        where: {
            email: req.body.email,
        }
    }).then(function (usrObj) {
        if (usrObj == null) {
            //email has not been taken; add this user
            var user = userModel.build({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,        //hash at client side
                auth_key: req.body.token,
                points: 0
            });

            user.save()
                .then(function () {
                    utils.logMe('*** Added user with email: '+req.body.email);
                    resObj.success = true;
                    resObj.message = "Successfully created new user account";
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
};

exports.getUserPoints = function(req,res, userModel) {

    var playerToken = req.query.token;

    /*sqlConn.query(
        "SELECT points FROM users WHERE auth_key = '"+playerToken+"'",
        { type: sqlConn.QueryTypes.SELECT })*/
        userModel.findOne({
            where: {
                auth_key: playerToken
            },
            attributes: ['points']
        })
        .then(function (usrScore) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ score: usrScore.dataValues.points }));
        })
        .catch(function (err) {
            utils.logMe("Error trying to get user score data for token: "+req.query.token+". Details:\n" + err);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ score: -1 }));
        });
};

exports.getUserPredictionsDONOTCALLYET = function(req,res,matchModel){
    var resObj = {
        predictData: [],
        message: "",
        success: false
    };

    var query = "";
    var tokenID = req.query.token;

    //check if match is locked, in which case only return current user's prediction
    matchModel.find({ where: { isActive: 1 } })
        .then(function (active_rows) {
            if (active_rows == null) {
                return;
            }
            if (active_rows.isHidden == 1) {
                //show only current user's prediction
                query = "SELECT u.userID, u.name,(SELECT Name FROM teams WHERE teamID = p.predictedTeamID) As PredictedTeam,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team1ID) AS team1,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team2ID) AS team2 " + "" +
                    "FROM prediction p, users u, teams t, `match` m " +
                    "WHERE p.playerID = u.userID AND "+
                    "u.userID = (SELECT userID from users where auth_key = '" + tokenID + "') AND "+
                    "p.matchID IN (SELECT matchID FROM `match` WHERE isActive =1) AND "+
                    "p.matchID = m.matchID AND "+
                    "t.teamID IN (m.Team1ID, m.Team2ID, 50) AND "+
                    "p.predictedTeamID = t.teamID";
            }
            else {
                //show everyone's predictions
                query = "SELECT u.userID,u.name,(SELECT Name FROM teams WHERE teamID = p.predictedTeamID) As PredictedTeam,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team1ID) AS team1,(SELECT teams.Name FROM teams WHERE teams.teamID = m.Team2ID) AS team2 " + "" +
                    "FROM prediction p, users u, teams t, `match` m " +
                    "WHERE p.playerID = u.userID AND "+
                    "p.matchID IN (SELECT matchID FROM `match` WHERE isActive =1 AND isHidden=0) AND "+
                    "p.matchID = m.matchID AND "+
                    "t.teamID IN (m.Team1ID, m.Team2ID, 50) AND "+
                    "p.predictedTeamID = t.teamID " +
                    " ORDER BY u.name ASC";
            }

            sqlConn.query(query, { type: sqlConn.QueryTypes.SELECT })
                .then(function (predictions) {
                    var team='';
                    for (var n = 0; n < predictions.length; n++) {
                        //if draw has been predicted, show competing teams in brackets (so it's more descriptive for multi-game days)
                        team = (predictions[n].PredictedTeam === "DRAW")?"DRAW ("+ predictions[n].team1 + " vs " + predictions[n].team2 +")":predictions[n].PredictedTeam;
                        resObj.predictData.push({
                            uid: predictions[n].userID,
                            Name: predictions[n].name,
                            Team: team
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

};