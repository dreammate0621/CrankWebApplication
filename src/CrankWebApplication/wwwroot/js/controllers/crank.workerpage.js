/// <reference path="../../partials/index.html" />
app.controller('workerPageCtrl', function ($rootScope, $scope, $http, $modal, $timeout, $window) {
   
    $scope.sortableConfig = { group: 'workpageteam', animation: 150, filter: '.frame__gray' };

    $scope.$parent.myScrollOptions = {
        'team-user-wrapper': {
            snap: false,
            scrollX: true,
            mouseWheel: true,
            scrollbars: true,
            //fadeScrollbars:true,
            interactiveScrollbars: true
        }
    };
    $scope.userAddedToInnetwork = function userAddedToInnetwork(evt) {
        console.log('user added to in network');
        console.log(evt.item);
        $scope.refreshEventsiScroll();
    };

    $scope.inNetworkUsers = { group: 'workpageteam', animation: 150 };
    $scope.inNetworkUsers['onAdd'] = $scope.userAddedToInnetwork;

    $scope.getSearchedUser = function (val) {
        return $http.get(crankServiceApi + '/users/searchbyname/' + val, {
          
        }).then(function (response) {
            var searchedList = [];

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].id != $rootScope.current_login_user.id)
                {
                    if ($scope.InNetworkTeamUsersId.indexOf(response.data[i].id) < 0
                        && $scope.OutNetworkConnectedTeamUsersId.indexOf(response.data[i].id) < 0) {
                        searchedList.push(response.data[i]);
                    }
                }                           
            }
            return searchedList;
        });
    };
   
    function CheckIfUserConnectedToLoginUser(inputUserId)
    {
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.connectedUsers.length; iMemberCount++) {
            if(inputUserId.indexOf($rootScope.current_login_user.connectedUsers[iMemberCount]) < 0)
            {
                return true;
            }
        }
        return false;
    }

    $scope.addSearchUserToDiv = function ($item, $model, $label) {
        $http({
            url: crankServiceApi + '/users/getById/' + $model.id,
            method: "GET"
        })
           .then(function (searchedUserData) {
               setTimeout(function () {
                   $scope.$apply(function () {
                       $scope.OutOfNetworkTeamUsers.push({
                           "id": searchedUserData.data[0].id,
                           "firstName": searchedUserData.data[0].firstName,
                           "lastName": searchedUserData.data[0].lastName,
                           "company": searchedUserData.data[0].company,
                           "isActive": searchedUserData.data[0].isActive,
                           "email": searchedUserData.data[0].email,
                           "isConnected": CheckIfUserConnectedToLoginUser(searchedUserData.data[0].id),
                           "sortOrder": "1"
                       });
                       $scope.OutNetworkConnectedTeamUsersId.push(
                            searchedUserData.data[0].id
                       );
                   });
               }, 2000);


           },
           function (data) {
               //log the error
           });
        $scope.searchedOutOfNetworkUser = null;
    };

    $scope.modelOptions = {
        debounce: {
            default: 500,
            blur: 250
        },
        getterSetter: true
    };

    $scope.refreshEventsiScroll = function () {
        $scope.myScroll['team-user-wrapper'].refresh();
    };

    $scope.current_view = 'workerpage'; // artist or analytics
    
    $rootScope.checkUser();


    //var mainContainer = $('.source-panel__content--main');

    //mainContainer.find($('.source-panel__member-link')).click(function () {
    //    if (!$(this).data().sourcePanel) return false;
    //    var container = $(document.getElementById($(this).data().sourcePanel));

    //    fadeOut(mainContainer, 300);
    //    fadeIn(mainContainer, container, 300, 350);
    //    return false;
    //});

    //$('.source-panel__label--main').click(function () {
    //    if ($(this).closest('.source-panel__content').hasClass('source-panel__content--main')) return false;

    //    var container = getContainer(this);

    //    fadeOut(container, 300);
    //    fadeIn(container, mainContainer, 300, 350);
    //    return false;
    //});

    //mainContainer.find($('.source-panel__label--data')).click(function () {
    //    var container = getContainer(this);

    //    fadeOut(container, 300);
    //    fadeIn(container, $('.source-panel__content--digital'), 300, 350);
    //    return false;
    //});

    //$('.source-panel__member-link').click(function () {
    //    if ($(this).closest('.source-panel__content').hasClass('source-panel__content--main') ||
    //        !$(this).html()) return false;

    //    $(this).parent().toggleClass('source-panel__member-item--active');
    //    return false;
    //});

    //function fadeOut(container, duration) {
    //    container.animate({
    //        opacity: 0
    //    }, duration, 'jswing');
    //}

    //function fadeIn(containerToHide, containerToShow, duration, delay) {
    //    setTimeout(function () {
    //        containerToHide.css({ 'display': 'none' });
    //        containerToShow.css({ 'display': 'flex', 'opacity': '0' });

    //        containerToShow.animate({
    //            opacity: 1
    //        }, duration, 'jswing');
    //    }, delay);
    //}

    //function getContainer(el) {
    //    var container = $(el).closest('.source-panel__content');
    //    return container;
    //}
   
    $scope.InNetworkTeamUsers = [];
    $scope.OutOfNetworkTeamUsers = [];
    $scope.InNetworkTeamUsersId = []
    $scope.OutNetworkConnectedTeamUsersId = [];

    //default tab to be shown
   
    $scope.showAccountTab = function()
    {
        HideAllTabs();
        $scope.accountTabVisible = true;
    }

    $scope.showTeamTab = function () {
        HideAllTabs();
        $scope.teamTabVisible = true;
    }

    $scope.showShowsTab = function () {
        HideAllTabs();
        $scope.showsTabVisible = true;
    }
    
    $scope.showModuleTab = function () {
        HideAllTabs();
        $scope.moduleTabVisible = true;
    }
    $scope.showRosterTab = function () {
        HideAllTabs();
        $scope.rosterTabVisible = true;
    }
    $scope.showDigitalsTab = function () {
        HideAllTabs();
        $scope.digitalTabVisible = true;
    }
    function HideAllTabs()
    {
        $scope.teamTabVisible = false;
        $scope.accountTabVisible = false;
        $scope.showsTabVisible = false;
        $scope.moduleTabVisible = false;
        $scope.rosterTabVisible = false;
        $scope.digitalTabVisible = false;
    }
    

    $scope.inviteModalOpen = function (user) {
        $scope.invited_user = user;
        $scope.invited_user.firstName = user.firstName + ' ' + user.lastName;
        
        var modalInstance = $modal.open({
            templateUrl: 'invite.html',
            controller: 'preferencesModalArtistCtrl',
            windowClass: 'preferences1-modal',
            scope: $scope,
        });
    };
    

    $scope.loadUserImage = function()
    {
        var url = crankServiceApi + '/users/' + $rootScope.current_login_user.id + '/getImage';
        $http.get(url, { responseType: "blob" }).
            success(function (data, status, headers, config) {
                // encode data to base 64 url
                fr = new FileReader();
                fr.onload = function () {
                    $scope.loadedFile = fr.result;
                    $scope.$apply();
                };
                fr.readAsDataURL(data);
            }).
            error(function (data, status, headers, config) {
                // alert("The url could not be loaded...\n (network error? non-valid url? server offline? etc?)");
            });
    }

    //Initialize on page load
    $scope.init = function () {
        $scope.showTeamTab();
        $scope.FetchInNetworkUsers();
        $scope.FetchOutOfNetworkUsers();
        $scope.FetchInNetworkRosters();
        $scope.FetchOutOfNetworkRosters();

        $scope.FetchInNetworkStations();
        $scope.FetchOutOfNetworkStations();

        
        $scope.FetchInNetworkModules();
        $scope.FetchOutOfNetworkModules();

        $scope.loadUserImage();
        $scope.loadUserDetails();
    }

    $scope.loadUserDetails = function()
    {
        $scope.accountinfo = {};
        
        $scope.accountinfo.userid = $rootScope.current_login_user.userid;
        $scope.accountinfo.firstName = $rootScope.current_login_user.firstName;
        $scope.accountinfo.lastName = $rootScope.current_login_user.lastName;
        $scope.accountinfo.email = $rootScope.current_login_user.email;
        $scope.accountinfo.company = $rootScope.current_login_user.company;
    }

    $timeout($scope.init)

    $scope.ShowError = function (errorMessage) {
        if (typeof (errorMessage) == "undefined" || errorMessage == "") {
            return;
        }
        $window.alert("Following Error Occured: " + errorMessage);
    }

    $scope.showAlert = function (message) {
        if (typeof (message) == "undefined" || message == "") {
            return;
        }
        $window.alert(message);
    }

    $scope.SaveInNetworkUsers = function () {
        $rootScope.current_login_user.team = [];
        for (var i = $scope.InNetworkTeamUsers.length - 1; i >= 0; i--) {
            $rootScope.current_login_user.team.push($scope.InNetworkTeamUsers[i].id);

            //remove him from the connected users for the logged in user
            for (var iConnectedMember = 0; iConnectedMember < $rootScope.current_login_user.connectedUsers.length; iConnectedMember++) {
                
                if ($scope.InNetworkTeamUsers[i].id == $rootScope.current_login_user.connectedUsers[iConnectedMember])
                {
                    $rootScope.current_login_user.connectedUsers.splice(iConnectedMember,1);
                }
            }
        }

        $http({
            method: 'PUT',
            url: crankServiceApi + '/users',
            data: angular.toJson($rootScope.current_login_user)
        }).then(function successCallback(response) {
            $scope.showAlert('Successfully saved in team member changes');

            $http({
                url: crankServiceApi + '/users/getById',
                method: "GET",
                data: { 'id': '57b0afa9c2cb68191e936c81' }
            })
            .then(function (loginuserdata) {
                $cookieStore.put('current_login_user', loginuserdata.data[0]);
                $rootScope.current_login_user = loginuserdata.data[0];
            },
            function (loginuserdata) {
                //log error
            });

            //console.log($rootScope.current_login_user);

            $scope.InNetworkTeamUsers = [];
            $scope.OutOfNetworkTeamUsers = [];
            $scope.InNetworkTeamUsersId = []
            $scope.OutNetworkConnectedTeamUsersId = [];
            $scope.FetchInNetworkUsers();
            $scope.FetchOutOfNetworkUsers();

            $scope.InNetworkRosters = [];
            $scope.OutOfNetworkRosters = [];
            $scope.InNetworkRostersId = []
            $scope.OutOfNetworkRostersId = [];
            $scope.FetchInNetworkRosters();
            $scope.FetchOutOfNetworkRosters();

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
          
    };

    $scope.moveUserOutOfTeam = function (id) {
        for (var i = $scope.InNetworkTeamUsers.length - 1; i >= 0; i--) {
            if ($scope.InNetworkTeamUsers[i].id == id) {
                $scope.OutOfNetworkTeamUsers.push($scope.InNetworkTeamUsers[i]);
                $scope.InNetworkTeamUsers.splice(i, 1);
            }
        }       
    };
  
    //call the worker page API method
    $http.get(crankServiceApi + '/users')
    .success(function (data, status) {
        return data;
    });

    $scope.FetchInNetworkUsers = function ()
    {        
        //Loop through and get all the team user details
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.team.length; iMemberCount++) {
            //console.log(response.data[0].team[i]);
            $http({
                url: crankServiceApi + '/users/getById/' + $rootScope.current_login_user.team[iMemberCount],
                method: "GET"                
            })
                .then(function (teamData) {
                    $scope.InNetworkTeamUsers.push({
                        "id": teamData.data[0].id,
                        "firstName": teamData.data[0].firstName,
                        "lastName": teamData.data[0].lastName,
                        "company": teamData.data[0].company,
                        "isActive": teamData.data[0].isActive,
                        "email":teamData.data[0].email,
                        "isConnected": false
                    });
                    $scope.InNetworkTeamUsersId.push(
                         teamData.data[0].id
                    );
                    console.log("In network team members - " + teamData.data[0].firstName + teamData.data[0].lastName);
                    
                },
                function (data) {
                    //log the error
                });
        }     
    };


    $scope.SendInviteMail = function () {
        console.log($scope.invited_user);
        //Call API method to send mail invitation
        $http({
            method: 'POST',
            url: crankServiceApi + '/users/invite',
            data: angular.toJson($scope.invited_user)
        }).then(function successCallback(response) {
            $scope.showAlert('Team member invited successfully..');
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.FetchOutOfNetworkUsers = function () {
        
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.connectedUsers.length; iMemberCount++) {
            if ($rootScope.current_login_user.connectedUsers[iMemberCount] != $rootScope.current_login_user.id
                    && $scope.InNetworkTeamUsersId.indexOf($rootScope.current_login_user.connectedUsers[iMemberCount]) < 0) {
                $http({
                    url: crankServiceApi + '/users/getById/' + $rootScope.current_login_user.connectedUsers[iMemberCount],
                    method: "GET"
                })
            .then(function (connectedUserData) {
                //console.log(connectedUserData);
                $scope.OutOfNetworkTeamUsers.push({
                    "id": connectedUserData.data[0].id,
                    "firstName": connectedUserData.data[0].firstName,
                    "lastName": connectedUserData.data[0].lastName,
                    "company": connectedUserData.data[0].company,
                    "isActive": connectedUserData.data[0].isActive,
                    "email": connectedUserData.data[0].email,
                    "isConnected": true,
                    "sortOrder": "2"
                });
                $scope.OutNetworkConnectedTeamUsersId.push(
                     connectedUserData.data[0].id
                );
            },
            function (data) {
                //log the error
            });
            }
        }
        //Now get all the other users
        $http({
            url: crankServiceApi + '/users',
            method: "GET"
        })
              .then(function (allusers) {
                  //console.log(outofnetworkusers);
                  //console.log('found some users with company of crank');
                  for (var i = 0; i < allusers.data.length; i++) {
                      if (allusers.data[i].id != $rootScope.current_login_user.id
                          && $scope.InNetworkTeamUsersId.indexOf(allusers.data[i].id) < 0
                          && $scope.OutNetworkConnectedTeamUsersId.indexOf(allusers.data[i].id) < 0)
                      {
                          $scope.OutOfNetworkTeamUsers.push({
                              "id": allusers.data[i].id,
                              "firstName": allusers.data[i].firstName,
                              "lastName": allusers.data[i].lastName,
                              "company": allusers.data[i].company,
                              "isActive": allusers.data[i].isActive,
                              "email": allusers.data[i].email,
                              "isConnected": false,
                              "sortOrder": "3"
                          });

                          $scope.OutNetworkConnectedTeamUsersId.push(
                            allusers.data[i].id
                            );
                      }
                  }

                  // console.log($scope.OutOfNetworkTeamUsers);
              },
              function (data) {
                  //log the error
              });
    };

  
    $scope.newUploadImage = null;
    $scope.openFile = function(event) {
        var input = event.target;

        var reader = new FileReader();
        
        //fr.readAsDataURL(data);

        reader.onload = function(){
            var dataURL = reader.result;
            //var output = document.getElementById('output');
            //output.src = dataURL;
           
            $scope.loadedFile = reader.result;
            $scope.$apply();
        };
        reader.readAsDataURL(input.files[0]);

        var fd = new FormData();
        fd.append('file', input.files[0]);

        $scope.newUploadImage = fd;
        $scope.$apply();
    };

    $scope.connectUserToLoginUser = function (connectUser)
    {
        for (var iMemberCount = 0; iMemberCount < $scope.OutOfNetworkTeamUsers.length; iMemberCount++) {
            if ($scope.OutOfNetworkTeamUsers[iMemberCount].id == connectUser.id)
            {
                $scope.OutOfNetworkTeamUsers[iMemberCount].isConnected = true;
                
            }
        }
        $scope.$apply();
    }

    $scope.updateAccountInfo = function () {
       
        if ($scope.newUploadImage != null || $scope.newUploadImage != undefined)
        {
            $http.post(crankServiceApi + '/users/' + $rootScope.current_login_user.id + '/uploadImage', $scope.newUploadImage, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
           .success(function () {
               $scope.loadUserImage();
           })
           .error(function () {
           });
        }
       
        var saveUser = $scope.current_login_user;

        saveUser.firstName = $scope.accountinfo.firstName;
        saveUser.lastName = $scope.accountinfo.lastName;
        saveUser.userid = $scope.accountinfo.userid;
        saveUser.email = $scope.accountinfo.email;
        saveUser.company = $scope.accountinfo.company;
       
        console.log(saveUser);
        $http({
            method: 'PUT',
            url: crankServiceApi + '/users',
            data: angular.toJson(saveUser)
        }).then(function successCallback(response) {
            $scope.showAlert('Successfully saved account info');

            $http({
                url: crankServiceApi + '/users/getById',
                method: "GET",
                data: { 'id': '57b0afa9c2cb68191e936c81' }
            })
            .then(function (loginuserdata) {
                $cookieStore.put('current_login_user', loginuserdata.data[0]);
                $rootScope.current_login_user = loginuserdata.data[0];
            },
            function (loginuserdata) {
                //log error
            });

            $scope.InNetworkTeamUsers = [];
            $scope.OutOfNetworkTeamUsers = [];
            $scope.InNetworkTeamUsersId = []
            $scope.OutNetworkConnectedTeamUsersId = [];
            $scope.FetchInNetworkUsers();
            $scope.FetchOutOfNetworkUsers();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    }

    $scope.$on('crankRefresh',function() {
        console.log('TODO crank refresh ui');
    });

    //Roster
    $scope.saveInNetworkRoster = function () {
        $rootScope.current_login_user.artists = [];
        for (var i = $scope.InNetworkRosters.length - 1; i >= 0; i--) {
            $rootScope.current_login_user.artists.push($scope.InNetworkRosters[i].id);
        }

        $http({
            method: 'PUT',
            url: crankServiceApi + '/users',
            data: angular.toJson($rootScope.current_login_user)
        }).then(function successCallback(response) {
            $scope.showAlert('Successfully saved in artist changes');

            $http({
                url: crankServiceApi + '/users/getById',
                method: "GET",
                data: { 'id': '57b0afa9c2cb68191e936c81' }
            })
            .then(function (loginuserdata) {
                $cookieStore.put('current_login_user', loginuserdata.data[0]);
                $rootScope.current_login_user = loginuserdata.data[0];
            },
            function (loginuserdata) {
                //log error
            });

            //console.log($rootScope.current_login_user);

            $scope.InNetworkRosters = [];
            $scope.OutOfNetworkRosters = [];
            $scope.InNetworkRostersId = []
            $scope.OutOfNetworkRostersId = [];

            $scope.FetchInNetworkRosters();
            $scope.FetchOutOfNetworkRosters();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

    $scope.moveUserOutOfRoster = function(id)
    {
        for (var i = $scope.InNetworkRosters.length - 1; i >= 0; i--) {
            if ($scope.InNetworkRosters[i].id == id) {
                $scope.OutOfNetworkRosters.push($scope.InNetworkRosters[i]);
                $scope.InNetworkRosters.splice(i, 1);
            }
        }
    }

    $scope.InNetworkRosters = [];
    $scope.OutOfNetworkRosters = [];
    $scope.InNetworkRostersId = []
    $scope.OutOfNetworkRostersId = [];

    $scope.inNetworkRosters = { group: 'workpageroster', animation: 150 };
    $scope.inNetworkRosters['onAdd'] = $scope.rosterAddedToInnetwork;

    $scope.FetchInNetworkRosters = function () {
        //Loop through and get all the roster details for user
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.artists.length; iMemberCount++) {

            $http({
                url: crankServiceApi + '/artists/getById/' + $rootScope.current_login_user.artists[iMemberCount],
                method: "GET"
            })
                .then(function (teamData) {
                    var url = crankServiceApi + '/artists/getById/' + teamData.data[0].id + '/images/large';
                    setTimeout(function () {
                        $http.get(url, { responseType: "blob" }).
                            success(function (data, status, headers, config) {
                                // encode data to base 64 url
                                fr = new FileReader();
                                fr.onload = function () {
                                    $scope.InNetworkRosters.push({
                                        "id": teamData.data[0].id,
                                        "title": teamData.data[0].title,
                                        "isApproved": true,
                                        "imgResult": fr.result
                                    });

                                    $scope.InNetworkRostersId.push(
                                                           teamData.data[0].id
                                                      );

                                    $scope.$apply();
                                };
                                fr.readAsDataURL(data);
                            }).
                            error(function (data, status, headers, config) {
                                // error message
                            });

                    }, 4000);

                },
                function (data) {
                    //log the error
                });
        }
    }


    $scope.FetchOutOfNetworkRosters = function () {

        //Now get all the other users
        $http({
            url: crankServiceApi + '/artists',
            method: "GET"
        })
              .then(function (allusers) {
                  //console.log(outofnetworkusers);
                  //console.log('found some users with company of crank');
                  for (var i = 0; i < allusers.data.length; i++) {
                      if ($scope.InNetworkRostersId.indexOf(allusers.data[i].id) < 0 &&
                          $scope.OutOfNetworkRostersId.indexOf(allusers.data[i].id) < 0) {
                          $scope.OutOfNetworkRosters.push({
                              "id": allusers.data[i].id,
                              "title": allusers.data[i].title,
                              "isApproved": false
                          });

                          $scope.OutOfNetworkRostersId.push(
                            allusers.data[i].id
                            );
                      }
                  }

                  // console.log($scope.OutOfNetworkTeamUsers);
              },
              function (data) {
                  //log the error
              });
    };


    $scope.rosterAddedToInnetwork = function rosterAddedToInnetwork(evt) {
        console.log('roster added to in network');
        console.log(evt.item);
        $scope.refreshEventsiScroll();
    };

    $scope.sortableRosterConfig = { group: 'workpageroster', animation: 150, filter: '.frame__gray' };

    $scope.addSearchRosterToDiv = function ($item, $model, $label) {
        $http({
            url: crankServiceApi + '/artists/getById/' + $model.id,
            method: "GET"
        })
           .then(function (searchedUserData) {
               setTimeout(function () {
                   $scope.$apply(function () {
                       $scope.OutOfNetworkRosters.push({
                           "id": searchedUserData.data[0].id,
                           "title": searchedUserData.data[0].title,
                           "isApproved": false
                       });
                       $scope.OutOfNetworkRostersId.push(
                            searchedUserData.data[0].id
                       );
                   });
               }, 2000);


           },
           function (data) {
               //log the error
           });
        $scope.searchedOutOfNetworkRoster = null;
    };

    $scope.getSearchedRoster = function (val) {
        return $http.get(crankServiceApi + '/artists/searchByName/' + val, {

        }).then(function (response) {
            var searchedList = [];

            for (var i = 0; i < response.data.length; i++) {
                if ($scope.InNetworkRostersId.indexOf(response.data[i].id) < 0
                    && $scope.OutOfNetworkRostersId.indexOf(response.data[i].id) < 0) {
                    console.log(response.data[i]);
                    searchedList.push(response.data[i]);
                }
            }
            return searchedList;
        });
    };

    //Station
    $scope.saveInNetworkStation = function () {
        console.log('saved successfully..');
        $rootScope.current_login_user.digitals = [];
        for (var i = $scope.InNetworkStations.length - 1; i >= 0; i--) {
            $rootScope.current_login_user.digitals.push($scope.InNetworkStations[i].id);
        }

        $http({
            method: 'PUT',
            url: crankServiceApi + '/users',
            data: angular.toJson($rootScope.current_login_user)
        }).then(function successCallback(response) {
            $scope.showAlert('Successfully saved member digital changes');

            $http({
                url: crankServiceApi + '/users/getById',
                method: "GET",
                data: { 'id': '57b0afa9c2cb68191e936c81' }
            })
            .then(function (loginuserdata) {
                $cookieStore.put('current_login_user', loginuserdata.data[0]);
                $rootScope.current_login_user = loginuserdata.data[0];
            },
            function (loginuserdata) {
                //log error
            });

            //console.log($rootScope.current_login_user);

            $scope.InNetworkStations = [];
            $scope.OutOfNetworkStations = [];
            $scope.InNetworkStationsId = []
            $scope.OutOfNetworkStationsId = [];

            $scope.FetchInNetworkStations();
            $scope.FetchOutOfNetworkStations();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

    $scope.moveUserOutOfStation = function (id) {
        for (var i = $scope.InNetworkStations.length - 1; i >= 0; i--) {
            if ($scope.InNetworkStations[i].id == id) {
                $scope.OutOfNetworkStations.push($scope.InNetworkStations[i]);
                $scope.InNetworkStations.splice(i, 1);
            }
        }
    }

    $scope.InNetworkStations = [];
    $scope.OutOfNetworkStations = [];
    $scope.InNetworkStationsId = []
    $scope.OutOfNetworkStationsId = [];

    $scope.inNetworkStations = { group: 'workpageStation', animation: 150 };
    $scope.inNetworkStations['onAdd'] = $scope.StationAddedToInnetwork;

    $scope.FetchInNetworkStations = function () {
        
        //Loop through and get all the team user details
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.digitals.length; iMemberCount++) {
            //console.log(response.data[0].team[i]);
            $http({
                url: crankServiceApi + '/stations/getById/' + $rootScope.current_login_user.digitals[iMemberCount],
                method: "GET"
            })
                .then(function (teamData) {
                    console.log(teamData);
                    $scope.InNetworkStations.push({
                        "id": teamData.data[0].id,
                        "name": teamData.data[0].name,
                        "owner": teamData.data[0].owner,
                        "isActive": true,
                        "sortOrder": 1
                    });
                    $scope.InNetworkStationsId.push(
                         teamData.data[0].id
                    );
                    //console.log("In network Station - " + teamData.data[0].firstName + teamData.data[0].lastName);

                },
                function (data) {
                    //log the error
                });
        }
    };

    $scope.FetchOutOfNetworkStations = function () {

        //Now get all the other stations
        $http({
            url: crankServiceApi + '/stations',
            method: "GET"
        })
              .then(function (allusers) {
                  //console.log(outofnetworkusers);
                  //console.log('found some users with company of crank');
                  for (var i = 0; i < allusers.data.length; i++) {
                      if ($scope.OutOfNetworkStationsId.indexOf(allusers.data[i].id) < 0
                          && $scope.InNetworkStationsId.indexOf(allusers.data[i].id) < 0) {
                          $scope.OutOfNetworkStations.push({
                              "id": allusers.data[i].id,
                              "name": allusers.data[i].name,
                              "owner": allusers.data[i].owner,
                              "isActive": true,
                              "sortOrder": 2
                             
                          });

                          $scope.OutOfNetworkStationsId.push(
                            allusers.data[i].id
                            );
                      }
                  }

                  // console.log($scope.OutOfNetworkTeamUsers);
              },
              function (data) {
                  //log the error
              });
    };


    $scope.StationAddedToInnetwork = function StationAddedToInnetwork(evt) {
        console.log('Station added to in network');
        console.log(evt.item);
        $scope.refreshEventsiScroll();
    };

    $scope.sortableStationConfig = { group: 'workpageStation', animation: 150, filter: '.frame__gray' };

    $scope.addSearchStationToDiv = function ($item, $model, $label) {
        $http({
            url: crankServiceApi + '/stations/getById/' + $model.id,
            method: "GET"
        })
           .then(function (searchedUserData) {
               setTimeout(function () {
                   $scope.$apply(function () {
                       $scope.OutOfNetworkStations.push({
                           "id": searchedUserData.data[0].id,
                           "name": searchedUserData.data[0].name,
                           "owner": searchedUserData.data[0].owner,
                           "isActive": true,
                           "sortOrder": 0
                          
                       });
                       $scope.OutOfNetworkStationsId.push(
                            searchedUserData.data[0].id
                       );
                   });
               }, 2000);


           },
           function (data) {
               //log the error
           });
        $scope.searchedOutOfNetworkStation = null;
    };

    $scope.getSearchedStation = function (val) {
        if ((typeof (val) !== 'undefined') && (val !== null))
       {
        
            var searchStation = { Name: val };
            return $http({
                method: 'POST',
                url: crankServiceApi + '/stations/search',
                data: JSON.stringify(searchStation)
            }).then(function successCallback(response) {
               // $scope.showAlert('station searched..');
                var searchedList = [];

                for (var i = 0; i < response.data.length; i++) {
                    
                        if ($scope.InNetworkStationsId.indexOf(response.data[i].id) < 0
                            && $scope.OutOfNetworkStationsId.indexOf(response.data[i].id) < 0) {
                            searchedList.push(response.data[i]);
                        }
                    
                }
                return searchedList;

            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }
       


       
    };

    //Module
    $scope.saveInNetworkModule = function () {
        $rootScope.current_login_user.modules = [];
        for (var i = $scope.InNetworkModules.length - 1; i >= 0; i--) {
            $rootScope.current_login_user.modules.push($scope.InNetworkModules[i].id);
        }

        $http({
            method: 'PUT',
            url: crankServiceApi + '/users',
            data: angular.toJson($rootScope.current_login_user)
        }).then(function successCallback(response) {
            $scope.showAlert('Successfully saved in module changes');

            $http({
                url: crankServiceApi + '/users/getById',
                method: "GET",
                data: { 'id': '57b0afa9c2cb68191e936c81' }
            })
            .then(function (loginuserdata) {
                $cookieStore.put('current_login_user', loginuserdata.data[0]);
                $rootScope.current_login_user = loginuserdata.data[0];
            },
            function (loginuserdata) {
                //log error
            });

            //console.log($rootScope.current_login_user);

            $scope.InNetworkModules = [];
            $scope.OutOfNetworkModules = [];
            $scope.InNetworkModulesId = []
            $scope.OutOfNetworkModulesId = [];

            $scope.FetchInNetworkModules();
            $scope.FetchOutOfNetworkModules();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    };

    $scope.moveUserOutOfModule = function (id) {
        for (var i = $scope.InNetworkModules.length - 1; i >= 0; i--) {
            if ($scope.InNetworkModules[i].id == id) {
                $scope.OutOfNetworkModules.push($scope.InNetworkModules[i]);
                $scope.InNetworkModules.splice(i, 1);
            }
        }
    }

    $scope.InNetworkModules = [];
    $scope.OutOfNetworkModules = [];
    $scope.InNetworkModulesId = []
    $scope.OutOfNetworkModulesId = [];

    $scope.inNetworkModules = { group: 'workpageModule', animation: 150 };
    $scope.inNetworkModules['onAdd'] = $scope.ModuleAddedToInnetwork;

    $scope.FetchInNetworkModules = function () {
        //Loop through and get all the team user details
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.modules.length; iMemberCount++) {
            //console.log(response.data[0].team[i]);
            $http({
                url: crankServiceApi + '/modules/getById/' + $rootScope.current_login_user.modules[iMemberCount],
                method: "GET"
            })
                .then(function (teamData) {
                    $scope.InNetworkModules.push({
                        "id": teamData.data[0].id,
                        "name": teamData.data[0].name,
                        "description": teamData.data[0].description,
                        "isActive": teamData.data[0].isActive
                    });
                    $scope.InNetworkModulesId.push(
                         teamData.data[0].id
                    );
                    console.log("In network Module - " + teamData.data[0].name);

                },
                function (data) {
                    //log the error
                });
        }
    };

    $scope.FetchOutOfNetworkModules = function () {

        //Now get all the other users
        $http({
            url: crankServiceApi + '/modules',
            method: "GET"
        })
              .then(function (allusers) {
                  //console.log(outofnetworkusers);
                  //console.log('found some users with company of crank');
                  for (var i = 0; i < allusers.data.length; i++) {
                      if ($scope.OutOfNetworkModulesId.indexOf(allusers.data[i].id) < 0
                          && $scope.InNetworkModulesId.indexOf(allusers.data[i].id) < 0) {
                          $scope.OutOfNetworkModules.push({
                              "id": allusers.data[i].id,
                              "name": allusers.data[i].name,
                              "description": allusers.data[i].description,
                              "isActive": allusers.data[i].isActive
                          });

                          $scope.OutOfNetworkModulesId.push(
                            allusers.data[i].id
                            );
                      }
                  }

                  // console.log($scope.OutOfNetworkTeamUsers);
              },
              function (data) {
                  //log the error
              });
    };


    $scope.ModuleAddedToInnetwork = function ModuleAddedToInnetwork(evt) {
        console.log('Module added to in network');
        console.log(evt.item);
        $scope.refreshEventsiScroll();
    };

    $scope.sortableModuleConfig = { group: 'workpageModule', animation: 150, filter: '.frame__gray' };

   
   
});

var workpageCtrl = function ($scope, $http, $modalInstance, $animate) {
    $scope.is_loading = false;
   

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

};

