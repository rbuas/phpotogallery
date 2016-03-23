<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "noteget";
$BRAIN->StartProcess( $PROCESS );

$noteid = isset($_REQUEST["note"]) ? $_REQUEST["note"] : NULL;

$error = NULL;

$route = $BRAIN->GetRoute(NOTES_PATH);
$user = User::Current();
$note = new Note($noteid, $error);

if(!$note->exists) {
    if( $user == NULL 
        || $user->email == NULL 
        || $route == NULL 
        || $route["MASTER"] == NULL 
        || !in_array($user->email, $route["MASTER"]) ) {
        $error = "Note $noteid doesn't exist.";
    }
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($error == NULL) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => $error,
    "note" => ($error == NULL) ? $noteid : NULL,
    "notecontent" => ($error == NULL) ? $note->content : NULL,
    "process" => $processStatus,
]);
?>