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
        notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "An error occurred.", "QUERY: ".$query."<br>GET: ".print_r($_GET, true)."<br>ERROR: ".print_r($stmt->errorInfo(), true));
        return;
    }
}
?>