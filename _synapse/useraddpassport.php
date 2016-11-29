<?php
set_include_path('..');
require_once("_brain/webkit.php");

$PROCESS = "useraddpassport";
$BRAIN->StartProcess( $PROCESS );

$error = NULL;

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation ($master->email).";
} else {
    $email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : NULL;
    $slug = isset($_REQUEST["slug"]) ? $_REQUEST["slug"] : NULL;

    $user = User::Load($email, $error);
    if($user) {
        $user->AddPassport($slug);
        $user->Save($error);
    }
}

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => ($error) ? $error : "Passport '$slug' was add to '$user->email'.",
    "process" => $processStatus,
]);
?>