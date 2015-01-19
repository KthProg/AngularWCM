<?php
if(isset($_POST["Query"]) || isset($_GET["Query"])){
    
    $query_name = isset($_POST["Query"]) ? $_POST["Query"]: $_GET["Query"];

    $xml = simplexml_load_file("http://192.9.200.62/xml/queries.xml");
    $query = $xml->xpath("/queries/query[@name='".$query_name."']");

    if($query){
        echo json_encode($query[0]->parameters);
    }else{
        echo "[]";
    }

}
?>