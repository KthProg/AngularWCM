<!DOCTYPE HTML>
<html>
<head>
    <script src="http://code.jquery.com/jquery-2.1.1.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.18/angular.min.js"></script>
    <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/form.js"></script>
    <script src="/scripts/js/issue.js"></script>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Safety Issues Dashboard</title>

    <link rel="stylesheet" type="text/css" href="/css/normalize.css">
    <link rel="stylesheet" type="text/css" href="/css/issues.css">
</head>
<body ng-app="wcm">
    <header>
        <h3>Safety Issues Dashboard</h3>
    </header>
    <div>
        <div ng-controller="Form"
            ng-init="setFormData('Issues Filter');">
            <form>
                <div class="filter">Plant:<select name="Plant" ng-model="fields['plants']" ng-options="k as v for (k,v) in queries['plants'].options"></select></div>
                <div class="filter">Department:<select name="Department" ng-model="fields['departments']" ng-options="k as v for (k,v) in queries['departments'].options"></select></div>
                <div class="filter">Zone:<select name="Zone" ng-model="fields['zones']" ng-options="k as v for (k,v) in queries['zones'].options"></select></div>
                <div class="filter">Machine:<select name="Machine" ng-model="fields['machines']" ng-options="k as v for (k,v) in queries['machines'].options"></select></div>
                <div class="filter">Supervisor:<select name="SupervisorName" ng-model="fields['supervisors']" ng-options="k as v for (k,v) in queries['supervisors'].options"></select></div>
                <div class="filter">Shift:<select name="Shift" ng-model="fields['shifts']" ng-options='v as v for (k,v) in [1,2,3]'></select></div>
                <div class="filter">Severity:<select name="Severity" ng-model="fields['severities']" ng-options='v as v for (k,v) in ["Low","Medium","High"]'></select></div>
                <div class="filter">Category:<select name="Category" ng-model="fields['categories']" ng-options='v as v for (k,v) in ["Housekeeping","None","Crane","Ergonomics","Emergency Evacuation Routes/Equipment","Ladders","Chemical Usage & Storage","Forklift","Warehouse/PIT Drivers","Electrical","Material/Waste Handling","Respiratory Compliance","Welding","PPE","Continual Training","Timely Incident Reporting"]'></select></div>
                <div class="filter">Form:<select name="Severity" ng-model="fields['severities']" ng-options='v as v for (k,v) in ["EHS","WCC","SEWO","Unsafe Act"]'></select></div>
                <div class="filter">
                    <button type="button" onclick="angular.element('[ng-app]').injector().get('$rootScope').$broadcast('filter');">Apply</button>
                    <button type="reset">Clear</button>
                </div>
                <div class="filter">
                    <button type="button" onclick="window.print();">Print</button>
                    <button type="button" onclick="angular.element('[ng-app]').injector().get('$rootScope').$broadcast('export');">Export</button>
                </div>
            </form>
        </div>
        <div id="legend" >
            <div><div id="lowseverity"></div>Low Severity</div>
            <div><div id="mediumseverity"></div>Medium Severity</div>
            <div><div id="highseverity"></div>High Severity</div>
            <div><div><input type="checkbox" checked onclick="event.preventDefault();" /></div>Closed</div>
            <div><div><input type="checkbox" onclick="event.preventDefault();" /></div>Open</div>
            <br />
            Click on an issue to view details.
        </div>
        <div id="issues" ng-controller="Issues">
            <div id="open_issues">
                <span class="toggleButton" ng-click="showOpen = !showOpen">{{showOpen ? '-' : '+'}}</span><h3>Open Issues</h3>
                <div id="open_issues_div" ng-repeat="i in openIssues | orderBy : ['Severity', 'Name', 'ID', 'LineNum', 'Compliancy']" ng-show="showOpen">
                    <div class="issue" onclick="$(this).next().toggle()">
                        {{i.Name}} {{i.ID}} {{i.LineNum}} {{i.Compliancy}} 
                        <input type="checkbox" ng-click="closeIssue(i.Name,i.ID,i.LineNum)" style="float: right;" onclick="return false" />
                        <span ng-switch="i.Severity">
                            <div ng-switch-when="Low"> </div>
                            <div ng-switch-when="Medium"> </div>
                            <div ng-switch-when="High"> </div>
                        </span>
                    </div>
                    <div style="display: none;">
                        Line Item: {{i.LineItem}}<br />
                        Category:  {{i.Category}}<br />
                        Location: {{i.Plant}}, {{i.Department}}, {{i.Zone}}, {{i.Machine}}<br />
                        Created: {{i.OpenDate}}<br />
                        Days Open: {{i.DaysOpen}}<br />
                        Details: {{i.Details}}
                    </div>
                </div>
            </div>
            <div id="closed_issues">
                <span class="toggleButton" ng-click="showClosed = !showClosed">{{showClosed ? '-' : '+'}}</span><h3>Closed Issues</h3>
                <div id="closed_issues_div" ng-repeat="i in closedIssues | orderBy : ['Severity', 'Name', 'ID', 'LineNum', 'Compliancy']" ng-show="showClosed">
                    <div class="issue" onclick="$(this).next().toggle()">
                        {{i.Name}} {{i.ID}} {{i.LineNum}} {{i.Compliancy}} 
                        <input type="checkbox" ng-click="closeIssue(i.Name,i.ID,i.LineNum)" style="float: right;" checked onclick="return false"/>
                        <span ng-switch="i.Severity">
                            <div ng-switch-when="Low"> </div>
                            <div ng-switch-when="Medium"> </div>
                            <div ng-switch-when="High"> </div>
                        </span>
                    </div>
                    <div style="display: none;">
                        Line Item: {{i.LineItem}}<br />
                        Category:  {{i.Category}}<br />
                        Location: {{i.Plant}}, {{i.Department}}, {{i.Zone}}, {{i.Machine}}<br />
                        Created: {{i.OpenDate}}<br />
                        Days Open: {{i.DaysOpen}}<br />
                        Details: {{i.Details}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
