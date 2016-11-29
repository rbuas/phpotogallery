<?php

class Memo extends PObject {
    private $memofile;
    private $config;

    public function __construct ( $mid, &$error ) {
        $this->mid = $mid;
        $this->memofile = ServerGetFile( "/" . MEMOS_PATH . "/$mid." . MEMOS_EXT );
        $path = explode( "/", $mid );

        parent::__construct($this->memofile, $this->data, $error);

        $this->Set("mid", $mid);
        $this->Set("path", $path);
        $this->Set("origin", ($path && count($path) >= 1) ? $path[0] : NULL);
        $this->Set("ishome", Memo::IsUserHome( $mid ));
        $this->Set("child", Memo::GetChildList($mid, $error));
    }

    public function Remove ( &$error = NULL ) {
        if(!file_exists( $this->memofile ) || !FileRename( $this->memofile, "$this->memofile.rem")) {
            $error = "Can not remove memo $this->mid.";
            return false;
        }
        return true;
    }

    public function IsHome () {
        return $this->Get("ishome");
    }

    public function HasPassport ( $user, $type = NULL ) {
        if(!$user)
            return false;

        $type = $type != NULL ? $type : User::PROFILE_VIEWER;
        $origin = $this->Get("origin");
        return $origin == $user->uid;
    }

    public function Update ( $data, &$error = NULL ) {
        if( $data == NULL ) {
            $error = "Can not update memo $this->mid.";
            return false;
        }
        $this->data = $data;
        foreach ($data as $key => $value) {
            $this->Set($key, $value);
        }
        return true;
    }


    /////////////
    // STATIC
    ///////

    static public function IsUserHome ($user) {
        $folder = ServerGetFile("/" . MEMOS_PATH . "/" . $user);
        return is_dir($folder);
    }

    static public function GetChildList ($path, &$error) {
        $folder = ServerGetFile("/" . MEMOS_PATH . "/" . $path);
        $files = DirScanR($folder , MEMOS_EXT );
        return $files;
    }

    static public function Connect ($mid, $user, &$error) {
        $memo = new Memo( $mid );
        $origin = $memo->Get("origin");

        $passtocreate = !$memo->exists && !$memo->IsHome() && $origin == $user->uid;
        if($passtocreate) {
            $memo->Save($error);
            $memo->LoadData($error);
        }
        return $memo;
    }


}


class MemosManager extends Synapse {

    public function GetList (&$error) {
        $PROCESS = "memolist";
        $this->StartProcess( $PROCESS );

        $error = NULL;
        $filenames = [];

        $user = User::Current();
        if( $user == NULL || $user->email == NULL ) {
            $error = "User not identified.";
        } else {
            $files = Memo::GetChildList($user->uid, $error);
        }

        $processStatus = $this->EndProcess( $PROCESS );
        $this->Response([
            "status" => ($error == NULL) ? STATUS_SUCCESS : STATUS_ERROR,
            "status_message" => $error,
            "memolist" => $files,
            "process" => $processStatus,
        ]);
    }

    public function GetMemo (&$error) {
        $PROCESS = "memoget";
        $this->StartProcess( $PROCESS );

        $memoid = isset($_REQUEST["memo"]) ? $_REQUEST["memo"] : NULL;

        $error = NULL;
        $message = NULL;

        $user = User::Current();
        $memo = new Memo($memoid, $error);

        if( $user == NULL || $user->email == NULL ) {
            $error = "User not identified.";
        } elseif( !$memo->exists && !$memo->IsHome() ) {
            $error = "Memo $memoid doesn't exist.";
        } elseif( !$memo->HasPassport($user) ) {
            $error = "User $user->uid hast'n a passport to memo $memoid.";
        }

        if( !$error && !$memo->exists ) {
            $message = "Start to write memo $memoid.";
        }
        $memodata = $memo->GetData();

        $processStatus = $this->EndProcess( $PROCESS );

        $this->Response([
            "status" => ($error == NULL) ? STATUS_SUCCESS : STATUS_ERROR,
            "status_message" => ($error == NULL) ? $message : $error,
            "memo" => ($error == NULL) ? $memodata : NULL,
            "process" => $processStatus,
        ]);
    }

    public function SaveMemo (&$error) {
        $PROCESS = "memosave";
        $this->StartProcess( $PROCESS );

        $memoid = isset($_REQUEST["memo"]) ? $_REQUEST["memo"] : NULL;
        $memodata = isset($_REQUEST["memodata"]) ? $_REQUEST["memodata"] : NULL;

        $error = NULL;
        $response = NULL;

        $user = User::Current();
        $memo = new Memo($memoid, $error);

        if( $user == NULL || $user->email == NULL ) {
            $error = "User not identified.";
        } elseif( !$memo->exists && !$memo->IsHome() ) {
            $error = "Memo $memoid doesn't exist.";
        } elseif( !$memo->HasPassport($user, User::PROFILE_EDITOR) ) {
            $error = "User $user->uid hast'n a passport to edit memo $memoid.";
        }

        if($error == NULL) {
            if($memo->Update($memodata, $error)) {
                $response = $memo->Save($error);
            }
        }
        $memodata = $memo->GetData();

        $processStatus = $this->EndProcess( $PROCESS );

        $this->Response([
            "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
            "status_message" => ($response) ? "Memo $memoid was updated." : $error,
            "memo" => ($error == NULL) ? $memodata : NULL,
            "process" => $processStatus,
        ]);
    }

    public function RemoveMemo () {
        $PROCESS = "memoremove";
        $this->StartProcess( $PROCESS );

        $memoid = isset($_REQUEST["memo"]) ? $_REQUEST["memo"] : NULL;

        $error = NULL;
        $response = NULL;

        $user = User::Current();
        $memo = new Memo($memoid, $error);

        if( $user == NULL || $user->email == NULL ) {
            $error = "User not identified.";
        } elseif( !$memo->exists && !$memo->IsHome() ) {
            $error = "Memo $memoid doesn't exist.";
        } elseif( !$memo->HasPassport($user, User::PROFILE_EDITOR) ) {
            $error = "User $user->uid hast'n a passport to edit memo $memoid.";
        }

        if($error == NULL) {
            $response = $memo->Remove($error);
        }
        $memodata = $memo->GetData();

        $processStatus = $this->EndProcess( $PROCESS );

        $this->Response([
            "status" => ($response) ? STATUS_SUCCESS : STATUS_ERROR,
            "status_message" => ($response) ? "Memo $memoid was removed." : $error,
            "memo" => ($error == NULL) ? $memodata : NULL,
            "process" => $processStatus,
        ]);
    }
}

?>