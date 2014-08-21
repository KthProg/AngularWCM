<?php
if(isset($_POST)){

require_once("Utilities.php");

$xml = simplexml_load_file("http://192.9.200.62/xml/queries.xml");
$query = $xml->xpath("/queries/query[@name='".$_GET["Query"]."']");
$query_string = $query[0]->qstring;  
$connection_string = $query[0]->connection;

$conn = get_connection($connection_string);
if($conn){
    $stmt = $conn->prepare($query_string);
}else{
    echo "[]";
    exit();
}

if($stmt->execute(json_decode($_GET["Params"]))){
    if($rows = $stmt->fetchAll(PDO::FETCH_NUM)){
        $first_of_each = function($n){
                        return $n[0];
                    };
        $filtered = array_map($first_of_each, $rows);
        echo json_encode($filtered);
    }else{
        echo "[]";
    }
}else{
    //$err = $stmt->errorInfo();
    //echo $err;
    echo "[]";
}

}
?>