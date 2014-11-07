<!DOCTYPE html>
<html>
<head>
    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">

     <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.18/angular.min.js"></script>
    <!-- <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/form.js"></script> -->
    <script src="/scripts/js/wcm.min.js"></script>
    <script src="/scripts/js/form.min.js"></script>

    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="css/Normalize.css" />
    <link rel="stylesheet" href="css/Checklist.css" />

    <title>Layered Process Audit</title>

    <script>
        /*
        1 Molding
        2 IP Assembly
        3 Foam
        4 Thermoforming
        5 Deco
        6 Sequencing
        7 Other
        
        Assembly -> Sequencing
        Molding/IP Mfg -> Molding, Foam, Thermoforming
        */
        $(document.body).ready(function () {
            var scope = angular.element($("[ng-app='wcm']")).scope();
            scope.showLines = [];
            scope.showList = [
                [0],
                [1, 2, 3, 4, 6], [1, 2, 3, 4, 6], [1, 2, 3, 4, 6], [1, 2, 3, 4, 5, 6],
                [5], [1, 2, 3, 4, 5, 6], [5], [5],
                [5], [2], [2], [2, 6],
                [5], [5], [5], [5],
                [1, 3, 4, 6], [], [1, 3, 4, 6], [1, 3, 4],
                [1, 2, 3, 4, 6], [1, 3, 4], [1, 3, 4], [1, 2, 3, 4, 6],
                [1, 3, 4, 6], [1, 3, 4], [1, 3, 4], [1, 3, 4, 6],
                [1, 3, 4, 6], [2], [2], [2],
                [5], [5], [5], [5],
                [5], [5], [5], [5],
                [5], [5], [5], [5],
                [5], [5], [5], [5],
                [5], [5], [5], [5]
            ]
            scope.$apply(
                function () {
                    scope.$watch("fields['DepartmentID']", function (n, o) {
                        scope.showLines = scope.showList.map(function (el) { return el.indexOf(Number(n)) > -1; });
                    });
                });
        });
    </script>
    <style>
        h1{ 
	        color: limegreen;
        }

        h3{
	        background-color: limegreen;
        }

        strong{
	        background-color: limegreen;
        }
    </style>
</head>

<body
    ng-app="wcm"
    ng-controller="Form"
    ng-init="setFormData('LPA');">
    <table>
        <tr>
            <td colspan="3">
                <h1>Layered Process Audit No. {{id + ( hasRecord ? " (Updating)" : " (New Form)" )}}</h1>
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
                    <strong>Supervisor's Name</strong>
                    <select ng-model="fields['SupervisorID']" ng-options="k as v for (k,v) in queries['SupervisorID'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Operator(s)</strong>
                    <input type="text" ng-model="fields['Operator']" />
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
            <td colspan="2" style="width: 65%;">
                <h2>Checks</h2>
            </td>
            <td style="width: 35%;">
                <h2>Remarks</h2>
            </td>
        </tr>

        <?php 
        $_GET["Query"] = "AuditLines";
        $_GET["ASSOC"] = "true";
        $_GET["Params"] = json_encode(array("LPA"));
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
                <select onchange="$(this).parent().next().children().first().attr('required', $(this).val() == 0);" ng-model="fields['Rating<?php echo $i+1; ?>']" ng-options="k as v for (k,v) in { '-1' : 'N/A', 0 : 'No', 1 : 'Yes' }" required>
                    <option value=""></option>
                </select>
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
