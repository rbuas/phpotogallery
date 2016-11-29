<?php
set_include_path( ".." );
require_once("_brain/webkit.php");

$PROCESS = "reset";
$GUARDIAN = "/building.guardian";

$BRAIN->StartProcess( $PROCESS );

$error = false;

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {
    $date = new DateTime();
    Brain::Version($date->format("YmdHi"));
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error ? $error : "cache was reset",
    "process" => $processStatus,
]);
?>