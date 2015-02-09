<?php

if(!(empty($_POST) && empty($_GET))){
    $is_post = !empty($_POST);
    $named = null;
    if(isset($_POST["Named"])){
        $named = $_POST["Named"];
    }else if(isset($_GET["Named"])){
        $named = $_GET["Named"];
    }
    $connection = null;
    if(isset($_POST["Connection"])){
        $connection = $_POST["Connection"];
    }else if(isset($_GET["Connection"])){
        $connection = $_GET["Connection"];
    }
    $qry = $is_post ? $_POST["Query"] : $_GET["Query"];
    $params = $is_post ? $_POST["Params"] : $_GET["Params"];
    $assoc = null;
    if(isset($_POST["ASSOC"])){
        $assoc = $_POST["ASSOC"];
    }else if(isset($_GET["ASSOC"])){
        $assoc = $_GET["ASSOC"];
    }
    $res = execute_query($qry, $connection, ($named != null), json_decode($params), (($assoc != null) ? PDO::FETCH_ASSOC : PDO::FETCH_NUM));
    exit(json_encode($res));
}

function get_connection($connection_name){
    $con = (string)$connection_name;
    
    $json = file_get_contents("http://192.9.200.62:8080/json/connections.json");
    if($json === false) { exit("Could not load json file."); }
    $con_obj = json_decode($json);
    if(!isset($con_obj->$con)) { exit("Could not find connection ".$con."."); }
    $con_data = $con_obj->$con;
    
    try{
        $conn = new PDO("sqlsrv:Server=".$con_data->host."; Database=".$con_data->database, $con_data->user, $con_data->password);
        return $conn;
    } catch(PDOException $e){
        echo $e->getMessage();
        return false;
    }
}

function get_query($query_name){
    $qry = (string)$query_name;
    
    $json = file_get_contents("http://192.9.200.62:8080/json/queries.json");
    if($json === false) { exit("Could not load json file."); }
    $qry_obj = json_decode($json);
    if(!isset($qry_obj->$qry)) { exit("Could not find query ".$qry."."); }
    $qry_data = $qry_obj->$qry;

    return $qry_data;
}

// this is from stackoverflow
function ms_escape_string($data) {
    if (!isset($data) or empty($data)){
        return '';
    }
    if (is_numeric($data)){
        return $data;
    }
    $non_displayables = array(
        '/%0[0-8bcef]/',            // url encoded 00-08, 11, 12, 14, 15
        '/%1[0-9a-f]/',             // url encoded 16-31
        '/[\x00-\x08]/',            // 00-08
        '/\x0b/',                   // 11
        '/\x0c/',                   // 12
        '/[\x0e-\x1f]/'             // 14-31
    );
    foreach ( $non_displayables as $regex ){
        $data = preg_replace( $regex, '', $data );
    }
    $data = str_replace("'", "''", $data );
    return $data;
}

function execute_query($query, $connection, $named, $params, $fetch_type = PDO::FETCH_NUM) {
    define("INVALID_CONNECTION", -1);
    define("EXECUTION_FAILED", -2);
    define("NO_ROWS", -3);
    
    if($named){
        $qry_obj = get_query($query);
        $query_string = $qry_obj->qstring;
        $connection_string = $qry_obj->connection;
        $conn = get_connection($connection_string);
    }else{
        $query_string = $query;
        $conn = get_connection($connection);
    }

    if($conn){
        $stmt = $conn->prepare($query_string);
    }else{
        send_error(array("Invalid Connection"));
        return array(INVALID_CONNECTION => "Error: Invalid Connection");
    }

    if(!$stmt->execute((array)$params)){
        send_error($stmt->errorInfo());
        return array(EXECUTION_FAILED => "Error: Could not execute statement");
    }
    
    $rows = $stmt->fetchAll($fetch_type);
    
    if(!$rows){
        return array(NO_ROWS => "Error: No rows");
    }

    return $rows;
}

function send_error($error_info){
    print_r($error_info);
    notify("hooks@njt-na.com", "An error occurred.", "GET: ".print_r($_GET, true)."<br>POST: ".print_r($_POST, true)."<br>ERROR: ".print_r($error_info, true));
}

// another script sends the emails every 5 minutes
// this is to prevent browsers hanging on mobile devices
function notify($contacts, $subject, $body){
    $conn = get_connection("Safety");
    $stmt = $conn->prepare("INSERT INTO Emails (Contacts, Subj, Body) VALUES(?, ?, ?)");
    if($stmt->execute(array($contacts, $subject, $subject."<br>".$body))){
        echo "Email query executed (Email will send in 0-5 minutes)<br>";
    }else{
        echo "Email query not executed<br>";
    }
}

?>