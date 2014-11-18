<!DOCTYPE HTML>
<html>
<head>
    <title>WCM Reporting</title>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.2/angular.min.js"></script>
    <script src="/scripts/js/chartFuncs.js"></script>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
        google.load("visualization", "1", { packages: ["corechart"] });
        google.load("visualization", "1", { packages: ["table"] });
    </script>
    <script src="/scripts/js/dashboard.js"></script>
    <link href="/css/reporting.css" type="text/css" rel="stylesheet" />
    <style>
        .spinner {
            margin: 100px auto;
            width: 22px;
            height: 22px;
            position: relative;
        }

        .circle {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
        }

            .circle:before {
                content: '';
                display: block;
                margin: 0 auto;
                width: 20%;
                height: 20%;
                background-color: #333;
                border-radius: 100%;
                -webkit-animation: bouncedelay 1.2s infinite ease-in-out both;
                animation: bouncedelay 1.2s infinite ease-in-out both;
            }

        .circle2 {
            -webkit-transform: rotate(30deg);
            transform: rotate(30deg);
        }

        .circle3 {
            -webkit-transform: rotate(60deg);
            transform: rotate(60deg);
        }

        .circle4 {
            -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
        }

        .circle5 {
            -webkit-transform: rotate(120deg);
            transform: rotate(120deg);
        }

        .circle6 {
            -webkit-transform: rotate(150deg);
            transform: rotate(150deg);
        }

        .circle7 {
            -webkit-transform: rotate(180deg);
            transform: rotate(180deg);
        }

        .circle8 {
            -webkit-transform: rotate(210deg);
            transform: rotate(210deg);
        }

        .circle9 {
            -webkit-transform: rotate(240deg);
            transform: rotate(240deg);
        }

        .circle10 {
            -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
        }

        .circle11 {
            -webkit-transform: rotate(300deg);
            transform: rotate(300deg);
        }

        .circle12 {
            -webkit-transform: rotate(330deg);
            transform: rotate(330deg);
        }

        .circle2:before {
            -webkit-animation-delay: -1.1s;
            animation-delay: -1.1s;
        }

        .circle3:before {
            -webkit-animation-delay: -1.0s;
            animation-delay: -1.0s;
        }

        .circle4:before {
            -webkit-animation-delay: -0.9s;
            animation-delay: -0.9s;
        }

        .circle5:before {
            -webkit-animation-delay: -0.8s;
            animation-delay: -0.8s;
        }

        .circle6:before {
            -webkit-animation-delay: -0.7s;
            animation-delay: -0.7s;
        }

        .circle7:before {
            -webkit-animation-delay: -0.6s;
            animation-delay: -0.6s;
        }

        .circle8:before {
            -webkit-animation-delay: -0.5s;
            animation-delay: -0.5s;
        }

        .circle9:before {
            -webkit-animation-delay: -0.4s;
            animation-delay: -0.4s;
        }

        .circle10:before {
            -webkit-animation-delay: -0.3s;
            animation-delay: -0.3s;
        }

        .circle11:before {
            -webkit-animation-delay: -0.2s;
            animation-delay: -0.2s;
        }

        .circle12:before {
            -webkit-animation-delay: -0.1s;
            animation-delay: -0.1s;
        }

        @-webkit-keyframes bouncedelay {
            0%, 80%, 100% {
                -webkit-transform: scale(0.0);
            }

            40% {
                -webkit-transform: scale(1.0);
            }
        }

        @keyframes bouncedelay {
            0%, 80%, 100% {
                -webkit-transform: scale(0.0);
                transform: scale(0.0);
            }

            40% {
                -webkit-transform: scale(1.0);
                transform: scale(1.0);
            }
        }
    </style>
</head>
<body ng-app="wcm" ng-controller="Dashboard">
    <div id="header">
        <img style="width: 33%; margin-left: 33%; margin-right: 33%; margin-bottom: 50px;" src="/res/wcm_logo.png" />
    </div>
    <div id="control_panel">
        <label style="display: block; margin: 8px; text-align: center; color: white;">Create Dashboard</label>
        <select id="chart_query" onchange="getParams($(this).val())">
            <option value="" selected="selected">Select a Query</option>
            <optgroup label="PM"></optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Averages">
                <option value="MachMTBF" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;MTBF by Machine (Bar)</option>
                <option value="MachMTTR" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;MTTR by Machine (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Downtime">
                <option value="MachDowntime" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;Downtime Reasons by Machine (Bar)</option>
                <option value="MachDownCodesByMonth" data-firstcol="Month">&nbsp;&nbsp;&nbsp;&nbsp;Machine Downtime Reasons by Month (Bar)</option>
                <option value="MaintDowntime" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;Maintenance Downtime Reasons by Machine (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Scrap">
                <option value="MachScrap" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;Machine Scrap (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;OEE">
                <option value="MachOEE" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;Machine OEE (Bar)</option>
                <option value="MachOEEByMonth" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;Machine OEE By Month</option>
                <option value="MoldOEE" data-firstcol="MoldID">&nbsp;&nbsp;&nbsp;&nbsp;Tool OEE (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Oil">
                <option value="OilPerPress" data-firstcol="Press">&nbsp;&nbsp;&nbsp;&nbsp;Oil per Press (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;EWOs">
                <option value="EWOsVsBreakdowns" data-firstcol="MachID">&nbsp;&nbsp;&nbsp;&nbsp;EWOs Vs Breakdowns (Table)</option>
                <option value="PressStratification" data-firstcol="Machine">&nbsp;&nbsp;&nbsp;&nbsp;Press Stratification for EWOs (Bar)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Tags">
                <option value="TagTrend" data-firstcol="Date">&nbsp;&nbsp;&nbsp;&nbsp;PM Tag Trend (Line)</option>
                <option value="TagTrendMach" data-firstcol="Date">&nbsp;&nbsp;&nbsp;&nbsp;PM Tag Trend By Machine (Line)</option>
                <option value="PMTagDetail" data-firstcol="TagNo">&nbsp;&nbsp;&nbsp;&nbsp;PM Tag Details (Table)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Tools">
                <option value="PMDue" data-firstcol="MoldID">&nbsp;&nbsp;&nbsp;&nbsp;PM Due per Tool (Table)</option>
            </optgroup>
            <optgroup label="Safety"></optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Audits">
                <option value="AuditsPerAuditor" data-firstcol="AuditorName">&nbsp;&nbsp;&nbsp;&nbsp;Number of Audits by Auditor (Bar)</option>
                <option value="AuditsPerWorkCell" data-firstcol="WorkCell">&nbsp;&nbsp;&nbsp;&nbsp;Number of Audits by Work Cell (Bar)</option>
                <option value="AuditsPerZone" data-firstcol="DeptZone">&nbsp;&nbsp;&nbsp;&nbsp;Number of Audits by Zone (Bar)</option>
                <option value="AuditorsWithoutAudits" data-firstcol="AuditorName">&nbsp;&nbsp;&nbsp;&nbsp;Auditors With No Audits (Table)</option>
                <option value="WorkCellsNotAudited" data-firstcol="WorkCell">&nbsp;&nbsp;&nbsp;&nbsp;Work Cells Without Audits (Table)</option>
                <option value="ZonesNotAudited" data-firstcol="Zone">&nbsp;&nbsp;&nbsp;&nbsp;Zones Without Audits (Table)</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;Issues">
                <option value="AgingReport" data-firstcol="Issue">&nbsp;&nbsp;&nbsp;&nbsp;Days Open per Issue (Bar)</option>
                <option value="SeverityReport" data-firstcol="Severity">&nbsp;&nbsp;&nbsp;&nbsp;Number of Issues By Severity (Pie)</option>
                <option value="IssuesBySeverity" data-firstcol="Issue">&nbsp;&nbsp;&nbsp;&nbsp;Issues By Severity (Table)</option>
                <option value="NumberOfIssuesByLine" data-firstcol="Line Item">&nbsp;&nbsp;&nbsp;&nbsp;Number of Issues by Line</option>
            </optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;UCANs">
                <option value="UCANDetail" data-firstcol="ID">&nbsp;&nbsp;&nbsp;&nbsp;UCAN Detail (Table)</option>
            </optgroup>
            <optgroup label="LO"></optgroup>
            <optgroup label="&nbsp;&nbsp;&nbsp;&nbsp;5T">
                <option value="5TScoreByMachine" data-firstcol="Machine">&nbsp;&nbsp;&nbsp;&nbsp;Audit Score by Machine per Month (Bar)</option>
                <option value="5TScoreByZone" data-firstcol="Zone">&nbsp;&nbsp;&nbsp;&nbsp;Audit Score by Zone per Month (Bar)</option>
                <option value="5TScoreByDept" data-firstcol="Department">&nbsp;&nbsp;&nbsp;&nbsp;Audit Score by Department per Month (Bar)</option>
                <option value="5TAuditScores" data-firstcol="ID">&nbsp;&nbsp;&nbsp;&nbsp;Audit Scores and Details (Table)</option>
            </optgroup>
        </select>
        <select id="chart_type">
            <option value="" selected="selected">Choose a Chart Type</option>
            <option value="table">Table</option>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
        </select>
        <select id="sort_order">
            <option value="Asc">Ascending</option>
            <option value="Desc">Descending</option>
        </select>
        <div id="params"></div>
        <!-- use existing code to render parameters -->
        <!-- maybe add chart options here automatically -->
        <select id="chart_width" required>
            <option value="">Set Width</option>
            <option value="25">25%</option>
            <option value="33">33%</option>
            <option value="40">40%</option>
            <option value="50">50%</option>
            <option value="60">60%</option>
            <option value="66">66%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
        </select>
        <select id="chart_height" required>
            <option value="">Set Height</option>
            <option value="50">50px</option>
            <option value="100">100px</option>
            <option value="150">150px</option>
            <option value="200">200px</option>
            <option value="250">250px</option>
        </select>
        <button ng-click="addChart()">Add Chart</button>
        <!-- on click, send broadcast to model with chart data -->
        <input id="layout_name" type="text" placeholder="Layout name" required />
        <button ng-click="saveOrUpdateLayout(false)">Save Layout</button>
        <!-- on click, upload dashboard layout to database -->
        <select id="open_layout">
            <!-- auto populate options -->
        </select>
        <button ng-click="openLayout()">Open Layout</button>
        <button ng-click="saveOrUpdateLayout(true)">Update Layout</button>
    </div>
    <div id="main_panel" ng-repeat="chart in charts">
        <div style="height: {{ chart.maximized ? '500px' : chart.options.height }}; width: {{ chart.maximized ? '100%' : (chart.options.width.replace('%','') - 10) + '%'}}; position: relative; " ng-show="!chart.minimized">
            <!-- <h1>{{ chart.name }}</h1> -->
            <div class="chart_buttons" style="position: absolute; top: 2px; left: 2px; z-index: 999;">
                <button ng-click="chart.showParams = !chart.showParams">&colone;</button>
                <button ng-click="chart.minimized = true">&ndash;</button>
                <button ng-click="chart.maximized = !chart.maximized;">&#9744;</button>
                <button ng-click="removeChart($index)">&#215;</button>
                <button ng-click="runQuery($index)">&#8635;</button>
                <a ng-click="viewImage($index)"><button>&#9988;</button></a><!-- view as image -->
                <button ng-click="getCSVFile($index)">&#8681;</button><!-- export -->
                <button ng-click="chart.showTypes = !chart.showTypes">&#8735;</button><!-- change chart type -->
            </div>
            <div ng-repeat="param in chart.params" ng-show="chart.showParams">
                <div ng-if="['text','date','datetime','datetime-local','time','range','number'].indexOf(param.type) > -1">
                    <input type="{{ param.type }}" ng-model="param.value" />
                </div>
                <div ng-if="param.type=='select'">
                    <select ng-model="param.value">
                        <option ng-repeat="op in param.options" value="{{op.value}}">{{ op.text }}</option>
                    </select>
                </div>
                <div ng-if="param.type=='textarea'">
                    <textarea ng-model="param.value"></textarea>
                </div>
            </div>
            <div ng-show="chart.showTypes">
                <select ng-model="chart.type">
                    <option value="table">Table</option>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    <option value="pie">Pie</option>
                </select>
                <select ng-model="chart.options.width">
                    <option value="25%">25%</option>
                    <option value="33%">33%</option>
                    <option value="40%">40%</option>
                    <option value="50%">50%</option>
                    <option value="60%">60%</option>
                    <option value="66%">66%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                </select>
                <select ng-model="chart.options.height">
                    <option value="50px">50px</option>
                    <option value="100px">100px</option>
                    <option value="150px">150px</option>
                    <option value="200px">200px</option>
                    <option value="250px">250px</option>
                </select>
                <!-- <input type="number" placeholder="Order" ng-model="$index" ng-change="changeIndex($index, $event)" /> --->
            </div>
            <div id="{{ chart.query }}" style="height: 90%; width: 90%;"></div>
        </div>
    </div>
    <div id="icon_panel">
        <span ng-repeat="chart in charts" style="width: 10%; height: 10%;" ng-show="chart.minimized">
            <a style="font-size: 0.75em;">{{ chart.options.title }}</a>
            <button style="display: inline;" ng-click="chart.maximized = false; chart.minimized = false;">&#9744;</button>
        </span>
    </div>
</body>
</html>
