<?php
set_include_path( ".." );
require_once("_brain/webkit.php");

$PROCESS = "removeguardian";
$GUARDIAN = "/.guardian";
$error = NULL;

$BRAIN->StartProcess( $PROCESS );

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    if(Brain::HasGuardian( $GUARDIAN ) ) Brain::RemoveGuardian( $GUARDIAN );

}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error ? $error : "Guardian removed.",
    "process" => $processStatus,
]);
?>