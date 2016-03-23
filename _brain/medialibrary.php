<?php
class MediaLibrary {

    static public function Clean ( $path = MEDIALIBRARY ) {
        $albums = DirScan( ServerGetFile($path) );
        if( !$albums )
            return false;

        foreach ($albums as $slug) {
            $files = DirListByFilename( ServerGetFile($path . "/" . $slug), "old" );
            if( $files ) {
                foreach( $files as $file ) {
                    $filePath = ServerGetFile($path . "/" . $slug . "/" . $file);
                    FileRemove($filePath);
                }
            }
        }
    }

    static public function GetLibrary () {
        global $BRAIN;
        if(!$BRAIN->sitemap)
            return;

        $user = User::Current();

        $library = [];
        foreach ($BRAIN->sitemap as $slug => $wac) {
            if(!isset($wac["ALBUM"]) || !$wac["ALBUM"])
                continue;

            $isPrivate = (isset($wac["PRIVATE"]) && $wac["PRIVATE"]);
            $passport = ($user) ? $user->HasPassport($slug) : false;
            if( $isPrivate && !$passport )
                continue;

            $library[ $slug ] = $wac;
        }
        return $library;
    }

    static public function GetAlbum ($slug, &$error) {
        if(!$slug) {
            $error = "Missing param.";
            return false;
        }

        global $BRAIN;
        if(!$BRAIN->sitemap) {
            $error = "Missing sitemap.";
            return false;
        }

        $wac = $BRAIN->GetRoute($slug);
        if(!$wac) {
            $error = "Can not find album $slug.";
            return false;
        }

        if(!isset($wac["ALBUM"]) || !$wac["ALBUM"]) {
            $error = "The $slug is not an album.";
            return false;
        }

        $user = User::Current();
        $isPrivate = (isset($wac["PRIVATE"]) && $wac["PRIVATE"]);
        $passport = ($user) ? $user->HasPassport($slug) : false;
        if( $isPrivate && !$passport ) {
            $error = "Private album ($slug)";
            return false;
        }

        $wac["PASSPORT"] = $passport;
        $indexfile = (!$passport) ? "publicindex" : "privateindex";
        $indexfile = ServerGetFile(MEDIALIBRARY . "/" . $slug . "/" . $indexfile . "." . ALBUM);
        $index = Decode(FileRead($indexfile));
        return [$wac, $index];
    }

    static public function GetMedia ($media, &$error) {
        if(!$media) {
            $error = "Missing param.";
            return false;
        }

        $pieces = explode("/", $media);
        $album = $pieces[0];
        $format = isset($pieces[1]) ? $pieces[1] : MEDIA_WEB;
        $item = $pieces[2];
        $ext = isset($pieces[3]) ? $pieces[3] : "jpg";

        global $BRAIN;
        if(!$BRAIN->sitemap) {
            $error = "Missing sitemap.";
            return false;
        }

        $slug = $album;
        $wac = $BRAIN->GetRoute($slug);
        if(!$wac) {
            $error = "Can not find album $slug.";
            return false;
        }

        if(!isset($wac["ALBUM"]) || !$wac["ALBUM"]) {
            $error = "The $slug is not an album.";
            return false;
        }

        $user = User::Current();
        $isPrivate = (isset($wac["PRIVATE"]) && $wac["PRIVATE"]);
        $passport = ($user) ? $user->HasPassport($slug) : false;
        if( $isPrivate && !$passport ) {
            $error = "Private album ($slug)";
            return false;
        }

        return ServerGetFile(MEDIALIBRARY . "/$album/$format/$item.$ext");
    }

    static public function BuildCatalog ( $path = MEDIALIBRARY ) {
        //get wac files in memory
        $albums = DirScan( ServerGetFile($path) );
        if( !$albums ) {
            $error = "Can not read the directory $path.";
            return false;
        }
        $catalog = [];
        foreach ($albums as $slug) {
            if( !($wac = MediaLibrary::BuildAlbum($slug, $path . "/" . $slug . "/", $path)) )
                continue;

            $catalog[$slug] = $wac;
        }
        return $catalog;
    }

    static public function BuildAlbum ( $id, $album, $medialibrary = MEDIALIBRARY, $file = ALBUM, $force = false ) {
        set_time_limit(60);
        $path = ServerGetFile( $album );
        $wacFile = $path . $file . "." . WAC;

        if(!file_exists($wacFile))
            return false;

        $wac = new PObject($wacFile);
        if(!$wac)
            return false;

        $wacpath = $wac->Get("PATH");
        $wacpath = str_replace("/RBUAS/", "/", $wacpath);

        $wac->Set("ALBUM", $id);
        $wac->Set("PATH", $wacpath);

        if(!$force && Brain::HasGuardian($album))
            return $wac->GetData();

        $now = date("Ymd_His");
        $publicfile = $path . "publicindex." . $file;
        if(file_exists( $publicfile ) && !FileRename( $publicfile, "$publicfile.$now.old")) {
            $error = "Can not remove album index ($publicfile).";
            return false;
        }
        $privatefile = $path . "privateindex." . $file;
        if(file_exists( $privatefile ) && !FileRename( $privatefile, "$privatefile.$now.old")) {
            $error = "Can not remove album index ($privatefile).";
            return false;
        }

        $albumpath = $wacpath != NULL ? ServerGetFile( $medialibrary . $wacpath ) : $path;
        $isVirtual = $wac->Get("VIRTUAL") != NULL ? true : false;

        //get album files
        $files = [];
        if($isVirtual) {

            $inputfiles = $wac->Get("VIRTUAL");
            if($inputfiles) {
                foreach ($inputfiles as $virtual) {
                    $virtualfile = MediaLibrary::GetVirtualFile($virtual,  $medialibrary);
                    if($virtualfile) {
                        $files[] = $virtualfile;
                    }
                }
            }

        } else {

            $inputfiles = DirListByFilename( $albumpath . MEDIA_WEB );
            if($inputfiles) {
                foreach ($inputfiles as $file) {
                    $files[] = $albumpath . MEDIA_WEB . "/" . $file;
                }
            }

        }
        if( empty($files) )
            return false;

        $privateindex = [];
        $privatetags = [];
        foreach( $files as $mediapath ) {
            $mid = FileGetName($mediapath);
            $mediainfo = MediaLibrary::ReadMedia($mediapath, $isVirtual);
            if($mid == NULL || $mediainfo == NULL)
                continue;

            $privateindex[ $mid ] = $mediainfo;
            if(isset($mediainfo["Tags"])) {
                $privatetags = array_merge($privatetags, is_array($mediainfo["Tags"]) ? $mediainfo["Tags"] : array($mediainfo["Tags"]) );
            }
        }
        $privatetags = array_count_values($privatetags);
        if($privatetags != NULL) $wac->Set("PRIVATETAGS", $privatetags);
        FileCreate( $privatefile, Encode($privateindex) );


        $publicindex = [];
        $publictags = [];
        $publicratting = $wac->Get("PUBLICRATING") != NULL ? $wac->Get("PUBLICRATING") : MEDIA_PUBLICRATING;
        foreach ($privateindex as $mid => $mediainfo) {
            if(isset($mediainfo["Rating"]) && $mediainfo["Rating"] >= $publicratting) {
                $publicindex[ $mid ] = $mediainfo;
                if(isset($mediainfo["Tags"])) {
                    $publictags = array_merge($publictags, is_array($mediainfo["Tags"]) ? $mediainfo["Tags"] : array($mediainfo["Tags"]) );
                }
            }
        }
        $publictags = array_count_values($publictags);
        if($publictags != NULL) $wac->Set("PUBLICTAGS", $publictags);
        FileCreate( $publicfile, Encode($publicindex) );

        $wac->Save();

        if(!$isVirtual) {
            if(!is_dir($path . "/" . MEDIA_LOW . "/"))
                mkdir($path . "/" . MEDIA_LOW . "/", 0777, true);

            if(!is_dir($path . "/" . MEDIA_MOB . "/"))
                mkdir($path . "/" . MEDIA_MOB . "/", 0777, true);

            if(!is_dir($path . "/" . MEDIA_THUMB . "/"))
                mkdir($path . "/" . MEDIA_THUMB . "/", 0777, true);

            foreach ($files as $mid => $origin) {
                $dest = str_replace("/" . MEDIA_WEB . "/", "/" . MEDIA_LOW . "/", $origin);
                MediaLibrary::BuildImageVersion($origin, $dest, 100, 1024);

                $dest = str_replace("/" . MEDIA_WEB . "/", "/" . MEDIA_MOB . "/", $origin);
                MediaLibrary::BuildImageVersion($origin, $dest, 100, 480);

                $dest = str_replace("/" . MEDIA_WEB . "/", "/" . MEDIA_THUMB . "/", $origin);
                MediaLibrary::BuildImageVersion($origin, $dest, 60, 120);
            }
        }

        return $wac->GetData();
    }

    static public function GetVirtualFile ( $virtual, $medialibrary = MEDIALIBRARY, $ext = ".jpg" ) {
        if(!$virtual)
            return;

        $info = explode("/", $virtual);
        if(!$info)
            return;

        $file = $info[count($info) - 1];
        unset($info[count($info) - 1]);

        $path = implode("/", $info);
        return ServerGetFile($medialibrary . "/" . $path . "/" . MEDIA_WEB . "/" . $file . $ext);
    }

    static public function GetRealPath ($media, $medialibrary = MEDIALIBRARY) {
        list($path, $file) = explode(MEDIA_WEB, $media);
        $root = ServerGetRoot();
        $path = str_replace($root, "", $path);
        $path = str_replace($medialibrary, "", $path);
        return $path;
    }

    static public function ReadMedia ( $media, $isVirtual = false, $medialibrary = MEDIALIBRARY) {
        $ext = strtolower(pathinfo($media, PATHINFO_EXTENSION));
        if($ext != "jpg" && $ext != "tiff" && $ext != "tif")
            return false;

        //ANY_TAG, IFD0, THUMBNAIL, EXIF
        $info = exif_read_data($media, 0, true);
        if($info === false)
            return false;

        $FILE = ArrayFilter($info["FILE"], [
            "FileName", 
            //"FileDateTime", 
            //"MimeType",
        ]);

        $COMPUTED = ArrayFilter($info["COMPUTED"], [
            "Copyright",
            "Height",
            "Width",
        ]);

        $IFD0 = ArrayFilter($info["IFD0"], [
            //"DateTime",
            "XResolution",
            //"YResolution",
            "Model",
            //"Artist",
            //"DateTime",
            "Copyright",
        ]);

        $EXIF = ArrayFilter($info["EXIF"], [
            "Model",
            "ExposureTime",
            "FNumber",
            "ISOSpeedRatings",
            "FocalLength",
            "WhiteBalance",
            //"ApertureValue",
            //"MeteringMode",
            //"Flash",
            //"ShutterSpeedValue",
        ]);

        $RDF = MediaLibrary::ReadRDFInfo( $media );

        $mediainfo = array_merge($FILE, $COMPUTED, $IFD0, $EXIF, $RDF);

        if(isset($mediainfo["FNumber"])) $mediainfo["FNumber"] = floatval($mediainfo["FNumber"]);
        if(isset($mediainfo["FocalLength"])) $mediainfo["FocalLength"] = floatval($mediainfo["FocalLength"]);
        if(isset($mediainfo["Temperature"])) $mediainfo["Temperature"] = floatval($mediainfo["Temperature"]);
        if(isset($mediainfo["XResolution"])) $mediainfo["XResolution"] = floatval($mediainfo["XResolution"]);
        if(isset($mediainfo["Rating"])) $mediainfo["Rating"] = floatval($mediainfo["Rating"]);

        if($isVirtual) $mediainfo["Path"] = MediaLibrary::GetRealPath($media, $medialibrary);

        $mediainfo = ArrayConvertKey($mediainfo, [
            "Height" => "H",
            "Width" => "W",
            "XResolution" => "R",
            "ExposureTime" => "EX",
            "WhiteBalance" => "WB",
            "FNumber" => "FN",
            "FocalLength" => "Focal",
            "ISOSpeedRatings" => "ISO",
            "Temperature" => "K",
            "FileName" => "File",
        ]);

        //echo("\n     MEDIAINFO:");print_r($mediainfo);
        return $mediainfo;
    }

    static public function ReadRDFInfo ( $media ) {
        $rdfinfo = [];

        $content = file_get_contents( $media );
        if( $content == NULL || $content == "" )
           return $rdfinfo;

        $rootkey = "x:xmpmeta";
        $xmp_datastart = strpos( $content, "<$rootkey" );
        $xmp_dataend = strpos( $content, "</$rootkey>" );
        $xmp_lenght = $xmp_dataend - $xmp_datastart;
        $xml = substr( $content, $xmp_datastart, $xmp_lenght + 12 );

        $xml_domparsed = XMLParseStr( $xml );
        if( !isset( $xml_domparsed[ $rootkey ] ) )
            return $rdfinfo;

        $xmp_meta = $xml_domparsed[ $rootkey ];
        if( !isset( $xmp_meta[ "rdf:RDF" ] ) )
            return $rdfinfo;

        $rdf = $xmp_meta[ "rdf:RDF" ];
        if( !isset( $rdf[ "rdf:Description" ] ) )
            return $rdfinfo;

        $rdf_desc = $rdf[ "rdf:Description" ];

        $rdfinfo["Lens"] = (isset( $rdf_desc[ "Lens" ] )) ? $rdf_desc[ "Lens" ] : NULL;
        $rdfinfo["WhiteBalance"] = (isset( $rdf_desc[ "WhiteBalance" ] )) ? $rdf_desc[ "WhiteBalance" ] : NULL;
        $rdfinfo["Temperature"] = (isset( $rdf_desc[ "Temperature" ] )) ? $rdf_desc[ "Temperature" ] : NULL;
        $rdfinfo["CreateDate"] = (isset( $rdf_desc[ "CreateDate" ] )) ? $rdf_desc[ "CreateDate" ] : NULL;
        $rdfinfo["ModifyDate"] = (isset( $rdf_desc[ "ModifyDate" ] )) ? $rdf_desc[ "ModifyDate" ] : NULL;
        //$rdfinfo["Label"] = (isset( $rdf_desc[ "Label" ] )) ? $rdf_desc[ "Label" ] : NULL;
        $rdfinfo["Rating"] = (isset( $rdf_desc[ "Lens" ] )) ? $rdf_desc[ "Rating" ] : NULL;
        $rdfinfo["Creator"] = (isset( $rdf_desc[ "dc:creator" ][ "rdf:Seq" ][ "rdf:li" ][ "#text" ] )) ? $rdf_desc[ "dc:creator" ][ "rdf:Seq" ][ "rdf:li" ][ "#text" ] : NULL;
        $rdfinfo["Tags"] = (isset( $rdf_desc[ "dc:subject" ][ "rdf:Bag" ][ "rdf:li" ][ "#text" ] )) ? $rdf_desc[ "dc:subject" ][ "rdf:Bag" ][ "rdf:li" ][ "#text" ] : NULL;
        //$rdfinfo["Firmware"] = (isset( $rdf_desc[ "Firmware" ] )) ? $rdf_desc[ "Firmware" ] : NULL;

        if( isset( $rdf_desc[ "Iptc4xmpCore:CreatorContactInfo" ] ) ) {
            $creator = $rdf_desc[ "Iptc4xmpCore:CreatorContactInfo" ];

            $rdfinfo["City"] = (isset( $creator[ "CiAdrCity" ] )) ? $creator[ "CiAdrCity" ] : NULL;
            $rdfinfo["Region"] = (isset( $creator[ "CiAdrRegion" ] )) ? $creator[ "CiAdrRegion" ] : NULL;
            $rdfinfo["Country"] = (isset( $creator[ "CiAdrCtry" ] )) ? $creator[ "CiAdrCtry" ] : NULL;
            //$rdfinfo["Email"] = (isset( $creator[ "CiEmailWork" ] )) ? $creator[ "CiEmailWork" ] : NULL;
            //$rdfinfo["Site"] = (isset( $creator[ "CiUrlWork" ] )) ? $creator[ "CiUrlWork" ] : NULL;
        }

        return $rdfinfo;
   }


   static public function BuildImageVersion ($src, $dest, $quality = 100, $desired_width = false, $desired_height = false) {
        // if no dimenstion for thumbnail given, return false
        if (!$desired_height && !$desired_width) 
            return false;

        $fparts = pathinfo($src);
        $ext = strtolower($fparts['extension']);
        // if its not an image return false
        if (!in_array($ext,array('gif','jpg','png','jpeg'))) 
            return false;

        // read the source image
        if ($ext == 'gif')
            $resource = imagecreatefromgif($src);
        else if ($ext == 'png')
            $resource = imagecreatefrompng($src);
        else if ($ext == 'jpg' || $ext == 'jpeg')
            $resource = imagecreatefromjpeg($src);

        $width  = imagesx($resource);//source_image);
        $height = imagesy($resource);//source_image);

        // find the "desired height" or "desired width" of this thumbnail, relative to each other, if one of them is not given
        if(!$desired_height) $desired_height = floor($height*($desired_width/$width));
        if(!$desired_width)  $desired_width  = floor($width*($desired_height/$height));

        // create a new, "virtual" image
        $virtual_image = imagecreatetruecolor($desired_width,$desired_height);

        // copy source image at a resized size
        imagecopyresized($virtual_image,$resource,0,0,0,0,$desired_width,$desired_height,$width,$height);

        // create the physical thumbnail image to its destination
        $fparts = pathinfo($dest);
        $dest = $fparts['dirname'].'/'.$fparts['filename'].'.'.$ext;

        if ($ext == 'gif')
            imagegif($virtual_image,$dest);
        else if ($ext == 'png')
            imagepng($virtual_image,$dest,$quality/100);
        else if ($ext == 'jpg' || $ext == 'jpeg')
            imagejpeg($virtual_image,$dest,$quality);

        imagedestroy($virtual_image);

        return array(
            'width'     => $width,
            'height'    => $height,
            'new_width' => $desired_width,
            'new_height'=> $desired_height,
            'dest'      => $dest
        );
   }

}
?>