/**
* Crank Artist app
* */

// TODO implement this to exchange data beetween states ??
app.factory('$artistScope', function ($rootScope)
{

    // This should alias artist scope on init
    // This gets init each time the artistCtrl gets loaded
    var state = {};

    // Map

    // Analytics
    state.selected_action;
    state.selected_station;
    state.shown_station_info_panel;
    state.selected_format_node;
    state.stations;

    // Artist
    return state;
});

app.controller('artistCtrl', function ($rootScope, $scope, $http, $uibModal,$timeout)
{
    //$scope.current_view = 'artist'; // artist or analytics
    $scope.current_view = 'artist'; // artist or analytics
    $scope.dates_scroller_opt = {
        scrollX: true,
        scrollY: false,
        //mouseWheel: true, 
        click: true,
        disableMouse: false,
        disablePointer: true,
        disableTouch: true,
        eventPassthrough: false
    };

    $rootScope.checkUser();

    //TODO: Verify wheteher this is required

    // #region Dates

    $scope.dates = [];
    $scope.n = 720;

    $scope.getDays = function (days)
    {

        var today = new Date(),
            dates = [],
            day_length = 1000 * 60 * 60 * 24; // day in milliseconds

        for (var i = 0; i < days; i++)
        {
            dates.push(new Date(today.getTime() + day_length * i));
        }
        //console.log(dates);
        return dates;
    };

    $scope.generateDates = function (n)
    {
        var days = $scope.getDays(720);
        for (var i = 0; i < 720; i++)
        {
            var date = {};
            date.day = days[i].toDateString().replace(" " + days[i].getFullYear(), "").substring(4);
            date.index = i;
            $scope.dates.push(date);
        }
    };


    // #endregion
    // #region Source panel

    var mainContainer = $('.source-panel__content--main');

    mainContainer.find($('.source-panel__member-link')).click(function ()
    {
        if (!$(this).data().sourcePanel) return false;
        var container = $(document.getElementById($(this).data().sourcePanel));

        fadeOut(mainContainer, 300);
        fadeIn(mainContainer, container, 300, 350);
        return false;
    });

    $('.source-panel__label--main').click(function ()
    {
        if ($(this).closest('.source-panel__content').hasClass('source-panel__content--main')) return false;

        var container = getContainer(this);

        fadeOut(container, 300);
        fadeIn(container, mainContainer, 300, 350);
        return false;
    });

    mainContainer.find($('.source-panel__label--data')).click(function ()
    {
        var container = getContainer(this);

        fadeOut(container, 300);
        fadeIn(container, $('.source-panel__content--digital'), 300, 350);
        return false;
    });

    $('.source-panel__member-link').click(function ()
    {
        if ($(this).closest('.source-panel__content').hasClass('source-panel__content--main') ||
            !$(this).html()) return false;

        $(this).parent().toggleClass('source-panel__member-item--active');
        return false;
    });

    function fadeOut(container, duration)
    {
        container.animate({
            opacity: 0
        }, duration, 'jswing');
    }

    function fadeIn(containerToHide, containerToShow, duration, delay)
    {
        setTimeout(function ()
        {
            containerToHide.css({ 'display': 'none' });
            containerToShow.css({ 'display': 'flex', 'opacity': '0' });

            containerToShow.animate({
                opacity: 1
            }, duration, 'jswing');
        }, delay);
    }

    function getContainer(el)
    {
        var container = $(el).closest('.source-panel__content');
        return container;
    }

    // #endregion

    // Actually binding to $parent.map because ng-include creates new scope
    $scope.map;
    $scope.mediabase_layer;
    $scope.artists = [];
    $scope.markets = [];
    $scope.showsFilter = "";
    $scope.shows = [];
    $scope.artistEvents = [];
    $scope.selectedEvent = null;
    $scope.showTiles = true;
    $scope.showTourDateScroller = false;
    $scope.showSourcePanel = false;
    $scope.showModule = false;
    $scope.isPromotionModuleMaximized = false;
    $scope.isChartingModuleMaximized = false;
    $scope.isEventsPanelMaximized = true;
    $scope.isTreemapModuleMaximized = false;
    $scope.stationsSelected = [];
    
    //Source panel
    $scope.sourcePanelDigitals = [];

    $scope.tile_layer = new L.TileLayer(
        'http://a.tiles.mapbox.com/v3/bgriffi.map-64e87391/{z}/{x}/{y}.png', {
            attribution: "",
            maxZoom: 18,
            minZoom: 2
        }
    );

    $scope.markers_layer = new L.FeatureGroup();
    $scope.country_layer = new L.FeatureGroup();

    $scope.current_market = null;
    $scope.current_market_data;
    $scope.current_artist = null;
    $scope.artist_carousel;
    $scope.datapanel_open = false;

    //$http.get('data/radio_shows.json')
    // .then(function (res)
    // {
         
    //     $scope.shows = res.data;
    //     //Add date filed for sorting
    //     _.forEach($scope.shows, function (value)
    //     {
    //         value.eventDate = new Date(value.date);

    //     });
    //     $scope.selectedEvent = $scope.shows[0];

    //     var days = $scope.getDays($scope.n);
    //     for (var i = 0; i < $scope.n; i++)
    //     {
    //         var date = {};
    //         date.day = days[i].toDateString().replace(" " + days[i].getFullYear(), "").substring(4);
    //         date.index = i;
    //         $scope.dates.push(date);
    //    }
        
    // });

    //$scope.getArtistData = function (artistName)
    //{
    //    //dummy function to load the artist data until API is completed
    //    $http.get('data/artist_artists.json')
    //    .success(function (res)
    //    {
    //        var filtered_json = find_in_object(res, { artist_name: artistName });
    //       // $scope.current_artist = res[0];
    //    })
    //    .error(function (res)
    //    {
    //        console.log(res);
    //    });

    //};

   

    //Method to find an object from json data based on criteria
    function find_in_object(my_object, my_criteria)
    {

        return my_object.filter(function (obj)
        {
            return Object.keys(my_criteria).every(function (c)
            {
                return obj[c] == my_criteria[c];
            });
        });

    }

    $scope.artist_carousel_options = {
        items: 4,
        width: '100%',
        auto: false,
        scroll: {
            duration: 750
        },
        prev: {
            button: '#artist-carousel-prev',
            items: 1
        },
        next: {
            button: '#artist-carousel-next',
            items: 1
        }
    };

    $scope.artist_scroller_opt = {
        scrollX: true,
        scrollY: false,
        mouseWheel: true,
        click: true,
        disableMouse: false,
        disablePointer: true,
        disableTouch: true,
        eventPassthrough: false,
        probeType: 2
    };

    $scope.artist_tile_scroller_opt = {
        scrollX: true,
        scrollY: true,
        mouseWheel: true,
        click: true,
        disableMouse: false,
        disablePointer: true,
        disableTouch: true,
        eventPassthrough: true,
        probeType: 2,
        hScrollbar: false,
        vScrollbar: true,
        hideScrollbar: true

    };

    $scope.map_options = {
        center: new L.LatLng(30, -15),
        zoom: 2,
        base_layer: $scope.tile_layer
    };

    //For demo,
    //Create marker for four radio station
    $scope.coverageWDASMarker = L.marker([40.041, -75.24]);
    $scope.coverageWDAS = L.circle([40.041, -75.24], 20000, {
        color: '#F15A22',
        opacity: .9,
        fillColor: '#F15A22',
        fillOpacity: 0.3
    });
    $scope.stationsSelected["WDAS"] = false;

    $scope.coverageWIOQMarker = L.marker([40.0436, -75.242]);
    $scope.coverageWIOQ = L.circle([40.0436, -75.242], 26000, {
        color: '#AB4A9C',
        opacity: .9,
        fillColor: '#AB4A9C',
        fillOpacity: 0.3
    });
    $scope.stationsSelected["WIOQ"] = false;

    $scope.coverageWISXMarker = L.marker([40.0827, -75.1816]);
    $scope.coverageWISX = L.circle([40.0827, -75.1816], 18000, {
        color: '#FFC60B',
        opacity: .9,
        fillColor: '#FFC60B',
        fillOpacity: 0.3
    });
    $scope.stationsSelected["WISX"] = false;

    $scope.coverageWRFFMarker = L.marker([40.0416, -75.24]);
    $scope.coverageWRFF = L.circle([40.0416, -75.24], 22000, {
        color: '#00AAAD',
        opacity: .9,
        fillColor: '#00AAAD',
        fillOpacity: 0.3
    });
    $scope.stationsSelected["WRFF"] = false;

    $scope.showCoverageMap = function showCoverageMap(station)
    {
        //console.log("Mouse enter : " + station);
        if ($scope.stationsSelected[station] == true)
        {
            return;
        }

        switch (station)
        {
            //Add coverage layer to map display
            case "WDAS":
                $scope.map.addLayer($scope.coverageWDAS);
                $scope.map.addLayer($scope.coverageWDASMarker);
                break;
            case "WIOQ":
                $scope.map.addLayer($scope.coverageWIOQ);
                $scope.map.addLayer($scope.coverageWIOQMarker);
                break;
            case "WISX":
                $scope.map.addLayer($scope.coverageWISX);
                $scope.map.addLayer($scope.coverageWISXMarker);
                break;
            case "WRFF":
                $scope.map.addLayer($scope.coverageWRFF);
                $scope.map.addLayer($scope.coverageWRFFMarker);
                break;
        }
    };

    $scope.hideCoverageMap = function hideCoverageMap(station)
    {
        //console.log("Mouse leave : " + station);
        if ($scope.stationsSelected[station] == true)
        {
            return;
        }
        switch (station)
        {
            case "WDAS":
                $scope.map.removeLayer($scope.coverageWDAS);
                $scope.map.removeLayer($scope.coverageWDASMarker);
                break;
            case "WIOQ":
                $scope.map.removeLayer($scope.coverageWIOQ);
                $scope.map.removeLayer($scope.coverageWIOQMarker);

                break;
            case "WISX":
                $scope.map.removeLayer($scope.coverageWISX);
                $scope.map.removeLayer($scope.coverageWISXMarker);

                break;
            case "WRFF":
                $scope.map.removeLayer($scope.coverageWRFF);
                $scope.map.removeLayer($scope.coverageWRFFMarker);

                break;
        }
    };

    $scope.toggleCoverageMap = function toggleCoverageMap(station)
    {
        switch (station)
        {
            case "WDAS":
                if ($scope.stationsSelected["WDAS"])
                {
                    $scope.map.removeLayer($scope.coverageWDAS);
                    $scope.map.removeLayer($scope.coverageWDASMarker);
                    $scope.stationsSelected["WDAS"] = false;
                }
                else
                {
                    $scope.map.addLayer($scope.coverageWDAS);
                    $scope.map.addLayer($scope.coverageWDASMarker);
                    $scope.stationsSelected["WDAS"] = true;
                }

                break;

            case "WIOQ":
                if ($scope.stationsSelected["WIOQ"])
                {
                    $scope.map.removeLayer($scope.coverageWIOQ);
                    $scope.map.removeLayer($scope.coverageWIOQMarker);
                    $scope.stationsSelected["WIOQ"] = false;
                }
                else
                {
                    $scope.map.addLayer($scope.coverageWIOQ);
                    $scope.map.addLayer($scope.coverageWIOQMarker);
                    $scope.stationsSelected["WIOQ"] = true;
                }

                break;
            case "WISX":
                if ($scope.stationsSelected["WISX"])
                {
                    $scope.map.removeLayer($scope.coverageWISX);
                    $scope.map.removeLayer($scope.coverageWISXMarker);
                    $scope.stationsSelected["WISX"] = false;
                }
                else
                {
                    $scope.map.addLayer($scope.coverageWISX);
                    $scope.map.addLayer($scope.coverageWISXMarker);
                    $scope.stationsSelected["WISX"] = true;
                }

                break;
            case "WRFF":
                if ($scope.stationsSelected["WRFF"])
                {
                    $scope.map.removeLayer($scope.coverageWRFF);
                    $scope.map.removeLayer($scope.coverageWRFFMarker);
                    $scope.stationsSelected["WRFF"] = false;
                }
                else
                {
                    $scope.map.addLayer($scope.coverageWRFF);
                    $scope.map.addLayer($scope.coverageWRFFMarker);
                    $scope.stationsSelected["WRFF"] = true;
                }
                break;
        }
    };


    $scope.toggleView = function ()
    {
        switch ($scope.current_view)
        {
            case ('analytics'):
                $scope.current_view = 'artist';
                break;
            case ('artist'):
                $scope.current_view = 'analytics';
                break;
        }
    };


    /*
    * Watch for current view changes and init the view
    */
    $scope.$watch('current_view', function (val)
    {
        switch (val)
        {
            case ('artist'):
                $scope.current_view_template = 'partials/artist_map.html';
                
                $scope.init();
                $scope.initMap();
                break;
            case ('analytics'):
                $scope.current_view_template = 'partials/artist_analytics.html';
                break;
        }

    });

    $scope.selectArtist = function selectArtist(artist)
    {
      
        if (artist === $scope.current_artist)
        {
            $scope.showTourDateScroller = true;
            $scope.showSourcePanel = true;
            //Artists has been selected
            return;
        }

        //Reset previous artist if selected
        if ($scope.current_artist != null)
        {
            //Previously selected aritst exist
            $scope.current_artist.selected = false;
            $scope.resetEventDates();
        }

        $scope.current_artist = artist;
        $scope.current_artist.selected = true;

       // console.log(artist);
        //$scope.showTourDateScroller = true;
        //$scope.showSourcePanel = true;
        // Load heatmap data
        if ($scope.map)
        {
            //uncomment this later..09/24/2016
          //  $scope.updateHeatmap(artist);
        }
        
        //Filter the events to the selected artists
        var filteredEvents = _.filter($scope.artistEvents, function (o) {
            return o.artist_name == $scope.current_artist.artistName;
        });
            
       
        //Set filter
        $scope.showsFilter = $scope.current_artist.artistName;
       
        $scope.addEventDates(filteredEvents);

        //Adjust events size if the displayed
        
       
        //Call event extras for selected event

        //Make call to events scroller notify the wrapper size change
        $scope.refreshEventsiScroll();
        
    };

    $scope.initializeSourcePanelItems = function()
    {
        $scope.showSourcePanelDigitals = false;
    }

    $scope.saveEventExtras = function saveEventExtras() {
        console.log('user clicked save event extras');
        var createMode = false;
        $http({
            url: crankServiceApi + '/events/' + $scope.selectedEvent.id + '/extras/1',
            method: "GET"
        })
                   .then(function (eventExtrasData) {

                       if (eventExtrasData.data.length < 1) {
                           //create new event extras
                           createMode = true;

                           if ($scope.showSourcePanelDigitals) {
                               console.log(createMode);
                               //save the event extras for this event artist
                               var associationList = [];

                               for (var iCount = 0; iCount < $scope.sourcePanelDigitals.length; iCount++) {
                                   if ($scope.sourcePanelDigitals[iCount].isActive) {
                                       var association = {

                                           "assignedBy": $rootScope.current_login_user.id,
                                           "assignedTo": $scope.sourcePanelDigitals[iCount].id,
                                           "assignedAs": 'digital'
                                       };
                                       associationList.push(association);
                                   }
                               }
                               if (createMode) {

                                 

                                   var postData = {
                                       "eventId": $scope.selectedEvent.id,
                                       "promotions": [],
                                       "associations": associationList
                                   };
                                   $http({
                                       method: 'POST',
                                       url: crankServiceApi + '/events/extras',
                                       data: JSON.stringify(postData),
                                       dataType: 'json',
                                   }).then(function successCallback(response) {
                                       $scope.ShowAlert('event association saved successfully');
                                   }, function errorCallback(response) {
                                       $scope.login_error = "There was an error, please contact the administrators";
                                   });
                               }
                           }
                           $scope.initializeSourcePanelItems();
                       }
                       else {
                           //update mode
                           console.log('save event extras - update mode');
                           if ($scope.showSourcePanelDigitals) {

                               var associationList = [];

                               for (var iCount = 0; iCount < $scope.sourcePanelDigitals.length; iCount++) {
                                   if ($scope.sourcePanelDigitals[iCount].isActive) {
                                       var association = {

                                           "assignedBy": $rootScope.current_login_user.id,
                                           "assignedTo": $scope.sourcePanelDigitals[iCount].id,
                                           "assignedAs": 'digital'
                                       };
                                       associationList.push(association);
                                   }
                               }
                               var existingAssociations = eventExtrasData.data[0].associations;

                             for (var iCount1 = 0; iCount1 < $scope.sourcePanelDigitals.length; iCount1++) {
                                   if ($scope.sourcePanelDigitals[iCount1].isActive == false) {
                                       //var association = {

                                       //    "assignedBy": $rootScope.current_login_user.id,
                                       //    "assignedTo": $scope.sourcePanelDigitals[iCount].id,
                                       //    "assignedAs": 'digital'
                                       //};
                                       //associationList.push(association);
                                      // for (var i = existingAssociations - 1; i >= 0; i--) {

                                       var found = $filter('filter')(existingAssociations, {
                                               assignedAs: 'digital',
                                               assignedBy: $rootScope.current_login_user.id,
                                               assignedTo: $scope.sourcePanelDigitals[iCount1].id,

                                           }, true);

                                           if (found.length) {
                                               for (var i = existingAssociations - 1; i >= 0; i--) {

                                                   if (existingAssociations[i].assignedAs == found[0].assignedAs && 
                                                       existingAssociations[i].assignedBy == found[0].assignedBy &&
                                                       existingAssociations[i].assignedTo == found[0].assignedTo)
                                                   {
                                                        existingAssociations.splice(i, 1);
                                                   }
                                               }
                                              
                                           } else {
                                             //
                                           }
                                      // }
                                   }
                               }

                               var newArray = associationList.concat(existingAssociations);

                               var postData = {
                                   "eventId": $scope.selectedEvent.id,
                                   "promotions": eventExtrasData.data[0].promotions,
                                   "associations": newArray
                               };
                               $http({
                                   method: 'POST',
                                   url: crankServiceApi + '/events/extras',
                                   data: JSON.stringify(postData),
                                   dataType: 'json',
                               }).then(function successCallback(response) {
                                   $scope.ShowAlert('event association saved successfully');
                               }, function errorCallback(response) {
                                   $scope.login_error = "There was an error, please contact the administrators";
                               });
                           }
                          
                       }

                   },
                   function (data) {
                       //log the error
                   });
    }

    $scope.selectEventArtist = function selectEventArtist(event)
    {
        var eventArtist = _.find($scope.artists, function (a) { return a.artist_name == event.artist_name; });
      //  $scope.fetchSourcePanelDigitals();
        if(eventArtist != null)
        {
            $scope.selectedEvent = event;


            $scope.showSourcePanel = true;
            //fill the sourcepanel stattions for the selected event
           
                $http({
                    url: crankServiceApi + '/events/' + event.id + '/extras/1',
                    method: "GET"
                })
                    .then(function (eventExtrasData) {
                        if (eventExtrasData != null && eventExtrasData.data.length > 0 && $scope.sourcePanelDigitals.length > 0)
                        {
                            for (var iCount = 0; iCount < $scope.sourcePanelDigitals.length; iCount++) {
                                console.log('current soure panel digital count is-');
                                console.log(eventExtrasData);
                                $scope.sourcePanelDigitals[iCount].isActive = $scope.checkEventAssociation(eventExtrasData.data[0].associations, $scope.sourcePanelDigitals[iCount].id, 'digital');
                            }
                        }
                       
                    },
                    function (data) {
                        //log the error
                    });
            $scope.selectArtist(eventArtist);
        }
    };

    $scope.checkEventAssociation = function checkEventAssociation(associationList, assignedTo, assignedAs)
    {
        for (var iCount = 0; iCount < associationList.length; iCount++) {
          
            if (associationList[iCount].assignedTo == assignedTo && associationList[iCount].assignedAs == assignedAs)
            {
                return true;
            }
           
            return false;
        }
    }
    
    $scope.resetSelection = function resetSelection()
    {
        if ($scope.current_artist != null)
        {
            $scope.current_artist.selected = false;
        }
        $scope.current_artist = null;

        $scope.showTourDateScroller = false;
        $scope.showSourcePanel = false;
        $scope.showsFilter = "";
        $scope.refreshEventsiScroll();
    };
    
    $scope.resetEventDates = function resetEventDates()
    {
        for (i = 0; i < $scope.n; i++)
        {
            var eventDate = $scope.dates[i];
            eventDate.booked = false;
            eventDate.venue = '';
            eventDate.market = '';
        }
    };
    //Add tour dates
    $scope.addEventDates = function addEventDates(artistEvents)
    {
        //Reset dates
        var days = $scope.getDays($scope.n);
       
        _.forEach(artistEvents, function (artistEvent)
        { 
            var show_date = new Date(artistEvent.eventDate);
            for (var i = 0; i < $scope.n; i++)
            {
                if ((show_date.getMonth() == days[i].getMonth()) &&
                            (show_date.getDate() == days[i].getDate()) &&
                            (show_date.getYear() == days[i].getYear()))
                {
                    //console.log(days[i]);
                    //console.log(show_date);
                    $scope.dates[i].booked = true;
                    $scope.dates[i].city = artistEvent.city;
                    $scope.dates[i].venue = artistEvent.venue;
                }
            }
        });
    };

    //Maximize promotion panel
    $scope.maximizePromotion = function ()
    {
        $scope.isPromotionModuleMaximized = true;

        //Minimize events
        $scope.isEventsPanelMaximized = false;
    };

    //Minimize promotion panel
    $scope.minimizePromotion = function ($event)
    {
        $scope.isPromotionModuleMaximized = false;
        //Prevent event propagation -- Required to prevent click event again
        $event.stopPropagation();
    };


    //Maximize charting panel
    $scope.maximizeCharting = function ()
    {
        $scope.isChartingModuleMaximized = true;
        //Minimize events
        $scope.isEventsPanelMaximized = false;
    };

    //Minimize charting panel
    $scope.minimizeCharting = function ($event)
    {
        $scope.isChartingModuleMaximized = false;
        //Prevent event propagation -- Required to prevent click event again
        $event.stopPropagation();
    };


    //Maximize events panel
    $scope.maximizeEvents = function ()
    {
        if($scope.isEventsPanelMaximized == false)
        {
            $scope.isEventsPanelMaximized = true;
        }
    };

    //Minimize events panel
    $scope.minimizeEvents = function ()
    {
        $scope.isChartingModuleMaximized = false;
            //Prevent event propagation -- Required to prevent click event again
      //  $event.stopPropagation();
    };

    //Maximize Treemap panel
    $scope.maximizeTreemap = function ()
    {
        $scope.isTreemapModuleMaximized = true;

        //Minimize events
        $scope.isEventsPanelMaximized = false;
    };

    //Minimize Treemap panel
    $scope.minimizeTreemap = function ($event)
    {
        $scope.isTreemapModuleMaximized = false;
        //Prevent event propagation -- Required to prevent click event again
        $event.stopPropagation();
    };


    $scope.updateHeatmap = function (artist)
    {
        var name = artist.artistName.toLowerCase();
        uri_name = name.replace(/ /g, '_');
        $http.get('data/airplay/' + uri_name + '_global.json')
        .success(function (res)
        {
            //console.log(res);
            $scope.mediabase_layer.fadeOutData();
            $scope.mediabase_layer.fadeInData(res.data);
        })
        .error(function (res)
        {
            console.log(res);
        });
    };

    //$scope.preferencesModalOpen = function ()
    //{
    //    var modalInstance = $uibModal.open({
    //        templateUrl: 'preferencesModal.html',
    //        controller: 'preferencesModalArtistCtrl',
    //        windowClass: 'preferences-modal',
    //        scope: $scope,
    //    });
    //};

    $scope.workpageModalOpen = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'partials/workerpage_home.html',
            controller: 'workpageCtrl',
            windowClass: 'preferences-modal',
            scope: $scope,
        });

        modalInstance.result.then(function (data) {
          
        }, function () {
            // console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openDataPanel = function ()
    {
        $scope.datapanel_open = true;
    };

    $scope.closeDataPanel = function ()
    {
        $scope.datapanel_open = false;
    };

    $scope.companies_carousel;
    $scope.companies_carousel_opt = {
        items: 1,
        width: '100%',
        auto: false,
        scroll: {
            duration: 750
        }
    };

    $scope.openTeamCarousel = function (team)
    {
        if (team.is_record_company)
        {
            $scope.companies_carousel.trigger('slideTo', 1);
            return;
        }
        //Otherwise
        if (!team.hovered)
            return $scope.hoverEffect(team, true);
        if (team.hovered)
            return $scope.hoverEffect(team, false);
    };

    $scope.openCompanyCarousel = function ()
    {
        $scope.companies_carousel.trigger('slideTo', 0);
    };

    $scope.hoverEffect = function (team, state)
    {
        if (state)
        {
            if (!team.hovered)
            {
                team.logo = team.logo.replace(".png", "c.png");
                team.hovered = true;
            }
        } else
        {
            team.logo = team.logo.replace("c.png", ".png");
            team.hovered = false;
        }
    };

    /**
    * Watch for changes in current_market (markets json)
    * */

    $scope.$watch('current_market', function ()
    {
        if (IS_LIVE)
        {
            if ($scope.current_market)
            {
                //console.log($scope.current_market);
                // Load market id
                $http.get(api + '/market/search?query=' + $scope.current_market.city)
                .success(function (res)
                {
                    //console.log(res);
                    var market_id = res.results[0].id;
                    // Load market data
                    $http.get(api + '/market/' + market_id)
                    .success(function (res)
                    {
                        // add spotify
                        var spotify = {
                            call_code: "SPOTIFY",
                            id: 123456789,
                            logo: "images/mock/spotify.png",
                            market: "Spotify"
                        };

                        res.stations.unshift(spotify);

                        $scope.current_market_data = res;
                        $scope.$broadcast('ajaxStationsLoaded', {});
                        console.log(res);
                    })
                    .error(function (res)
                    {
                        console.log(res);
                    });
                })
                .error(function (res)
                {
                    console.log(res);
                });
            }
        }
    });


    $scope.$on('crankRefresh', function ()
    {
        console.log('TODO crank refresh ui');

        $scope.current_market = null;
        $scope.current_market_data = null;
        $scope.current_artist = null;
        $scope.artist_carousel = null;
        $scope.datapanel_open = false;

        // clean markers
        $scope.markers_layer.clearLayers();

        // put countries on
        $scope.map.addLayer($scope.country_layer);

        // zoom out
        $scope.map.setView($scope.map_options.center, $scope.map_options.zoom);

    });

    // Refresh events scroller
    $scope.refreshEventsiScroll = function refreshEventsiScroll()
    {
        $timeout(function ()
        {
            var events = angular.element("#events");
            if ($scope.showTourDateScroller == true)
            {
                events.addClass("events-tours-visible");
            }
            else
            {
                events.removeClass("events-tours-visible");
            }
            $scope.myScroll['events_wrapper'].refresh();
        }, 400);
    };

    //Hide all panels
    $scope.hideAllPanels = function ()
    {
       // $scope.showTourDateScroller = false;
        $scope.isEventsPanelMaximized = false;
    };
    /**
    * Init
    * */

    //$http.get('data/artist_artists.json')
    //.success(function (res)
    //{
    //    $scope.artists = res;
    //    //$scope.selectArtist($scope.artists[0]);
    //    //$scope.artist_carousel.update();
    //    //Add dateField to each event
    //})
    //.error(function (res)
    //{
    //    console.log(res);
    //});



    /**
    * Init Map // TODO detach it from the scope
    * */

    $scope.initMap = function ()
    {
        //console.log($artistScope.map);
        $scope.tile_layer = new L.TileLayer(
            'http://a.tiles.mapbox.com/v3/bgriffi.map-64e87391/{z}/{x}/{y}.png', {
                attribution: "",
                maxZoom: 18,
                minZoom: 2,
            }
        );

        $scope.markers_layer = new L.FeatureGroup();
        $scope.country_layer = new L.FeatureGroup();
        $scope.mediabase_layer = new L.DivHeatmapLayer({
            color: '#C15A26'
        });

        if ($scope.map && !$scope.map.hasLayer($scope.tile_layer))
            $scope.map.addLayer($scope.tile_layer);

        //display
        setTimeout(function ()
        {
            if ($scope.map && !$scope.map.hasLayer($scope.mediabase_layer))
                $scope.map.addLayer($scope.mediabase_layer);

            if ($scope.map && !$scope.map.hasLayer($scope.country_layer))
                $scope.map.addLayer($scope.country_layer);

            if ($scope.map && !$scope.map.hasLayer($scope.tile_layer))
                $scope.map.addLayer($scope.tile_layer);

            // If an artist is already selected, update the airplay
            if ($scope.current_artist)
            {
              //  $scope.updateHeatmap($scope.current_artist);
            }
        }, 1000);


        // Init the states layer
        $http.get('data/countries_fixed.geo.json')
        .success(function (res)
        {
            /*
            // Add the country_layer to the map
            setTimeout(function() {
            $scope.map.addLayer($scope.country_layer);
            },500);
            */

            var countryJSON = res;

            var countryStyle = function (feature)
            {
                return {
                    fillColor: '#FFF',
                    weight: 1,
                    opacity: 1,
                    color: '#000',
                    dashArray: '3',
                    fillOpacity: 0
                };
            };

            var highlightFeature = function (e)
            {
                var layer = e.target;

                layer.setStyle({
                    weight: 2,
                    color: '#666',
                    dashArray: '',
                    fillColor: '#FFF',
                    fillOpacity: 0.3
                });

                layer.bringToBack();

                if (!L.Browser.ie && !L.Browser.opera)
                {
                    //layer.bringToFront();
                }
            };

            var resetHighlight = function (e)
            {
                geojson.resetStyle(e.target);
                e.target.bringToBack();
            };

            var clickToFeature = function (e)
            {
                geojson.resetStyle(e.target);

                if (e.target.country_id != 'USA')
                {
                    // if target is not USA
                    $scope.map.fitBounds(e.target.getBounds());
                } else
                {
                    // If target is USA
                    $scope.map.setView(new L.LatLng(40.7, -86.3), 5);
                }

                $scope.loadMarkers(e.target.country_id);
                $scope.map.on('zoomend', function setupMarkersOnZoomEnd()
                {
                    $scope.map.addLayer($scope.markers_layer);
                });

                // Turn off countries
                $scope.map.removeLayer($scope.country_layer);
            };

            var onEachFeature = function (feature, layer)
            {
                // Assign each layer the id of the GEOJSON 3 digit ISO
                layer.country_id = feature.id;

                // Event handlers for country layers
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: clickToFeature
                });

            };

            var geojson = L.geoJson(countryJSON, {
                style: countryStyle,
                onEachFeature: onEachFeature
            });

            $scope.country_layer.addLayer(geojson);

        })
        .error(function (res)
        {
            console.log(res);
        });

        /*
        * Load markers
        */
        $scope.loadMarkers = function (country_id)
        {

            /**
            * Build markers from XML
            * */
            var loadMarketsUSA = function (xml_string)
            {
                var oParser = new DOMParser();
                var xmlDoc = oParser.parseFromString(xml_string, "text/xml");

                var markets_json = [];
                var marketsNodes = xmlDoc.querySelectorAll('entry');

                for (var i = 0; i < marketsNodes.length; i++)
                {
                    var marketNode = marketsNodes[i];
                    var city = marketNode.getElementsByTagName('city')[0].textContent;
                    var country = marketNode.getElementsByTagName('country')[0].textContent;
                    var state = marketNode.getElementsByTagName('state')[0].textContent;
                    var point = marketNode.getElementsByTagName('point')[0].textContent;
                    var lat = point.split(" ")[0];
                    var lng = point.split(" ")[1];

                    var stationNodes = marketNode.getElementsByTagName("stations")[0];
                    var stations = [];
                    for (var j = 0; j < stationNodes.children.length; j++)
                    {
                        var stationNode = stationNodes.children[j];
                        var station = stationNode.textContent;
                        stations.push(station);
                    }

                    var market = {
                        "country": country,
                        "state": state,
                        "city": city,
                        "point": {
                            "lat": lat,
                            "lng": lng
                        },
                        "stations": stations
                    };
                    $scope.markets.push(market);
                }
                return $scope.markets;
            };

            /**
            * Build map markers
            * */
            var buildMarkers = function (markets)
            {
                var markets_marker = [];
                for (var i = 0; i < markets.length; i++)
                {

                    // Return the appropriate class for the size
                    var size = function (market)
                    {
                        var token = '';
                        if (market.stations)
                        {
                            if (market.stations.length > 4) token = 'big';
                            if (market.stations.length > 8) token = 'bigger';
                            if (market.stations.length > 10) token = 'biggest';
                            return token;
                        } else
                        {
                            return token;
                        }
                    };

                    // Create marker 
                    markets_marker[i] = new L.Marker(markets[i].point, {
                        icon: L.divIcon({
                            className: 'market-marker',
                            html: '<span class="dot ' + size(markets[i]) + '"></span>'
                        }),
                        iconSize: [15, 15]
                    });

                    // Extend the object with markets data to make it persistent
                    markets_marker[i].market = markets[i];
                    markets_marker[i].market.actions = {
                        'tickets': Math.floor(99 * Math.random()),
                        'meetngreet': Math.floor(99 * Math.random()),
                        'interview': Math.floor(99 * Math.random()),
                        'appearance': Math.floor(99 * Math.random())
                    };

                    // Bind click action on market marker
                    markets_marker[i].on('click', function (e)
                    {
                        if (!!document.querySelector('.market-marker-selected'))
                        {
                            document.querySelector('.market-marker-selected').className = document.querySelector('.market-marker-selected').className.replace(' market-marker-selected', '');
                        };
                        this._icon.className += ' market-marker-selected'
                        $scope.map.setView(this.getLatLng(), 8);
                        $scope.current_market = this.market;
                        $scope.openDataPanel();
                        $scope.$digest();
                        //console.log($scope);
                    });

                    // Attach to the markers layer
                    $scope.markers_layer.addLayer(markets_marker[i]);
                }
            };

            var buildGeoPointMarker = function (province)
            {
                var marker = new L.Marker([province.lat, province.lng], {
                    icon: L.divIcon({
                        className: 'market-marker',
                        html: '<span class="dot"></span>'
                    }),
                    iconSize: [15, 15]
                });

                marker.market_name = province.name;

                if (province.name == "Barcelona")
                {
                    //console.log('Adding barcelona markets');
                }

                marker.on('click', function (e)
                {
                    if (!!document.querySelector('.market-marker-selected'))
                    {
                        document.querySelector('.market-marker-selected').className = document.querySelector('.market-marker-selected').className.replace(' market-marker-selected', '');
                    };

                    this._icon.className += ' market-marker-selected';
                    $scope.map.setView(this.getLatLng(), 8);
                    $scope.current_market = {
                        "city": this.market_name,
                        "id": this.market_name
                    }
                    $scope.openDataPanel();
                    $scope.$digest();
                });
                return marker;
            };


            var xhr = new XMLHttpRequest();
            var loaded_markets;

            // if USA
            if (country_id == 'USA')
            {
                xhr.open("GET", "data/markets_data.xml", false);
                xhr.setRequestHeader('Content-Type', 'text/xml');
                xhr.onload = function ()
                {
                    loaded_markets = loadMarketsUSA(this.responseText);
                    buildMarkers(loaded_markets);
                };
                xhr.send();
            } else
            {
                // Load country geonames
                var countryInfo = JSON.parse($.ajax({
                    dataType: "json",
                    url: 'data/geonames_countries.json',
                    async: false
                }).responseText);

                //console.log(countryInfo);
                var geo_markers;
                countryInfo.geonames.forEach(function (country)
                {
                    if (country.isoAlpha3 == country_id)
                    {
                        $.ajax({
                            url: 'http://api.geonames.org/childrenJSON?geonameId=' + country.geonameId + '&username=mildtaste',
                        }).success(function (data)
                        {
                            var regions = data.geonames;
                            regions.forEach(function (region)
                            {
                                //console.log(region);
                                $.ajax({
                                    url: 'http://api.geonames.org/childrenJSON?geonameId=' + region.geonameId + '&username=mildtaste',
                                }).success(function (data)
                                {
                                    var province = data.geonames;
                                    province.forEach(function (province)
                                    {
                                        if (province.population > 250000)
                                        {
                                            //console.log(province);
                                            $scope.markers_layer.addLayer(buildGeoPointMarker(province));
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
                //loaded_markets = loadMarkets(this.responseText);
            }
        };
    }

    $("#platforms").click(function ()
    {
        $(".labels_group").fadeOut(200, function () { });
        $("#platforms_group").css("display", "block");
        $(".platforms_group").fadeIn(300, function () { });
    });

    $("#backToAgentAndLabelsArrow").click(function ()
    {
        $(".platforms_group").fadeOut(200, function () { });
        $(".labels_group").fadeIn(300, function () { });
    });

     //Roster - 9/17/2016
    $scope.init = function () {
        //$scope.fetchArtishShows();
        $scope.fetchRosterArtists();
        $scope.fetchSourcePanelDigitals();
        $scope.initializeSourcePanelItems();
    }

    $scope.fetchArtistEvents = function (artistId, artistName) {
        console.log('inside artist event fetching' + artistId);
        setTimeout(function () {
        $http({
            url: crankServiceApi + '/artists/' + artistId + "/events/Ascending",
            method: "GET"
        })
                .then(function (artistEventData) {
                    for (var i = 0; i < artistEventData.data.length; i++) {
                          $scope.artistEvents.push({
                        "id": artistEventData.data[i].id,
                        "artistName": artistName,
                        "artistImage": crankServiceApi + '/artists/' + artistId + '/images/normal',
                        "artistId": artistId,
                        "eventDate": artistEventData.data[i].startDate,
                        "venue": artistEventData.data[i].eventVenue.name,
                        "city": artistEventData.data[i].city
                      
                        });
                    }
                },
                function (data) {
                    //log the error
                });
        }, 2000);
      

        $scope.refreshEventsiScroll();
    }

    $scope.fetchRosterArtists = function()
    {
        if ($rootScope.current_login_user.artists.length > 0)
        {
            $scope.current_artist = $rootScope.current_login_user.artists[0];
        }
        
        //Loop through and get all the roster details for user
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.artists.length; iMemberCount++) {

            $http({
                url: crankServiceApi + '/artists/getById/' + $rootScope.current_login_user.artists[iMemberCount],
                method: "GET"
            })
                .then(function (teamData) {
                    var url = crankServiceApi + '/artists/' + teamData.data[0].id + '/images/large';
                    setTimeout(function () {
                        $http.get(url, { responseType: "blob" }).
                            success(function (data, status, headers, config) {
                                // encode data to base 64 url
                                fr = new FileReader();
                                fr.onload = function () {
                                    $scope.artists.push({
                                        "id": teamData.data[0].id,
                                        "title": teamData.data[0].title,
                                        "imgResult": fr.result
                                    });

                                    $scope.$apply();
                                };
                                fr.readAsDataURL(data);
                            }).
                            error(function (data, status, headers, config) {
                                // error message
                            });

                    }, 4000);

                    //fetch the events data
                    $scope.fetchArtistEvents(teamData.data[0].id, teamData.data[0].title);

                    _.forEach($scope.artistEvents, function (value)
                    {
                        console.log('event date is here-');
                                 value.eventDate = new Date(value.date);

                             });
                    $scope.selectedEvent = $scope.artistEvents[0];

                             var days = $scope.getDays($scope.n);
                             for (var i = 0; i < $scope.n; i++)
                             {
                                 var date = {};
                                 date.day = days[i].toDateString().replace(" " + days[i].getFullYear(), "").substring(4);
                                 date.index = i;
                                 $scope.dates.push(date);
                            }
                  
                },
                function (data) {
                    //log the error
                });
        }
            

        //$http.get('data/artist_artists.json')
        //.success(function (res)
        //{
        //    $scope.artists = res;
        //    //$scope.selectArtist($scope.artists[0]);
        //    //$scope.artist_carousel.update();
        //    //Add dateField to each event
        //})
        //.error(function (res)
        //{
        //    console.log(res);
        //});
    }

    $scope.fetchSourcePanelDigitals = function()
    {
        //fetch all the source panel digitals for the user
        for (var iMemberCount = 0; iMemberCount < $rootScope.current_login_user.digitals.length; iMemberCount++) {
            $http({
                url: crankServiceApi + '/stations/getById/' + $rootScope.current_login_user.digitals[iMemberCount],
                method: "GET"
            })
                .then(function (teamData) {
                    console.log('digitials for the logged in team user');
                    console.log(teamData);
                    $scope.sourcePanelDigitals.push({
                        "id": teamData.data[0].id,
                        "name": teamData.data[0].name,
                        "owner": teamData.data[0].owner,
                        "isActive": false
                    });
                },
                function (data) {
                    //log the error
                });
        }

        //loop through each of them and find if it has been saved in event extras and mark it green (if found) 

    }

    $scope.toggleSourcePanelDigitals = function (digital) {

        //find out the selected digital
        digital.isActive = !digital.isActive;
    }
});



/**
* Data Panel Controller
* Extends artistCtrl
* */
app.controller('dataPanelCtrl', function ($scope)
{
    $scope.station_carousel;

    $scope.station_carousel_options = {
        items: 4,
        width: '100%',
        height: 64,
        auto: false,
        scroll: {
            duration: 750
        },
        prev: {
            button: '#station-carousel-prev',
            items: 1,
        },
        next: {
            button: '#station-carousel-next',
            items: 1,
        }
    };

    $scope.$on('ajaxStationsLoaded', function ()
    {
        //console.log('loaded stations'); 
        //console.log($scope);
        $scope.station_carousel.update();
    });

});

/**
* This controller is controller of the modal set when calling it
* The modal controllers should have this ugly definition
* */
var preferencesModalArtistCtrl = function ($scope, $http, $modalInstance, $animate)
{
    $scope.is_loading = false;
    $scope.found_artist = [];

    $scope.ok = function ()
    {
        // TODO password change

        // check two fields if they are not empty

        // if the password is the same change it

        if (!$scope.selected_artist)
        {
            $modalInstance.close();
            return;
        }
        $modalInstance.close($scope.selected_artist);
    };

    $scope.cancel = function ()
    {
        $modalInstance.dismiss('cancel');
    };

    $scope.selectArtist = function (artist)
    {
        artist.artist_name = artist.title.charAt(0).toUpperCase() + artist.title.slice(1).toLowerCase();
        artist.imgResult = artist.imgResult;
        $scope.selected_artist = artist;
    };



    $scope.fetchArtist = function ()
    {
        $scope.is_loading = true;

        $scope.found_artists = [];
        $http.get(api + '/artist/search?query=' + $scope.artist_name)
        .success(function (data, status)
        {
            //console.log(data);
            $scope.found_artists = data.results;

            // Foreach artist
            // $scope.found_artists.forEach(function(artist) {
            //     var id = artist.id;
            //     $http.get(api +'/artist/'+id+'/extra').success(function(data) {
            //         console.log(data);
            //         artist.image = data.info.photo_thumbnails[0].url;
            //     });
            // })
        })
    }

};

app.controller('workpageCtrl', function ($scope, $http, $uibModalInstance, $animate)
{
    $scope.is_loading = false;


    $scope.cancel = function ()
    {
        $uibModalInstance.dismiss('cancel');
    };

});

