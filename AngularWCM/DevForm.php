<!DOCTYPE HTML>
<html>
    <head>
        <script src="http://code.jquery.com/jquery-2.1.1.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.18/angular.min.js" ></script>
        <script src="/scripts/js/wcm.js"></script>
        <script src="/scripts/js/form.js"></script>
        <title>Angular WCM</title>
    </head>
    <body
        ng-app="wcm" 
        ng-controller="Form" 
        ng-init="setFormData('Development Form');">
        <h2>Development form number {{id + (hasRecord ?" (Updating)" : "(New Form)")}}</h2>
        <input type="text" ng-model="fields['ToolName']" />
        <textarea ng-model="fields['Problems']"></textarea>
        <select ng-model="fields['ToolNumber']" ng-options="k as v for (k,v) in queries['ToolNumber'].options" required></select>
        <select ng-model="fields['Plant']" ng-options="k as v for (k,v) in queries['Plant'].options" required></select>
        <select ng-model="fields['Department']" ng-options="k as v for (k,v) in queries['Department'].options" required></select>
        <select ng-model="fields['Zone']" ng-options="k as v for (k,v) in queries['Zone'].options" required></select>
        <select ng-model="fields['Machine']" ng-options="k as v for (k,v) in queries['Machine'].options"></select>
        <input type="text" ng-model="fields['ReportedBy']" />
        <input type="date" ng-model="fields['DateShipped']" />
        <select ng-model="fields['RepairedLocation']" ng-options="v as v for (k,v) in ['Mayco', 'Mound']"></select>
        <input type="text" ng-model="fields['Notes']" /> 
        <input type="date" ng-model="fields['DateReceived']" />
        <input type="checkbox" ng-model="fields['IsService']" ng-true-value="1" ng-false-value="0" />
        <button ng-click="open()">Open</button>
        <button ng-click="clear()">Clear</button>
        <button ng-click="submit()" ng-show="!hasRecord">Submit</button>
        <button ng-click="update()" ng-show="hasRecord">Update</button>
    </body>
</html>