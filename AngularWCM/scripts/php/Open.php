<?php
require_once("Utilities.php");

if(isset($_POST["FormData"])){
    $form_data = json_decode($_POST["FormData"]);
    
    $query = "SELECT * FROM {$form_data->Table} WHERE {$form_data->PK}=?";
    $query = ms_escape_string($query);
    $conn = get_connection($form_data->Connection);
    if($conn){
        $stmt = $conn->prepare($query);
    }else{
        return;
    }
    
    if(!$stmt->execute(array($form_data->ID))){
        notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "An error occurred.", "QUERY: ".$query."<br>GET: ".print_r($_GET, true)."<br>ERROR: ".print_r($stmt->errorInfo(), true));
        return;
    }
    
    if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        echo json_encode($row);
    }
}
?>