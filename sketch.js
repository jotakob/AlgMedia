"use strict";
var Field = {};
var viscosity = 0.001;
var hGridSize = 112;
var vGridSize = 64;
var resolution = 16;
var sim;
var planes;

function setup()
{
    noStroke();
    frameRate(30);
    createCanvas(hGridSize * resolution, vGridSize * resolution);
    sim = new Simulator(hGridSize, vGridSize, width, height);
    planes = new PlaneData();
    planes.requestAllData(Date().now);
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
            dens = 0.2;
        }
        else if (mouseButton == RIGHT)
        {
            dens = -0.2;
        }
        var x = constrain(mouseX, 0, width-1);
        var y = constrain(mouseY, 0, height-1);
        var s = new Source(x, y, 0, 0, dens);
        sources.push(s);
    }
    return sources;
}
