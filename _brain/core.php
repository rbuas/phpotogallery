<?php

function ERROR ( $error, $msg, $force = false ) {
    if( $force || MODE_VERBOSE ) {
        list( $file, $line ) = CoreDebugInfo( 1 );
        print( "Error ($file:$line): $msg<br/>" );
    }
    return $error;
}

function WARNING ( $msg , $level = 1, $force = false ) {
    if( $force || MODE_VERBOSE ) {
       list( $file, $line ) = CoreDebugInfo( $level );
       print( "Warning ($file:$line): $msg<br/>" );
    }
}

function V ( $msg ) {
    if( MODE_VERBOSE ) echo( $msg . "<br/>\n" );
}

function Encript ( $v ) {
    return md5( $v );
}
function Encode ( $data, $option = NULL ) {
    return json_encode( $data, $option );
}

function Decode ( $string ) {
    return json_decode( $string, true );
}

function CoreDebugInfo ( $level = 0 ) {
    $btr = debug_backtrace();
    $line = $btr[$level]['line'];
    $file = basename($btr[$level]['file']);
    $function = $btr[$level + 1]['function'];
    return array( $file, $line, $function );
}


function PrintR ( $value = NULL, $pre = "", $pos = "" ) {
    if( $value === NULL ) {

        print( "NULL" . $pos );

    } elseif( $value === true ) {

        print( "true" . $pos );

    } elseif( $value === false ) {

        print( "false" . $pos );

    } elseif( is_array( $value ) ) { 

      echo( $pre . gettype( $value ) . " { \n" );
      foreach( $value as $k => $v ) {
          echo( "$pre   [$k] => " ); 
          PrintR( $v, "$pre   ", ",\n" );
      }
      print"$pre}$pos";

    } elseif( is_object( $value ) ) { 

      if( method_exists( $value, "ToString" ) ) {
         $value->ToString( $pre, $pos );
      } else {
         print_r( $value );
      }
      //$value.dump(); 
    } else {

      print( $value . $pos ); 

    }
}

function ArrayFilter ($arr, $wlist = [], $blist = []) {
    if($arr == NULL)
        return [];

    $result = [];
    foreach ($arr as $k => $value) {
        if(in_array($k, $wlist) && !in_array($k, $blist))
            $result[$k] = $value;
    }
    return $result;
}

function ArrayConvertKey ($arr, $trad) {
    if($arr == NULL || $trad == NULL)
        return;

    $result = [];
    foreach ($arr as $k => $value) {
        $key = isset($trad[$k]) ? $trad[$k] : $k;
        $result[$key] = $arr[$k];
    }
    return $result;
}
?>