<?php

function ServerGetRoot () {
    return $_SERVER[ "DOCUMENT_ROOT" ];
}

function ServerGetFile ( $file ) {
    return ServerGetRoot() . $file;
}

function ServerGetRequestPath () {
   $req = ServerGetRequestURI();
   list( $path, $argv ) = ServerGetPathInfo( $req );
   return $path;
}


function ServerGetRequestFragment () {
   $req = ServerGetRequestURI();
   return parse_url( $req, PHP_URL_FRAGMENT );
}


function ServerGetRequestSlug () {
   $path = ServerGetRequestPath();
   $breadcrumb = ServerGetBreadcrumb( $path );
   return implode( "/", $breadcrumb );
}


function ServerGetRequestURI () {
   return $_SERVER[ "REQUEST_URI" ];
}


function ServerGetRequestArgs () {
   if( isset( $_SERVER[ "argv" ] ) )
      return $_SERVER[ "argv" ];
}


function ServerGetRequestTime () {
   return $_SERVER[ "REQUEST_TIME" ];
}


function ServerGetBreadcrumb ( $path ) {
  $arr = explode( "/", $path );
  $clean = array();
  foreach( $arr as $i ) {
    if( $i != "" )
      $clean[] = $i;
  }
  return $clean;
}


function ServerGetPathInfo ( $uri ) {
   if( stripos( $uri, "?" ) === false )
      $path = $uri;
   else
      list( $path, $args ) = explode( "?", $uri );

   if( isset( $args ) )
      $argv = ServerSplitArgs( $args );  
   else
      $argv = array();

   return array( $path, $argv );
}


/*
 * Split args into an array.
 * */
function ServerSplitArgs ( $args ) {
   if( $args == NULL || $args == "" )
      return;
   $argv = array();
   $vars = explode( "&", $args );
   foreach( $vars as $a ) {
      if( strrchr( $a, "=" ) != false ) {
         list( $name, $val ) = explode( "=", $a );
      if( $name != NULL and $val != NULL )
         $argv[ $name ] = $val;
    }
  }
  return $argv;
}

?>
