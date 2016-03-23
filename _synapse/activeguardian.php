<?php

set_include_path( ".." );
require_once("_brain/brainweb.php");

$PROCESS = "activeguardian";
$GUARDIAN = "/.guardian";
$error = NULL;

$BRAIN->StartProcess( $PROCESS );

$text = isset($_REQUEST["text"]) ? $_REQUEST["text"] : NULL;

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    Brain::PushGuargian( $GUARDIAN , $text ); 

}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error ? $error : "Guardian actived.",
    "process" => $processStatus,
]);
?>