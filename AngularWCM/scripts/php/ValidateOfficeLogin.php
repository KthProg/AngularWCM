<?php

$html_doc = new DOMDocument();
$html_doc->loadHTMLFile("http://login.microsoftonline.com");
if($html_doc){
    $html_doc->saveHTML();
}else{
    echo "Didn't work.";
}

?>