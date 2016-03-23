<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "usercreate";
$BRAIN->StartProcess( $PROCESS );

$email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : NULL;
$password = isset($_REQUEST["password"]) ? $_REQUEST["password"] : NULL;
$lang = isset($_REQUEST["lang"]) ? $_REQUEST["lang"] : NULL;
$news = isset($_REQUEST["news"]) ? $_REQUEST["news"] : NULL;

$user = User::CreateUser($email, $password, $news, $lang, $error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => ($user) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($user) ? "User $email was create" : $error,
    "user" => ($user) ? $user->Info() : NULL,
    "process" => $processStatus,
]);
?>