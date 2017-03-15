/**
* Crank Beta
* Application definition
*/

var api = 'http://cr.thesilverlogic.us/api';
var crankServiceApi = 'http://crankdev3.cranklive.com/api/v1';

// Token for activating the ajax calls, disable for testing
var IS_LIVE = true;

// Removed ng-animate for incompatibility
// https://github.com/angular/angular.js/issues/3613
var app = angular.module('crank_app', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'ngIscroll', 'ngCaroufredsel', 'ngDragndrop', 'ngDragDrop', 'ngLeaflet','ng-iscroll','ng-sortable']);

app.config(['$animateProvider', function($animateProvider){
  $animateProvider.classNameFilter(/^((?!no-animation).)*$/);
}]);

app.run(['$rootScope','$http', '$cookieStore','$location', function($rootScope, $httpProvider, $cookieStore, $location) {
    // Init
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.useXDomain = true;
    $rootScope.user_type_desc = '';
    // Redirect if not logged
    $rootScope.checkUser = function ()
    {
        // Redirect if no user
        $rootScope.current_user = $cookieStore.get('current_user');
        $rootScope.current_login_user = $cookieStore.get('current_login_user');
        if (!$rootScope.current_user || !$rootScope.current_user.user_type)
        {
            $location.path('/');
        }
    };

    // TODO Define Ajax loader
}]);


app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/signin', {
        templateUrl: 'partials/landing_index.html',
        controller: 'signinFormCtrl'
    })
    .when('/register', {
        templateUrl: 'partials/landing_index.html',
        controller: 'registerFormCtrl'
    })
    .when('/register/:guid', {
        templateUrl: 'partials/landing_index.html',
        controller: 'registerFormCtrl',
    })
    .when('/register/confirm', {
        templateUrl: 'partials/landing_index.html',
        controller: 'confirmFormCtrl'
    })  
    .when('/artist', {
        templateUrl: 'partials/artist_index.html',
        controller: 'artistCtrl',
        resolve: {
        }
    })
     .when('/radio', {
        templateUrl: 'partials/radio_index.html',
        controller: 'radioCtrl',
        resolve: {
        }
     })
     .when('/promoter', {
         templateUrl: 'partials/promoter_index.html',
         controller: 'promoterCtrl',
         resolve: {
         }
     })
    .otherwise({ redirectTo: '/signin' });
}]);

