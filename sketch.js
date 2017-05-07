"use strict";
document.addEventListener('DOMContentLoaded', init);

var Field = {};
var viscosity = 0.001;
var hGridSize = 160;
var vGridSize = 90;
var resolution = 12;
var sim;
var planes;
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
    for (var i = 0; i < planeData.length; i++) {
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
