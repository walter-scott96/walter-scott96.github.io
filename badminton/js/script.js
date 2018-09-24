var circles = [];
var offsetX,offsetY;
const numHits = 42;

function draw()
{
    //createGraph();
    
    var canvas = document.getElementById('canvas');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');

        //Background
        ctx.fillStyle = 'rgb(0, 173, 81)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        
        w = canvas.width - 100;
        h = canvas.height - 100;
        
        /*
         Lines
         */
        
        //Outline
        ctx.strokeStyle = 'rgba(255, 255, 255)';
        ctx.lineWidth = 7;
        ctx.strokeRect(50, 50, w, h/2);
        ctx.strokeRect(50, h/2 + 50, w, h/2);
        
        //Service Court
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 50, w/2, h*0.3522);
        ctx.strokeRect(50 + w/2, 50, w/2, h*0.3522);
        
        ctx.strokeRect(50, 50 + (h - h*0.3522), w/2, h*0.3522);
        ctx.strokeRect(50 + w/2, 50 + (h - h*0.3522), w/2, h*0.3522);
        
        //Doubles Long Service Line
        ctx.strokeRect(50, 50, w, h*0.0597);
        ctx.strokeRect(50, 50 + (h - h*0.0597), w, h*0.0597);
        
        //Singles Side Line
        ctx.strokeRect(50, 50, w*0.08197, h);
        ctx.strokeRect(50 + (w - w*0.08197), 50, w*0.08197, h);
        
        
        size = 10;
        ctx.strokeStyle = 'rgba(0, 0, 0)';
        ctx.lineWidth = 2;       
    }
    
    reOffset();
}

function selectMatch()
{
    draw();
    
    var pcanv = document.getElementById('point');
    var acanv = document.getElementById('animation');
    if(pcanv != null){
        pcanv.parentNode.removeChild(pcanv);
        if(acanv != null){
            acanv.parentNode.removeChild(acanv);
        }
    }

    var matchSelect = document.getElementsByClassName("match");
    var c = 0;
    var i;
    for(i = 0; i < matchSelect.length; i++){
       if(matchSelect[i].selectedIndex > 0){
           c++;
       }
    }
    drawCircles(c);
    updateGraph(c);
}

function drawCircles(numMatches)
{
    draw();
    var canvas = document.getElementById('canvas');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        
        circles = [];
        
        for (i = 0; i < numHits * numMatches; i++)
        {
            if(i % 2 == 0)
            {
                ctx.fillStyle = 'rgb(14, 98, 232, 0.6)';
            }
            else
            {
                ctx.fillStyle = 'rgb(244, 127, 2, 0.6)';
            }
            ctx.beginPath();
            xPos = Math.floor((Math.random() * (canvas.width - size*2)) + size);
            yPos = Math.floor((Math.random() * (canvas.height - size*2)) + size);
            ctx.arc(xPos, yPos, size, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();

            //Center dot
            ctx.beginPath();
            ctx.arc(xPos, yPos, 1, 0, Math.PI * 2, true);
            ctx.stroke();

            var p = {
                id: i,
                x: xPos,
                y: yPos,
                radius: size
            }

            circles.push(p);
        }
    }
    
    reOffset();
  
    canvas.addEventListener('click', (e) => {
        const pos = {
            x: parseInt(e.clientX-offsetX),
            y: parseInt(e.clientY-offsetY)
        };
        //console.log("x:" + pos.x + " y:" + pos.y);
        
        var wrap = document.getElementById('animation');
        if(wrap != null){
            wrap.parentNode.removeChild(wrap);
        }
        wrap = document.getElementById('point');
        if(wrap != null){
            wrap.parentNode.removeChild(wrap);
        }
        
        circles.forEach(circle => {
            //console.log("x:" + circle.x + " y:" + circle.y);
            if (isIntersect(pos, circle)) {
                console.log('click on circle: ' + circle.id);
                drawLine(circle);
            }
        });
    });
}



function reOffset()
{
    var BB=document.getElementById('canvas').getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top;        
}

window.onscroll=function(e){ reOffset(); }
window.onresize=function(e){ reOffset(); }

function isIntersect(point, circle)
{
    return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
}


function drawLine(circle)
{
    //Animated line canvas
    var canvas = document.getElementById('canvas');
    var aniCanvas = document.createElement("CANVAS");
    aniCanvas.id = 'animation';
    aniCanvas.width = canvas.width;
    aniCanvas.height = canvas.height;
    
    //Point canvas
    var pointCanvas = document.createElement("CANVAS");
    pointCanvas.id = 'point';
    pointCanvas.width = canvas.width;
    pointCanvas.height = canvas.height;
        
    canvas.parentElement.appendChild(aniCanvas);
    canvas.parentElement.appendChild(pointCanvas);
    
    if (aniCanvas.getContext)
    {
        var actx = aniCanvas.getContext('2d');
        
        //Calculate position from other side of court
        var xPos = Math.floor((Math.random() * (canvas.width - 100)) + 50);
        var yPos = 0;
        
        //If in lower half, other point will be in top half
        if(circle.y > canvas.height/2){
            yPos = Math.floor((Math.random() * (canvas.height/2 - 50)) + 50);
        }
        //If in top half, other point will be in bottom half
        else{
            yPos = Math.floor((Math.random() * (canvas.height/2 - 50)) + canvas.height/2 + 50);
        }
        
        
        //Point and info
        if (pointCanvas.getContext)
        {
            var con = pointCanvas.getContext('2d');
            
            //Point
            con.beginPath();
            con.strokeStyle = 'rgba(0, 0, 0)';
            con.lineWidth = 6;
            con.arc(xPos, yPos, 2, 0, Math.PI * 2, true);
            con.stroke();
            
            //Info box
            con.fillStyle = 'rgba(255, 255, 255)';
            con.lineWidth = 2;
            con.fillRect(circle.x + circle.radius * 1.5, circle.y - circle.radius*2.5, 100, 45);
            con.strokeRect(circle.x + circle.radius * 1.5, circle.y - circle.radius*2.5, 100, 45);
            
            //Info
            var t = Math.floor((Math.random() * 60) + 1)
            var h = Math.floor((Math.random() * 100) + 1)
            con.lineWidth = 1;
            con.font = '12px arial';
            con.strokeText("Rally time: " + t + "s", circle.x + circle.radius * 2, circle.y - circle.radius);
            con.strokeText("No. hits: " + h, circle.x + circle.radius * 2, circle.y + circle.radius);
        }
        
        pointCanvas.addEventListener('click', (e) => {
            var pcanv = document.getElementById('point');
            var acanv = document.getElementById('animation');
            if(pcanv != null){
                pcanv.parentNode.removeChild(pcanv);
                if(acanv != null){
                    acanv.parentNode.removeChild(acanv);
                }
            }
        });
        
        aniCanvas.addEventListener('click', (e) => {
            var wrap = document.getElementById('animation');
            if(wrap != null){
                wrap.parentNode.removeChild(wrap);
            }
        });
        
        var offset = 0;
        
        //Animates line
        function animate(){
            actx.clearRect(0, 0, canvas.width, canvas.height);
            
            //Line
            actx.beginPath();
            actx.lineWidth = 2;
            actx.setLineDash([8, 5]);
            actx.lineDashOffset = -offset;
            actx.moveTo(xPos, yPos);
            actx.lineTo(circle.x, circle.y);
            actx.stroke();
        }
        function march(){
            offset++;
            if(offset > 12){
                offset = 0;
            }
            animate();
            setTimeout(march, 20);
        }
        march();
    }
}


function createGraph()
{
    draw();
    nv.addGraph(function() {
        var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline
            //.transitionDuration(350)  //how fast the lines transition
            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
            .showYAxis(true)        //Show the y-axis
            .showXAxis(true);        //Show the x-axis

        chart.xAxis     //Chart x-axis settings
            .axisLabel('Rally');


        chart.yAxis     //Chart y-axis settings
            .axisLabel('Score')
            //.tickFormat(d3.format('.02f'))
            .axisLabelDistance(-10);

        var myData = [];   //You need data...

        d3.select('#chart svg')    //Select the <svg> element to render the chart in
          .datum(myData)         //Populate the <svg> element with chart data...
          .transition().duration(500)
          .call(chart);          //Finally, render the chart

        //Update the chart when window resizes.
        nv.utils.windowResize(function() { chart.update() });
        return chart;
    });
}

function updateGraph(numMatches)
{
    /* Bug in library code makes this cause an exception */
    /* Need to recreate whole graph instead of updating */
    /*
    var myData = scoreData();
    
    d3.select('#chart svg')
          .datum(myData)
          //.transition().duration(500)
          .call(chart);
    
    nv.utils.windowResize(chart.update);
    */
    
    nv.addGraph(function() {
        var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline
            //.transitionDuration(350)  //how fast the lines transition
            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
            .showYAxis(true)        //Show the y-axis
            .showXAxis(true);        //Show the x-axis

        chart.xAxis     //Chart x-axis settings
            .axisLabel('Rally');


        chart.yAxis     //Chart y-axis settings
            .axisLabel('Score')
            //.tickFormat(d3.format('.02f'))
            .axisLabelDistance(-10);

        var myData = scoreData(numMatches);   //You need data...

        d3.select('#chart svg')    //Select the <svg> element to render the chart in
          .datum(myData)         //Populate the <svg> element with chart data...
          .transition().duration(500)
          .call(chart);          //Finally, render the chart

        //Update the chart when window resizes.
        nv.utils.windowResize(function() { chart.update() });
        return chart;
    });
}

function scoreData(numMatches)
{
    var data = [];
    
    for(j = 0; j < numMatches; j++)
    {
        var c = 0;
        var s1 = 0;
        var s2 = 0;
        var p1 = [];
        var p2 = [];
        
        for(i = 0; i < numHits; i++)
        {
            if(Math.random() < 0.5)
            {
                s1++;
                c++;
                p1.push ({
                    x: c,
                    y: s1
                });
            }
            else
            {
                s2++;
                c++;
                p2.push ({
                    x: c,
                    y: s2
                });
            }
        }
        data.push({
            values: p1,      
            key: 'Player 1 - Match' + (j+1)
            //color: '#7777ff'
        },
        {
            values: p2,      
            key: 'Player 2 - Match' + (j+1)
           // color: '#ff7f0e'
        });
    }
    return data;
}



/*
 * Generate test data
 */
function testData(numLines) {
  return stream_layers(numLines,10+Math.random()*200,.1).map(function(data, i) {
    return {
      key: 'Driver ' + i,
      values: data
    };
  });
}

/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
  if (arguments.length < 3) o = 0;
  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < m; i++) {
      var w = (i / m - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }
  return d3.range(n).map(function() {
      var a = [], i;
      for (i = 0; i < m; i++) a[i] = o + o * Math.random();
      for (i = 0; i < 5; i++) bump(a);
      return a.map(stream_index);
    });
}

/* Another layer generator using gamma distributions. */
function stream_waves(n, m) {
  return d3.range(n).map(function(i) {
    return d3.range(m).map(function(j) {
        var x = 20 * j / m - i / 3;
        return 2 * x * Math.exp(-.5 * x);
      }).map(stream_index);
    });
}

function stream_index(d, i) {
  return {x: i, y: Math.max(0, d)};
}

/**************************************
 * Simple test data generator
 */
function sinAndCos() {
  var sin = [{x:1255585338000, y:8}, {x:1255585398000, y:23}, {x:1255585458000, y:7}, {x:1255585518000, y:32}]
      ,sin2 = [{x:1255585338000,y:26},{x:1255585398000,y:32},{x:1255585458000,y:33},{x:1255585518000,y:19}],
      cos = [{x:1255585338000,y:12},{x:1255585398000,y:5},{x:1255585458000,y:16},{x:1255585518000,y:12}];

  

  //Line chart data should be sent as an array of series objects.
  return [
    {
      values: sin,      //values - represents the array of {x,y} data points
      key: 'Sine Wave', //key  - the name of the series.
      color: '#ff7f0e'  //color - optional: choose your own line color.
    },
    {
      values: cos,
      key: 'Cosine Wave',
      color: '#2ca02c'
    },
    {
      values: sin2,
      key: 'Another sine wave',
      color: '#7777ff'   //area - set to true if you want this line to turn into a filled area chart.
    }
  ];
}

function add()
{
    var container = document.getElementById('graph');
    var match = container.lastElementChild.cloneNode(true);
    
    container.appendChild(match);
}

function remove(button)
{
    var container = document.getElementById('graph');
    
    if(container.childElementCount > 2)
    {
       container.removeChild(button.parentElement.parentElement);
    }
    
    var matchSelect = document.getElementsByClassName("match");
    var c = 0;
    var i;
    for(i = 0; i < matchSelect.length; i++){
       if(matchSelect[i].selectedIndex > 0){
           c++;
       }
    }
    
    var pcanv = document.getElementById('point');
    var acanv = document.getElementById('animation');
    if(pcanv != null){
        pcanv.parentNode.removeChild(pcanv);
        if(acanv != null){
            acanv.parentNode.removeChild(acanv);
        }
    }
    
    drawCircles(c);
    updateGraph(c);
}