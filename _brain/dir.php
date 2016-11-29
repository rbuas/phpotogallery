<?php
function DirIsValidFile ( $file ) {
   return $file != NULL
          && $file != "."
          && $file != ".."
          && $file[0] != ".";
}

function DirFileInTypeFilter ( $ext, $extensions ) {
    if( $extensions == "*" )
        return true;
    elseif( is_string( $extensions ) )
        return $ext == $extensions;
    elseif( is_array( $extensions ) )
        return in_array( $ext, $extensions );
    return false;
}

function DirListByFilename ( $path, $filetypes = "*" ) {
    $dir = @opendir( $path );
    if( !$dir ) 
        return ERROR( false, "Can not open dir ($path).");

    $files = array();
    $filescount = 0;
    while( false !== ( $filename = readdir( $dir ) ) ) {
        $fullfilename = $path . "/" . $filename;
        if( DirIsValidFile( $filename ) ) {
          if( is_file( $fullfilename ) ) {
            $fileext = FileGetExtension( $fullfilename );
            if( DirFileInTypeFilter( $fileext, $filetypes ))
              $files[ $filescount++ ] = $filename;
          }
        }
    }
    @closedir( $dir );

    if( $filescount == 0 )
        return;

    asort( $files );
    return $files;
}

function DirScanR ( $path, $filetypes = "*" ) {
    $dir = @opendir( $path );
    if( !$dir ) 
        return;// ERROR( false, "Can not open dir ($path).");

    $files = array();
    $filescount = 0;
    while( false !== ( $filename = readdir( $dir ) ) ) {
        $fullfilename = $path . "/" . $filename;
        if( DirIsValidFile( $filename ) ) {
          if( is_file( $fullfilename ) ) {
            $fileext = FileGetExtension( $fullfilename );
            if( DirFileInTypeFilter( $fileext, $filetypes ))
              $files[ $filescount++ ] = FileGetName($filename);
          } else {
              $files[ $filename ] = DirScanR($fullfilename, $filetypes);
          }
        }
    }
    @closedir( $dir );

    asort( $files );
    return $files;
}

function DirScan ( $path ) {
    $dir = opendir( $path );
    if( !$dir ) 
        return ERROR( false, "Can not open dir ($path).");

    $subs = array();
    $subcount = 0;

    while( false !== ( $filename = readdir( $dir ) ) ) {
        if( DirIsValidFile( $filename ) ) {
            $fullfilename = $path . "/" . $filename;
            if( !is_file( $fullfilename ) ) {
                $subs[ $subcount++ ] = $filename;
            }
        }
    }
    @closedir( $dir );

    if( $subcount == 0 )
       return;

    asort( $subs );
    return $subs;
}
?>
