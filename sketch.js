"use strict";
var Field = {};
var viscosity = 0.001;
var hGridSize = 112;
var vGridSize = 64;
var resolution = 16;
var sim;

function setup()
{
    noStroke();
    frameRate(30);
    createCanvas(hGridSize * resolution, vGridSize * resolution);
    sim = new Simulator(hGridSize, vGridSize, width, height);
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
        var x = constrain(mouseX, 0, width-1);
        var y = constrain(mouseY, 0, height-1);
        var s = new Source(x, y, 0, 0);
        sources.push(s);
    }
    return sources;
}
