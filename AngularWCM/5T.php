<!DOCTYPE html>
<html>
<head>
    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">

     <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.18/angular.js"></script>
    <!-- <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/form.js"></script> -->
    <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/form.js"></script>

    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="/css/Normalize.css" />
    <link rel="stylesheet" href="/css/Checklist.css" />

    <title>5T Checklist</title>

    <script>
        $(document.body).ready(function () {
            var scope = angular.element($("[ng-app='wcm']")).scope();
            scope.showLines = [];
            var zonesList = {
                "Molding": [16, 17, 18, 19],
                "IP Assembly": [1, 2, 3, 4, 5, 6, 7, 8, 63],
                "Sequencing": [9, 10, 11],
                "IP Warehouse": [64, 71],
                "Thermoforming": [14, 15, 70],
                "Shipping Receiving": [22,99]
            };
            scope.showList = [
                [0],
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["Molding"].concat(zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["IP Warehouse"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["IP Warehouse"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"]),
                zonesList["IP Assembly"].concat(zonesList["Molding"], zonesList["Sequencing"], zonesList["Thermoforming"], zonesList["IP Warehouse"], zonesList["Shipping Receiving"])
            ]
            scope.$apply(
                function () {
                    scope.$watch("fields['ZoneID']", function (n, o) {
                        scope.showLines = scope.showList.map(function (el) { return el.indexOf(Number(n)) > -1; });
                    });
                });
        });
    </script>
    <style>
        h1{ 
	        color: teal;
        }

        h3{
	        background-color: teal;
        }

        strong{
	        background-color: teal;
        }

        .helpButton {
            float: right;
            font-size: 2em;
            width: 1em; 
            height: 1em; 
            border-radius: 50%; 
            border: 1px solid black; 
            text-align: center; 
            vertical-align: middle;
        }
        .helpButton:hover { 
            background-color: teal;
            cursor: pointer;
        }
    </style>
</head>

<body
    ng-app="wcm"
    ng-controller="Form"
    ng-init="setFormData('5T');">
    <table>
        <tr>
            <td colspan="3">
                <h1>5T Checklist No. {{id + ( hasRecord ? " (Updating)" : " (New Form)" )}}</h1>
            </td>
        </tr>
        <tr>
            <td colspan="3">
                <div class="inputPlusLabel">
                    <strong>Date</strong>
                    <input type="date" ng-model="fields['AuditDate']" placeholder="Date created" required>
                </div>
                <div class="inputPlusLabel">
                    <strong>Auditor's Name</strong>
                    <select ng-model="fields['AuditorID']" ng-options="k as v for (k,v) in queries['AuditorID'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Plant</strong>
                    <select ng-model="fields['PlantID']" ng-options="k as v for (k,v) in queries['PlantID'].options" required></select>
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
            </td>
        </tr>
        <tr>
            <td style="width: 35%;">
                <h2>Checks</h2>
            </td>
            <td style="width: 30%;">
                <h2>Rating</h2>
            </td>
            <td style="width: 35%;">
                <h2>Remarks</h2>
            </td>
        </tr>

        <?php 
        $_GET["Query"] = "AuditLines";
        $_GET["ASSOC"] = "true";
        $_GET["Params"] = json_encode(array("5T"));
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
        <tr ng-show="showLines[<?php echo $i+1; ?>]">
            <td>
                <span><?php echo "1.".($i+1).". ".$json_lines[$i]["SubCategory"]; ?></span>
            </td>
            <td>
                <select onchange="$(this).parent().next().children().first().attr('required', $(this).val() == 0);" ng-model="fields['Rating<?php echo $i+1; ?>']" ng-options="k as v for (k,v) in { 0 : 'Low', 2 : 'Medium' , 4 : 'High'}" required>
                    <option value=""></option>
                </select>
                <div class="helpButton" onclick="$(this).next().toggle()">?</div>
                <div style="display: none; background-color: yellow; border: 1px dashed grey;">
                    <?php
                        echo str_replace("\r","<br>",$json_lines[$i]["Details"]);
                    ?>
                </div>
            </td>
            <td>
                <textarea ng-model="fields['Remarks<?php echo $i+1; ?>']"></textarea>
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
