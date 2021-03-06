<?php
set_include_path('..');
require_once("_brain/webkit.php");

$error = NULL;
$authorization = false;
$PROCESS = "media";
$BRAIN->StartProcess( $PROCESS );

$media = $_GET["m"];
$file = ServerGetFile("/_skin/$media");
$referer = isset($_SERVER["HTTP_REFERER"]) ? $_SERVER["HTTP_REFERER"] : null;
$authorized = array("rbuas.com", "dev.rbuas.com");
$validfiles = array(
    "image/jpeg", 
    "image/jpg", 
    "image/png", 
    "image/gif",
    'video/x-flv',
    'video/mp4',
    'application/x-mpegURL',
    'video/MP2T',
    'video/3gpp',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv'
);
$filetype = NULL;
if($file != NULL) {
    $filetype = FileGetType($file);
    $acceptable = in_array($filetype, $validfiles);
    $authorization = $acceptable;
    $authorization &= ($referer != NULL || in_array($referer, $authorized));
    $authorization |= $media == "rbuas-logo.png" || $media == "cam.png";
}
$processStatus = $BRAIN->EndProcess( $PROCESS );

// echo("FILE : $file <br/>");
// echo("FILETYPE : $filetype <br/>");
// echo("AUTH : $authorization <br/>");
// echo("ERROR : $error <br/>");

if($authorization) {
    header("Content-type: $filetype");
    header("Pragma: cache");
    header("Cache-Control: max-age=3600, must-revalidate");
    echo file_get_contents($file);
}
else
{
    header("Location: /index.php?access=denied&media=$media");
}
exit;
?>