<?php

header('Content-Type: application/json');

$lat = $_GET['lat'];
$lng = $_GET['lng'];


$url = 'http://api.met.no/weatherapi/locationforecast/1.9/?lat='.$lat.';lon='.$lng;

$ch = curl_init(); 
curl_setopt($ch, CURLOPT_URL, $url); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
$output = curl_exec($ch); 
curl_close($ch); 

$xml = simplexml_load_string($output);
$json = json_encode($xml);
$array = json_decode($json,TRUE);

echo $json;