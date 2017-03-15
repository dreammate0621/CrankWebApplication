/**
* Crank Visualization
*
* TODO:
*
* x add links when adding new nodes
* improve refresh function
* x on removing the nodes should reinit the graph
* test adding removing manually with more data
* 
* ref:
* https://groups.google.com/forum/#!topic/d3-js/nkIpeZ60Sas
* https://github.com/mbostock/d3/wiki/Transitions#wiki-each
*
* @param $dates_scope = the angular app scope
* */


window.deb = {};

// Where to inject the results
var scope_injector = '.analytics';


var initForceGraph = function() {
    var el = document.querySelector("svg");
    var width = el.clientWidth;
    var height = el.clientHeight;

    var clicked_once,click_timer;

    var color = d3.scale.category20();

    var force = d3.layout.force().size([width, height]);

     // DragnDrop bind this to an angular directive
    var dragAction = function(el){

        var drag_start = function (event) {
            console.log(event);
            event.preventDefault(); 
            var style = window.getComputedStyle(event.target, null);
            event.dataTransfer.setData("text/plain",(parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
        };

        var drag_over = function (event) { 
            event.preventDefault(); 
            return false; 
        };

        var drop = function(event) { 
            //event.preventDefault();
            //console.log(event);
            // Take the d3 data
            var el = d3.select(event.target)
            var data = el.data()[0];
            console.log(data);
            //alert("Choose " + data.name);
            /*
            var offset = event.dataTransfer.getData("text/plain").split(',');
            var dm = document.querySelector('.dragme');
            dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
            dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
            */
            //return false;
        }; 
        
        el.addEventListener('dragstart',drag_start,false); 
        document.querySelector("body").addEventListener('dragover',drag_over,false); 
        document.querySelector("body").addEventListener('drop',drop,false); 
    }


    d3.json("data/viz_markets.json", function(error, graph) {
        
        function OneNodeForceGraph(city_nodes) {
          
          var svg = d3.select("svg");

            // Keep track of the single branches
            // Each branch start with a queue_head
            // link_counter will increment forever as we add branches

            var link_counter = 1;
            var queue_head_position = 0;
            var queue_heads = [];
            var queue_lengths = [];
            
            deb.queue_lengths = queue_lengths;
            deb.queue_heads = queue_heads;

            // TODO Discard the group element in the data json
            
            // Define a singleton for branch management
            var GraphManager = {
                _buildLinks: function(city_node){
                    // Build links
                    // Each format has to be in its own group
                    queue_heads.push(queue_head_position);
                    var in_links = new Array();
                    city_node.formats.forEach(function(f) {
                        var link = new Object();
                        link.source = queue_head_position; // Link to the first element of the queue
                        link.target = link_counter++;
                        link.value = f.size;
                        in_links.push(link);
                    });
                    queue_lengths.push(city_node.formats.length);
                    queue_head_position = link_counter++;
                    return in_links;
                },
                _buildNodes: function(city_node){
                    // Build nodes
                    var in_nodes = new Array();
                    city_node.formats.forEach(function(f) {
                        var format = new Object();
                        format.name = f.name;
                        format.head_position = queue_head_position;
                        //format.group = f.group;
                        format.size = f.size;
                        in_nodes.push(format);
                    });
                    // prepend the city node so it's at the head of the queue
                    in_nodes.unshift(city_node);
                    return in_nodes;
                },
                addBranches: function(city_node) {
                    // Do not change the order because the functions leverage mutation, buildNodes need to know the queue_head_position first
                    in_nodes = Array().concat(in_nodes,this._buildNodes(city_nodes[i]));
                    in_links = Array().concat(in_links,this._buildLinks(city_nodes[i]));
                },
                addTopLevel: function(city_node) {
                    //console.log("Adding the head at position: ", in_nodes.length);
                    in_nodes.push(city_node);
                    queue_heads.push(in_nodes.length);
                },
                addSubLevel: function(node) {
                    //console.log("Adding the branch at position: ", in_nodes.length);
                    //queue_heads.push(in_nodes.length);
                    //in_nodes.push(city_node);
                    
                    // Find the index of the head
                    //var source = node.index;

                    // So it has formats
                    node.formats.forEach(function(format) {
                        // Push the nodes in, with the corresponding head
                        // While pushing set the correct attributes for the position
                        // so they don't fly in
                        //console.log(node);
                        format.head = node.index;
                        var q = 25 * node.size;
                        if (!format.x)
                            format.x =  !!(in_nodes.length % 2) ? node.x + Math.random() * q : node.x - Math.random() * q;
                        if (!format.y)
                            format.y =   !!(in_nodes.length % 2) ? node.y + Math.random() * q : node.y - Math.random() * q;
                        in_nodes.push(format);

                        // Make links
                        var link = {
                            "source": node.index,
                            "target": (in_nodes.length - 1),
                            "value": 1
                        };
                        //console.log(link);
                        in_links.push(link);

                    });
                    
                    // Reinit graph
                    initForceGraph(in_nodes,in_links); 

                    // Make links nodes-head
                    //console.log(in_nodes);

                },
                removeSubLevel: function(node) {
                    //console.log("Removing the branch at position: ", in_nodes.length);
                    //console.log(node);
                    deb.in_nodes = in_nodes;
                    // Filter the array to return a new array with all but subnodes
                    var filtered_nodes = in_nodes.filter(function(n) {
                        return n.head != node.index;
                    });
                    in_nodes = filtered_nodes;
                    // Filter the links to find those with the right source 
                    var filtered_links = in_links.filter(function(l) {
                        return l.source.index != node.index;
                    });
                    //console.log(filtered_links);
                    in_links = filtered_links;
                    // Reinit graph
                    initForceGraph(in_nodes,in_links); 
                }


            };

            

            // Init
            function initForceGraph(in_nodes,in_links) {
               
                // Init force field
                var forceField = force
                .linkDistance(100)
                .gravity(0.025) 
                .friction(0.85)
                .charge(function(d){
                    return -100 * d.size;
                })
                .nodes(in_nodes)
                .links(in_links)

                .start();

                // Clean the canvas
                // TODO add SVG beetween dependencies
                /*
                while (svg.node().firstChild) {
                    svg.node().removeChild(svg.node().firstChild);
                }
                */
                 while (svg.node().querySelector('.node')) {
                    svg.node().removeChild(svg.node().querySelector('.node'));
                }
                 while (svg.node().querySelector('.link')) {
                    svg.node().removeChild(svg.node().querySelector('.link'));
                }
                //
              
                // Build the links data
                var link = svg.selectAll(".link")
                .data(in_links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return Math.sqrt(d.value); });

                // Build the nodes data
                var nodes = svg.selectAll(".node")
                .data(in_nodes)
                .enter();

                // Define the node like this for the movement
                var node = nodes.append("g")
                .attr("class", "node");

                node.append("circle")
                .attr("class", function(d) {
                    if (!!d.formats){
                        return "node_city";
                    } else{
                        var format_class = "node_format";
                        //console.log(d.name);
                        format_class += " " + d.name.toLowerCase().replace(/\s/g,"_");
                        return format_class;
                    }
                })
                .attr("r", function(d) { return (25 * d.size) })
                /*
                .style("fill", function(d) { 
                    if (!!d.formats){
                        //
                    } else{
                        return "ff0";
                    }
                });
                */

                node.append("text")
                .text(function(d) { return d.name; })
                .attr("class", function(d) { 
                    if (!!d.formats){
                        return "node_city_name";
                    } else{
                        return "node_format_name";
                    }
                })
                .attr("dx", function(d){return -20});

                node.on('mouseover',function(event) {
                    //console.log(event);
                    var current_node = event;
                    //window.current_node = event;
                    //console.log('selected node', current_node);
                    //console.log(window.selected_date_index);
                    if (window.selected_date_index || window.selected_date_index == 0) {
                        //console.log('selected selected_date_index', window.selected_date_index);
                        $dates_scope.dates[window.selected_date_index].market = current_node.name;
                        $dates_scope.$apply();
                    }
                });

                node.call(force.drag);
                /*
                node.call(d3.behavior.drag().on("drag", dragHandler).on("dragEnd", dropHandler)); 

                var dragHandler = function (event) {
                    console.log(event);
                };

                var dropHandler = function(event) { 
                    console.log(event);
                }; 
                */

                node.on( "click", function(d){
                    
                    // Remove a node
                    if (d3.event.defaultPrevented) return;
                    var this_node = this;
                    var point = d3.mouse(this_node);

                    if (clicked_once) {
                        ondoubleclick(d,this_node);
                        clicked_once = false;
                        clearTimeout(click_timer);
                    } else {
                        click_timer = setTimeout(function() {
                            onsingleclick(d,this_node);
                            clicked_once = false;
                        }, 150);
                        clicked_once = true;
                    }
                });

                
                /**
                 * On click select the market node and open subnodes
                 * */
                 var onsingleclick = function(d,this_node){
                    
                     if (d.formats) {
                         // Set the market selected in the rootScope
                         // TODO This should be refactor when we have a common market json
                         angular.element(scope_injector).scope().selected_market_node = d;
                         angular.element(scope_injector).scope().selected_format_node = null;
                         
                         // Fire ajax calls on watch changin market
                       //  var market = {
                       //     "city": d.name
                       //  }
                       //  angular.element('.artist-scope').scope().current_market = market; 
                         angular.element(scope_injector).scope().$apply();

                        // If we are clicking on a first level node
                        if (!d.expanded){
                            GraphManager.addSubLevel(d);
                            d.expanded = true;
                            
                        } else {
                            //console.log("Already");
                            GraphManager.removeSubLevel(d);
                            d.expanded = false;
                        }
                        //console.log(d);
                        //console.log(node);
                        //console.log(link);
                    }else {
                        // If we are clicking on a sub node
                        //angular.element(scope_injector).scope().selected_format_node = d;
                        //angular.element(scope_injector).scope().$apply();
                        console.log('filter by format', d);
                    };
                };

                /**
                 * On doubleclick
                 * */
                var ondoubleclick = function(d){
                    console.log("double click");
                    if (d.formats) {
                        // If we are clicking on a first level node
                        //console.log(node);
                    }else {
                        // If we are clicking on a sub node
                        //console.log(d);
                    };
                };



                // Recalculate movement on tick 
                force.on("tick", function() {
                    link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                    node.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")"; })
                });

                deb.force = force;

                // Compute layout
                var n = 100;

            };

            /*
            * main
            * */

            // Build the links and nodes structure
            // TODO these could be passed as parameters to avoid mutation?
            var in_links = Array();
            var in_nodes = Array();

            deb.in_links = in_links;
            deb.in_nodes = in_nodes;

            // Do a pre-launch of the graph without plotting to update positions
            // ??

            // This uses the GraphManager to mutate the in_links and in_nodes
            for (var i in city_nodes) {
                //GraphManager.addBranches(city_nodes[i]);       
                GraphManager.addTopLevel(city_nodes[i]); 
            };

            initForceGraph(in_nodes,in_links);

            /**
            * Events
            * */

            /*
            var toggleNodes = function() {
            var toggleOnElem = function(sel) {
            d3.selectAll(sel)
            .classed("hidden",function(){
            return !this.classList.contains("hidden");
            });
            };
            toggleOnElem(".link");
            toggleOnElem(".node_format_name");
            toggleOnElem(".node_format");
            };
            */


        };

        new OneNodeForceGraph(graph.nodes);
    });
};



/**
* Animated pie chart for the radio airplay
*
* This gets called each time to render a pie chart based on
* some data, used for showing the % of airplay that the 
* station gets TW
*
* @param String selector
* @param Object values - TODO, actually takes values from a TSV 
* */

var initPieChart = function(sel,data) {
    var el = d3.select(sel);
    // Don't append another if already there
    if (el.node() && el.node().childNodes.length > 0) return;
    var self = this;

    var width = 128,
    height = 128,
    radius = Math.min(width, height) / 2;

    var color = d3.scale.category20();

    var pie = d3.layout.pie()
    .value(function(d) {return d.apples; })
    .sort(null);

    var arc = d3.svg.arc()
    .outerRadius(function(d) {
        return radius - 20;
    });

    var svg = el.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.tsv("data/tour_station_pie_data.tsv", function(error, data) {
        //console.log(data);

        var path = svg.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { 
            this._current = d; 
        }); // store the initial angles

        //d3.selectAll("input")
        //.on("change", change );

        var timeout = setTimeout(function() {
            //d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
            change('oranges');
        }, 100);

        function change(value) {
            //console.log(value);
            clearTimeout(timeout);
            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }

    });
    
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

}

/**
 * initStationPieChart
 * Pie chart taking values
 *
 * @param string selector
 * @param array values
 * */

var initStationPieChart = function(sel,data) {
    var el = d3.select(sel);
    // Don't append another if already there
    if (el.node() && el.node().childNodes.length > 0) return;
    var self = this;

    var width = 128,
    height = 128,
    radius = Math.min(width, height) / 2;

    var color = d3.scale.category20();

    var pie = d3.layout.pie()
    .value(function(d) {return d.apples; })
    .sort(null);

    var arc = d3.svg.arc()
    .outerRadius(function(d) {
        return radius - 20;
    });

    var svg = el.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.tsv("data/tour_station_pie_data.tsv", function(error, data) {
        //console.log(data);

        // Randomize data
        var r = Math.random() * 0.5;
        var cr = 1 - r;
        data[0].oranges = cr;
        data[1].oranges = r;
    
        var path = svg.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { 
            this._current = d; 
        }); // store the initial angles

        //d3.selectAll("input")
        //.on("change", change );

        var timeout = setTimeout(function() {
            //d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
            change('oranges');
        }, 100);

        function change(value) {
            //console.log(value);
            clearTimeout(timeout);
            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }

    });
    
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

}


/**
 * initTourPieChart
 * Pie Chart Based on Format, 
 * Top 5 Formats Nationally for Artist
 *
 * @param String selector
 * @param Object values - TODO, actually takes values from a TSV 
 * */

var initTourPieChart = function(sel,data) {
    console.log('Init Tour Pie Chart');
    var self = this;
    var el = d3.select(sel);
    //console.log(el);
    // Don't append another if already there
    if (el.node() && el.node().childNodes.length > 0) return;
    
    // Set Size
    var width = 168,
    height = 168,
    radius = Math.min(width, height) / 2;

    // Set Colours
    var color = d3.scale.category20();

    var pie = d3.layout.pie()
    .value(function(d,i) {
    // Init an empty pie    
    return i == 0 ? 1 : 0; 
    })
    .sort(null);

    var arc = d3.svg.arc()
    .outerRadius(function(d) {
        return radius - 20;
    });

    var svg = el.append("svg")
    .style("display","block")
    .style("margin","auto")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.tsv("data/tour_pie_chart_data.tsv", function(error, data) {
        //console.log(data);
        var path = svg.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("class","slice")
        .attr("fill", function(d, i) { return color(i); })
        //.attr("stroke", function(d, i) { return color(i); })
        .attr("d", arc)
        /*
        .on("mouseover",function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var yPosition = parseFloat(d3.select(this).attr("y"));
            //console.log(d);
            svg.append("text")
            .attr("id", "tooltip")
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(d.data.format + ': ' +d.data.col2);    
        })
        .on("mouseout", function() {
            //Remove the tooltip
            d3.select("#tooltip").remove();
        })
        */
        .each(function(d) { 
            this._current = d; 
        }); // store the initial angles

        //path.append("svg:title")
        //.text(function(d) { return 'estet' });

        var timeout = setTimeout(function() {
            clearTimeout(timeout);
            pie.value(function(d) { return d['col2']; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }, 100);

        function change(value) {
            //console.log(value);
            clearTimeout(timeout);
            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }

    });

    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }
}

/**
* initTourBarChart
* 5 point bar chart 
* for the Top 5 songs of Artist History 
*
* @param String selector
* @param Object values - TODO, actually takes values from a TSV 
* */

var initTourBarChart = function(sel) {
    //var margin = {top: 20, right: 20, bottom: 30, left: 40},
    var margin = {top: 10, right: 20, bottom: 5, left: 30},
    width = 224 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

    var y = d3.scale.linear()
    .range([0,width]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(0, "");

    var labelAxis = d3.svg.axis()
    .scale(x)
    .orient("left");

    var svg = d3.select(sel).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data/tour_bar_chart_data.tsv", type, function(error, data) {
        x.domain(data.map(function(d) { return d.letter; }));
        y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

        /*
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-1.5em")
        .style("text-anchor", "end")
        .text("Count");

        svg.selectAll(".bar")
        .data(data).enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        // Init values
        .attr("y",height)
        .attr("height",0)
        // Start transition
        .transition().delay(250).duration(1000)
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        */

        svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," + height + ")")
        .call(labelAxis);


        svg.selectAll(".bar")
        .data(data).enter()
        .append("rect")
        .attr("class", "bar")
        /*
        .on("mouseover",function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x")) + 20;
            var yPosition = parseFloat(d3.select(this).attr("y")) + x.rangeBand()/2 +3;
            console.log(d);
            svg.append("text")
            .attr("id", "tooltip")
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text(d.frequency);    
        })
        .on("mouseout", function() {
            //Remove the tooltip
            d3.select("#tooltip").remove();
        })
        */
        .attr("y", function(d) { return x(d.letter); })
        .attr("height", x.rangeBand())
        //.attr("height", 32)
        // Init values
        .attr("width",0)
        .attr("x", 0)
        // Start transition
        //.attr("x", function(d) { return -y(d.frequency); })
        .transition().delay(250).duration(1000)
        .attr("width", function(d) { return +y(d.frequency); })
        

    });

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
}


/**
* InitTourLineChart
* Make Time Line Chart, 
* based on Artist Time Line Like 5 Year
*
* @param String selector
* @param Object values - TODO, actually takes values from a TSV 
* */

var initTourLineChart = function(sel,data) {
    var margin = {top: 20, right: 10, bottom: 40, left: 10},
    width = 200 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%b-%y").parse;

    var x = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(5);

    //.orient("bottom");

    //var yAxis = d3.svg.axis()
    //.scale(y)
    //.orient("left");
    var baseline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(height);


    var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    //.y(0)
    //.transition().delay(100).duration(100)
    .y(function(d) { return y(d.close); });

    var getLine = function() {
        return d3.svg.line().x(function(d) { return x(d.date); }).y(function(d) { return y(d.close); });
    }

    var svg = d3.select(sel).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data/tour_line_chart_data.tsv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain(d3.extent(data, function(d) { return d.close; }));

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .style("font-size", "0.8em")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)" 
        });;

        // svg.append("g")
        // .attr("class", "y axis")
        // .call(yAxis)
        // .append("text")
        // .attr("transform", "rotate(-90)")
        // .attr("y", 6)
        // .attr("dy", ".71em")
        // .style("text-anchor", "end")
        //.text("Price ($)");

        svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", baseline)
        .transition().delay(100).duration(1000)
        .attr("d", line);
    });

}

/*
 * Main
 */

var initVisualization = function(){
    console.log("Initializing...");
    $dates_scope = angular.element('.dates').scope();
    // Size the svg viewport accordingly
    window.initSvg = function(){
        var svg = document.querySelector('svg');
        console.log("row height: " + document.querySelector('.viewport').clientHeight);
        console.log("dates height: " + document.querySelector('.dates').clientHeight);
        // TODO: switch to document ready equivalent
        svg.style.height = document.querySelector('.viewport').clientHeight - Math.max(148, document.querySelector('.dates').clientHeight) + "px";
    };
    window.initSvg();
    initForceGraph();
};


