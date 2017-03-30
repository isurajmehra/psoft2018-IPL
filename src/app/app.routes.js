angular.module("psoft2UI",['ngRoute','angular-md5','ui.grid','timer'])
	.config(function($routeProvider){
		$routeProvider
			.when('/poll',{
				controller: 			'pollController',
				templateUrl: 			'/src/app/components/poll/gamePollPartial.html',
				caseInsensitiveMatch: 	true
			})
			//.when('/user',{
			//	controller: 			'userController',
			//	templateUrl: 			'/app/views/profilePartial.html',
			//	caseInsensitiveMatch: 	true
			//})
			.when("/login",{
				controller: 			'loginController',
				templateUrl: 			'/src/app/components/login/loginPartial.html',
				caseInsensitiveMatch: 	true	
			})
			.when('/',{		//start with authentication service
				controller: 			'loginController',
				templateUrl: 			'/src/app/components/login/loginPartial.html',
				caseInsensitiveMatch: 	true
			})
			// .when('/',{
			// 	controller: 			'gameController',
			// 	templateUrl: 			'/src/app/components/poll/gamePollPartial.html',
			// 	caseInsensitiveMatch: 	true
			// })
			.when('/register',{
				controller: 			'registerController',
				templateUrl: 			'/src/app/components/register/registerPartial.html',
				caseInsensitiveMatch: 	true
			})
			.when('/profile',{
				controller: 			'profileController',
				templateUrl: 			'/src/app/components/profile/profilePartial.html',
				caseInsensitiveMatch: 	true
			})
			.when('/profile/:id',{
				controller:				'profileController',
				templateUrl: 			'/src/app/components/profile/profilePartial.html',
				caseInsensitiveMatch: 	true
			})
			.when('/rules',{
				controller:				'profileController',
				templateUrl:			'/src/app/components/rules/rulesPartial.html',
				caseInsensitiveMatch: 	true
			})
			.otherwise({
				template: "<H1>Page not found</H1>",
				//templateUrl: "/app/views/notFoundPartial.html",
				caseInsensitiveMatch: true
			});			
	});
