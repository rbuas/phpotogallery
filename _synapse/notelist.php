<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "noteget";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$list = Note::GetList($error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($error == NULL) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => $error,
    "notelist" => $list,
    "process" => $processStatus,
]);
?>