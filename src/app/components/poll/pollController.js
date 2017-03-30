/*
grjoshi 3/10/2016
Controller that handles 
	- loading up poll page, with team names
*/
(function () {
    angular.module("psoft2UI").controller("pollController", pollCtrl);
    pollCtrl.$inject = ['$scope', '$location', 'userService', 'authService', 'gameService', '$timeout'];
    
    function pollCtrl($scope, $location, userService, authService, gameService, $timeout) {
        
        $scope.games = [];
        $scope.selection = [];				//array of {usrID, matchID, teamID} objects			
        $scope.predErr = false;				//flag showing error if all selections aren't made	
        $scope.nogames = false;				//flag to show message if no games are available
        
        $scope.loadingGames = true;         //flag to show "Loading games...." animation
        
        $scope.user_token = authService.getToken();
        
        $scope.submitResponseERR = "";
        $scope.showConfirmation = false;

        $scope.msg_announcement = "Predictions from other players will be revealed 15 minutes before the match";
        $scope.display_announcement = true;            //TODO: move these to config/exports file


        $scope.predictionGridLoaded = true;

        $scope.matchDateTime = '';
        var now = new Date();

        // $scope.lockDown = false;
        
        //	$scope.isPointsTableLoaded = false;
        
        // $scope.predictionGrid = {
        //     columnDefs: [{ field: 'Name', displayName: 'Name' },
        //         { field: 'Team', displayName: 'Predicted Team' }]
        // };
        
        $scope.hasPredicted = true;
        

        //visibility for poll options      
        $scope.showPolls = function () {
            
            if ($scope.games.length > 0) {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.showDateRemaining = function(predLockTime){
            return (now < predLockTime);
        };

        $scope.showDaysRemaining = function(predLockTime){

            //console.log(new Date(predLockTime).getDay() != now.getDay());
            return (new Date(predLockTime).getDay() != now.getDay());
        };

        $scope.getRemainingPlayerCount = function(){
            return gameService.getRemainingPredictionCount();
        }

/*
        var getPredictionTable = function () {
            
            //quick hack for semi and finals:
            if ($scope.lockDown) {
                $scope.predictionGrid = { data: '' };		//comment to show prediction grid 
                return;
            }
            
            //get Prediction from API
            gameService.getPredictionList($scope.user_token)
			.then(function (response) {
                if (response == null) {
                    throw "There was an error trying to fetch prediction data from the web service. Please try again later";
                }
                if (!response.data.success) { throw response.data.message; }
                //console.log(angular.toJson(response.data));
                
                if (response.data.predictData.length == 1) {
                    $scope.lockDown = true;
                }
                $scope.predictionGrid.data = response.data.predictData;
            })
			.catch(function (err) {
                console.log("Unable to fetch prediction table. Details:\n" + err)
            })
        }
*/

        if (!authService.isLoggedIn()) {
            //try loading user session from localstorage
            if (!authService.loadSession()) {
                //no session saved either, so redirect to login
                console.log("User object not set. Redirecting to login...");
                $location.path("/login");
            }
        }
        else {
            //getLeaderBoard();			//load score table - moved to scoreboardController.js
            //getPredictionTable();		//load prediction table
            
            
            //get list of active games
           gameService.getNextGame()
				.then(function (response) {
                
                $scope.loadingGames = false;            //hide the "Loading...." animation
                
                if (response == null) {
                    throw "There was an error trying to connect to the web service. Please try again later";
                }
                
                if (!response.data.success) {
                    throw response.data.message;
                }

                //console.log(angular.toJson(response.data, true));
                
                if (response.data.count == 0) {
                    $scope.nogames = true;
                }
                else {
                    $scope.games = response.data.matchData.slice();		//copy games info to scope
                    $scope.nogames = false;

                    //$scope.remainingPredictions = response.data.rem_predictions;
                    gameService.setRemainingPredictionCount(response.data.rem_predictions);

                    var targetDateMsec = new Date($scope.games[0].date).getTime() -  15*60000;
                    $scope.matchDateTime = (targetDateMsec > 0) ? (new Date($scope.games[0].date).getTime() - 15 * 60000) : '';       //get 15 min prior to match time in msec
                }
                return;
            })
				.catch(function (err) {
                $scope.submitResponseERR = err;
                console.log("ERROR: " + err);
                return;
            })
        }
        
        
        $scope.submitPoll = function () {
            //submit prediction data to the server
            
            //check if all NON-LOCKED matches have been predicted
            var lgc = 0;        //locked games count
            $scope.games.forEach(function(g){
                    if(g.locked) lgc++;
            });

            //check total game count = number of selection + locked games
            if ($scope.games.length != ($scope.selection.length + lgc)) {
                $scope.predErr = true;
                return;
            }
            else {
                //try submitting
                $scope.predErr = false;
                gameService.submitPrediction(authService.usrObj.token, $scope.selection)
			.then(function (response) {
                    if (response == null) {
                        throw "There was an error trying to send the prediction data. Please try again later";
                    }
                    
                    //console.log(">>"+angular.toJson(response, true));
                    
                    if (!response.data.success) {
                        //if(!response.data.message)
                        $scope.submitResponseERR = response.data.message;
                        //throw response.data.message;
                        return;
                    }
                    
                    $scope.showConfirmation = true;
                    //$location.path("/poll");
                    return;
                })
            .then(function(){

                $scope.predictionGridLoaded = false;
                //wait for 3 seconds (to allow all updates) and refresh prediction grid
                $timeout(function(){
                    gameService.getPredictionList($scope.user_token)
                    .then(function (response) {
                        if (response == null) {
                            throw "There was an error trying to fetch prediction data from the web service. Please try again later";
                        }
                        if (!response.data.success) { throw response.data.message; }

                        gameService.setRemainingPredictionCount(response.data.rem_predictions);
                        gameService.fillPredictionGrid(response.data.predictData);      //for dynamic refreshing of prediction grid
                        $scope.predictionGridLoaded = true;
                    })
                },3000);
            })
			.catch(function (err) {
                    $scope.message = err;
                    $scope.is_valid = false;
                    console.log(err);
                })
            }
        };
        
        //add each match's predictions inside a JSON object, to send back to server
        $scope.selectTeam = function (matchID, teamID, teamName) {
            
            var doAdd = true;
            //builds the array to submit prediction data		
            $scope.selection.some(function (e) {
                //check if matchID key already exists and clear if so
                if (e.matchID === matchID) {
                    //Existing item found, updating with new selection
                    //e.userID = userService.usrObj.userID;//$scope.userID;
                    e.teamID = teamID;
                    e.teamName = teamName;
                    doAdd = false;
                    return;
                }
            });

            /*Disable for group of 16 onwards*/
            if(teamID == 50)
                return;

            if (doAdd) {
                $scope.selection.push(
                    {
                        //userID: userService.usrObj.userID,
                        matchID: matchID,
                        teamID: teamID,
                        teamName: teamName
                    });
            }
            
            //console.log(angular.toJson($scope.selection, true));
            return;
        }

        $scope.div_click = function(matchID, teamID, teamName, otherTeamID, isLocked){

            if(!isLocked) {
               //clear for other team in this match
                angular.element(document.querySelector('#divMatch' + matchID + '_' + otherTeamID)).css('background-color', '#ffffff');
                angular.element(document.querySelector('#divMatch' + matchID + '_' + teamID)).css('background-color', '#80d4ff');
                $scope.selectTeam(matchID, teamID, teamName);
            }
        }

    }
})();