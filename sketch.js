"use strict";
document.addEventListener('DOMContentLoaded', init);

var Field = {};
var viscosity = 0.001;
var hGridSize = 160;
var vGridSize = 90;
var resolution = 12;
var sim;
var planes;
var lastPlanePositions = {};
var planeCanvas;
var mode = 0;
var showAirports = false;
var DENSITY_SCALE = 0.1;
var cC1, cC2;
var showSmallAirports = true;

var GRID_WHITENESS = "16%";
var GRID_BLACKNESS = "8%";
var HUE_WIDTH = 1.5;
var HUE_SCALE = 180; //default 360
var TRAIL_LENGTH = 200;

function init()
{
    var w = hGridSize * resolution;
    var h = vGridSize * resolution;
    cC1 = document.getElementById("canvasContainer1");
    cC2 = document.getElementById("canvasContainer2");
    cC1.innerHTML = "<canvas id='fluidCanvas' width=" + w + " height=" + h + ">";
    cC2.innerHTML = "<canvas id='planeCanvas' width=" + w + " height=" + h + ">";
    planeCanvas = document.getElementById("planeCanvas").getContext("2d");
    sim = new Simulator(hGridSize-2, vGridSize-2, w+1, h+1);
    planes = new PlaneData();

    window.requestAnimationFrame(update);
}

function update()
{

    sim.step()

    window.requestAnimationFrame(update);
}

function modeButtonClick()
{
    var bgc;
    mode++;
    console.log("New Mode: " + mode)
    switch (mode) {
        case 0:
            cC1.style.display = 'block';
            cC2.style.display = 'none';
            showAirports = false;
            bgc = "#ee2222";
            break;
        case 1:
            cC1.style.display = 'block';
            cC2.style.display = 'block';
            showAirports = false;
            bgc = "#670035";
            break;
        case 2:
            cC1.style.display = 'block';
            cC2.style.display = 'block';
            showAirports = true;
            bgc = "#f6bf1a";
            break;
        case 3:
            cC1.style.display = 'none';
            cC2.style.display = 'block';
            showAirports = true;
            bgc = "#289915";
            break;
        case 4:
            cC1.style.display = 'none';
            cC2.style.display = 'block';
            showAirports = false;
            bgc = "#517e8c";
            break;
        default:
            mode = 0;
            cC1.style.display = 'block';
            cC2.style.display = 'none';
            showAirports = false;
            bgc = "#ee2222";
            break;

    }
    var btn = document.getElementById("modeButton");
    btn.style.backgroundColor = bgc;
}

function getSources()
{
    var sources = [];

    var planeData = planes.getCurrentPlanes();
    for (var i = 0; i < planeData.length; i++)
    {
        var p = planeData[i];
        var n = parseInt(p.adress, 16);
        var sum = 0;
        while (n>0)
        {
            sum += n % 10;
            n = Math.floor(n/10);
        }
        var dens = (sum%2 == 0) ? -1 : 1;
        var src = new Source(p.x, p.y, 0, 0, dens * DENSITY_SCALE * (p.speed/140));
        sources.push(src);
    }

    return sources;
}

function drawAirports(ctx)
{
    ctx.font = "10px 'Lucida Console'";
    for (var key in planes.airports)
    {
        if (!planes.airports.hasOwnProperty(key)) {continue;}

        var airport = planes.airports[key];

        if (showSmallAirports || airport.type != "small_airport")
        {
            for (var i = 0; i < airport.runways.length; i++) {
                var rW = airport.runways[i];
                ctx.beginPath();
                ctx.strokeStyle="#BBBBBB";
                ctx.lineWidth = 3;
                var long1 = planes.scaleLong(rW.x1);
                var lat1 = planes.scaleLat(rW.y1);
                var long2 = planes.scaleLong(rW.x2);
                var lat2 = planes.scaleLat(rW.y2);
                ctx.moveTo(long1, lat1);
                ctx.lineTo(long2, lat2);
                ctx.stroke();
            }

            ctx.fillText(airport.code, planes.scaleLong(airport.long), planes.scaleLat(airport.lat) -2);
        }
    }

}

function drawPlanes(planeData)
{
    var ctx = planeCanvas;
    ctx.clearRect(0, 0, sim.width, sim.height);
    if (showAirports)
    {
        drawAirports(ctx);
    }
    for (var i = 0; i < planeData.length; i++)
    {

        var p = planeData[i];
        var n = p.adress;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(p.x - 4/2, p.y - 4/2, 4, 4);
        if (! (n in lastPlanePositions))
        {
            lastPlanePositions[n] = [];
        }

        lastPlanePositions[n].push([p.x, p.y]);
    }

    for (var key in lastPlanePositions) {
        if (!lastPlanePositions.hasOwnProperty(key)) {continue;}

        var pos = lastPlanePositions[key];
        for (var i = 0; i < pos.length; i++) {
            if (i == 0)
            {
                continue;
            }
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(255,255,255," + (1- ((pos.length - i) * (1/TRAIL_LENGTH) )) + ")";
            ctx.moveTo(pos[i-1][0], pos[i-1][1]);
            ctx.lineTo(pos[i][0], pos[i][1]);
            ctx.stroke();
        }
    }
}
