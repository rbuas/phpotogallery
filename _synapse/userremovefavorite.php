<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "userremovefavorite";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;

$user = User::Current();
if(!$user) {
    $error = "Sorry, user not logged.";
} else {
    $slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;

    $user->RemoveFavorite($slug);
    $user->Save($error);
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : "Passport '$slug' was remove to '$user->email'.",
    "process" => $processStatus,
]);
?>