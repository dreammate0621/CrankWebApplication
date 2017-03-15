/**
* This is the controller of the navbar
* */
app.controller('navBarCtrl',function($rootScope, $scope, $cookieStore) {

    $scope.doRefresh = function() {
        $rootScope.$broadcast('crankRefresh',{});
    };

    $scope.clickCrank = function() {
        $rootScope.$broadcast('clickCrank',{});
    };


    /**
    * Main
    * */

    $scope.current_user = $cookieStore.get('current_user');

});
