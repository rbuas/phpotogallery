<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "notesave";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$response = false;
$route = $BRAIN->GetRoute(NOTES_PATH);
$user = User::Current();

if( $user == NULL 
    || $user->email == NULL 
    || $route == NULL 
    || $route["MASTER"] == NULL 
    || !in_array($user->email, $route["MASTER"]) ) {
    $error = "Master not logged.";
    $response = false;
}

if($error == NULL) {
    $noteid = isset($_REQUEST["note"]) ? $_REQUEST["note"] : NULL;
    $content = isset($_REQUEST["content"]) ? $_REQUEST["content"] : NULL;

    $note = new Note( $noteid, $error );
    $response = ($error == NULL) ? $note->Save($content, $error) : false;
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($response) ? "Note $noteid was updated." : $error,
    "note" => ($response) ? $noteid : NULL,
    "notecontent" => ($response) ? $note->content : NULL,
    "process" => $processStatus,
]);
?>