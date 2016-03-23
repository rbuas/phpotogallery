<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "userretrievepassword";
$BRAIN->StartProcess( $PROCESS );

$email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : NULL;

$response = User::RetrievePassword($email, $error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($response) ? "An email was send to user $email." : $error,
    "process" => $processStatus,
]);
?>