"use strict";

const DOMAIN = "getPlanes.php";
const AREASIZE = 2.5;
const HAGENBERG_LAT = 48.3687;
const HAGENBERG_LONG = 14.5126;
const VELOCITY_SCALE = 0.1;

var vScale;

function PlaneData()
{

    this.latMin = 0;
    this.latMax = 0;
    this.longMin = 0;
    this.longMax = 0;
    this.lastCheckTime = 0;
    this.lastResponseTime = 0;
    this.startTime = Math.floor(Date.now() / 1000);
    vScale = sim.height / sim.width;

    this.currentPlanes = [];
    this.airports = {};


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(readPosition);
    } else {
        alert("Geolocation is not supported by this browser. Using Hagenberg");
        this.latMin = HAGENBERG_LAT - AREASIZE * vScale;
        this.latMax = HAGENBERG_LAT + AREASIZE * vScale;
        this.longMin = HAGENBERG_LONG - AREASIZE;
        this.longMax = HAGENBERG_LONG + AREASIZE;
        this.loadAirports();
    }

    function readPosition(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        planes.latMin = lat - AREASIZE * vScale;
        planes.latMax = lat + AREASIZE * vScale;
        planes.longMin = long - AREASIZE;
        planes.longMax = long + AREASIZE;
        planes.loadAirports();
    }


    this.getCurrentPlanes = function()
    {
        var timeStamp = Date.now() / 1000;
        if (timeStamp > this.lastCheckTime + 1)
        {
            this.lastCheckTime = timeStamp;
            if (this.latMin != 0)
            {
                var reqTimestamp = Math.floor((this.startTime - 3500) + (timeStamp - this.startTime) * 5);
                this.requestAllData(reqTimestamp);
                drawPlanes(this.currentPlanes);
            }
        }

        return this.currentPlanes;
    }

    this.requestAllData = function(timestamp)
    {
        var myReq = new XMLHttpRequest();

        myReq.onreadystatechange = this.planeDataReceived;

        var s = DOMAIN + "?timestamp=" + timestamp;
        myReq.open("GET", s, true);
        myReq.send();

    }

    this.planeDataReceived = function()
    {
        if (this.readyState == this.DONE && this.status == 200)
        {
            var response = JSON.parse(this.responseText);
            planes.lastResponseTime = response.time;
            planes.analyseResponse(response.states);
        }
    }

    this.analyseResponse = function(states)
    {
        var results = [];
        for (var i = 0; i < states.length; i++) {
            var s = states[i]

            var plane = {}
            plane.adress = s[0];
            plane.long = s[5];
            plane.lat = s[6];
            plane.heading = s[10];
            plane.speed = s[9];

            if (plane.lat != null && plane.long != null)
            {
                if (plane.lat > this.latMin && plane.lat < this.latMax && plane.long > this.longMin && plane.long < this.longMax)
                {
                    if (plane.heading != null)
                    {
                        plane.vX = Math.cos(plane.heading) * VELOCITY_SCALE;
                        plane.vY = Math.sin(plane.heading) * VELOCITY_SCALE;
                    }

                    plane.x = this.scaleLong(plane.long);
                    plane.y = this.scaleLat(plane.lat);


                    results.push(plane);
                }
            }
        }

        this.currentPlanes = results;
    }

    this.loadAirports = function()
    {
        var myReq = new XMLHttpRequest();

        myReq.onreadystatechange = this.airportDataReceived;

        var s = "getAirports.php?latMin=" + this.latMin + "&latMax=" + this.latMax  + "&longMin=" + this.longMin  + "&longMax=" + this.longMax ;
        console.log(s);
        myReq.open("GET", s, true);
        myReq.send();
    }

    this.airportDataReceived = function()
    {
        if (this.readyState == this.DONE && this.status == 200)
        {
            var response = JSON.parse(this.responseText);
            planes.airports = response;
        }
    }

    this.scaleLong = function(long)
    {
        return Math.floor(((long - this.longMin) / (this.longMax - this.longMin)) * sim.width);
    }

    this.scaleLat = function(lat)
    {
        return Math.floor( (1 - ( (lat - this.latMin) / (this.latMax - this.latMin) ) ) * sim.height );
    }
}
