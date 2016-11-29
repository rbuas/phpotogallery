<?php

class PObject {
    public $exists;

    private $_data;
    private $_file;

    public function __construct ($file = NULL, $data = NULL, &$error = NULL) {
        $this->_data = $data != NULL ? $data : [];
        $this->_file = $file;

        $this->LoadData($error);
    }

    public function Save ( &$error = NULL ) {
        if($this->_file == NULL) {
            $error = "PObject::Can not identify persitent file.";
            return false;
        }
        $file = $this->_file;
        $content = Encode($this->_data, JSON_PRETTY_PRINT);
        $response = FileWrite( $file, $content );
        return true;
    }

    public function Set ($key, $value) {
        $this->_data[$key] = $value;
    }

    public function Get ($key) {
        if($this->_data == NULL)
            return;

        return $this->_data[$key];
    }

    public function SetData ($data) {
        $this->_data = $data;
    }

    public function GetData () {
        return $this->_data;
    }

    public function LoadData (&$error = NULL) {
        $serverfile = $this->_file;
        if($serverfile == NULL) {
            $error = "PObject::Load::Missing params file input ($serverfile)";
            return false;
        }

        $this->exists = file_exists( $serverfile );
        if( !$this->exists ) {
            $error = "PObject::Load::File $serverfile not exists.";
            return false;
        }

        $content = FileRead($serverfile);
        if($content == NULL) {
            $error = "PObject::Load::Can not read file $serverfile.";
            return false;
        }

        $data = Decode($content, true);
        if($data == NULL) {
            $error = "PObject::Load::Can not parse file $serverfile, content : $content";
            return false;
        }

        $this->_data = $data;
    }

    static public function Load ($file, &$error = NULL) {
        return new PObject($file, $error);
    }
}
?>