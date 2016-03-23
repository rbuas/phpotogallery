<?php
set_include_path('..');
require_once("_brain/brainweb.php");

$PROCESS = "setlang";
$BRAIN->StartProcess( $PROCESS );

$lang = isset($_REQUEST["lang"]) ? $_REQUEST["lang"] : NULL;
if( $BRAIN->Lang($lang, $error) ) {
    if( $user = User::Current() ) {
        $user->lang = $lang;
        $user->Save($error);
    }
}
$lang = $BRAIN->Lang();
$successMessage = ($lang) ? "Language $lang confirmed." : "No current lang.";

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => (!$error) ? STATUS_SUCCESS : STATUS_ERROR,
    "status_message" => (!$error) ? $successMessage : $error,
    "lang" => (!$error) ? $lang : NULL,
    "process" => $processStatus,
]);
?>