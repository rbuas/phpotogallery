<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "userconfirm";
$BRAIN->StartProcess( $PROCESS );

$email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : NULL;
$token = isset($_REQUEST["token"]) ? $_REQUEST["token"] : NULL;

$user = User::Load($email, $error);
$response = ($user) ? $user->Confirm($token, $error) : false;

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($response) ? "User $email confirmed." : $error,
    "process" => $processStatus,
]);
?>