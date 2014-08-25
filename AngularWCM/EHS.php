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
    <link rel="stylesheet" href="css/EHS.css" />

    <title>WCC</title>
</head>

<body
    ng-app="wcm" 
    ng-controller="Form" 
    ng-init="setFormData('EHS');">
    <table>
        <tr>
            <td colspan="3"><h1>Work Cell Observation Checklist No. {{hasRecord ? id  + " (Updating)" : "(New Form)"}}</h1></td>
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
                    <select ng-model="fields['AuditorName']" ng-options="v as v for (k,v) in queries['AuditorName'].options" required>
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Plant</strong>
                    <select ng-model="fields['Plant']" ng-options="v as v for (k,v) in queries['Plant'].options" required>
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Department</strong>
                    <select ng-model="fields['Department']" ng-options="v as v for (k,v) in queries['Department'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Zone</strong>
                    <select ng-model="fields['Zone']" ng-options="v as v for (k,v) in queries['Zone'].options" required></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Machine</strong>
                    <select ng-model="fields['MachID']" ng-options="v as v for (k,v) in queries['MachID'].options" ></select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Work Cell</strong>
                    <select ng-model="fields['WorkCell']" ng-options="v as v for (k,v) in queries['WorkCell'].options" required>
                        <!-- code to update at end of file -->
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Tool No.</strong>
                    <select ng-model="fields['PartNum']" ng-options="v as v for (k,v) in queries['PartNum'].options" >
                    </select>
                </div>
                <div class="inputPlusLabel">
                    <strong>Supervisor</strong>
                    <select ng-model="fields['Supervisor']" ng-options="v as v for (k,v) in queries['Supervisor'].options" required>
                    </select>
                </div>
            </td>
        </tr>
        <tr>
            <td colspan="2"><h2>Requirement</h2></td>
            <td><h2>Select</h2></td>
        </tr>
            <?php
                $xml = simplexml_load_file("xml/ehslabels.xml");
                $i = 0;
                foreach($xml->group as $groupValues):
                    foreach($groupValues as $type => $text):
                        if($type == "header"):
            ?>
            <tr class="header"><td colspan="3"><h3><?php echo $text; ?></h3></td></tr>
            <?php
                        else:
                            $i+=1;
            ?>
            <tr>
                <td>
                    <span><?php echo $i.". ".$text; ?></span>
                </td>
                <td>
                    <label for="file<?php echo $i; ?>">
                        <img id="uploadimg<?php echo $i; ?>" src="res/upload.png" alt="Upload">
                    </label>
                    <input type="file" id="file<?php echo $i; ?>" onchange="changeImage($(this), $('#uploadimg<?php echo $i; ?>')); imgToBase64(this, $('#FileURL<?php echo $i; ?>'));">
                </td>
                <td>
                    <select ng-model="fields['Compliant<?php echo $i; ?>']" ng-options="v as v for (k,v) in ['Satisfactory','Unsafe Condition','Unsafe Act','Both']" ng-init="fields['Compliant<?php echo $i; ?>'] = 'Satisfactory'" required></select>
                </td>
            </tr>
            <?php
                        endif;
                    endforeach;
                endforeach;
            ?>

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