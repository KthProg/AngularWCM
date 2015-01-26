<?php

require_once("\\smtp\\class.phpmailer.php");
require_once("\\smtp\\class.smtp.php");

$emails = execute_query("GetTopIssues", "[]", PDO::FETCH_ASSOC);
if($stmt->execute()){
    for($i = 0, $l = count($emails); $i < $l; ++$i){
		$email = $emails[$i];
		if($email["SupervisorName"] == $last_supervisor){
			$body.= 
<<<EOT
$email[rank] . $email[Name] number $email[ID].$email[LineNum]<br>
Issue: $email[LineItem]<br>
Details: $email[Details]<br>
Location: $email[Department] - $email[Zone] - $email[Machine]<br>
Days Open: $email[DaysOpen]<br>
Severity: $email[Severity]<br>
Compliancy: $email[Compliancy]<br>
<br><br>
EOT;
		} else {
			notify($last_supervisor_email, $body, $conn);
			
			$body =
<<<EOT
Hello $email[SupervisorName] <br><br>
The top ten open issues for your area are listed below, 
please take care of these issues as soon as possible. You may have less than ten.<br><br>

Visit http://192.9.200.62/Dashboard/Issues.html in your internet browser to view your issues.
Select your name from the supervisors drop-down then press 'apply' to filter.<br><br>

To close an issue, click on the checkbox for that issue. You will be prompted to enter the
action taken to close the issue. Once the action is entered, the issue is closed.<br><br>
				
$email[rank] . $email[Name] number $email[ID].$email[LineNum]<br>
Issue: $email[LineItem]<br>
Details: $email[Details]<br>
Location: $email[Department] - $email[Zone] - $email[Machine]<br>
Days Open: $email[DaysOpen]<br>
Severity: $email[Severity]<br>
Compliancy: $email[Compliancy]<br>
<br><br>
EOT;
		}
		$last_supervisor = $email["SupervisorName"];
		$last_supervisor_email = $email["SupervisorEmail"];
    }
}

function notify($email, $body, $conn){
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
    $mail->Subject = "The top ten open issues in your area";
    $mail->Body = $body;
	if(!$mail->Send()):
        echo "Mailer Error: " . $mail->ErrorInfo;
    else:
        echo "Message has been sent";
    endif;
}

?>