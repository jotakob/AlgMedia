<?php

/*if (!isset($_GET["latMin"]) || !isset($_GET["latMax"]) || !isset($_GET["longMin"]) || !!isset($_GET["longMax"]))
{
    $airportData = array_map('str_getcsv', file('airports.csv'));
    array_shift($airportData);
    echo(json_encode($airportData));
}
else*/
{
    /*$airportData = array_map('str_getcsv', file('airports.csv'));
    array_shift($airportData);*/

    $latMin = $_GET["latMin"];
    $latMax = $_GET["latMax"];
    $longMin = $_GET["longMin"];
    $longMax = $_GET["longMax"];

    $airports = [];

    $handle = fopen("airports.csv", "r");
    if ($handle) {
        while (($csvLine = fgets($handle)) !== false) {
            $line = str_getcsv($csvLine);
            $lat = $line[4];
            $long = $line[5];
            if ($lat > $latMin && $lat < $latMax && $long > $longMin && $long < $longMax && $line[2] != "heliport")
            {
                $airport = [];
                $airport['lat'] = $lat;
                $airport['long'] = $long;
                $airport['code'] = ( ($line[13] != '') ? $line[13] : $line[12]);
                $airport['runways'] = [];
                $airports[$line[0]] = $airport;
            }
        }

        fclose($handle);
    } else {
        // error opening the file.
    }

    /*foreach ($airportData as $line)
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
    }*/

    $runwayData = array_map('str_getcsv', file('runways.csv'));
    array_shift($runwayData);

    foreach ($runwayData as $line)
    {
        $id = $line[1];
        if (array_key_exists($id, $airports))
        {
            $runway = [];
            $runway['x1'] = $line[9];
            $runway['y1'] = $line[10];
            $runway['x2'] = $line[15];
            $runway['y2'] = $line[16];

            array_push($airports[$id]['runways'], $runway);
        }
    }

	$out = json_encode($airports);
	echo $out;
}

 ?>
