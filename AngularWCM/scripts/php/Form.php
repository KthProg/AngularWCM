<?php

if(isset($_POST["Function"]) || isset($_GET["Function"])){
    $is_post = isset($_POST["Function"]);
    $func = $is_post ? $_POST["Function"] : $_GET["Function"];
    switch($func){
        case "Open":
            $form_data = $is_post ? $_POST["Form"] : $_GET["Form"];
            $res = open(json_decode($form_data));
            if($res){
                echo json_encode($res);
            }else{
                echo $res;
            }
            break;
        case "getMaxID":
            $form_data = $is_post ? $_POST["Form"] : $_GET["Form"];
            $res = get_max_ID(json_decode($form_data));
            echo $res;
            break;
        case "Submit":
            $form_data = $is_post ? $_POST["Form"] : $_GET["Form"];
            submit(json_decode($form_data));
            break;
        case "Update":
            $form_data = $is_post ? $_POST["Form"] : $_GET["Form"];
            update(json_decode($form_data));
            break;
        case "Query":
            $qry = $is_post ? $_POST["Query"] : $_GET["Query"];
            $params = $is_post ? $_POST["Params"] : $_GET["Params"];
            $assoc = null;
            if(isset($_POST["ASSOC"])){
                $assoc = $_POST["ASSOC"];
            }else if(isset($_GET["ASSOC"])){
                $assoc = $_GET["ASSOC"];
            }
            $res = execute_query($qry, json_decode($params), (($assoc != null) ? PDO::FETCH_ASSOC : PDO::FETCH_NUM));
            echo json_encode($res);
            break;
    }
}

function get_max_ID($form_data) {
    $conn = get_connection($form_data->Connection);

    $query = "SELECT MAX({$form_data->PK}) FROM {$form_data->Table}";
    $query = ms_escape_string($query);

    if($conn){
        $stmt = $conn->prepare($query);
    }else{
        exit("-1");
    }

    if(!$stmt->execute()){
        // failed to execute, table or primary key incorrect
        exit("-1");
    }
        
    if($row = $stmt->fetch(PDO::FETCH_NUM)){
        // executed and row returned
        // first column (only column) has max pk
        return $row[0];
    }else{
        // empty result set
        exit("-1");
    }
}

function open($form_data){
    $query = "SELECT * FROM {$form_data->Table} WHERE {$form_data->OpenBy}=?";
    $query = ms_escape_string($query);
    $conn = get_connection($form_data->Connection);
    if(!$conn){ return; }
    $stmt = $conn->prepare($query);
        
    if(!$stmt->execute(array($form_data->OpenByValue))){
        send_error($stmt->errorInfo());
        return;
    }
        
    if($rows = $stmt->fetchAll(PDO::FETCH_ASSOC)){
        return $rows;
    }
}

function send_error($error_info){
    print_r($error_info);
    notify("wcm-500dx.external_tasks.1163497.hooks@reply.redbooth.com", "An error occurred.", "GET: ".print_r($_GET, true)."<br>POST: ".print_r($_POST, true)."<br>ERROR: ".print_r($error_info, true));
}

function submit($form) {
    execute_query_upload_files_and_notify("prepare_inserts", $form, $form->Name." number ".$form->tables[0]->ID." submitted.", $form->Name." number ".$form->tables[0]->ID." not submitted.");
}

function update($form) {
    execute_query_upload_files_and_notify("prepare_updates", $form, $form->Name." number ".$form->tables[0]->ID." updated.", $form->Name." number ".$form->tables[0]->ID." not updated.");
}

// uses xpath to create a connection by name from an XML file
function get_connection($connection_name){
    $con = (string)$connection_name;
    
    $xml = simplexml_load_file("http://192.9.200.62/xml/connections.xml");
    if(!$xml) { exit("Could not load xml file."); }
    $con_nodes = $xml->xpath("/connections/connection[@name='".$con."']");
    if(!$con_nodes) { exit("Could not load find connection ".$con."."); }
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
function execute_query_upload_files_and_notify($query_func, $form, $success, $failure){
    $conn = get_connection($form->tables[0]->Connection);
    
    $queries = $query_func($form);
    $all_successful = true;
    
    foreach($queries as $query){
            $stmt = $conn->prepare($query["Query"]);
            
            if($stmt->execute($query["Values"])){
                echo $success."<br>";
                //echo "<pre>";
                //print_r($stmt->errorInfo());
                //print_r($query);
                //echo "</pre>";
                $all_successful = $all_successful && true;
            }else{
                echo $failure."<br>";
                $all_successful = false;
                send_error(array("Error:" => $stmt->errorInfo(), "Query:" => $query));
                echo "<pre>";
                print_r($stmt->errorInfo());
                print_r($query);
                echo "</pre>";
                exit();
            }
    }
    
    if($all_successful){
        insert_notification($success, $form->EmailBody, $form->tables[0], get_pk_value($form->tables[0], $form->tables[0]->records[0]));
    }
}

// another script sends the emails every 5 minutes
// this is to prevent browsers hanging on mobile devices
function insert_notification($subject, $body, $table, $id){
    $is_new = ($id == null);
    $conn = get_connection("Safety");
    $stmt = $conn->prepare("INSERT INTO Emails (New, Subj, Body, TableName, FormID) VALUES(?, ?, ?, ?, ".($is_new ? "(SELECT (MAX({$table->PK}) + 1) FROM {$table->Table})" : "?").")");
    $params = $is_new ? array(1, $subject, $body, $table->Table) : array(0, $subject, $body, $table->Table, $id);
    if($stmt->execute($params)){
        echo "Email query executed (Email will send in 0-5 minutes)<br>";
    }else{
        echo "Email query not executed<br>";
        send_error($stmt->errorInfo());
    }
}

function prepare_inserts($form){
    $queries = array();
    foreach($form->tables as $table){
        for($i = 0, $l = count($table->records); $i < $l; ++$i){
            $values = array();
            $record = $table->records[$i];
            $query = record_to_insert_sql($table, $record, array($table->PK, $table->OpenBy));
            $values = record_to_values($record, array($table->PK, $table->OpenBy));
            $queries[] = array("Query" => ms_escape_string($query), "Values" => $values, "Table" => $table->Table);
        }
        if($table->IsMain != true){
            $queries[] = array("Query" => ms_escape_string("UPDATE {$table->Table} SET [{$table->OpenBy}] = (SELECT MAX([{$form->tables[0]->PK}]) FROM {$form->tables[0]->Table}) WHERE [{$table->OpenBy}] IS NULL"), "Values" => array(), "Table" => $table->Table);
        }
    }
    return $queries;
}

function prepare_updates($form){
    $queries = array();
    foreach($form->tables as $table){
        for($i = 0, $l = count($table->records); $i < $l; ++$i){
            $values = array();
            $record = $table->records[$i];
            $query = "";
            if(record_is_new($table, $record)){
                $query = record_to_insert_sql($table, $record, array($table->PK));
                $values = record_to_values($record, array($table->PK));
            } else {
                //$query = record_to_update_sql($table, $table->records[0], array($table->PK));
                $query = record_to_update_sql($table, $record, array($table->PK));
                $values = record_to_values($record, array());
            }
            $queries[] = array("Query" => ms_escape_string($query), "Values" => $values, "Table" => $table->Table);
        }
    }
    return $queries;
}

function record_to_insert_sql($table, $record, $skip){
    $cols = "";
    $vals = "";
    $query = "INSERT INTO {$table->Table} ";
    foreach($record->fields as $field){
        if(in_array($field->name, $skip)){
            continue;
        }
        $cols .= "[".$field->name."],";
        $vals .= ":".$field->name.",";
    }
    $cols = substr($cols, 0, strlen($cols) - 1);
    $vals = substr($vals, 0, strlen($vals) - 1);
    $query .= "(".$cols.") VALUES (".$vals.")";
    return $query;
}

function record_to_update_sql($table, $record, $skip){
    $query = "UPDATE {$table->Table} SET ";
    $values[] = array();
    foreach($record->fields as $field){
        if(in_array($field->name, $skip)){
            continue;
        }
        $query .= "[".$field->name."]=:".$field->name.",";
    }
    $query = substr($query, 0, strlen($query) - 1);
    $query .= " WHERE {$table->PK}=:{$table->PK}";
    return $query;
}

function record_to_values($record, $skip){
    $values = array();
    foreach($record->fields as $field){
        if(in_array($field->name, $skip)){
            continue;
        }
        // set to null if the value is not defined
        $values[$field->name] = $field->value;
    }
    return $values;
}

function get_pk_value($table, $record) {
    foreach($record->fields as $field){
        if($field->name == $table->PK){
            return $field->value;
        }
    }
    return null;
}


function record_is_new($table, $record){
    return (get_pk_value($table, $record) == null);
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

function execute_query($query, $params, $fetch_type = PDO::FETCH_NUM) {
    $xml = simplexml_load_file("http://192.9.200.62:8080/xml/queries.xml");
    if(!$xml) { exit("Could not load xml file."); }
    $query_nodes = $xml->xpath("/queries/query[@name='".$query."']");
    if(!$query_nodes) { exit("Could not find query ".$query); }
    $query_string = $query_nodes[0]->qstring;  
    $connection_string = $query_nodes[0]->connection;

    $conn = get_connection($connection_string);
    if($conn){
        $stmt = $conn->prepare($query_string);
    }else{
        send_error(array("Could not execute query ".$query_string." using connection ".$connection_string));
        return array();
    }

    if(!$stmt->execute($params)){
        send_error($stmt->errorInfo());
        return array();
    }
    
    $rows = $stmt->fetchAll($fetch_type);
    
    if(!$rows){
        return array();
    }

    if($fetch_type != PDO::FETCH_NUM){
        return $rows;
    }else{
        $filtered = array();
        foreach($rows as $row){
            $filtered[$row[0]] = $row[1];
        }
        return $filtered;
    }
}

?>