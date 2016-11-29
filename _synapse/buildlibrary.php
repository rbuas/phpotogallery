<?php
set_include_path( ".." );
require_once("_brain/webkit.php");

$PROCESS = "buildlibrary";
$GUARDIAN = "/building.guardian";

$BRAIN->StartProcess( $PROCESS );

$error = [];

$master = User::Current();
if(!$master || $master->email != MASTER) {
    $error = "Sorry, not authorized operation.";
} else {

    Brain::PushGuargian( $GUARDIAN , "building site, please F5." ); 

    //build htaccess
    if( !$BRAIN->BuildHTAccess() )
       $error[] = "Error on build htaccess file.";

    //build config.jsc
    if( !$BRAIN->BuildConfigFile() )
       $error[] = "Error on build config file.";

    //build sitemap.jsc
    if( !$BRAIN->BuildRouteMap() )
       $error[] = "Error on build route map.";

    //build robots.txt
    if( !$BRAIN->BuildRobotsFile() ) {
        $error[] = "Error on BuildRobotsFile";
    }

    //build sitemap.xml
    if( !$BRAIN->BuildSitemap() )
        $error[] = "Error on build Sitemap.";

    //build rss
    $feedList = $BRAIN->Config("FEED");
    if($feedList) {
        foreach ($feedList as $feed => $category) {
            if( !$BRAIN->BuildRSS( "/$feed.rss", $category ) )
                $error[] = "Error on build RSS ($feed : $category)";
        }
    }

    $date = new DateTime();
    Brain::Version($date->format("YmdHi"));

    Brain::RemoveGuardian( $GUARDIAN );

}

$errorCount = count($error);

$processStatus = $BRAIN->EndProcess( $PROCESS );

$BRAIN->Response([
    "status" => $errorCount > 0 ? STATUS_ERROR : STATUS_SUCCESS,
    "status_message" => $errorCount > 0 ? $error : "site was build",
    "process" => $processStatus,
]);
?>