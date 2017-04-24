"use strict";
var Field = {};
var viscosity = 0.001;
var hGridSize = 150;
var vGridSize = 80;
var resolution = 12;
var sim;
var planes;
var DENSITY_SCALE = 0.1;

var GRID_WHITENESS = "16%";
var GRID_BLACKNESS = "8%";
var HUE_WIDTH = 1.5;
var HUE_SCALE = 180; //default 360

function setup()
{
    noStroke();
    frameRate(10);
    createCanvas(hGridSize * resolution, vGridSize * resolution);
    sim = new Simulator(hGridSize, vGridSize, width, height);
    planes = new PlaneData();
}

function draw()
{

    sim.step()

}

function windowResized()
{
    //resizeCanvas(windowWidth, windowHeight)
}


function getSources()
{
    var sources = [];
    if (mouseIsPressed) {
        var dens = 0;
        if (mouseButton == LEFT)
        {
            dens = 0.1;
        }
        else if (mouseButton == RIGHT)
        {
            dens = -0.1;
        }
        var x = constrain(mouseX, 0, width-1);
        var y = constrain(mouseY, 0, height-1);
        var s = new Source(x, y, 0, 0, dens);
        sources.push(s);
    }

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
