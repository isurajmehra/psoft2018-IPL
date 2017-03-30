/*
grjoshi 5/30/2016
     Controller to handle register user page
*/

(function () {
    angular.module("psoft2UI").controller("registerController", addUserCtrl);
    addUserCtrl.$inject = ['$scope', '$location', 'userService', 'md5'];
    
    function addUserCtrl($scope, $location, userService, md5) {
              
        $scope.is_pass_match = true;
        $scope.is_processing = false;
        $scope.show_confirmation = false;
        $scope.err_msg = '';
        $scope.user_added = true;
        
        $scope.registerUser = function () {
            
            return;  //uncomment after registraion period expires

            if ($scope.user.name == "" || $scope.user.email == "" || $scope.user.password == "") {
                console.error("Blank values cannot be submitted!");
                return;
            }
            
            if ($scope.user.password == $scope.user.confirm_password)
                $scope.is_pass_match = true;
            else {
                $scope.is_pass_match = false;
                return;
            }
            
            $scope.is_processing = true;            //processing GIF            
           
            var usr_token = md5.createHash($scope.user.email + Date.now());
            
            //call service and wait for response
            userService.addUser($scope.user.name, $scope.user.email, md5.createHash($scope.user.password),usr_token)
			.then(function (response) {
                
                $scope.is_processing = false;
                if (!response.data.success) {
                    $scope.user_added = false;
                    $scope.err_msg = response.data.message;
                    return;
                } 
                
                $scope.user_added = true;
                $scope.show_confirmation = true;
                //console.log("Added new user");
            })
			.catch(function (response) {
                $scope.err_msg = "ERROR trying to add user. Response was:" + response.status + "//" + response.data;
            })
        }
    }
})();