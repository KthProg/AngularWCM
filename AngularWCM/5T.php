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
    <link rel="stylesheet" href="css/5T.css" />

    <title>5T Checklist</title>

    <script>
        $(document.body).ready(function () {
            var scope = angular.element($("[ng-app='wcm']")).scope();
            scope.showLines = [];
            scope.showList = [
                [0],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [14, 15, 16, 17, 18, 19, 22, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 22, 63, 70, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63, 64, 71],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63, 64, 71],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 63],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 63, 64, 70, 71, 99]
            ]
            scope.$apply(
                function () {
                    scope.$watch("fields['ZoneID']", function (n, o) {
                        scope.showLines = scope.showList.map(function (el) { return el.indexOf(Number(n)) > -1; });
                    });
                });
        });
    </script>
</head>

<body
    ng-app="wcm" 
    ng-controller="Form" 
    ng-init="setFormData('5T');">
    <table>
        <tr>
            <td colspan="3"><h1>5T Checklist No. {{id + ( hasRecord ? " (Updating)" : " (New Form)" )}}</h1></td>
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
                    <select ng-model="fields['MachineID']" ng-options="k as v for (k,v) in queries['MachineID'].options" ></select>
                </div>
            </td>
        </tr>
        <tr>
            <td style="width: 35%;"><h2>Checks</h2></td>
            <td style="width: 30%;"><h2>Rating</h2></td>
            <td style="width: 35%;"><h2>Remarks</h2></td>
        </tr>

        <?php 
                $_GET["Query"] = "AuditLines";
                $_GET["ASSOC"] = "true";
                $_GET["Params"] = json_encode(array("5T"));
                $_GET["ReturnQuery"] = "true";
                $json_lines = require_once('/scripts/php/Query.php');
                $last_category = "";
                for($i = 0, $l = count($json_lines); $i < $l; ++$i){
                    foreach($json_lines[$i] as $type => $value){
                        if($type == "Category"){
                            if($last_category != $value){
                                $last_category = $value;
           ?>
            <tr class="header"><td colspan="3"><h3><?php echo $value; ?></h3></td></tr>
                <?php           }          
                            } else { ?>
            <tr ng-show="showLines[<?php echo $i+1; ?>]">
                <td>
                    <span><?php echo "1.".($i+1).". ".$value; ?></span>
                </td>
                <td>
                    <select onchange="$(this).parent().next().children().first().attr('required', $(this).val() == 0);" ng-model="fields['Rating<?php echo $i+1; ?>']" ng-options="k as v for (k,v) in { 0 : 'Low', 2 : 'Medium' , 4 : 'High'}" required>
                        <option value=""></option>
                    </select>
                    <div class="helpButton" onclick="$(this).next().toggle()">?</div>
                    <div style="display: none; background-color: yellow; border: 1px dashed grey;">
                    <?php
                                echo "Adding criteria soon.<br>";
                    ?>
                   </div>
                </td>
                <td>
                    <textarea ng-model="fields['Remarks<?php echo $i; ?>']"></textarea>
                </td>
            </tr>
        <?php           }
                    } 
                }?>

            <tr>
                <td colspan="3"><h3>Comments</h3></td>
            </tr>
            <tr></tr> <!-- makes sure the next (last) row is blue, becaue of the nth-of-type rule-->
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