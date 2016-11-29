<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "usercurrent";
$BRAIN->StartProcess( $PROCESS );

$user = User::Current();

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => STATUS_SUCCESS,
    "status_message" => ($user) ? "User $user->email logged." : "There isn't any user logged in this session.",
    "user" => ($user) ? $user->Info() : NULL,
    "process" => $processStatus,
]);
?>