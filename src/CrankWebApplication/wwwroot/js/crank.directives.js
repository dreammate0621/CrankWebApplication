/*
* Angular directive for iScroll
*/

angular.module('ng-iscroll', []).directive('ngIscroll', function () {
    return {
        replace: false,
        restrict: 'A',
        link: function (scope, element, attr) {
            // default timeout
            var ngiScroll_timeout = 5;

            // default options
            var ngiScroll_opts = {
                snap: true,
                momentum: true,
                hScrollbar: false,
                mouseWheel: true,
                click: false,
                tap: true
            };

            // scroll key /id
            var scroll_key = attr.ngIscroll;

            if (scroll_key === '') {
                scroll_key = attr.id;
            }

            if (scope.$parent.myScrollOptions) {
                for (var i in scope.$parent.myScrollOptions) {
                    if (typeof (scope.$parent.myScrollOptions[i]) !== "object") {
                        ngiScroll_opts[i] = scope.$parent.myScrollOptions[i];
                    } else if (i === scroll_key) {
                        for (var k in scope.$parent.myScrollOptions[i]) {
                            ngiScroll_opts[k] = scope.$parent.myScrollOptions[i][k];
                        }
                    }
                }
            }

            // iScroll initialize function
            function setScroll() {
                if (scope.$parent.myScroll === undefined) {
                    scope.$parent.myScroll = [];
                }

                scope.$parent.myScroll[scroll_key] = new IScroll(element[0], ngiScroll_opts);
            }

            // new specific setting for setting timeout using: ng-iscroll-timeout='{val}'
            if (attr.ngIscrollDelay !== undefined) {
                ngiScroll_timeout = attr.ngIscrollDelay;
            }

            // watch for 'ng-iscroll' directive in html code
            scope.$watch(attr.ngIscroll, function () {
                setTimeout(setScroll, ngiScroll_timeout);
            });

            // add ng-iscroll-refresher for watching dynamic content inside iscroll
            if (attr.ngIscrollRefresher !== undefined) {
                scope.$watch(attr.ngIscrollRefresher, function () {
                    if (scope.$parent.myScroll[scroll_key] !== undefined) scope.$parent.myScroll[scroll_key].refresh();
                });
            }

            // destroy the iscroll instance if we are moving away from a state to another
            // the DOM has changed and he only instance is not necessary any more
            scope.$on('$destroy', function () {
                scope.$parent.myScroll[scroll_key].destroy();
            });
        }
    };
});


angular.module('ngIscroll',[])
.directive('iscroll', function($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            "iscroll": "=iscroll",
            "opt": "=iscrollOpt"
        },
        link: function (scope, element, attrs, controller) {
            
            var opt = scope.opt || {};
            scope.iscroll = new IScroll(element[0],opt);

            // Refresh automatically
            setInterval(function(){
                scope.iscroll.refresh();
            },500);

        }
    };

});

angular.module('ng-sortable', [''])
		.constant('ngSortableConfig', {
		    onEnd: function () {
		        console.log('default onEnd()');
		    }
		})


/*
* Angular directive for carouFredSel
*/

angular.module('ngCaroufredsel',[])
.directive('caroufredsel', function($parse) {
    var ddo = {
        restrict: 'E,A',
        scope: {
            "handler": "=caroufredsel",
            "opt": "=caroufredselOpt"
        },
        link: function (scope,element,attrs,controller) {
            var $el = $(element);
            scope.handler = $el.carouFredSel(scope.opt);

            /**
             * Update the carousel
             * */
            scope.handler.update = function() {
               setTimeout(function(){
                   $el.carouFredSel(scope.opt);
               },50);
            };
        }
    };
    return ddo;
});

/*
 * Angular directive for jQuery drag
 */
angular.module('ngDragndrop',[])
.directive('ngDrag', function() {
    var ddo = {
        restrict:'A',
        link: function(scope, element, attrs) {
            element.draggable({
                revert: 'invalid',
                helper: 'clone',
                cursor: 'move',
                //appendTo: 'body'
            });
        }
    };
    return ddo;
})
.directive('ngDrop', function() {
    var ddo = {
        restrict: 'A',
        scope: {
            "ondrop": "&onDrop"
        },
        link: function(scope,element,attrs){
            element.droppable({
                //hoverClass: "drop-hover",
                drop: function(event,ui) {
                    console.log('drop');
                    var dropCallback = scope.ondrop();
                    // Pass all the variables relative to the dragged element and the scope
                    dropCallback(event,ui,element,attrs,scope)
                }
            });
        }
    };
    return ddo;
});

/*
 * Directive wrapper for leaflet
 */

angular.module('ngLeaflet',[])
.directive('ngLeaflet', function() {
    var ddo = {
        restrict: 'AE',
        scope: {
            "ngLeaflet": "=",
            "mapOptions": "="
        },
        link: function(scope,element,attrs) {

            // Config 
            var map_defaults = scope.mapOptions;

            // Init
            scope.ngLeaflet = new L.Map(element.get(0).id, {
                center: map_defaults.center,
                zoom: map_defaults.zoom,
                layers: [map_defaults.base_layer],
                scrollWheelZoom: true,
                zoomControl: false,
            });

            if (L.Control.Zoomslider)
                scope.ngLeaflet.addControl( new L.Control.Zoomslider({
                    position: 'topright'
                }));
        }
    };
    return ddo;
});


/**
 * App specific
 * */
app.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});

app.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            if ('disabled' in attrs) {
                elem.on('click', function (e) {
                    e.preventDefault(); // prevent link click
                });
            }
        }
    };
});
app.directive('iscrollAnimated', function($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            "iscroll": "=iscrollAnimated",
            "opt": "=iscrollOpt"
        },
        link: function (scope, element, attrs, controller) {
            var opt = scope.opt || {};
            scope.iscroll = new IScroll(element[0],opt);
            
            var wrapper = element[0].children[0]

            // Refresh automatically
            setInterval(function(){
                
                // Count children
                var children_w = 140;
                var w = wrapper.children.length * children_w;

                // Resize wrapper
                wrapper.style.width = w + 'px';

                scope.iscroll.refresh();
            },500);

            scope.iscroll.on('scroll', function() {
                var pos = Math.abs(this.x) - 10;
                var tile = 110
                var cursor = Math.floor(pos/tile);
                cursor < 0 ? cursor = 0 : cursor; // add one
                //console.log(cursor);
                var n = 2;
                var l_el = wrapper.children[cursor];
                var r_el = wrapper.children[cursor+n];
            });


        }
    };

});

