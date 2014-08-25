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
    <nav id="left_nav">
        <img id="logo" src="/res/mayco.png" alt="Mayco International">
    </nav>
    <header>
        <h3>
            <img id="menubutton" src="/res/menubutton.png" onclick="$('#left_nav').slideToggle()" alt="Menu">WCM Application Dashboard</h3>
        <nav id="buttons">
            <ul>
                <a id="newForm" target="_blank" href="#">
                    <li>+ New Form</li>
                </a>
                <a id="viewCharts" target="_blank" href="Chart.php?Pillar=SA">
                    <li>O View Charts</li>
                </a>
            </ul>
        </nav>
    </header>
    <div>
        <div ng-controller="Form"
            ng-init="setFormData('Issues Filter');">
            <form>
                <table>
                    <tr>
                        <td>Plant:</td>
                        <td>
                            <select ng-model="fields['plants']" ng-options="k as v for (k,v) in queries['plants'].options">
                                <option value=""></option>
                            </select>
                        </td>
                        <td>Department:</td>
                        <td>
                            <select ng-model="fields['departments']" ng-options="k as v for (k,v) in queries['departments'].options">
                                <option value=""></option>
                            </select>
                        </td>
                        <td>Zone:</td>
                        <td>
                            <select ng-model="fields['zones']" ng-options="k as v for (k,v) in queries['zones'].options">
                                <option value=""></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Machine:</td>
                        <td>
                            <select ng-model="fields['machines']" ng-options="k as v for (k,v) in queries['machines'].options">
                                <option value=""></option>
                            </select>
                        </td>
                        <td>Supervisor:</td>
                        <td>
                            <select ng-model="fields['supervisors']" ng-options="k as v for (k,v) in queries['supervisors'].options">
                                <option value=""></option>
                            </select>
                        </td>
                        <td>Shift:</td>
                        <td>
                            <select ng-model="fields['shifts']" ng-options='v as v for (k,v) in [1,2,3]'>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Severity:</td>
                        <td>
                            <select ng-model="fields['severities']" ng-options='v as v for (k,v) in ["Low","Medium","High"]'></select>
                        </td>
                        <td>Category:</td>
                        <td>
                            <select ng-model="fields['categories']" ng-options='v as v for (k,v) in ["Housekeeping","None","Crane","Ergonomics","Emergency Evacuation Routes/Equipment","Ladders","Chemical Usage & Storage","Forklift","Warehouse/PIT Drivers","Electrical","Material/Waste Handling","Respiratory Compliance","Welding","PPE","Continual Training","Timely Incident Reporting"]'></select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <button type="button">Apply</button></td>
                        <td>
                            <button type="reset">Clear</button></td>
                    </tr>
                </table>
            </form>
        </div>
        <div id="issues" ng-controller="Issues">
            <div id="open_issues">
                <span class="toggleButton" ng-click="showOpen = !showOpen">v</span><h3>Open Issues</h3>
                <div id="open_issues_div" ng-repeat="i in openIssues | orderBy : ['Name', 'ID', 'LineNum']" ng-show="showOpen">
                    <div class="issue">{{i.Name}} {{i.ID}} {{i.LineNum}} {{i.Compliancy}} {{i.Severity}}</div>
                </div>
            </div>
            <div id="closed_issues">
                <span class="toggleButton" ng-click="showClosed = !showClosed">v</span><h3>Closed Issues</h3>
                <div id="closed_issues_div" ng-repeat="i in closedIssues | orderBy : ['Name', 'ID', 'LineNum']" ng-show="showClosed">
                    <div class="issue">{{i.Name}} {{i.ID}} {{i.LineNum}} {{i.Compliancy}} {{i.Severity}}</div>
                </div>
            </div>
        </div>
</body>
</html>
