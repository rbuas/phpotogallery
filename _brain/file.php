<?php
function FileWrite ( $filename, $content ) {
   $file = fopen( $filename, "w" );
   if( !$file )
      return;
   $resp = fwrite( $file, $content );
   fclose( $file );
   return $resp;
}


function FileRead ( $filename, $includepath = NULL ) {
   if( !$filename || !file_exists( $filename ) ) {
      return ERROR( false, "Can not get lines from file. File not exists ($filename)." );
   }
   $content = file_get_contents($filename, $includepath) ;
   return $content;
}


function FileRename ( $oldname, $newname ) {
   return rename($oldname, $newname);
}


function FileGetLines ( $filename, $includepath = NULL ) {
   if( !$filename || !file_exists( $filename ) ) {
      return ERROR( false, "Can not get lines from file. File not exists ($filename)." );
    }
   $lines = file( $filename, $includepath );
   return $lines;
}


function FileIni2Array ( $filename, $selection = true ) {
   return parse_ini_file( $filename, $selection );
}


function FileXML2Array ( $xml_filename ) {
   $xml_str = FileRead( $xml_filename );
   $arr = new SimpleXMLElement( $xml_str );
   return $arr;
}


function FileCreate ( $filename, $datastr = NULL ) {
  if( !$filename ) {
    return ERROR(false, "Can not create file. Missing filename." );
  }
  $file = fopen( $filename, "w" );
  if( !$file ) {
    return ERROR(false, "Can not create file. File not open ($filename)." );
  }
  if( $datastr != NULL ) {
    $resp = fwrite( $file, $datastr );
    if( !$resp ) {
      return ERROR(false, "Can not write data on file ($filename)." );
    }
  }
  return fclose( $file );
}


function FileRemove ( $filename ) {
    V("removing file : " . $filename );
    return unlink( $filename );
}


function FilePut ( $filename, $datastr ) {
   if( !$filename ) {
      return ERROR(false, "Can not create file. Missing filename." );
   }
   // if( !file_exists( $filename ) ) {
   //    return ERROR(false, "Can not put content in file. File not exists ($filename)." );
   // }
  return file_put_contents( $filename, $datastr, FILE_APPEND);
}


function FileGetExtension ( $filename ) {
  if(!$filename) return;
  $pathinfo = pathinfo( $filename );
  return isset($pathinfo[ "extension" ]) ? $pathinfo[ "extension" ] : NULL;
}


function FileGetName ( $filename ) {
  if(!$filename) return;
  $pathinfo = pathinfo( $filename );
  return isset($pathinfo[ "filename" ]) ? $pathinfo[ "filename" ] : NULL;
}


function FileGetType($file) {
  //Deprecated, but still works if defined...
  $filetype = NULL;
  if (function_exists("mime_content_type")) {
    $filetype = mime_content_type($file);
  }

  //New way to get file type, but not supported by all yet.
  else if (function_exists("finfo_open")) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $type = finfo_file($finfo, $file);
    finfo_close($finfo);
    $filetype = $type;
  }

  //Otherwise...just use the file extension
  else {
    $types = array(
      'jpg' => 'image/jpeg', 
      'jpeg' => 'image/jpeg', 
      'png' => 'image/png',
      'gif' => 'image/gif', 
      'bmp' => 'image/bmp',
      'flv' => 'video/x-flv',
      'mp4' => 'video/mp4',
      'm3u8' => 'application/x-mpegURL',
      'ts' => 'video/MP2T',
      '3gp' => 'video/3gpp',
      'mov' => 'video/quicktime',
      'avi' => 'video/x-msvideo',
      'wmv' => 'video/x-ms-wmv'
    );
    $ext = substr($file, strrpos($file, '.') + 1);
    if (key_exists($ext, $types))
      $filetype = $types[$ext];
    else
      $filetype = "unknown";
  }
  return $filetype;
}
?>