<?php

require_once("\\smtp\\class.phpmailer.php");
require_once("\\smtp\\class.smtp.php");

require_once("Form.php");

$emails = execute_query("GetTopIssues", array(), PDO::FETCH_ASSOC);
if($emails){
    for($i = 0, $l = count($emails); $i < $l; ++$i){
		$email = $emails[$i];
		if(isset($last_supervisor_name) && ($email["SupervisorName"] == $last_supervisor_name)){
			$body .= issue_to_description($email);
		} else {
            if(isset($last_supervisor_email)){
			    send_email($last_supervisor_email, get_introduction($last_supervisor_name).$body);
            }
			$body = issue_to_description($email);
		}
		$last_supervisor_name = $email["SupervisorName"];
		$last_supervisor_email = $email["SupervisorEmail"];
    }
}

function send_email($email, $body){
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
    $mail->addAddress($email);
	$mail->addAddress("phelps@njt-na.com");
    $mail->addAddress("hooks@njt-na.com");
    $mail->Subject = "The top ten open issues in your area";
    $mail->Body = $body;
	if(!$mail->Send()):
        echo "Mailer Error: ".$mail->ErrorInfo."<br>";
    else:
        echo "Message has been sent.<br>";
    endif;
}

function get_introduction($supervisor_name){
$introduction = 
<<<EOT
<table style="width: 100%; border: dashed 1px grey;">
    <tr>
        <td style="border-bottom: dashed 1px grey;">
            <h1 style="color: forestgreen;">Hello $supervisor_name,</h1>
        </td>
    </tr>
    <tr>
        <td>
            &nbsp;&nbsp;&nbsp;&nbsp;The top ten open issues for your area are listed below, please take care of these issues as soon as possible. You may have less than ten.<br><br>

            &nbsp;&nbsp;&nbsp;&nbsp;Visit the <a href="http://192.9.200.62/Dashboard/Issues.html">Open Issues Safety App</a> in your internet browser to view your issues (Click on the link - you must be connected to the company network). Select your name from the supervisors drop-down then press 'apply' to filter.<br><br>

            &nbsp;&nbsp;&nbsp;&nbsp;To close an issue, click on the checkbox for that issue. You will be prompted to enter the action taken to close the issue. Once the action is entered, the issue is closed.
        </td>
    </tr>
</table>
EOT;

return $introduction;
}

function issue_to_description($issue){
$description = 
<<<EOT
<table style="width: 100%;">
    <tr>
        <td colspan="2" style="background-color: rgb(200, 200, 200);">
            <em>$issue[rank] . $issue[Name] number $issue[ID].$issue[SubCategoryID]</em>
        </td>
    </tr>
    <tr>
        <td><strong>Issue:</strong> </td>
        <td>$issue[SubCategory]</td>
    </tr>
    <tr>
        <td><strong>Details:</strong></td>
        <td>$issue[Details]</td></tr>
    <tr>
        <td><strong>Location:</strong></td>
        <td>$issue[Department] - $issue[Zone] - $issue[Machine]</td>
    </tr>
    <tr>
        <td><strong>Days Open:</strong></td>
        <td>$issue[DaysOpen]</td>
    </tr>
    <tr>
        <td><strong>Severity:</strong></td>
        <td>$issue[Severity]</td>
    </tr>
    <tr>
        <td><strong>Compliancy:</strong></td>
        <td>$issue[Compliancy]</td>
    </tr>
</table>
EOT;

return $description;
}

?>