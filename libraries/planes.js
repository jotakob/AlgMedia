"use strict";

var USERNAME = "jmendels";
var PASSWORD = "U6hcymfTRStyRKsC"
var DOMAIN = "https://opensky-network.org/api/states/all";


function PlaneData()
{


    this.requestAllData = function(timestamp)
    {
        var myReq = new XMLHttpRequest();

        myReq.onreadystatechange = function()
        {
            if (this.readyState == this.DONE)
            {
                alert(this.responseText);
            }
        }

        var s = DOMAIN + "?time=" + timestamp;
        myReq.open("GET", s, true, USERNAME, PASSWORD);
        myReq.send();

    }

}
