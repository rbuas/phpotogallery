<?php
define("USER_STATUS_OFF", "off");
define("USER_STATUS_ON", "on");
define("USER_STATUS_CONFIRM", "confirm");
define("USER_STATUS_BLOCKED", "blocked");

class User {
    public $lang;
    public $news;
    public $email;
    public $status;
    public $password;

    public $token;

    public $passport;
    public $favorite;
    public $history;

    public function __construct ($email, $password = NULL, $lang = NULL, $news = NULL, $status = NULL, $token = NULL, $passport = [], $favorite = [], $history = []) {
        $this->email = $email;
        $this->password = $password;
        $this->lang = ($lang) ? $lang : "EN";
        $this->news = ($news != NULL) ? $news : true;
        $this->status = ($status) ? $status : USER_STATUS_CONFIRM;
        $this->token = $token;
        $this->passport = $passport;
        $this->favorite = $favorite;
        $this->history = $history;
    }

    public function Save ( &$error = NULL ) {
        if($this->email == NULL) {
            $error = "Can not identify user.";
            return false;
        }

        $userfile = ServerGetFile( FRIENDS . "/$this->email." . FRIENDS_EXT );
        $userContent = Encode($this);

        $newUser = FileWrite( $userfile, $userContent );
        return true;
    }

    public function Confirm ($token, &$error = NULL) {
        if($token == NULL || $this->token == NULL || $this->token == "" || $this->token != $token) {
            $error = "Token error.";
            return false;
        }

        $this->status = USER_STATUS_OFF;
        return $this->Save($error);
    }

    public function Login ($password, &$error = NULL) {
        $current = User::Current();
        if($current != NULL) {
            $current->Logout( $error );
        }

        if($this->password == NULL) {
            $error = "User state error.";
            return false;
        }

        if($this->password != $password) {
            $error = "Wrong password.";
            return false;
        }

        if($this->status == USER_STATUS_CONFIRM) {
            $error = "User $this->email must to be confirmed to login.";
            return false;
        }

        $this->status = USER_STATUS_ON;
        if(!$this->Save($error)) {
            $error = "Writing changes.";
            return false;
        }

        User::Current($this);
        return true;
    }

    public function Logout (&$error = NULL) {
        $this->status = USER_STATUS_OFF;
        if(!$this->Save($error)) {
            $error = "Writing changes.";
            return false;
        }

        User::Reset();
        return true;
    }

    public function Info () {
        return [
            "email" => $this->email,
            "news" => $this->news,
            "lang" => $this->lang,
            "status" => $this->status,
            "favorite" => $this->favorite,
            "passport" => $this->passport,
            "history" => $this->history,
        ];
    }

    public function AddPassport ( $slug ) {
        $this->passport[ $slug ] = true;
    }

    public function RemovePassport ( $slug ) {
        unset($this->passport[ $slug ]);
    }

    public function HasPassport ( $slug ) {
        if($this->email == MASTER)
            return true;

        return isset($this->passport[ $slug ]) ? $this->passport[ $slug ] : false;
    }

    public function AddFavorite ( $slug ) {
        $this->favorite[] = $slug;
    }

    public function RemoveFavorite ( $slug ) {
        if(!$this->IsFavorite($slug))
            return;

        $this->favorite = array_diff($this->favorite, [$slug]);
    }

    public function IsFavorite ( $slug ) {
        return in_array($slug, $this->favorite);
    }

    public function AddHistory ( $item ) {
        $now = date("Ymd_His");
        $this->favorite[ $now ] = $item;
    }


    /////////////
    // STATIC
    //////

    static public function CreateUser ($email, $password, $news = NULL, $lang = NULL, &$error) {
        if($email == NULL || $password == NULL) {
            $error = "Missing params ($email ; $password)";
            return false;
        }

        $userfile = ServerGetFile( FRIENDS . "/$email." . FRIENDS_EXT );
        $exists = file_exists( $userfile );
        if( $exists ) {
            $error = "User $email already exists.";
            return false;
        }

        $token = Encript(date("Ymd_His"));
        $user = new User($email, $password, $lang, $news, USER_STATUS_CONFIRM, $token);

        $activateLink = "http://rbuas.com/synapse/userconfirm?email=$email&token=$token";

        MailFactory::Send($email,
            "[" . POSTTAG . "] Inscription confirmation",
            "Wellcome and thank you to register in my website.\r\n\r\n"
            . "But before, you have to click in the <a href=\"$activateLink\">link to activate your new account</a>.\r\n\r\n"
            . "Or, if you prefere, you can copy the address bellow in your browser to activate your account : \r\n\r\n"
            . "$activateLink\r\n\r\n"
            . "I hope you enjoy my work. We will keep in contact.\r\nThank you ;-)\r\n" . POSTNAME . "\r\n"
        );

        $user->Save($error);
        return $user;
    }

    static public function Load ($email, &$error = NULL) {
        if($email == NULL) {
            $error = "User::Load::Missing params ($email)";
            return false;
        }

        $userfile = ServerGetFile( FRIENDS . "/$email.user" );
        $exists = file_exists( $userfile );
        if( !$exists ) {
            $error = "User::Load::User $email not exists.";
            return false;
        }

        $userContent = FileRead($userfile);
        if($userContent == NULL) {
            $error = "User::Load::Can not read user $email.";
            return false;
        }

        $userData = Decode($userContent, true);
        if($userData == NULL) {
            $error = "User::Load::Can not parse user $email.";
            return false;
        }

        $password = (isset($userData["password"])) ? $userData["password"] : NULL;
        $lang = (isset($userData["lang"])) ? $userData["lang"] : NULL;
        $news = (isset($userData["news"])) ? $userData["news"] : NULL;
        $status = (isset($userData["status"])) ? $userData["status"] : NULL;
        $token = (isset($userData["token"])) ? $userData["token"] : NULL;
        $favorite = (isset($userData["favorite"])) ? $userData["favorite"] : NULL;
        $passport = (isset($userData["passport"])) ? $userData["passport"] : NULL;
        $history = (isset($userData["history"])) ? $userData["history"] : NULL;

        return new User($email, $password, $lang, $news, $status, $token, $passport, $favorite, $history);
    }

    static public function RetrievePassword ($email, &$error) {
        $user = User::Load($email, $error);
        if( !$user )
            return false;

        MailFactory::Send($email,
            "[" . POSTTAG . "] Retrieve password",
            "Hello,\r\n\r\n"
            . "You ask to me to remember you your password : $user->password.\r\n\r\n"
            . "If you want to change it, send an email to " . POSTMAN . ".\r\n\r\n"
            . "Thank you ;-)\r\n" . POSTNAME . "\r\n"
        );
        return true;
    }

    static public function Current ( $user = NULL ) {
        if($user == NULL)
            return isset($_SESSION["USER"]) ? $_SESSION["USER"] : NULL;

        $_SESSION["USER"] = $user;
    }

    static public function Reset () {
        unset($_SESSION["USER"]);
    }

    static public function GetList (&$error = NULL) {
        //get wac files in memory
        $files = DirListByFilename( ServerGetFile(FRIENDS), FRIENDS_EXT );
        if( !$files ) {
            $error = "Can not read the directory.";
            return false;
        }

        $filenames = [];
        foreach ($files as $file) {
            $userid = FileGetName($file);
            $userError = NULL;
            $user = User::Load($userid, $userError);
            if(!$user)
                continue;

            $filenames[ $userid ] = $user->Info();
        }

        return $filenames;
    }
} 
?>