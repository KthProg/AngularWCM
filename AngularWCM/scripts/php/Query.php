<?php
if(isset($_GET["Query"]) || isset($_POST["Query"])){

    $sent_qry = $_GET["Query"] ?: $_POST["Query"];
    if(isset($_GET["ASSOC"])){
        $sent_assoc = $_GET["ASSOC"] ?: $_POST["ASSOC"];
    }else{
        $sent_assoc = "false";
    }
    $sent_params = $_GET["Params"] ?: $_POST["Params"];
    if(isset($_GET["ReturnQuery"])){
        $sent_return = true;
    }else{
        $sent_return = false;
    }
    
    require_once("Form.php");

    $xml = simplexml_load_file("http://192.9.200.62/xml/queries.xml");
    if(!$xml) { exit("Could not load xml file."); }
    $query = $xml->xpath("/queries/query[@name='".$sent_qry."']");
    if(!$xml) { exit("Could not find query ".$sent_qry); }
    $query_string = $query[0]->qstring;  
    $connection_string = $query[0]->connection;

    $conn = get_connection($connection_string);
    if($conn){
        $stmt = $conn->prepare($query_string);
    }else{
        send_error(array("Could not execute query ".$query_string." using connection ".$connection_string));
        exit("[]");
    }

    $fetch_type = ($sent_assoc != "false") ? PDO::FETCH_ASSOC : PDO::FETCH_NUM;

    if(!$stmt->execute(json_decode($sent_params))){
        send_error($stmt->errorInfo());
        if($sent_return){
            return array();
        }else{
            exit(json_encode(array()));
        }
    }
    
    if(!($rows = $stmt->fetchAll($fetch_type))){
        if($sent_return){
            return array();
        }else{
            exit(json_encode(array()));
        }
    }

    if($fetch_type != PDO::FETCH_NUM){
        if($sent_return){
            return $rows;
        }else{
            echo json_encode($rows);
        }
    }else{
        $filtered = array();
        foreach($rows as $row){
            $filtered[$row[0]] = $row[1];
        }
        
        if($sent_return){
            return $filtered;
        }else{
            echo json_encode($filtered);
        }
    }

}
?>