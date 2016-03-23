<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "userlogin";
$BRAIN->StartProcess( $PROCESS );

$email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : NULL;
$password = isset($_REQUEST["password"]) ? $_REQUEST["password"] : NULL;

$user = User::Load($email, $error);
$response = ($user) ? $user->Login($password, $error) : false;

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($response) ? "User $email was logged." : $error,
    "user" => ($response && $user) ? $user->Info() : NULL,
    "process" => $processStatus,
]);
?>