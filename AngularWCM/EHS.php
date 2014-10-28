<!DOCTYPE html>
<html>
<head>
    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">

    <script src="http://code.jquery.com/jquery-2.1.1.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.18/angular.min.js"></script>
    <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/form.js"></script>

    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="css/Normalize.css" />
    <link rel="stylesheet" href="css/Checklist.css" />

    <title>EHS</title>

    <style>
        h1{ 
	        color: orange;
        }

        h3{
	        background-color: orange;
        }

        strong{
	        background-color: orange;
        }
    </style>
</head>

<body
    ng-app="wcm"
    ng-controller="Form"
    ng-init="setFormData('EHS');">
    <table>
        <tr>
            <td colspan="3">
                <h1>EHS No. {{id + (hasRecord ?" (Updating)" : " (New Form)")}}</h1>
            </td>
        </tr>
        <tr>
            <td colspan="3">
                <div class="inputPlusLabel">
                    <strong>Date</strong>
                    <input type="date" ng-model="fields['EHSDate']" placeholder="Date created" required>
                </div>
                <div class="inputPlusLabel">
                    <strong>Shift</strong>
                    <select ng-model="fields['Shift']" ng-options='v as v for (k,v) in  ["1","2","3"]' required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Auditor's Name</strong>
                    <select ng-model="fields['AuditorID']" ng-options="k as v for (k,v) in queries['AuditorID'].options" required>
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Plant</strong>
                    <select ng-model="fields['PlantID']" ng-options="k as v for (k,v) in queries['PlantID'].options" required>
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Department</strong>
                    <select ng-model="fields['DepartmentID']" ng-options="k as v for (k,v) in queries['DepartmentID'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Zone</strong>
                    <select ng-model="fields['ZoneID']" ng-options="k as v for (k,v) in queries['ZoneID'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Machine</strong>
                    <select ng-model="fields['MachineID']" ng-options="k as v for (k,v) in queries['MachineID'].options"></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Work Cell</strong>
                    <select ng-model="fields['WorkCellID']" ng-options="k as v for (k,v) in queries['WorkCellID'].options" required>
                        <!-- code to update at end of file -->
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Tool No.</strong>
                    <select ng-model="fields['MoldNo']" ng-options="k as v for (k,v) in queries['MoldNo'].options">
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Supervisor</strong>
                    <select ng-model="fields['SupervisorID']" ng-options="k as v for (k,v) in queries['SupervisorID'].options" required>
                    </select>
                </div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <h2>Requirement</h2>
            </td>
            <td>
                <h2>Select</h2>
            </td>
        </tr>
        <?php 
        $_GET["Query"] = "AuditLines";
        $_GET["ASSOC"] = "true";
        $_GET["Params"] = json_encode(array("EHS"));
        $_GET["ReturnQuery"] = "true";
        $json_lines = require_once('/scripts/php/Query.php');
        $last_category = "";
        for($i = 0, $l = count($json_lines); $i < $l; ++$i){
                if($last_category != $json_lines[$i]["Category"]){
                    $last_category = $json_lines[$i]["Category"];
        ?>
        <tr class="header">
            <td colspan="3">
                <h3><?php echo $json_lines[$i]["Category"]; ?></h3>
            </td>
        </tr>
        <?php } ?>
        <tr>
            <td>
                <span><?php echo ($i+1).". ".$json_lines[$i]["SubCategory"]; ?></span>
            </td>
            <td>
                <label for="file<?php echo $i+1; ?>">
                    <img id="uploadimg<?php echo $i+1; ?>" src="res/upload.png" alt="Upload">
                </label>
                <input type="file" id="file<?php echo $i+1; ?>" onchange="changeImage($(this), $('#uploadimg<?php echo $i+1; ?>')); imgToBase64(this, <?php echo $i+1; ?>);">
            </td>
            <td>
                <select ng-model="fields['Compliant<?php echo $i+1; ?>']" ng-options="v as v for (k,v) in ['Satisfactory','Unsafe Condition','Unsafe Act','Both']" ng-init="fields['Compliant<?php echo $i+1; ?>'] = 'Satisfactory'" required></select>
            </td>
        </tr>
        <?php } ?>

        <tr>
            <td colspan="3">
                <h3>Comments</h3>
            </td>
        </tr>
        <tr></tr>
        <!-- makes sure the next (last) row is blue, becaue of the nth-of-type rule-->
        <tr>
            <td colspan="2">
                <textarea maxlength="1000" ng-model="fields['Comments']" rows="6" cols="50" placeholder="Comments"></textarea><br />
            </td>
            <td>
                <button ng-click="open()">Open</button>
                <button ng-click="clear()">Clear</button>
                <button ng-click="submit()" ng-show="!hasRecord">Submit</button>
                <button ng-click="update()" ng-show="hasRecord">Update</button>
            </td>
        </tr>
    </table>
    </form>
</body>
</html>
