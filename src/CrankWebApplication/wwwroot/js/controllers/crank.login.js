/**
* Crank Landing page app
*
* Makes people register
* Choose beetweern artist / radio
* Choose beetween signin / register
* */

app.controller('signinFormCtrl', function ($scope, $http, $cookieStore, $location) {
    
    $scope.current_view = 'signin';
    $scope.current_form  = 'partials/landing_signin.html';
    $scope.login_username;
    $scope.login_password;
   
    /**
    * Submit the login form
    * */
    $scope.submitLogin = function(username,password) {
        // Call $parent because ng-include creates a new inner scope
        var postData = {
            "username": $scope.login_username,
            "password": $scope.login_password
        };
        $http.post(api+'/auth/login', JSON.stringify(postData))        
        .success(function (data) {
            console.log(data);
            $cookieStore.put('current_user', data);
            if (data.user_type == Constants.Role['RADIO_MANAGER'])
            {
                $location.path('/Radio');
            }
            else
            {
                $location.path('/Artist');
            }
            
        })
        .error(function(data){
            $scope.login_error = "There was an error loggin in, are you registered?";
            console.log(data);
        });
        return false;
    }
});

app.controller('confirmFormCtrl',function($scope,$http,$cookieStore,$location) {
    $scope.current_view  = 'confirm';
    $scope.current_form = 'partials/landing_confirm.html';
});


