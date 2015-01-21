<?php

require_once("\\smtp\\class.phpmailer.php");
require_once("\\smtp\\class.smtp.php");

require_once("Form.php");

$MOUND_CONTACTS = array("jmurphy@venturecorporation.net","pillars@ventureglobalengineering.com","dharper@mayco-mi.com","newberry@ventureglobalengineering.com");
$DEFAULT_CONTACTS = array(
    "ESEWOs" => array("phelps@njt-na.com")
    );

$emails = execute_query("GetAllEmails", array(), PDO::FETCH_ASSOC);
foreach($emails as $email){
    $table_info = execute_query("GetTablesData", array("'{$email["TableName"]}'"), PDO::FETCH_ASSOC);
	$location = get_location_fields($table_info);
    $pk = get_pk($table_info);
    $contacts = execute_query("GetContactsFromTableAndID", array($email["TableName"], $location["Plants"], $location["Departments"], $location["Zones"], $pk, $email["FormID"]), PDO::FETCH_ASSOC);
    $contacts_arr = array_map(function($el){
        return $el["SupervisorEmail"];
    }, $contacts);
    
    if($email["TableName"] == "ToolIssues" && $email["New"] == 1){
        $contacts_arr = array_merge($contacts_arr, $MOUND_CONTACTS);
    }
    
    if(isset($DEFAULT_CONTACTS[$email["TableName"]])){
        $contacts_arr = array_merge($contacts_arr, $DEFAULT_CONTACTS[$email["TableName"]]);
    }
	
    send_email($email, $contacts_arr);
}

function get_location_fields ($table_info) {
    $loc_fields = array_filter($table_info, function ($field) {
        return $field["IsFK"] == 1 && 
            in_array($field["REF_TABLE"], array("Plants","Departments","Zones")) 
            && $field["REF_COLUMN"] == "ID";
    });
    
    $loc_array = array();
    
    foreach($loc_fields as $loc_field){
        $loc_array[$loc_field["REF_TABLE"]] = $loc_field["COLUMN_NAME"];
    }
    
    return $loc_array;
}

function get_pk ($table_info) {
    $pk_field = array_values(array_filter($table_info, function ($field) {
        return $field["IsPK"] == 1;
    }));
    
    return $pk_field[0]["COLUMN_NAME"];
}

function print_r_nicely($obj){
    echo "<pre>";
    print_r($obj);
    echo "</pre>";
}
    
/**
 * Notifies the specified contacts of the submitted or updated form
 * @param string $contacts Semi-colon delimited emails
 * @param string $subject The subject of the email
 * @param string $body The body of the email
 */
function send_email($email, $contacts){
    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPSecure = "tls";
    $mail->Port = 587;
    $mail->SMTPAuth = true;
    $mail->Username = "formalert@gmail.com";
    $mail->Password = "t05kwp456";
    $mail->From = "formalert@gmail.com";
    $mail->FromName = "FormAlert";
    $mail->isHTML(true);
    foreach($contacts as $address):
        $mail->addAddress($address);
    endforeach;
    $mail->Subject = $email["Subj"];
    $mail->Body = $email["Body"];
    if(!$mail->Send()):
        echo "Mailer Error: " . $mail->ErrorInfo;
    else:
        echo "Message has been sent";
		delete_email($email["ID"]);
    endif;
}

function delete_email($id){
    execute_query("DeleteEmail", array($id), PDO::FETCH_ASSOC);
}

?>