<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "album";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;

list($album, $index) = MediaLibrary::GetAlbum($slug, $error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : NULL,
    "album" => (!$error) ? $album : NULL,
    "albumindex" => (!$error) ? $index : NULL,
    "process" => $processStatus,
]);
?>