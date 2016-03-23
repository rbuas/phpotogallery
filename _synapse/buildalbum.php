<?php
set_include_path( ".." );
require_once("_brain/brainweb.php");

$PROCESS = "buildalbum";

$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$success = NULL;

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    $slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;
    $force = isset($_REQUEST["force"]) ? $_REQUEST["force"] : true;
    $wac = MediaLibrary::BuildAlbum($slug, MEDIALIBRARY . "/" . $slug . "/", MEDIALIBRARY, ALBUM, $force);
    if(!$wac)
        $error = "Sorry, can not build album $slug";
    else
        $success = "album $slug was build";
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $error!= NULL ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $error != NULL ? $error : $success,
    "process" => $processStatus,
    "wac" => $wac,
]);
?>