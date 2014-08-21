<?php
require_once("Utilities.php");
execute_query_upload_files_and_notify("prepare_update", $_GET["Name"]." number ".$_GET["ID"]." updated.", $_GET["Name"]." number ".$_GET["ID"]." not updated.");
?>