<?php
set_include_path( ".." );
require_once("_brain/brainweb.php");

$PROCESS = "cleansite";
$GUARDIAN = "/building.guardian";
$error = NULL;

$BRAIN->StartProcess( $PROCESS );

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    Brain::PushGuargian( $GUARDIAN , "building site, please F5." ); 

    $BRAIN->Clean($error);

    Brain::RemoveGuardian( $GUARDIAN );

}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error ? $error : "site was clean",
    "process" => $processStatus,
]);
?>