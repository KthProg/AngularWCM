<?php
require_once("Utilities.php");
$form_data = json_decode($_POST["FormData"]);
execute_query_upload_files_and_notify("prepare_insert", $form_data->Name." number ".$form_data->ID." submitted.", $form_data->Name." number ".$form_data->ID." not submitted.");
?>