<?php
set_include_path( ".." );
require_once("_brain/brainweb.php");

$PROCESS = "admin";

$BRAIN->StartProcess( $PROCESS );

$error = NULL;

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

   $usersList = User::GetList();
   $catalog = MediaLibrary::GetLibrary();

}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error ? $error : NULL,
    "userlist" => $error ? NULL : $usersList,
    "catalog" => $error ? NULL : $catalog,
    "process" => $processStatus,
]);
?>