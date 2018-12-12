/* JS by Albert Bautista 2018 */



//self-executing anonymous function
(function () {
    // Creating pseudo-global variables for the map and the bar chart
    var osmType = ["Buildings", "Natural Features", "Hydrology", "Road Classes", "Physical Spaces", "Roads Directionality", "Addresses", "Points of Interests"];
    var years = ["2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018"];
    
    var uniqueosm = osmType[0]
    var uniqueYears = years[0]
    
    // variables that will be joined   
    var attrArray = ["Buildings_2002","Buildings_2003","Buildings_2004","Buildings_2005","Buildings_2006","Buildings_2007","Buildings_2008","Buildings_2009","Buildings_2010","Buildings_2011","Buildings_2012","Buildings_2013","Buildings_2014","Buildings_2015","Buildings_2016","Buildings_2017","Buildings_2018","Nautral Features_2002","Nautral Features_2003","Nautral Features_2004","Nautral Features_2005","Nautral Features_2006","Nautral Features_2007","Nautral Features_2008","Nautral Features_2009","Nautral Features_2010","Nautral Features_2011","Nautral Features_2012","Nautral Features_2013","Nautral Features_2014","Nautral Features_2015","Nautral Features_2016","Nautral Features_2017","Nautral Features_2018","Hydrology_2002","Hydrology_2003","Hydrology_2004","Hydrology_2005","Hydrology_2006","Hydrology_2007","Hydrology_2008","Hydrology_2009","Hydrology_2010","Hydrology_2011","Hydrology_2012","Hydrology_2013","Hydrology_2014","Hydrology_2015","Hydrology_2016","Hydrology_2017","Hydrology_2018","Physical Spaces_2002","Physical Spaces_2003","Physical Spaces_2004","Physical Spaces_2005","Physical Spaces_2006","Physical Spaces_2007","Physical Spaces_2008","Physical Spaces_2009","Physical Spaces_2010","Physical Spaces_2011","Physical Spaces_2012","Physical Spaces_2013","Physical Spaces_2014","Physical Spaces_2015","Physical Spaces_2016","Physical Spaces_2017","Physical Spaces_2018","Road Class_2002","Road Class_2003","Road Class_2004","Road Class_2005","Road Class_2006","Road Class_2007","Road Class_2008","Road Class_2009","Road Class_2010","Road Class_2011","Road Class_2012","Road Class_2013","Road Class_2014","Road Class_2015","Road Class_2016","Road Class_2017","Road Class_2018","Road Directionality_2002","Road Directionality_2003","Road Directionality_2004","Road Directionality_2005","Road Directionality_2006","Road Directionality_2007","Road Directionality_2008","Road Directionality_2009","Road Directionality_2010","Road Directionality_2011","Road Directionality_2012","Road Directionality_2013","Road Directionality_2014","Road Directionality_2015","Road Directionality_2016","Road Directionality_2017","Road Directionality_2018","Addresses_2002","Addresses_2003","Addresses_2004","Addresses_2005","Addresses_2006","Addresses_2007","Addresses_2008","Addresses_2009","Addresses_2010","Addresses_2011","Addresses_2012","Addresses_2013","Addresses_2014","Addresses_2015","Addresses_2016","Addresses_2017","Addresses_2018","Points of Interests_2002","Points of Interests_2003","Points of Interests_2004","Points of Interests_2005","Points of Interests_2006","Points of Interests_2007","Points of Interests_2008","Points of Interests_2009","Points of Interests_2010","Points of Interests_2011","Points of Interests_2012","Points of Interests_2013","Points of Interests_2014","Points of Interests_2015","Points of Interests_2016","Points of Interests_2017","Points of Interests_2018"];   
    var expressed = attrArray[0];
        
    
    
    //create chart dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 170]);

    //execute map when page loads
    window.onload = setMap();

    //setup choropleth map
    function setMap() {
        
        //create map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 520;

        //create svg container    
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height)
            //add zoom and pan functionality to map
            //.call(d3.zoom().on("zoom", function () {
            //    map.attr("transform", d3.event.transform);
            //}))
            .append("g");
            
        //determine map projection
        var projection = d3.geoAlbersUsa()
            .scale(950)
            .translate([width / 2, height / 2]);
        
        //create path generator
        var path = d3.geoPath()
            .projection(projection);
        
        //use queue for asynchronous data loading
        d3.queue()
            .defer(d3.csv, "data/osmdata_output.csv")
            .defer(d3.json, "data/us_states.topojson")
            .await(callback);
        
            
        function callback(error, csvData, state) {

            //translate topojson data 
            var stateMap = topojson.feature(state, state.objects.us_states).features;

            //join topojson and csv data
            stateMap = joinData(stateMap, csvData);

            //create color scale
            var colorScale = makeColorScale(csvData);

            //add enumeration units
            setEnumerationUnits(stateMap, map, path, colorScale);

            //add coordinated visualization
            setChart(csvData, colorScale);

            //add dropdown menu
            createDropdown(csvData);
           
            //change attriubute data 
            changeAttribute(csvData, makeColorScale);

            //update charts when data changes
            updateChart(csvData);

        };
    };

    
    function joinData(stateMap, csvData) {
        //loop through csv to collect attributes 
        for (var i = 0; i < csvData.length; i++) {
            var csvosm = csvData[i];
            var csvKey = csvosm.state;

            for (var a = 0; a < stateMap.length; a++) {
                var geojsonProps = stateMap[a].properties;
                var geojsonKey = geojsonProps.STUSPS;

                if (geojsonKey == csvKey) {

                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvosm[attr]);
                        geojsonProps[attr] = val;
                    });
                };
            };
        };
     
        return stateMap;
        
    };

    function setEnumerationUnits(stateMap, map, path, colorScale) {
        
        //add states for analysis to the map
        var osmStates = map.selectAll(".osmStates")
            .data(stateMap)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "osmState " + d.properties.STUSPS;
            })
            .attr("d", path)
            .style("fill", function(d){
                return colorScale(d.properties[expressed]);
            })
            .on("mouseover", function(d){
                highlight(d.properties);
            })
            .on("mouseout", function(d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);

            var desc = osmStates.append("desc")
                .text('{"stroke": "#000", "stroke-width": "0.5"}');

            console.log(osmStates);

    };

    function makeColorScale(data){
        //assign colors
        var colorClasses = [
        "#ffb3b3",
        "#ff8080",
        "#ff1a1a",
        "#cc0000",
        "#990000"
        ];

        //create color generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build array of values
        var domainArray = [];
        for (var i = 0; i < data.length; i++) {
            var val = parseFloat(data[i][expressed])
            domainArray.push(val);
        };
            
        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);

        //reset domain array to cluster minimums
        domainArray = clusters.map(function (d) {
            return d3.min(d);
        });

        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of last 4 clusters minimum as domain
        colorScale.domain(domainArray);

        return colorScale;
    };

    //function to test for data value and return color
    function choropleth(props, colorScale) {
        //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign white
        if (typeof val === "number" && !isNaN(val)) {
            return colorScale(val);
        } else {
            return "#FFFF";
        }
    };    


    function setChart(csvData, colorScale) {
        
        //create another svg container to hold chart 
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create rectangle chart container
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //set bars for each state being evalulated
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed];
            })
            .attr("class", function (d) {
                return "bars " + d.state;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
            .on("mousemove", moveLabel)
            .attr("x", function (d, i) {
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            .attr("height", function (d, i) {
                return 463-yScale(parseFloat(d[expressed]));
            })
            .attr("y", function (d, i) {
                return yScale(parseFloat(d[expressed])) ;
            })
            .style("fill", function (d) {
                return choropleth(d, colorScale);
            });

        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        //create chart title element
        var chartTitle = chart.append("text")
            .attr("x", 150)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Number of Declared " + uniqueosm + " in " + uniqueYears + ".");

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        updateChart(bars, csvData.length, colorScale);
    };

    function createDropdown(csvData){
        
        // create dropdown menu element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData);
            });            

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select osm Type");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(osmType)
            .enter()
            .append("option")
            .attr("value", function (d) { return d })
            .text(function (d) { return d });
   
    
        // Adding a select element for year
        var dropdownyear = d3.select("body")
            .append("select")
            .attr("class", "dropdown2")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });
        
        //add initial option
        var titleOption2 = dropdownyear.append("option")
            .attr("class", "titleOption2")
            .attr("disabled", "true")
            .text("Select Year");
        
        // Adding attribute options for the dropdown menu
        var attrOptions2 = dropdownyear.selectAll("attrOptions2")
            .data(years)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };
    
    function changeAttribute(attribute, csvData) {
        // Creating an "if" statement to account for updating dropdown values for each dropdown menu
        if (attribute.indexOf("B","N","H","P","R","A","P") > -1){
            uniqueosm = attribute
        } else {
            uniqueYears = attribute
        };
               
        // Combining the attribute values into the expressed input for the map and the bar chart
        expressed = uniqueosm + "_" + uniqueYears; 

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var osmState = d3.selectAll(".osmState")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                return choropleth(d.properties, colorScale);
            });
        
        //re-configure bars 
        var bars = d3.selectAll(".bars")
            //re-sort bars
            .sort(function (a, b) {
                return b[expressed] - a[expressed];
            })
            .transition()
            .delay(function(d, i){
                return i * 20;
            })
            .duration(500);

        updateChart(bars, csvData.length, colorScale);
            
    };

    function updateChart(bars, n, colorScale){
        //position bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function(d){
                return choropleth(d, colorScale);
            });

        var chartTitle = d3.select(".chartTitle")
            .text("Number of Changesets " + uniqueosm + " in " + uniqueYears + "."); 
    };

    function highlight(props, csvData){

        //highlight enumeration units and bars
        var selected = d3.selectAll("." + props.STUSPS)
            .style("stroke", "#FFFF00")
            .style("stroke-width", "3");

            setLabel(props);
    };

    function dehighlight(props) {

        //remove highlighting when mouse leaves enum unit or bar 
        var selected = d3.selectAll("." + props.STUSPS)
            .style("stroke", function () {
                return getStyle(this, "stroke");
            })
            .style("stroke-width", function () {
                return getStyle(this, "stroke-width");
            });

        function getStyle(element, styleName) {
            var styleText = d3.select(element)
                .select("desc")
                .text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        };

        d3.select(".infolabel")
            .remove();
    };

    function setLabel(props, csvData){
        
        //name attributes filtered to replace underscore with space 
        var labelName = props.NAME;
        
        //if statement to specifically add attributes once dropdown menu item is activated 
        var labelAttribute;
        if ([expressed] != expressed) {
            labelAttribute = "<h2>" + labelName +
                "</h2><b>" + "Click dropdown menu to begin viewing Changeset figures." + "</b>";

        } else {
            //second if statement to add attribute data only to countries being evaluated 
            if (props[expressed] > 0) {
                labelAttribute = "<h2>" + labelName +
                    "</h2><b>" + "Total Changesets " + expressed + " : " + props[expressed] + "</b>";
            } else {
                labelAttribute = "<h2>" + labelName +
                    "</h2><b>" + "No OSM Changesets for this type." + "</b>";
            };
        };
        //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.NAME + "_label")
            .html(labelAttribute);
   
    };

    function moveLabel(){

        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;

        //use coordinates of mousemove event to set label coordinates
        var x = d3.event.clientX + 10,
            y = d3.event.clientY - 75;
    
        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };


})();
