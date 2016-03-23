<?php
class Brain {

    public function __construct ( $config, $map, $restart = false ) {
        $this->process = [];
        $this->configFile = $config;
        $this->mapFile = $map;

        $this->StartProcess();

        $this->Start( $restart );
        $this->LoadConfigFiles();

        $this->requestedPath = ServerGetRequestPath();
        $this->requestedArgs = ServerGetRequestArgs();
        $this->requestedTime = ServerGetRequestTime();
        $this->requestedSlug = ServerGetRequestSlug();
        $this->breadcrumb = ServerGetBreadcrumb($this->requestedSlug);

        $this->EndProcess();
    }


    /////////////
    // AUXILIARS
    ///////

    public function Start ( $restart = false ) {
        session_start();

        if($restart) {
            session_destroy();
            $_SESSION = array();
        }
    }

    public function Memory ($key = null, $val = null) {
        if($key == null && $val == null) {
            return $_SESSION;
        }

        if($key == null)
            return;

        if($val == null) {
            return (isset($_SESSION[ $key ])) ? $_SESSION[ $key ] : null;
        }

        return $_SESSION[ $key ] = $val;
    }

    public function Config ($key = null, $val = null) {
        if($key == null && $val == null) {
            return $this->config;
        }

        if($key == null)
            return;

        if($val == null) {
            return (isset($this->config[ $key ])) ? $this->config[ $key ] : null;
        }

        return $this->config[ $key ] = $val;
    }

    public function Forget ( $key ) {
        unset( $_SESSION[ $key ] );
    }

    public function Response ($response) {
        header('Content-Type: application/json');
        echo( Encode($response) );
    }

    public function Clean () {
        $files = DirListByFilename( ServerGetFile(MEMORY), "old" );
        if( $files ) {
            foreach( $files as $file ) {
                $filePath = ServerGetFile(MEMORY . "/" . $file);
                FileRemove($filePath);
            }
        }
        MediaLibrary::Clean();
    }


    /////////////
    // ROUTE
    ///////

    public function BuildRouteMap () {
        $this->sitemap = [];

        //read wac files in MEMORY
        $files = DirListByFilename( ServerGetFile(MEMORY), WAC );
        if( $files ) {
            foreach( $files as $file ) {
                $filePath = ServerGetFile(MEMORY . "/" . $file);
                $fileContent = FileRead( $filePath );
                $fileParsed = Decode($fileContent);

                $wacId = str_replace("." . WAC, "", $file);
                $this->sitemap[$wacId] = $fileParsed;
            }
        }

        //read albums in MEDIALIBRARY
        $catalog = MediaLibrary::BuildCatalog();
        if($catalog) {
            foreach( $catalog as $slug => $wac ) {
                $this->sitemap[$slug] = $wac;
            }
        }

        //store routmap
        $routemap = Encode($this->sitemap);
        FileWrite(ServerGetFile(SITEMAP), $routemap);

        return true;
    }

    public function GetRoute ( $route = null ) {
        if(!$route || $route == "")
            $route = "home";

        if(isset($this->sitemap[$route]))
            return $this->sitemap[$route];

        $path = explode( "/", $route );
        $base = ($path && count($path) > 0) ? $path[0] : NULL;
        if(isset($this->sitemap[$base]))
            return $this->sitemap[$base];

        foreach ($this->sitemap as $slug => $wac) {
            if( isset($wac["ALIAS"]) ) {
                if( in_array($route, $wac["ALIAS"]) || in_array($base, $wac["ALIAS"]) )
                    return $wac;
            }
        }
    }

    public function ActiveRoute ( $route = NULL, $active = true ) {
        if($slug == NULL)
            return false;

        $file = ServerGetFile(MEMORY . "/" . $route . "." . WAC);
        if(!file_exists( $file ))
            return false;

        $wac = new PObject($file);
        if($wac == NULL)
            return;

        $wac->Active = $active;
        $wac->Save();
    }

    public function Access ( &$error ) {
        if(Brain::HasGuardian()) {
            $error = Brain::GetGuardianContent();
            return false;
        }

        $wac = $this->GetRoute( $this->requestedSlug );
        if(!$wac) {
            //$error = "PAGE NOT FOUND";
            return false;
        }

        $this->Memory("route", $wac);
        $this->Memory("access", [
            "path" => $this->requestedPath,
            "args" => $this->requestedArgs,
            "time" => $this->requestedTime,
            "slug" => $this->requestedSlug,
            "breadcrumb" => $this->breadcrumb,
        ]);
        return true;
    }

    public function GetAccess ($slug = NULL) {
        $slug = $slug ? $slug : ServerGetRequestSlug();

        return [
            "path" => ServerGetRequestPath(),
            "args" => ServerGetRequestArgs(),
            "time" => ServerGetRequestTime(),
            "slug" => $slug,
            "breadcrumb" => ServerGetBreadcrumb($slug),
        ];
    }

    public function InCategory ( $wac, $category = "*" ) {
        if( $wac == NULL || $category == NULL )
            return false;

        if( $category == "*" )
            return true;

        if( !isset( $wac["CATEGORY"] ) )
            return false;

        return in_array( $category, $wac["CATEGORY"] );
    }

    public function HasLang ($lang) {
        if(!$this->config || !isset($this->config["LANGUAGES"]))
            return false;

        return in_array($lang, $this->config["LANGUAGES"]);
    }

    public function Lang ( $lang = NULL, &$error = NULL ) {
        if($lang == NULL) {
            if($user = User::Current())
                return $user->lang;

            return isset($_SESSION["LANG"]) ? $_SESSION["LANG"] : NULL;
        }

        if(!$this->HasLang($lang)) {
            $error = "Language $lang not available.";
            return;
        }

        $_SESSION["LANG"] = $lang;
        return $lang;
    }

    static public function Version ($version = NULL) {
        $file = ServerGetFile(VERSION);
        if($version == NULL)
            return file_exists( $file ) ? FileRead($file) : "";

        FileCreate( $file, $version );
    }



    /////////////
    // GUARDIAN
    ///////

    static public function PushGuargian ( $filename, $message ) {
        return FileCreate( ServerGetFile($filename), $message );
    }


    static public function RemoveGuardian ( $filename ) {
        return FileRemove( ServerGetFile($filename) );
    }


    static public function HasGuardian ( $path = "/", $filename = ".guardian" ) {
        $guardianfile = ServerGetFile($path . $filename);
        return file_exists( $guardianfile );
    }


    static public function GetGuardianContent ( $filename = ".guardian" ) {
        return FileRead( $filename );
    }



    /////////////
    // FACTORY
    ///////

    public function BuildHTAccess ( $filename = "/.htaccess" ) {
        $content = "<IfModule mod_rewrite.c>" . BR
                 . "RewriteEngine On" . BR
                 . "RewriteBase /" . BR
                 . "Options -Indexes" . BR
                 . BR
                 . "AddType 'text/xml; charset=UTF-8' rss" . BR
                 . BR
                 . "RewriteRule ^media/(.*)$ /_synapse/media.php?m=$1 [NC,PT]" . BR
                 . "RewriteRule ^mediaget/(.*)$ /_synapse/media.php?m=$1&get=1 [NC,PT]" . BR
                 . "RewriteRule ^mediaskin/(.*)$ /_synapse/mediaskin.php?m=$1 [NC,PT]" . BR
                 . "RewriteRule ^mediaext/(.*)$ /_synapse/mediaext.php?m=$1 [NC,PT]" . BR
                 . BR
                 . "RewriteCond %{SCRIPT_FILENAME} logo.png$ [NC,OR]" . BR
                 . "RewriteCond %{SCRIPT_FILENAME} cam.png$ [NC,OR]" . BR
                 . "RewriteRule ^ - [L]" . BR
                 . BR
                 . "RewriteCond %{HTTP_REFERER} ^$" . BR
                 . "RewriteCond %{SCRIPT_FILENAME} media\.php$ [NC,OR]" . BR
                 . "RewriteCond %{SCRIPT_FILENAME} mediaget\.php$ [NC,OR]" . BR
                 . "RewriteCond %{SCRIPT_FILENAME} mediaskin\.php$ [NC]" . BR
                 . "RewriteRule (.*) index.php?access=denied [QSA,L]" . BR
                 . BR
                 . "RewriteCond %{HTTP_REFERER} ^$" . BR
                 . "RewriteCond %{SCRIPT_FILENAME} \.config$ [NC]" . BR
                 . "RewriteRule (.*) index.php?access=denied [QSA,L]" . BR
                 . BR
                 . "RewriteCond %{REQUEST_FILENAME} \.(gif|png|jpg|jpeg|bmp)$ [NC]" . BR
                 . "RewriteRule (.*)$ http://lorempicsum.com/rio/627/300/4 [NC,R,L]" . BR
                 . BR
                 . "# Don't rewrite files or directories" . BR
                 . "RewriteCond %{REQUEST_FILENAME} -f [OR]" . BR
                 . "RewriteCond %{REQUEST_FILENAME} -d" . BR
                 . "RewriteRule ^ - [L]" . BR;

        $content .= "# Rewrite everything else to index.php to index.php" . BR
                 . "RewriteRule ^ /index.php [L]" . BR
                 . "</IfModule>";
        return FileCreate( ServerGetFile($filename), $content );
    }

    public function BuildConfigFile () {
        $this->config = include( ServerGetFile(MEMORY . "/site.config") );
        return FileCreate( ServerGetFile(CONFIG), Encode($this->config) );
    }

    public function BuildRobotsFile ( $filename = "/robots.txt" ) {
         $content = "User-agent: *" . BR
                  . "Disallow: /_*" . BR
                  . "Disallow: ". SITE_URL . MEDIALIBRARY . BR
                  . "Sitemap: " . SITE_URL . SITEMAP_XML;

        return FileCreate( ServerGetFile($filename), $content );
    }

    public function BuildSitemap () {
        $filename = SITEMAP_XML;
        //start content
        $content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $content .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

        $content .= $this->BuildXMLInfo( SITE_URL, NULL, "1.0", "always" );

        //process registered slugs
        foreach( $this->sitemap as $slug => $wac ) {
            //test public page and category 
            if( !isset( $wac["PRIVATE"] ) ) {
                //set values
                $loc = SITE_URL . "/" . $slug;
                $priority = isset( $wac["PRIORITY"] ) ? $wac["PRIORITY"] : "0.5";
                $lastmod = isset( $wac["DATE"] ) ? $wac["DATE"] : 0;

                $content .= $this->BuildXMLInfo( $loc, $lastmod, $priority );
            }
        }

        //end content
        $content .= "</urlset>\n";

        return FileCreate( ServerGetFile($filename), $content );
    }

    public function BuildRSS ( $filename, $category = "*" ) {
        //start content
        $content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $content .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

        //process registered slugs
        foreach( $this->sitemap as $slug => $wac ) {
            //test public page and category 
            if( !isset( $wac["PRIVATE"] ) && $this->InCategory( $wac, $category ) ) {
                //set values
                $loc = SITE_URL . "/" . $slug;
                $priority = isset( $wac["PRIORITY"] ) ? $wac["PRIORITY"] : "0.5";
                $lastmod = isset( $wac["DATE"] ) ? $wac["DATE"] : 0;

                $content .= $this->BuildXMLInfo( $loc, $lastmod, $priority );
            }
        }

        //end content
        $content .= "</urlset>\n";

        return FileCreate( ServerGetFile($filename), $content );
    }

    private function BuildXMLInfo( $loc = "", $date = "", $priority = "1.0", $freq = "monthly" ) {
        if($priority == NULL) $priority = "1.0";
        if($date == NULL) $date = "";

        return "   <url>\n" .
               "      <loc>" . $loc . "</loc>\n" . 
               "      <lastmod>" . $date . "</lastmod>\n" .
               "      <changefreq>" . $freq . "</changefreq>\n" .
               "      <priority>" . $priority . "</priority>\n" .
               "   </url>\n"; 
    }



   /////////////
   // PRIVATE
   ///////

    private function LoadConfigFiles () {
        $this->config = [];
        if($this->configFile) {
            $configContent = FileRead( ServerGetFile($this->configFile) );
            if($configContent)
                $this->config = Decode($configContent);
        }

        $this->sitemap = [];
        if($this->mapFile) {
            $mapContent = FileRead( ServerGetFile($this->mapFile) );
            if($mapContent)
                $this->sitemap = Decode($mapContent);
        }
    }

    public function StartProcess ( $token = "brain_contruction" ) {
        $this->process[$token] = [
            "starttime" => microtime( true ),
            "startmem" => memory_get_usage(),
        ];
    }

    public function EndProcess ( $token = "brain_contruction" ) {
        if(!isset($this->process[$token]))
            $this->process[$token] = [];

        $process = &$this->process[$token];

        $process["endtime"] = microtime( true );
        $process["endmem"] = memory_get_usage();

        $endtime = $process["endtime"];
        $starttime = $process["starttime"];
        $endmem = $process["endmem"];
        $startmem = $process["startmem"];

        $process["timeused"] = round($endtime - $starttime, 7); //s
        $process["memused"] = ($endmem - $startmem) / 1024; //Kb

        return $process;
    }

}
?>