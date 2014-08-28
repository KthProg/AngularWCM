<?php
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
    
function execute_query_upload_files_and_notify($query_func, $success, $failure){

    $conn = get_connection($_GET["Connection"]);

    $query = $query_func();
    $query = ms_escape_string($query);
    $stmt = $conn->prepare($query);
        
    if($stmt->execute($_POST)){
        echo $success."<br>";
        if($_GET["SendEmail"] == "true"){
            notify($_GET["Contacts"], $success, $_GET["EmailBody"]);
        }
    }else{
        echo $failure."<br>";
        echo $query."<br>";
        print_r($_POST);
        print_r($stmt->errorInfo());
        notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "An error occurred.", "QUERY: ".$query."<br>POST: ".print_r($_POST)."<br>Error: ".print_r($stmt->errorInfo()));
    }
}

function upload_files(){
    for($i = 0; $i < count($_FILES["file"]["name"]); ++$i) {
        $base_file = basename($_FILES["file"]["name"][$i]);
        if($base_file != ""){
            $fname = "../../uploads/{$_GET["Name"]}_{$_GET["ID"]}_{$i}_{$base_file}";
            if(move_uploaded_file($_FILES["file"]["tmp_name"][$i],$fname)){
                echo "Uploaded file ".$base_file."<br>";
            }else{
                echo "Error: ".$_FILES["file"]["error"][$i].", Could not upload ".$_FILES["file"]["name"][$i]." to ".$fname."<br>";
            }
        }
    }
}
    
function notify($contacts, $subject, $body){
    $conn = get_connection("Safety");
    $stmt = $conn->prepare("INSERT INTO Emails (Contacts, Subj, Body) VALUES(?, ?, ?)");
    if($stmt->execute(array($contacts, $subject, $subject."<br>".$body))){
        echo "Email query executed (Email will send in 0-5 minutes)<br>";
    }else{
        echo "Email query not executed<br>";
    }
}

function prepare_insert(){
    $query = "INSERT INTO {$_GET["Table"]} ";
    $cols = "";
    $vals = "";
    foreach($_POST as $col => $val){
        if($col == $_GET["PK"]){
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
    $query = "UPDATE {$_GET["Table"]} SET ";
    foreach($_POST as $col => $val){
        if($col == $_GET["PK"]){
            continue;
        }
        $query .= "[".$col."]=:".$col.",";
    }
    $query = substr($query, 0, strlen($query) - 1);
    $query .= " WHERE {$_GET["PK"]}={$_GET["ID"]}";
    return $query;
}

?>