"use strict";

const DOMAIN = "getPlanes.php";
const AREASIZE = 5;
const HAGENBERG_LAT = 48.3687;
const HAGENBERG_LONG = 14.5126;
const VELOCITY_SCALE = 0.1;

function PlaneData()
{

    this.latMin = 0;
    this.latMax = 0;
    this.longMin = 0;
    this.longMax = 0;
    this.lastCheckTime = 0;
    this.lastResponseTime = 0;
    this.startTime = Math.floor(Date.now() / 1000);

    this.currentPlanes = [];


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser. Using Hagenberg");
        latMin = HAGENBERG_LAT - AREASIZE;
        latMax = HAGENBERG_LAT + AREASIZE;
        longMin = HAGENBERG_LONG - AREASIZE;
        longMax = HAGENBERG_LONG + AREASIZE;
    }

    function showPosition(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        planes.latMin = lat - AREASIZE;
        planes.latMax = lat + AREASIZE;
        planes.longMin = long - AREASIZE;
        planes.longMax = long + AREASIZE;
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
            }
        }

        return this.currentPlanes;
    }

    this.requestAllData = function(timestamp)
    {
        var myReq = new XMLHttpRequest();

        myReq.onreadystatechange = function()
        {
            if (this.readyState == this.DONE && this.status == 200)
            {
                var response = JSON.parse(this.responseText);
                planes.lastResponseTime = response.time;
                planes.analyseResponse(response.states);
            }
        }

        var s = DOMAIN + "?timestamp=" + timestamp;
        myReq.open("GET", s, true);
        myReq.send();

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

            if (plane.lat != null && plane.long != null)
            {
                if (plane.lat > this.latMin && plane.lat < this.latMax && plane.long > this.longMin && plane.long < this.longMax)
                {
                    if (plane.heading != null)
                    {
                        plane.vX = cos(plane.heading) * VELOCITY_SCALE;
                        plane.vY = sin(plane.heading) * VELOCITY_SCALE;
                    }

                    plane.x = Math.floor((plane.long - this.longMin) / (2*AREASIZE) * width);
                    plane.y = Math.floor((plane.lat - this.latMin) / (2*AREASIZE) * height);


                    results.push(plane);
                }
            }
        }

        this.currentPlanes = results;
    }

}
