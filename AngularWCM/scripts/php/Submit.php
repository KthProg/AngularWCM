<?php
require_once("Utilities.php");
execute_query_upload_files_and_notify("prepare_insert", $_GET["Name"]." number ".$_GET["ID"]." submitted.", $_GET["Name"]." number ".$_GET["ID"]." not submitted.");
?>