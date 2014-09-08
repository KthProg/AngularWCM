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
        echo -1;
        exit();
    }

    if($stmt->execute()){
        if($row = $stmt->fetch(PDO::FETCH_NUM)){
            echo $row[0];
            exit();
        }else{
            echo -1;
            exit();
        }
    }else{
        echo -1;
        exit();
    }

    echo 1;
}
?>