/*
grjoshi 3/30/2016
     Service to handle all game-related API calls
*/

angular.module("psoft2UI").service("gameService", function ($http) {


    var rem_predictions = 0;

    var predictionGrid = {
        enableColumnMenus: false,
        minRowsToShow: 17,
        columnDefs: [
            { field: 'href',
                displayName: 'Name',
                cellTemplate: '<div class="ngCellText"><a href="/src/index.html#/profile?id={{row.entity.uid}}">{{row.entity.Name}}</a></div>'
            },
            { field: 'Team',
                displayName: 'Predicted Team'
            }]
    };
    
    this.getRemainingPredictionCount = function(){
        return rem_predictions;
    };

    this.setRemainingPredictionCount = function(remP){
        rem_predictions = remP;
    };
    this.fillPredictionGrid = function(pred_data){
        predictionGrid.data = pred_data;
    };

    this.getPredictionGrid = function(){
        return predictionGrid;
    }

    this.getNextGame = function () {
        var promise = $http.get("/api/nextmatch");
        return promise;
    };
    
    this.submitPrediction = function (usr_token, predObj) {
        
        var data = {
            token: usr_token,               //user token
            predObj: predObj                //array of predictions (if more than 1 game)
        };
        
        //console.log("SENDINGG..." + angular.toJson(data, true));
        var promise = $http.post("/api/submitPrediction", data);
        return promise;
    };
    
    this.showNextGamePredictions = function () {
        var promise = $http.get("/api/getPredictions");
        return promise;
    };
    
    this.getLeaderboardScores = function () {
        var promise = $http.get("/api/getLeaderboardScores");
        return promise;
    };
    
    this.getPredictionList = function (user_token) {
        var promise = $http.get("/api/getPredictions?token=" + user_token);
        return promise;
    };
    
    this.checkIfUserPredicted = function (user_token) {
        var promise = $http.get("/api/checkIfPredicted?token=" + user_token);
        return promise;
    };
});