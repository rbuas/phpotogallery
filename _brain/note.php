<?php

class Note {
    public $note;
    public $content;
    public $exists;

    private $notefile;
    private $config;

    public function __construct ( $note, &$error ) {
        $this->note = $note;
        $this->notefile = ServerGetFile( MEMORY . "/$note." . NOTES_EXT);
        $this->exists = false;

        global $BRAIN;
        $this->config = $BRAIN->getRoute(NOTES_PATH);

        $this->content = $this->Read( $error );
    }

    public function Read ( &$error ) {
        if($this->note == NULL || $this->note == "") {
            $error = "Missing note name.";
            return false;
        }
        if(file_exists( $this->notefile )) {
            $this->exists = true;
            return FileRead( $this->notefile );
        }
        return "";
    }

    public function Save ( $content, &$error ) {
        if(file_exists( $this->notefile ) && !FileRename( $this->notefile, "$this->notefile.old")) {
            $error = "Can not remove note $this->note.";
            return false;
        }

        $this->content = $content;

        if( $content != "" ) {
            if( !FileCreate( $this->notefile, $content ) ) {
                $error = "Can not save new content into file $this->note.";
                return false;
            }
        }

        return true;
    }

    static public function GetList (&$error) {
        //get wac files in memory
        $files = DirListByFilename( ServerGetFile(MEMORY), NOTES_EXT );
        if( !$files ) {
            $error = "Can not read the directory.";
            return false;
        }

        $filenames = [];
        foreach ($files as $file) {
            $filenames[] = FileGetName($file);
        }

        return $filenames;
    }
}
?>