<?php
require_once("Utilities.php");
$form_data = json_decode($_POST["FormData"]);
execute_query_upload_files_and_notify("prepare_update", $form_data->Name." number ".$form_data->ID." updated.", $form_data->Name." number ".$form_data->ID." not updated.");
?>