<?php
require_once("Utilities.php");

if(isset($_GET["Table"], $_GET["PK"], $_GET["ID"], $_GET["Connection"])){
    $conn = get_connection($_GET["Connection"]);

    $query = "SELECT MAX({$_GET["PK"]}) FROM {$_GET["Table"]}";
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