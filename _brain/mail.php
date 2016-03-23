<?php
class MailFactory {
    public static function Send ($to, $subject, $content) {
        $headers   = array();
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-type: text/plain; charset=iso-8859-1";
        $headers[] = "From: " . POSTNAME . " <" . POSTMAN . ">";
        //$headers[] = "Bcc: JJ Chong <bcc@domain2.com>";
        $headers[] = "Reply-To: " . POSTNAME . " <response." . POSTMAN . ">";
        $headers[] = "Subject: {$subject}";
        $headers[] = "X-Mailer: PHP/" . phpversion();
        mail($to, $subject, $content, implode("\r\n", $headers));
    }
}
?>