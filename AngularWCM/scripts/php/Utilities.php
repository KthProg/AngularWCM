<?php
// uses xpath to create a connection by name from an XML file
function get_connection($connection_name){
    $con = (string)$connection_name;
        
    $xml = simplexml_load_file("http://192.9.200.62:8080/xml/connections.xml");
    $con_nodes = $xml->xpath("/connections/connection[@name='".$con."']");
    $con_data = $con_nodes[0];

    try{
        $conn = new PDO("sqlsrv:Server=".$con_data->host."; Database=".$con_data->database, $con_data->user, $con_data->password);
        return $conn;
    }
    catch(PDOException $e){
        echo $e->getMessage();
        return false;
    }
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

// ... does what it says...
// the update and submit code both call this with different $query_funcs
function execute_query_upload_files_and_notify($query_func, $success, $failure){
    if(!isset($_POST["FormData"], $_POST["Fields"])){
        notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "Someone refreshed the script page.", "GET: ".print_r($_GET, true)."<br>POST: ".print_r($_POST, true)."<br>");
        exit("Please do not try to refresh this page, or to go to this page directly.");
    }
    
    $form_data = json_decode($_POST["FormData"]);
    $fields = json_decode($_POST["Fields"]);
    $conn = get_connection($form_data->Connection);

    $query = $query_func();
    $query = ms_escape_string($query);
    $stmt = $conn->prepare($query);
        
    foreach($fields as $name => $val){
        if(is_array($val)){
            $fields->$name = json_encode($val);
        }
    }
        
    if($stmt->execute(get_object_vars($fields))){
        echo $success."<br>";
        notify($form_data->Contacts, $success, $form_data->EmailBody);
    }else{
        echo $failure."<br>";
        notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "An error occurred.", "QUERY: ".$query."GET: ".print_r($_GET, true)."<br>POST: ".print_r($_POST, true)."<br>Error: ".print_r($stmt->errorInfo(), true));
    }
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

// TODO: use some sort of array reduce function instead of a loop
function prepare_insert(){
    $form_data = json_decode($_POST["FormData"]);
    $fields = json_decode($_POST["Fields"]);
    $query = "INSERT INTO {$form_data->Table} ";
    $cols = "";
    $vals = "";
    foreach($fields as $col => $val){
        if($col == $form_data->PK){
            continue;
        }
        $cols .= "[".$col."],";
        $vals .= ":".$col.",";
    }
    $cols = substr($cols, 0, strlen($cols) - 1);
    $vals = substr($vals, 0, strlen($vals) - 1);
    $query .= "(".$cols.") VALUES (".$vals.")";
    return $query;
}

function prepare_update(){
    $form_data = json_decode($_POST["FormData"]);
    $fields = json_decode($_POST["Fields"]);
    $query = "UPDATE {$form_data->Table} SET ";
    foreach($fields as $col => $val){
        if($col == $form_data->PK){
            continue;
        }
        $query .= "[".$col."]=:".$col.",";
    }
    $query = substr($query, 0, strlen($query) - 1);
    $query .= " WHERE {$form_data->PK}={$form_data->ID}";
    return $query;
}

?>