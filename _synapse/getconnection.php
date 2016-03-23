<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "get_connection";
global $BRAIN;
$BRAIN->StartProcess( $PROCESS );
$error = NULL;

$slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;
if($slug) {
    $access = $BRAIN->GetAccess($slug);
    $route = $BRAIN->GetRoute($slug);
    if(!$route) $error = "Can not find route.";
} else {
    $route = $BRAIN->Memory("route");
    $access = $BRAIN->Memory("access");
    $slug = isset($access["slug"]) && $access["slug"];
}
$lang = $BRAIN->Lang();

$user = User::Current();
$userInfo = ($user) ? $user->Info() : NULL;
$hasPassword = ($user) ? $user->HasPassport($slug) : false;
$isPrivate = isset($route["PRIVATE"]) ? $route["PRIVATE"] : false;

if( $isPrivate && !$hasPassword ) {
    $error = "Private page ($slug).";
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : NULL,
    "route" => (!$error) ? $route : NULL,
    "user" => $userInfo,
    "lang" => $lang,
    "access" => (!$error) ? $access : NULL,
    "process" => $processStatus,
]);
?>