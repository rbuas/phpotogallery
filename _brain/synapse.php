<?php
class Synapse {
    public function __construct () {
        $this->process = [];

        $this->requestedPath = ServerGetRequestPath();
        $this->requestedArgs = ServerGetRequestArgs();
        $this->requestedTime = ServerGetRequestTime();
        $this->requestedSlug = ServerGetRequestSlug();
        $this->breadcrumb = ServerGetBreadcrumb($this->requestedSlug);
    }

    public function StartProcess ( $token = NULL ) {
        if($token == NULL)
            return false;

        $this->process[$token] = [
            "starttime" => microtime( true ),
            "startmem" => memory_get_usage(),
        ];
        return true;
    }

    public function EndProcess ( $token = NULL ) {
        if($token == NULL)
            return false;

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

    public function Response ($response) {
        header('Content-Type: application/json');
        echo( Encode($response) );
    }

    static public function Version ($version = NULL) {
        $file = ServerGetFile(VERSION);
        if($version == NULL)
            return file_exists( $file ) ? FileRead($file) : "";

        FileCreate( $file, $version );
    }

}
?>