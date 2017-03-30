
/*
grjoshi 3/30/2016
     Service to handle user session object and all user-related API calls
*/

angular.module("psoft2UI").service("userService", function ($http){
	// this.usrObj = {
	// 	userID: '',
	// 	email: '',
	// 	name: '',
     //    token: '',
	// 	points: 0
	// };	
    
    //
    // this.checkSession = function () {
    // //check local storage for login, and return true if found
    //     if (window.localStorage['nofapp_session']) {
    //         //console.log("User session is available as:" + angular.toJson(window.localStorage['nofapp_session']));
    //         this.usrObj = angular.fromJson(window.localStorage['nofapp_session']);
    //         //console.log("Loaded:: " + angular.toJson(this.usrObj, true));
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    // };


    this.getUserPoints = function (token) {

        var promise = $http.get("/api/getUserPoints/?token=" + token);
        return promise;
    };

    //
    ////reassigned to authservice
    //
    // this.checkLogin=function(){
    //
    //     if (this.usrObj.token == '')			//use token to check if user is logged in
    //         return false;
    //     else
    //         return true;
    // }

    
    // this.login = function (email, password) {
    //     var data = {
    //         email: email,
    //         password: password
    //     };
    //
    //     var promise = $http.post("/api/login", data);
    //     return promise;
    // }
    
    this.addUser = function (name, email, password, token) {
        var data = {
            name: name,
            email: email,
            password: password,
            token: token
        };
        
        var promise = $http.post("/api/adduser", data);
        return promise;
    };
    
    this.getPredictionHistory = function (token) {
        var promise = $http.get("/api/getHistory?token=" + token);
        return promise;
    };

    this.getPredictionHistoryByID = function(userID){
        var promise = $http.get("/api/getHistoryByID?userID=" + userID);
        return promise;
    }
});
