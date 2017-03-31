/*
    grjoshi 5/30/2016
    Controller that retrieves view-allowed (not locked or hidden) prediction history for current or any given user
 */
(function () {
    angular.module("psoft2UI").controller("profileController", profileCtrl);
    profileCtrl.$inject = ['$scope', '$location', 'userService', 'authService', '$routeParams', '$window', 'md5'];
    function profileCtrl($scope, $location, userService, authService, $routeParams, $window, md5) {


        $scope.gameHistory = [];
        $scope.name = '';
        $scope.points = 0;

        var getMyGameHistory = function(token){

            userService.getPredictionHistory(authService.getToken())
                .then(function (response) {
                    //console.log(angular.toJson(response.data));
                    if (response == null) {
                        throw "There was an error trying to get user prediction history from the server. Please try again later";
                    }
                    if (!response.data.success) { throw response.data.message; }
                    if (response.data.historyData.length == 0) {
                        //show empty grid
                        $scope.gameHistory = [];
                    }
                    else {
                        $scope.gameHistory = response.data.historyData.slice();
                    }
                    $scope.name = authService.getName();
                    $scope.points = authService.getPoints();
                })
                .catch(function (err) {
                    console.log("Unable to fetch user prediction history. Details:\n" + err)
                })
        };

        var getUserGameHistory = function(userID){

            userService.getPredictionHistoryByID(userID)
                .then(function (response) {
                    //console.log(angular.toJson(response.data));
                    if (response == null) {
                        throw "There was an error trying to get user prediction history from the server. Please try again later";
                    }
                    if (!response.data.success) { throw response.data.message; }
                    if (response.data.historyData.length == 0) {
                        //show empty grid
                        $scope.gameHistory = [];
                        //throw "History array is null!";
                    }
                    else {
                        $scope.gameHistory = response.data.historyData.slice();
                        $scope.name = response.data.userData.name;
                        $scope.points = response.data.userData.points;
                        //console.log("DONE LOADING>..");
                    }
                })
                .catch(function (err) {
                    console.log("Unable to fetch user prediction history for userID " + userID + " . Details:\n" + JSON.stringify(err));
                })
        };

        $scope.getDisplayPoints = function (resultStr)
        {
            if (resultStr == "[TBD]") return "[TBD]";
            if (resultStr == "WIN") return "3";
            return "0";
        }


        if(!$routeParams.id) {
            //this is token based, i.e. current user's account
            if ($scope.gameHistory.length == 0) { getMyGameHistory(); }
        }

        if($routeParams.id) {
            //fetch prediction history for user with userid
            getUserGameHistory($routeParams.id);
        }
    }
})();