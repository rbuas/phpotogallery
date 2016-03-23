<?php
define("MASTER", "rodrigobuas@gmail.com");

define("POSTMAN", "rodrigobuas@gmail.com");
define("POSTNAME", "Rodrigo Buas");
define("POSTTAG", "RBUAS");

define("MODE_VERBOSE", false);
define("SITE_URL", "http://rbuas.com");
define("VERSION", "/.version");

define("FRIENDS", "/_friends");
define("FRIENDS_EXT", "user");
define("NOTES_EXT", "note");
define("NOTES_PATH", "notes");
define("HOMEPAGE", "home");

define("MEMORY", "/RBUAS");

define("WAC", "wac");
define("MEDIALIBRARY", "/RBUAS");
define("MEDIA_THUMB", "thumb");
define("MEDIA_WEB", "web");
define("MEDIA_MOB", "mob");
define("MEDIA_LOW", "low");
define("MEDIA_PUBLICRATING", 4);
define("ALBUM", "album");

define("SITEMAP", "/sitemap.jsc");
define("SITEMAP_XML", "/sitemap.xml");
define("CONFIG", "/config.jsc");
define("STATUS_SUCCESS", "success");
define("STATUS_ERROR", "error");
define("BR", "\n");

require_once( "core.php" );
require_once( "file.php" );
require_once( "dir.php" );
require_once( "server.php" );
require_once( "xml.php" );
require_once( "mail.php" );
require_once( "user.php" );
require_once( "pobject.php" );
require_once( "note.php" );
require_once( "medialibrary.php" );

require_once( "brain.php" );

$reset = (isset($_REQUEST["RESET"]) ? $_REQUEST["RESET"] == 1 : false);

global $BRAIN;
$BRAIN = new Brain( CONFIG, SITEMAP, $reset );
?>