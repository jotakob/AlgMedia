<?php

if (!isset($_GET["latMin"]) || !isset($_GET["latMax"]) || !isset($_GET["longMin"]) || !!isset($_GET["longMax"]))
{

}
else
{
    $airportData = array_map('str_getcsv', file('airports.csv'));
    $runwayData = array_map('str_getcsv', file('runways.csv'));
    array_shift($airportData);
    array_shift($runwayData);

    $latMin = $_GET["latMin"];
    $latMax = $_GET["latMax"];
    $longMin = $_GET["longMin"];
    $longMax = $_GET["longMax"];

    $airports = [];

    foreach ($airportData as $line)
    {
        $lat = $line[4];
        $long = $Line[5];
        if ($lat > $latMin && $lat < $latMax && $long > $minLong && $long < $maxLong)
        {
            $airport = [];
            $airport['lat'] = $lat;
            $airport['long'] = $long;
            $airport['code'] = ( ($line[13] != '') ? $line[13] : $line[14]);
            $airport['runways'] = [];
            $airports[$line[0]] = $airport;
        }
    }

    foreach ($runwayData as $line)
    {
        $id = $line[1];
        if (array_key_exists(id, $airports))
        {
            $runway = [];

            array_push($airports[id]['runways'], $runway);
        }
    }

 ?>
