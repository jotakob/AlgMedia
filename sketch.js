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
var DENSITY_SCALE = 0.1;

var GRID_WHITENESS = "16%";
var GRID_BLACKNESS = "8%";
var HUE_WIDTH = 1.5;
var HUE_SCALE = 180; //default 360

function init()
{
    var w = hGridSize * resolution;
    var h = vGridSize * resolution;
    var cC1 = document.getElementById("canvasContainer1");
    var cC2 = document.getElementById("canvasContainer2");
    cC1.innerHTML = "<canvas id='fluidCanvas' width=" + w + " height=" + h + ">";
    cC2.innerHTML = "<canvas id='planeCanvas' width=" + w + " height=" + h + ">";
    planeCanvas = document.getElementById("planeCanvas").getContext("2d");
    drawAirports();
    sim = new Simulator(hGridSize-2, vGridSize-2, w+1, h+1);
    planes = new PlaneData();

    window.requestAnimationFrame(update);
}

function update()
{

    sim.step()

    window.requestAnimationFrame(update);
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

function drawAirports()
{

}

function drawPlanes(planeData)
{
    console.log("Planes!")
    var ctx = planeCanvas;
    ctx.clearRect(0, 0, sim.width, sim.height);
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
            ctx.strokeStyle = "rgba(255,255,255," + (1- ((pos.length - i) * 0.1)) + ")";
            ctx.moveTo(pos[i-1][0], pos[i-1][1]);
            ctx.lineTo(pos[i][0], pos[i][1]);
            ctx.stroke();
        }
    }
}
