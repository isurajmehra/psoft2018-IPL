/*
grjoshi 5/30/2016
Controller that retrieves prediction list for current match from submitted entries
*/
(function () {
    angular.module("psoft2UI").controller("predListController", plCtrl);
    plCtrl.$inject = ['$scope', '$location','authService','gameService'];
    
    function plCtrl($scope, $location,authService,gameService) {

        $scope.lockDown = false;
        $scope.user_token = authService.getToken();
        $scope.predictionGrid = gameService.getPredictionGrid();
        /*$scope.predictionGrid = {
            enableColumnMenus: false,
            columnDefs: [
                { field: 'href',
                    displayName: 'Name',
                    cellTemplate: '<div class="ngCellText"><a href="/src/index.html#/profile?id={{row.entity.uid}}">{{row.entity.Name}}</a></div>'
                },
                { field: 'Team',
                    displayName: 'Predicted Team'
                }]
        };*/

        //quick hack for semi and finals:
        if ($scope.lockDown) {
            $scope.predictionGrid = { data: '' };		//comment to show prediction grid
            return;
        }

        // TODO: something to update grid dynamically?
        // $scope.$watch(currentPredList)

        //get Prediction from API
        gameService.getPredictionList($scope.user_token)
            .then(function (response) {
                if (response == null) {
                    throw "There was an error trying to fetch prediction data from the web service. Please try again later";
                }
                if (!response.data.success) { throw response.data.message; }
                //console.log(angular.toJson(response.data,true));

                if (response.data.predictData.length == 1) {
                    $scope.lockDown = true;
                }
                gameService.setRemainingPredictionCount(response.data.rem_predictions);
                gameService.fillPredictionGrid(response.data.predictData);      //for dynamically refreshing the prediction grid
            })
            .catch(function (err) {
                console.error("Unable to fetch prediction table. Details:\n" + err);
            })
    }


})();