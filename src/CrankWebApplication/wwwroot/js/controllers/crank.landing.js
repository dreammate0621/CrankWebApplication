/**
* Crank Landing page app
*
* Makes people register
* Choose beetweern artist / radio
* Choose beetween signin / register
* */

app.controller('signinFormCtrl', function ($scope, $http, $cookieStore, $location, $rootScope) {

    $scope.current_view = 'signin';
    $scope.current_form  = 'partials/landing_signin.html';
    $scope.login_username='barry_griffin@comcast.net';
    $scope.login_password='babyboy123';

    /**
    * Submit the login form
    * */
    $scope.submitLogin = function(username,password) {
        // Call $parent because ng-include creates a new inner scope
        var postData = {
            "username": $scope.login_username,
            "password": $scope.login_password
        };
        $http.post(api+'/auth/login',postData)
        .success(function(data){
            console.log(data);
            $cookieStore.put('current_user', data);
         
            SetUserTypeDesciption(data);

            if ($rootScope.user_type_desc == 'ARTIST_MANAGAER') {
                $location.path('/artist');
            }
            else {
                $location.path('/radio');
            }

            //hard coded user id to Barry griffin
            $http({
                url: crankServiceApi + '/users/getById/57b0afa9c2cb68191e936c81',
                method: "GET"

            })
             .then(function (loginuserdata) {
                 console.log(loginuserdata.data[0]);
                 $cookieStore.put('current_login_user', loginuserdata.data[0]);
                 console.log(loginuserdata);//57b0afa9c2cb68191e936c81
             },
             function (loginuserdata) {
                 //log error
             });
        })
        .error(function(data){
            $scope.login_error = "There was an error loggin in, are you registered?";
            console.log(data);
        });
        return false;
    }

    function SetUserTypeDesciption(data)
    {
        if (data.user_type == '1') {
            $rootScope.user_type_desc = 'ARTIST_MANAGAER'
        }
        else if (data.user_type == '2') {
            $rootScope.user_type_desc = 'RADIO_MANAGAER'
        }

    }
});

app.controller('confirmFormCtrl',function($scope,$http,$cookieStore,$location) {
    $scope.current_view  = 'confirm';
    $scope.current_form = 'partials/landing_confirm.html';
});

app.controller('registerFormCtrl', function ($scope, $http, $location, $routeParams, $window) {
    console.log($routeParams.guid);
    $scope.current_view = 'register';
    $scope.current_form = 'partials/landing_register.html';

    $scope.register_first_name;
    $scope.register_last_name;
    $scope.register_username;
    $scope.register_password;
    $scope.repeat_password;
    $scope.register_company_name;
    $scope.register_user_type = 'artistmanager';
    $scope.register_selected_country = '224';//United states code
    $scope.register_guid = null;


    //Get Country list
    //$http.get(crankServiceApi + '/geo/countries') for now getting the list of countries from geognos
    $http.get('http://www.geognos.com/api/en/countries/info/all.json')
    .success(function (res) {
        $scope.register_country_list = res.Results;
    })
    .error(function (res) {
        console.log(res);
    });



    //Submit register form
    $scope.submitRegister = function () {

        var postData = {
            "password": $scope.register_password,
            "email": $scope.register_username,
            "firstName": $scope.register_first_name,
            "lastName": $scope.register_last_name,
            "isActive": true,
            "userType": $scope.register_user_type,
            "company": $scope.register_company_name,
            "venues": [],
            "artists": [],
            "stations": [],
            "events": [],
            "team": [],
            "connectedUsers": [],
            "digitals": [],
            "modules": []
        };

        var urlPath = crankServiceApi + '/users/register/' + $routeParams.guid;
        if ($routeParams.guid == null || angular.isUndefined($routeParams.guid)) {
            urlPath = crankServiceApi + '/users';

        }

        if ($scope.register_password != $scope.repeat_password) {
            $scope.login_error = "Passwords don't match.";
            return false;
        }

        $scope.ShowAlert = function (alertMessage) {
            if (typeof (alertMessage) == "undefined" || alertMessage == "") {
                return;
            }
            $window.alert(alertMessage);
        }

        $http({
            method: 'POST',
            url: urlPath,
            data: JSON.stringify(postData),
            dataType: 'json',
        }).then(function successCallback(response) {
            $scope.ShowAlert('User registered successfully');
            $location.path('/signin');
        }, function errorCallback(response) {
            if (response.status === 409) {
                $scope.login_error = "This email id is already registered";
                return false;
            }
            $scope.login_error = "There was an error, please contact the administrators";
            console.log(response);
        });
        return true;
    }
});


