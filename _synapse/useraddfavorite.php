<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "useraddfavorite";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;

$user = User::Current();
if(!$user) {
    $error = "Sorry, user not logged.";
} else {
    $slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;

    $user->AddFavorite($slug);
    $user->Save($error);
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : "Favorite '$slug' was add to '$user->email'.",
    "process" => $processStatus,
]);
?>