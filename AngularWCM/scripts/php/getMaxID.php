<?php
require_once("Utilities.php");

if(isset($_POST["FormData"])){
    $form_data = json_decode($_POST["FormData"]);
    
    $conn = get_connection($form_data->Connection);

    $query = "SELECT MAX({$form_data->PK}) FROM {$form_data->Table}";
    $query = ms_escape_string($query);

    if($conn){
        $stmt = $conn->prepare($query);
    }else{
        exit("-1");
    }

    if(!$stmt->execute()){
        // failed to execute, table or primary key incorrect
        exit("-1");
    }
    
    if($row = $stmt->fetch(PDO::FETCH_NUM)){
        // executed and row returned
        // first column (only column) has max pk
        echo $row[0];
    }else{
        // empty result set
        exit("-1");
    }
}
?>