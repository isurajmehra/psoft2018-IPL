/*
grjoshi 5/30/2016
Controller that handles leaderboard view 
*/
(function () {
    angular.module("psoft2UI").controller("scoreboardController", sbCtrl);
    sbCtrl.$inject = ['$scope', '$location', 'gameService'];
    
    function sbCtrl($scope, $location,gameService) {

        $scope.scoreGrid = {
            minRowsToShow: 17,
            enableColumnMenus: false,
            columnDefs: [{
                field: 'Name',
                displayName: 'Player Name',
                width: "75%",
                cellTemplate: '<div class="ngCellText"><a href="/src/index.html#/profile?id={{row.entity.uid}}">{{row.entity.Name}}</a></div>'
            },
            {
                field: 'Points',
                displayName: '',
                width: "25%",
                enableSorting: false
            }]
        };

        //get leaderboard for scores
        gameService.getLeaderboardScores()
            .then(function (response) {
                if (response == null) {
                    throw "There was an error trying to connect to the web service. Please try again later";
                }
                if (!response.data.success) { throw response.data.message; }
                if (response.data.scoreData.length == 0) {
                    $scope.scoreGrid = { data: '' };
                }
                else {
                    //console.log(angular.toJson(response.data.scoreData,true));
                    $scope.scoreGrid.data = response.data.scoreData;
                }
            })
            .catch(function (err) {
                console.log("Unable to fetch score table. Details:\n" + err)
            })
	}
})();