<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "connect";
global $BRAIN;
$BRAIN->StartProcess( $PROCESS );
$error = NULL;

$lang = $BRAIN->Lang();
$user = User::Current();
$userInfo = ($user) ? $user->Info() : NULL;
$ctype = isset($_REQUEST["ctype"]) ? $_REQUEST["ctype"] : "S"; //S (static) | M (memos) | N (notes)
$slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;
$route = null;

//STATIC PROCCESS
if($slug) {
    $access = $BRAIN->GetAccess($slug);
    $route = $BRAIN->GetRoute($slug);
    if(!$route) $error = "Can not find route.";
} else {
    $access = $BRAIN->Memory("access");
    $route = $BRAIN->Memory("route");
    $slug = isset($access["slug"]) && $access["slug"];
}
$isPrivate = ($route && isset($route["PRIVATE"])) ? $route["PRIVATE"] : false;
$hasPassport = ($user) ? $user->HasPassport($slug) : false;


//DINAMIC PROCCESS

if(!$route && $ctype == "N") {
    $memo = Memo::Connect($slug, $user, $error);
    if( $memo->exists || $memo->IsHome() ) {
        $error = NULL;
        $isPrivate = true;
        $hasPassport = $memo->HasPassport($user);
    }
    $memodata = $memo->GetData();
}

if( $isPrivate && !$hasPassport ) {
    $error = "Private page ($user->uid : $slug).";
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : NULL,
    "route" => (!$error) ? $route : NULL,
    "user" => $userInfo,
    "memo" => $hasPassport ? $memodata : NULL,
    "ctype" => $ctype,
    "lang" => $lang,
    "slug" => $slug,
    "access" => (!$error) ? $access : NULL,
    "process" => $processStatus,
]);
?>