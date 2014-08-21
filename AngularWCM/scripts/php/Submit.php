<?php
require_once("Utilities.php");
execute_query_upload_files_and_notify("prepare_insert", "New ".$_GET["Name"]." submitted.", "New ".$_GET["Name"]." not submitted.");
?>