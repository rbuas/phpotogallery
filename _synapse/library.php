<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "library";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$library = MediaLibrary::GetLibrary();

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => $error,
    "library" => (!$error) ? $library : NULL,
    "process" => $processStatus,
]);
?>