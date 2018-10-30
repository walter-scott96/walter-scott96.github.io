//532 project
//Harrison Osburn - 1140138
//Walter Scott - 1237688
//Hayden Borrie - 1265788

var map;
var selLayer;
var curLayer;
var regionLayer;
var dateCnst = "";
var layerPolys;
var valueGroups = [];
var units = "";
var layersHidden = true;
var isZoomed = false;
var selLayerNum;
var style = [];
var hideLayer;

//change layer bar
var nav = document.createElement("div");
nav.id = "nav";
var layerText = document.createElement("span");
layerText.appendChild(document.createTextNode("Measurement: "));
nav.appendChild(layerText);

var arrow = (document.createElement("span"));
arrow.className = "arrowDown";
arrow.onclick = function(){
	if(layersHidden){
		$(".hideLayers").removeClass("hideLayers");
		arrow.className = "arrowUp";
		layersHidden = false;
	} else {
		$(".layer").addClass("hideLayers");
		arrow.className = "arrowDown";
		layersHidden = true;
	}
}

//add layer nav items to map
var layerIds = ["bdisc","drp","ecoli","nh4","tb","tn","ton","turb"];
var layerText = ["Black disc visibility","Dissolved reactive Phosphorus","E. coli","Ammoniacal Nitrogen","Total Phosphorus","Total Nitrogen","Total Oxidised Nitrogen","Turbidity"];

nav.appendChild(arrow);

for(var i = 0; i < 8; i++){
	var tmp = document.createElement("div");
	tmp.id = layerIds[i];
	tmp.appendChild(document.createTextNode(layerText[i]));
	tmp.setAttribute('onclick', 'setLayer('+i+')');
	$(tmp).addClass("layer");
	$(tmp).addClass("hideLayers");
	nav.appendChild(tmp);
}

//slider
var slider = document.createElement("input");
var sliderValue = document.createElement("output");
var sliderContainer = document.createElement("div");

slider.setAttribute("type","range");
slider.setAttribute("min","1");
slider.setAttribute("max","120");
slider.setAttribute("value","120");
slider.className = "slider";
slider.id = "slide";
slider.oninput = function(){
	updateSlider();
}
sliderValue.setAttribute("for","slide");
sliderValue.id = "sliderValue";
sliderContainer.id = "sliderContainer";

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

updateSlider = function(){
	if(curLayer!=null){
		var month = ((slider.value-1)%12)+1;
		var year = 2007+Math.floor((slider.value-1)/12);
		sliderValue.innerHTML = months[month-1]+" "+year;
		dateCnst = "'DateTime' >= '"+month+"/01/"+year+"' AND 'DateTime' <= '"+month+"/31/"+year+"'";
		curLayer.setOptions({
			query: {
				select: "Latitude",
				from: selLayer,
				where: dateCnst
			}
		});
		var width = sliderContainer.offsetWidth;
		var tmp = (slider.value-1)/119;
		if(width*tmp-25<0){
			tmp=(25/width);
		} if(width*tmp >width-30){
			tmp = (width-30)/width;
		}
		$(sliderValue).css('left','calc('+tmp*100+'% - 25px)');
		getData();
	}
}
function getData() {
	//update region styles
	var opts = {sendMethod: 'auto'};
	var query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata', opts);
	query.setQuery("SELECT 'col2', 'OriginalValue' FROM "+selLayer+" WHERE "+dateCnst);
	query.send(handleQueryResponse);
}

function region(_name, _value){
	this.name = _name,
	this.value = _value,
	this.count = 1
};

function handleQueryResponse(response){
	if(!response.isError()){
		var regions = [];
		var data = response.getDataTable();
		var rows = data.getNumberOfRows();
		for(var i = 0; i < rows; i++){
			var contains = false;
			var x = 0;
			while((x < regions.length) && !contains){
				if(regions[x].name == data.getValue(i,0)){
					regions[x].value += data.getValue(i,1);
					regions[x].count++;
					contains = true;
				}
				x++;
			}
			if(!contains){
				regions.push(new region(data.getValue(i,0),data.getValue(i,1)));
			}
		}
		var red;
		var yellow;
		var green;
		var blue;
		for(var n = 0; n < regions.length; n++){
			var avg = (regions[n].value/regions[n].count);
			if(avg > valueGroups[2]){
				red+=",'"+regions[n].name+"'";
				} else if((avg <= valueGroups[2])&& (avg > valueGroups[1])){
					yellow+=",'"+regions[n].name+"'";
					} else if((avg <= valueGroups[2])&&(avg > valueGroups[1])){
						green+=",'"+regions[n].name+"'";
						} else{
							blue+=",'"+regions[n].name+"'";
						}
			}

			style.push({where: "'regNames' IN('nores'"+red+")",
								polygonOptions:{
									fillColor: "#ff2d00"
								}
							});
			style.push({where: "'regNames' IN('nores'"+yellow+")",
								polygonOptions:{
									fillColor: "#fbff00"
								}
							});
			style.push({where: "'regNames' IN('nores'"+green+")",
								polygonOptions:{
									fillColor: "#42d004"
								}
							});
			style.push({where: "'regNames' IN('nores'"+blue+")",
								polygonOptions:{
									fillColor: "#0442d0"
								}
							});

		//add average and count off sites to region info windows
		google.maps.event.clearListeners(regionLayer, 'click');
		google.maps.event.addListener(regionLayer, 'click', function(e) {
			function isRegion(regionElement){
					return regionElement.name == e.row['regNames'].value;
				}
			var reg = regions.find(isRegion);
			if(reg!=null){
				e.infoWindowHtml = "<div class='googft-info-window'>"+
				"<b>"+reg.name+"</b><br>"+
				"<b>Area:</b> "+e.row['AREA_SQ_KM'].value+" (SQ KM)<br>"+
				"<b>Land Area:</b> "+e.row['LAND_AREA_SQ_KM'].value+" (SQ KM)<br>"+
				"<b>Number of sites:</b> "+reg.count+"<br>"+
				"<b>Average Value:</b> "+(reg.value/reg.count).toPrecision(4)+"<br>"+
				"</div>"
			}
		});
		if(!isZoomed&&!hideLayer){
			regionLayer.setMap(map);
			curLayer.setMap(map);
		}

	}
}
slider.oninput = function(){
	updateSlider();
}


//"'DateTime' >= '"+month+"/01/"+year+"'
//query.setQuery("SELECT 'col2', 'OriginalValue' FROM "+selLayer+" WHERE "+dateCnst);
                            function synchroniseDataWindow(e){

                                // Grab the site name & date
                                var date = e.row['DateTime'].value;
                                var siteName =  e.row['SiteName'].value;
                            //    console.log(date);
                                var t = date.split(" "); // 5/05/2015 13:16
                            //    console.log(t[0]);

                                var s = t[0].split("/"); // 5/05/2015
                                //    console.log(s[1]);

                                var month = parseInt(s[1]);
                                // var tempDate = date[2].split(" ");
                                var year = parseInt(s[2]);

                                var temp;
                                console.log(month +" "+ year);
                                var startMonth;
                                var startYear;

                                if(month > 4){
                                    startMonth = months[month - 1 - 4];
                                    startYear = year.toString();
                                }else{
                                    startMonth = months[month -1 + 8];
                                    console.log(startMonth + "<<");
                                    // Decrease the year
                                    temp = year - 1;
                                    startYear = temp.toString();
                                    console.log(startMonth + "<<" + startYear);
                                }
                                // var monthArray = [];

                             //   var startYear = "2010";
                                var endMonth = months[month - 1];
                                var endYear = year;

                                var opts = {sendMethod: 'auto'};
                                var query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata', opts);
                                query.setQuery("SELECT SiteName, RawValue, DateTime from " + selLayer
                                    + " where DateTime >= '" + startMonth + "/01/" + startYear + "' "
                                    +    "and DateTime <= '" + endMonth +   "/31/" + endYear +"' "
                                    +    "and SiteName = '" +  siteName + "' order by DateTime desc");
                                query.send(handleQueryRepsonseSynchniseData);
                            }

                            function handleQueryRepsonseSynchniseData(response){
                                if (response.isError()) {
                                    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                                    return;
                                }

                                var myDataTable = response.getDataTable();
                                var rowCount = myDataTable.getNumberOfRows();
                                console.log(rowCount.toString());
                                var container = [];
                                for(var i = 0; i < rowCount; i++) {
                                    container[i] = [];
                                    container[i][0] = myDataTable.getValue(i,0); // Name
                                    container[i][1] = myDataTable.getValue(i,1); // Value
                                    container[i][2] = myDataTable.getValue(i,2); // Date
                                  //  console.log(myDataTable.getValue(i,0).toString() +"," + myDataTable.getValue(i,1).toString()+"," + myDataTable.getValue(i,2).toString());
                                }
                                populatePictures(container);
                            }


// Set the layer (water quality test) according to the user's selection
setLayer = function(i){
	selLayerNum = i;
	switch(i){
        case 0: selLayer="1fLMfcSWoNcHWxAntzKnXmNrfjfy-YSC_QbXqNcZI";   // Assign the appropriate table reference
		$(".selectedLayer").removeClass("selectedLayer");               // Remove the highlight from previous selection
		$('#bdisc').addClass("selectedLayer");                          // Add highlight to current selection
        setGroups(2, 5, 12);                                            // Set the range divisions for low, medium & high
        units = "mg/m<sup>3</sup>";                                         // Set the units to be use
        addLayer();                                                     // Update the map with user selections
		break;
    	case 1: selLayer="1ejAYrtvIR-S7XzY7s6Qjj7d7sQu2TqLrMDTykwef";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#drp').addClass("selectedLayer");
        setGroups(0.010, 0.020, 0.050);
        units = "mg/m<sup>3</sup>";
        addLayer();
    	break;
    	case 2: selLayer="1ia1bHfcAQrChqxtF9AEYz6_4MYfkegYJKDGcHZj8";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#ecoli').addClass("selectedLayer");
        setGroups(540, 1000, 1200);
        units = "E. coli/100 mL";
        addLayer();
    	break;
    	case 3: selLayer="1HqqTJHr7nyNccYWFrvvozPpqb0HXKcOPYxOg8v8S";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#nh4').addClass("selectedLayer");
        setGroups(0.03, 0.24, 1.30);
        units = "mg NH<sub>4</sub>-N/L";
        addLayer();
    	break;
    	case 4: selLayer="1xPnv-6ahUxikMdn23Q2hF4ZFoDGmpFqx2zsoHBKf";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#tb').addClass("selectedLayer");
        setGroups(0.03, 0.24, 1.30);
        units = "mg/m<sup>3</sup>";
        addLayer();
    	break;
    	case 5: selLayer="1xEsdP3obQ3-vbR37KD7mXKSydQsfr8LQjIzpaQKI";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#tn').addClass("selectedLayer");
        setGroups(160, 350, 750);
        units = "mg/m<sup>3</sup>";
		addLayer();
    	break;
    	case 6: selLayer="1teN8WRrxEDmLfZbfGgGmXrEXYBR1nWCotJUy1_Hc";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#ton').addClass("selectedLayer");
        setGroups(0.008, 0.007, 0.005);
        units = "mg NO<sub>3</sub>-N/L";
        addLayer();
    	break;
    	case 7: selLayer="1Ztq6JuufyZ2Vq4UDK_i3RKv7OT9PDW0SYe035JGp";
		$(".selectedLayer").removeClass("selectedLayer");
		$('#turb').addClass("selectedLayer");
        setGroups(1, 2.4, 6.9);
        units = "mg NO<sub>3</sub>-N/L";
        addLayer();
    	break;
    }
    updateSlider();
};

// Marker divisions for assigning colours
function setGroups(a, b, c){
    valueGroups = [];
    valueGroups.push(a);
    valueGroups.push(b);
    valueGroups.push(c);
}

addLayer = function() {
    // Map in initial clear state
	if(curLayer!=null){
		curLayer.setMap(null);
	}
	// Add user's selected layer
	curLayer = new google.maps.FusionTablesLayer({
      map: map,
      heatmap: { enabled: false },
      suppressInfoWindows: true,
      query: {
        select: "Latitude",
        from: selLayer,
        where: dateCnst
      },
      options: {
        styleId: 2,
        templateId: 2
      },
      styles: [
          {
              where: "'OriginalValue' > " + valueGroups[2],
              markerOptions: {
                  iconName: "small_red"
              }
          },
          {
              where: "'OriginalValue' <= " + valueGroups[2],
              markerOptions: {
                  iconName: "small_yellow"
              }
          },
          {
              where: "'OriginalValue' <= " + valueGroups[1],
              markerOptions: {
                  iconName: "small_green"
              }
          },
          {
              where: "'OriginalValue' <= " + valueGroups[0],
              markerOptions: {
                  iconName: "small_blue"
              }
          }
      ]
    });

    // Create the legend and display on the map
    var tmp = document.getElementById("legend");

    var content = [];
    content.push('<h3>Values ('+units+')</h3>');
    content.push('<p><div class="color blue"></div>0 - '+valueGroups[0]+'</p>');
    content.push('<p><div class="color green"></div>'+valueGroups[0]+' - '+valueGroups[1]+'</p>');
    content.push('<p><div class="color yellow"></div>'+valueGroups[1]+' - '+valueGroups[2]+'</p>');
    content.push('<p><div class="color red"></div>'+valueGroups[2]+'+</p>');

    if(document.body.contains(tmp))
    {
        tmp.innerHTML = content.join('');
    }else{
        var legend = document.createElement('div');
        legend.id = 'legend';
        legend.innerHTML = content.join('');
        legend.index = 1;
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
    }

    // Dirty hard coded values, will add more later
    google.maps.event.addListener(curLayer, 'click', function(e) {

        synchroniseDataWindow(e);

        var content = [];
        content.push('<h2><b>'+ e.row['SiteName'].value +'</b></h2>');
        content.push('<div style= padding-bottom: 5px; font-size: 16px;><i>'+ e.row['Region'].value + '</i><br>Site ID: ' + e.row['LawaID'].value + '</div>');
        content.push('<div style=padding-top:5px; font-size: 10px;><b>Longitude:</b>'+ e.row['Longitude'].value + ' <br><b>Latitude:</b>' + e.row['Latitude'].value + '</div>');

        var infoG = document.getElementById('infographic');
        if(document.body.contains(infoG)) {
            // Update the existing info graphic window
            infoG.innerHTML = content.join('');
        }else{
            // Create the info graphic window
            var infoGraphic = document.createElement('div');
            infoGraphic.id = 'infographic';
            infoGraphic.innerHTML = content.join('');
            infoGraphic.index = 1;
            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(infoGraphic);
        }
    });
}

function populatePictures(container){

    console.log(container.length);
    var monthNumbers = {'Jan': 0,'Feb': 1,'Mar' : 2,'Apr' : 3,'May' : 4,'Jun' : 5,'Jul' : 6,'Aug' : 7,'Sep' : 8,'Oct' : 9,'Nov' : 10, 'Dec' : 11};
    var dateString = container[0][2].toString();
    var date0 = dateString.split(" "); //Tue Jun 01 2010 12:15:00 GMT+1200 (New Zealand Standard Time)
    var monthNum = monthNumbers[date0[1]];
    var year = parseInt(date0[3]);


    console.log(monthNum + "," + year);

    var monthArray = [];
   // var monthInt = months.valueOf(month);
   console.log("result " + monthNum+months[monthNum]);

    for(i = 0; i <= container.length; i++) {
        if(i == 0){
            monthArray.push(months[monthNum] +" "+ year.toString());
            monthNum--;
            if(monthNum == -1) monthNum = 11; year--;
            continue;
        }
        else if (monthNum == 0) {
            monthNum = 11; year--;
            monthArray.push(months[monthNum] +" "+ year.toString() );
            monthNum--;
        } else {
            monthArray.push(months[monthNum] +" "+ year.toString()  );
            monthNum--;
        }
    }

    var monthAverages = {minus4Av: 458.96, minus3Av: 766.89, minus2Av: 548.10, minus1Av: 400.65, minus0Av: 626.20};
    var Awakino = {minus4: 1487, minus3:306, minus2:1156, minus1:702,  minus0:2395,  min:0.5, max: 4500};
    var temp = Awakino;
    var infoG = document.getElementById('infographic');
    var i;
    var content = [];

    content.push('<div style=padding-top: 15px;>' +
        '<img src="http://occupodo.ddns.net:3000/?minIn='+ temp.min +'&maxIn='+ temp.max+'&originalValue='
        + parseFloat(container[3][1]) + '&average='+ monthAverages.minus3Av +'&tubeColor='+setColour(parseFloat(container[3][1]))
        +'&previousAverage='+ monthAverages.minus4Av +'&year='+ monthArray[3] +'&percentile=89th">' +
        '<img src="http://occupodo.ddns.net:3000/?minIn='+ temp.min +'&maxIn='+ temp.max+'&originalValue='
        + parseFloat(container[2][1]) + '&average='+ monthAverages.minus2Av +'&tubeColor='+setColour(parseFloat(container[2][1]))
        +'&previousAverage='+ monthAverages.minus3Av +'&year='+ monthArray[2] +'&percentile=66th">' +
        '<img src="http://occupodo.ddns.net:3000/?minIn='+ temp.min +'&maxIn='+ temp.max+'&originalValue='
        + parseFloat(container[1][1]) + '&average='+ monthAverages.minus1Av +'&tubeColor='+setColour(parseFloat(container[1][1]))
        +'&previousAverage='+ monthAverages.minus2Av +'&year='+ monthArray[1] +'&percentile=73rd">' +
        '<img src="http://occupodo.ddns.net:3000/?minIn='+ temp.min +'&maxIn='+ temp.max +'&originalValue='
        +parseFloat(container[0][1]) + '&average='+ monthAverages.minus0Av +'&tubeColor='+setColour(parseFloat(container[0][1]))
        +'&previousAverage='+ monthAverages.minus1Av +'&year='+ monthArray[0] +'&percentile=69th">');

    infoG.innerHTML += content.join('');
    }


function setColour(value){
    if (value <= valueGroups[0]) return 4;
    else if (value <= valueGroups[1]) return 2;
    else if (value <= valueGroups[2]) return 1;
    else return 0;
}

// Create the underlying map
initialize = function() {
    var mapDiv = document.getElementById('map');

    map = new google.maps.Map(mapDiv, {
      center: new google.maps.LatLng(-41.273627, 172.524935),
      zoom: 5,
	  maxZoom: 15,
	  minZoom: 5,
	  gestureHandling: 'greedy',
	  mapTypeControl: false,
	  streetViewControl: false,
	  fullscreenControl: true,
	  zoomControlOptions: {
		  position: google.maps.ControlPosition.RIGHT_TOP
	  },
      styles: [
          {
            elementType: 'geometry',
            stylers: [{color: '#f5f5f5'}]
          },
          {
            elementType: 'labels.icon',
            stylers: [{visibility: 'off'}]
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{color: '#616161'}]
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{color: '#f5f5f5'}]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{color: '#bdbdbd'}]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{color: '#eeeeee'}]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#757575'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#e5e5e5'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9e9e9e'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#ffffff'}]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [{color: '#757575'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#dadada'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{color: '#616161'}]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9e9e9e'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{color: '#e5e5e5'}]
          },
          {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{color: '#eeeeee'}]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#c9c9c9'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9e9e9e'}]
          }
        ]
    });
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend-open'));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend'));

    // Add the layer which displays the river boundaries
    layerPolys = new google.maps.FusionTablesLayer({
      map: map,
      heatmap: { enabled: false },
	  suppressInfoWindows: true,
      query: {
        select: "col3",
        from: "1ImJBP7m2013jjmbLg6Hm0oxe4WwPizbbAr-6_GpT",
        where: ""
      },
      options: {
        styleId: 2,
        templateId: 2
      }
    });


	regionLayer = new google.maps.FusionTablesLayer({
		heatmap: { enabled: false },
		query: {
			select: 'geometry',
			from: "1EELxO6MjbVJW6_LG-n0_xrZ9qtNYLHIQIim7iNUN",
		},
		map: map,
		options: {
			styleId: 2,
			templateId: 2
      }
	});
	var layerBtn = document.createElement("div");
	layerBtn.className = "layerBtnShown";
	layerBtn.id = "layerBtn";
	hideLayer = false;
	layerBtn.appendChild(document.createTextNode("Hide Regions"));
	layerBtn.onclick = function(){
		if(hideLayer == false){
			layerBtn.childNodes[0].nodeValue = "Show Regions";
			layerBtn.className = "layerBtnHidden";
			regionLayer.setMap(null);
			hideLayer = true;
		} else {
			layerBtn.childNodes[0].nodeValue = "Hide Regions";
			layerBtn.className = "layerBtnShown";
			regionLayer.setMap(map);
			curLayer.setMap(map);
			hideLayer = false;
		}
	}
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(layerBtn);

	sliderContainer.appendChild(sliderValue);
	sliderContainer.appendChild(slider);
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(sliderContainer);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(nav);

	google.maps.event.addListenerOnce(map, 'idle', function() {
		var checkLoad = window.setInterval(check, 1000);

		function check(){
			if(!$(".selectedLayer").length){
				updateSlider();
				setLayer(0);
				clearInterval(checkLoad);
			}
		}
	});
}

// initialises the map
initialize();

//hide show layers on zoom
//currently as test
google.maps.event.addListener(map, 'zoom_changed', function() { 
	if(hideLayer==false){
		var zoomLevel = map.getZoom();
		// Show a finer geometry when the map is zoomed in
		if (zoomLevel > 7 && !isZoomed) {
			changeZoomLayers(true);
		}
		// Show a coarser geometry when the map is zoomed out
		else if(zoomLevel <= 7 && isZoomed) {
			changeZoomLayers(false);
		}
	}
});

//update slider on map resize incl fullscreen
google.maps.event.addListener(map, 'resize', function() {
	updateSlider();
});

function changeZoomLayers(isZoomedIn){
	if(isZoomedIn){
		regionLayer.setMap(null);
		isZoomed = true;
	} else {
		regionLayer.setMap(map);
		if(curLayer!=null){
			curLayer.setMap(null);
			curLayer.setMap(map);
		}
		isZoomed = false;
	}
}

google.charts.load('current', {callback: getData});
