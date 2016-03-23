<?php
ini_set('display_errors', '1');
error_reporting( E_ALL );
set_time_limit(30);
set_include_path('.');


require_once("_brain/brainweb.php");

if(isset($_REQUEST["access"])) {
    echo("oops!");
}

if(!$BRAIN->Access($error)) {
    echo($error);
    return;
}
$version = $BRAIN->Version();
?>
<!DOCTYPE html>
<html lang="en" data-ng-app="CortexModule">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <base href="/">
        <link rel="icon" href="/mediaskin/cam.png">

        <title>rbuas</title>
        <meta name="description" content="" />
        <meta name="author" content="" />
        <meta name="canonical" content="" />
        <meta http-equiv="imagetoolbar" content="no" />

        <meta property="og:image" content="/mediaskin/logo.png"/>
        <meta property="og:title" content=""/>
        <meta property="og:description" content="" />
        <meta property="og:url" content=""/>
        <meta property="og:site_name" content=""/>
        <meta property="og:type" content=""/>
    </head>
    <body data-ng-controller="NeuroneMaster as master">
        <section class="container {{master.slug}} containerfadein" 
                 data-ng-include="master.skeleton('backbone')"
                 data-ng-class="{fadein : !master.inconnection()}"></section>

        <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css' />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.1.0/css/swiper.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.6.0/fullcalendar.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.6.0/fullcalendar.print.css" media="print" />
        <!--[if lt IE 9]>
            <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
            <script src="/_cortex/ie-fix.js"></script>
        <![endif]-->

        <!-- Bootstrap -->
        <!--<link href="/_skin/bootstrap.min.css" rel="stylesheet">-->
        <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">-->
        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->
        <link rel="stylesheet" href="/_skin/skin.css" />

        <!-- JQuery -->
        <!-- <script src="/_cortex/jquery.min.js" type="text/javascript"></script>
        <script src="/_cortex/jquery.min.js" type="text/javascript"></script>
        <script src="http://code.jquery.com/jquery-2.1.1.js" type="text/javascript"></script>-->
        <script src="http://code.jquery.com/jquery-2.1.1.min.js" type="text/javascript"></script>
        <!--<script src="https://code.jquery.com/ui/1.11.1/jquery-ui.js" type="text/javascript"></script>-->
        <script src="http://code.jquery.com/ui/1.11.1/jquery-ui.min.js" type="text/javascript"></script>
        <script src="/_ext/jquery.focuspoint.min.js" type="text/javascript"></script>
        <script src="/_ext/promise.min.js" type="text/javascript"></script>


        <!-- Bootstrap -->
        <!--<script src="/_cortex/bootstrap.min.js"></script>-->
        <!--script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script-->

        <!-- Angular -->
        <!-- //ajax.googleapis.com/ajax/libs/angularjs/1.4.6/ -->
        <!-- //code.angularjs.org/1.4.6/ -->
        <script src="http://code.angularjs.org/1.4.6/angular.min.js" type="text/javascript"></script>
        <script src="http://code.angularjs.org/1.4.6/angular-route.js" type="text/javascript"></script>
        <script src="http://code.angularjs.org/1.4.6/angular-sanitize.min.js" type="text/javascript"></script>
        <script src="http://code.angularjs.org/1.4.6/angular-touch.js" type="text/javascript"></script>

        <!-- Swipper -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.1.0/js/swiper.min.js" type="text/javascript"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.1.0/js/swiper.jquery.min.js" type="text/javascript"></script>

        <!-- Calendar -->
        <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js" type="text/javascript"></script> -->
        <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.6.0/fullcalendar.min.js" type="text/javascript"></script> -->

        <!-- CORTEX -->
        <script src="/_cortex/extensions.js" type="text/javascript"></script>
        <script src="/_cortex/core.js" type="text/javascript"></script>
        <script src="/_cortex/tracer.js" type="text/javascript"></script>
        <script src="/_cortex/clientstorage.js" type="text/javascript"></script>
        <script src="/_cortex/clientdata.js" type="text/javascript"></script>

        <script src="/_cortex/synapse.js" type="text/javascript"></script>
        <script src="/_cortex/cortex.js" type="text/javascript"></script>

        <script type="text/javascript">
            (function ($, Cortex) {
                cortex = new Cortex({version:"<?= $version ?>", memoryPath : "<?= MEDIALIBRARY ?>"});
            })(jQuery, Cortex);
        </script>

        <script src="/_cortex/neurone_route.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_master.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_admin.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_user.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_medialist.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_album.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_library.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_notes.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_imageload.js" type="text/javascript"></script>
        <script src="/_cortex/neurone_imageinview.js" type="text/javascript"></script>
        <script src="/_cortex/scrollsnap.js" type="text/javascript"></script>

        <!-- GOOGLE Analytics -->
        <script type="text/javascript">
          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-16098895-9']);
          _gaq.push(['_trackPageview']);
          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();
        </script>
    </body>
</html>