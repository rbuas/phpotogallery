<?php
set_include_path( ".." );
require_once("_brain/brainweb.php");

$PROCESS = "sendmail";

$BRAIN->StartProcess( $PROCESS );

$error = [];

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    $to = isset($_REQUEST["to"]) ? $_REQUEST["to"] : NULL;
    $subject = isset($_REQUEST["subject"]) ? $_REQUEST["subject"] : NULL;
    $content = isset($_REQUEST["content"]) ? $_REQUEST["content"] : NULL;

    MailFactory::Send($to, $subject, $content);
}

$errorCount = count($error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $errorCount > 0 ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $errorCount > 0 ? $error : "Mail was send",
    "process" => $processStatus,
]);
?>