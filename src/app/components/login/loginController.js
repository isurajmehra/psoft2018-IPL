(function () {
    angular.module("psoft2UI").controller("loginController", loginCtrl);
    loginCtrl.$inject = ['$scope', '$location', 'authService', 'userService', 'md5'];
    function loginCtrl($scope, $location, authService, userService, md5) {

        $scope.is_valid = true;
        $scope.message = "";
        $scope.is_waiting = false;			//enabled when waiting on server
        
        //console.log("AUTH_INIT: checking auth object::" + angular.toJson(authService.usrObj));
        if (!authService.isLoggedIn()) {
            if (authService.loadSession()) {
                //fetch and update score if different from session storage
                userService.getUserPoints(authService.usrObj.token)
                    .then(function (response) {
                        if (response != null) {
                            if (authService.usrObj.points != response.data.score) {
                                //update score and storage object
                                authService.usrObj.points = response.data.score;
                                authService.saveSession();      //update score in saved session
                            }
                        }
                    });
                //user info loaded; redirect to main page
                $location.path("/poll");
            }
            else {
                //no session saved either, so wait on login
                //console.log("First time run - waiting on login...");
             }
        }
/*        else {
            // $scope.user.userID = authService.usrObj.userID;
            // $scope.user.name = authService.usrObj.name;
            // $scope.user.email = authService.usrObj.email;
            // $scope.user.token = authService.usrObj.token;
            // $scope.user.points = authService.usrObj.points;
            $scope.user = authService.usrObj.slice();
            console.log("DOES THIS EVER GET HERE???");
            $location.path("/poll");
        }*/

        $scope.checkIfLoggedIn = function () {

            //TODO: try to figure out why this factory function won't work
            //console.log("factory.isLoggedIn = "+authService.isLoggedIn());
            return authService.isLoggedIn();

            //possible solution for checking the user login status, if factory function fails
            /* if(authService.usrObj.token == '')
                 return false;
             else{
                 //console.log("## " + authService.usrObj.token);
                 return true;
             }*/
        };

        $scope.getUserName = function() {
            // if(authService)
            //     return authService.usrObj.name;
            // else
            //     return '404';
            return authService.getName();
        };

        $scope.getUserPoints = function() {
            // if(!authService)
            //     return '';
            //     return authService.usrObj.points;
            return authService.getPoints();
        }

        $scope.login = function () {
            
            //check if already logged in
            if (authService.isLoggedIn()) {
                //console.log("Already logged in as "+userService.usrObj.name);
                $location.path("/poll");
                return;
            }
            $scope.is_waiting = true;
            authService.login($scope.email, md5.createHash($scope.password))
			.then(function (response) {
                //console.log("RESPONSE RETURNED:: "+angular.toJson(response,true));
                if (response == null) {
                    throw "There was an error trying to connect to the web service. Please try again later";
                }
                
                if (!response.data.success) {
                    throw response.data.message;
                }
                
                /*authService.usrObj = {
                    userID: response.data.usrData.userID,
                    name: response.data.usrData.user,
                    email: response.data.usrData.email,
                    token: response.data.usrData.token,
                    points: response.data.usrData.points
                };*/
                authService.usrObj = angular.copy(response.data.usrData);
                //$scope.user = angular.copy(response.data.usrData);

                if ($scope.savelogin) {
                    //session persistence
                    //console.log("This is where the login needs to be saved!");
                    //window.localStorage['nofapp_session'] = angular.toJson(userService.usrObj);
                    authService.saveSession();
                    //console.log("Saved user token to local storage");
                }
                
                $scope.is_valid = true;
                //console.log("Set user object to: " + angular.toJson(userService.usrObj, true));
                //console.log("Login successful, routing to poll page..");
                $location.path("/poll");
                return;
            })
			.catch(function (err) {
                //console.log("FAILED finding user. Response was:"+response.status, response.data);
                $scope.message = err;
                $scope.is_valid = false;
                console.log(err);
            })
			.finally(function () {
                //$location.path("/poll");
                //return;
                $scope.is_waiting = false;
            })
        };

        $scope.logout = function () {
            //invalidate user session
            console.log("Erasing user session...");
            //authService.usrObj = {};
            window.localStorage.clear();
            authService.clearAuth();
            $location.path("/login");
        };


        $scope.redirectToRegister = function () {
            //console.log("Redirecting to Register page");
            $location.path("/register");
            return;
        };
    }
})();