<?php

if (isset($_GET["latMin"]) && isset($_GET["latMax"]) && isset($_GET["longMin"]) && isset($_GET["longMax"]))
{
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
                $airport['lat'] = (float)$lat;
                $airport['long'] = (float)$long;
                $airport['code'] = ( ($line[13] != '') ? $line[13] : $line[12]);
                $airport['type'] = $line[2];
                $airport['runways'] = [];
                $airports[$line[0]] = $airport;
            }
        }

        fclose($handle);
    } else {
        // error opening the file.
    }

    $handle = fopen("runways.csv", "r");
    if ($handle) {
        while (($csvLine = fgets($handle)) !== false)
        {
            $line = str_getcsv($csvLine);
            $id = $line[1];
            if (array_key_exists($id, $airports))
            {
                $runway = [];
                $runway['y1'] = (float)$line[9];
                $runway['x1'] = (float)$line[10];
                $runway['y2'] = (float)$line[15];
                $runway['x2'] = (float)$line[16];

                array_push($airports[$id]['runways'], $runway);
            }
        }
        fclose($handle);
    } else {
        // error opening the file.
    }

	$out = json_encode($airports);
	echo $out;
}
else
{
    echo("Error with the GET-Parameters");
    $airportData = array_map('str_getcsv', file('airports.csv'));
    array_shift($airportData);
    echo(json_encode($airportData));
}


?>
