<?php
require_once("Utilities.php");

if(isset($_GET["Table"], $_GET["PK"], $_GET["ID"], $_GET["Connection"])){
    $query = "SELECT * FROM {$_GET["Table"]} WHERE {$_GET["PK"]}=?";
    $query = ms_escape_string($query);
    $conn = get_connection($_GET["Connection"]);
    if($conn){
        $stmt = $conn->prepare($query);
    }else{
        return;
    }
    
    if($stmt->execute(array($_GET["ID"]))){
        if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            echo json_encode($row);
        }else{
            //echo json_encode(array($_GET["PK"] => get_max_id($_GET["Connection"], $_GET["Table"], $_GET["PK"])));
            return;
        }
    }else{
        return;
    }
}

function get_max_id($connection, $table, $pk){
    $conn = get_connection($connection);

    $query = "SELECT MAX({$pk}) FROM {$table}";
    $query = ms_escape_string($query);

    if($conn){
        $stmt = $conn->prepare($query);
    }else{
        return -1;
        exit();
    }

    if($stmt->execute()){
        if($row = $stmt->fetch(PDO::FETCH_NUM)){
            return $row[0];
            exit();
        }else{
            return -1;
            exit();
        }
    }else{
        return -1;
        exit();
    }

    return 1;
}
?>