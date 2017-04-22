<?php

error_reporting(E_ERROR | E_PARSE);

$USERPASS = "jmendels:U6hcymfTRStyRKsC";
$DOMAIN = "https://opensky-network.org/api/states/all";

$timeout = 30;
$ret = "";
$url= isset($_GET["timestamp"]) ? $DOMAIN."?time=".$_GET["timestamp"] : $DOMAIN;
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);
curl_setopt($curl, CURLOPT_MAXREDIRS, 20);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, $timeout);
curl_setopt($curl, CURLOPT_USERPWD, $USERPASS);
curl_setopt($curl, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
$text = curl_exec($curl);
if ($text === false)
{
    echo "Curl Failed: ";
    echo curl_error($curl);
}
echo $text;

?>
