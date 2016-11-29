<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "userlogout";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;
$user = User::Current();
$response = ($user) ? $user->Logout($error) : false;

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($response) ? "User $user->email was unlogged." : $error,
    "process" => $processStatus,
]);
?>