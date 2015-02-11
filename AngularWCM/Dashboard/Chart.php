<!DOCTYPE HTML>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WCM Reporting</title>
    
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.2/angular.js"></script>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
        google.load("visualization", "1", { packages: ["corechart"] });
        google.load("visualization", "1", { packages: ["table"] });
    </script>
    <script src="/scripts/js/wcm.js"></script>
    <script src="/scripts/js/chart.js"></script>
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
        <div id="create_dashboard">
            <label style="display: block; margin: 8px; text-align: center; color: white;">Create Dashboard</label>
            <select id="chart_query" ng-model="query" ng-change="getParams()">
                <option value="" selected="selected">Select a Query</option>
                <optgroup label="PM"></optgroup>
                <optgroup label="Averages">
                    <option value="MachMTBF" data-firstcol="MachID">MTBF by Machine </option>
                    <option value="MachMTTR" data-firstcol="MachID">MTTR by Machine </option>
                </optgroup>
                <optgroup label="Downtime">
                    <option value="MachDowntime" data-firstcol="MachID">Downtime Reasons by Machine </option>
                    <option value="MachDownCodesByMonth" data-firstcol="Month">Machine Downtime Reasons by Month </option>
                    <option value="MaintDowntime" data-firstcol="MachID">Maintenance Downtime Reasons by Machine </option>
                </optgroup>
                <optgroup label="Scrap">
                    <option value="MachScrap" data-firstcol="MachID">Machine Scrap </option>
                </optgroup>
                <optgroup label="OEE">
                    <option value="MachOEE" data-firstcol="MachID">Machine OEE </option>
                    <option value="MachOEEByMonth" data-firstcol="MachID">Machine OEE By Month</option>
                    <option value="MoldOEE" data-firstcol="MoldID">Tool OEE </option>
                </optgroup>
                <optgroup label="Oil">
                    <option value="OilPerPress" data-firstcol="Press">Oil per Press </option>
                </optgroup>
                <optgroup label="EWOs">
                    <option value="EWOsVsBreakdowns" data-firstcol="MachID">EWOs Vs Breakdowns (Table) </option>
                    <option value="PressStratification" data-firstcol="Machine">Press Stratification for EWOs </option>
                </optgroup>
                <optgroup label="Tags">
                    <option value="TagTrend" data-firstcol="Date">PM Tag Trend </option>
                    <option value="TagTrendMach" data-firstcol="Date">PM Tag Trend By Machine </option>
                    <option value="PMTagDetail" data-firstcol="TagNo">PM Tag Details (Table)</option>
                </optgroup>
                <optgroup label="Tools">
                    <option value="PMDue" data-firstcol="MoldID">PM Due per Tool (Table)</option>
                </optgroup>
                <optgroup label="Safety"></optgroup>
                <optgroup label="WCC">
                    <option value="WCCPerAuditor" data-firstcol="AuditorName">Number of Audits by Auditor </option>
                    <option value="WCCPerWorkCell" data-firstcol="WorkCell">Number of Audits by Work Cell </option>
                    <option value="WCCPerZone" data-firstcol="DeptZone">Number of Audits by Zone </option>
                    <option value="AuditorsWithoutWCCs" data-firstcol="AuditorName">Auditors With No Audits (Table)</option>
                    <option value="WorkCellsNotWCCd" data-firstcol="WorkCell">Work Cells Without Audits (Table)</option>
                    <option value="ZonesNotWCCd" data-firstcol="Zone">Zones Without Audits (Table)</option>
                </optgroup>
                <optgroup label="EHS">
                    <option value="EHSPerAuditor" data-firstcol="AuditorName">Number of Audits by Auditor </option>
                    <option value="EHSPerWorkCell" data-firstcol="WorkCell">Number of Audits by Work Cell </option>
                    <option value="EHSPerZone" data-firstcol="DeptZone">Number of Audits by Zone </option>
                    <option value="AuditorsWithoutEHSs" data-firstcol="AuditorName">Auditors With No Audits (Table)</option>
                    <option value="WorkCellsNotEHSd" data-firstcol="WorkCell">Work Cells Without Audits (Table)</option>
                    <option value="ZonesNotEHSd" data-firstcol="Zone">Zones Without Audits (Table)</option>
                </optgroup>
                <optgroup label="Issues">
                    <option value="AgingReport" data-firstcol="Issue">Days Open per Issue </option>
                    <option value="SeverityReport" data-firstcol="Severity">Number of Issues By Severity </option>
                    <option value="IssuesBySeverity" data-firstcol="Issue">Issues By Severity </option>
                    <option value="NumberOfIssuesByLine" data-firstcol="Line Item">Number of Issues by Line</option>
                </optgroup>
                <optgroup label="UCANs">
                    <option value="UCANDetail" data-firstcol="ID">UCAN Detail (Table)</option>
                </optgroup>
                <optgroup label="LO"></optgroup>
                <optgroup label="5T">
                    <option value="5TScoreByMachine" data-firstcol="Machine">Audit Score by Machine per Month </option>
                    <option value="5TScoreByZone" data-firstcol="Zone">Audit Score by Zone per Month </option>
                    <option value="5TScoreByDept" data-firstcol="Department">Audit Score by Department per Month </option>
                    <option value="5TAuditScores" data-firstcol="ID">Audit Scores and Details (Table)</option>
                </optgroup>
                <optgroup label="QA"></optgroup>
                <optgroup label="LPA">
                    <option value="LPAAuditsByAuditorThisWeek" data-firstcol="AuditorName">LPAs by Auditor this Week</option>
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
            <div id="params">
                <div ng-repeat="param in parameters">
                    <label>{{ param.name }}</label>
                    <div ng-if="['text','date','datetime','datetime-local','time','range','number'].indexOf(param.type) > -1">
                        <input type="{{ param.type }}" ng-model="param.value" />
                    </div>
                    <div ng-if="param.type=='select'">
                        <select ng-model="param.value" ng-options="op.value as op.text for op in param.options"></select>
                    </div>
                    <div ng-if="param.type=='textarea'">
                        <textarea ng-model="param.value"></textarea>
                    </div>
                </div>
            </div>
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
        </div>
        <div id="edit_layout">
            <label style="display: block; margin: 8px; text-align: center; color: white;">Edit Layout</label>
            <input id="layout_name" type="text" placeholder="Layout name" required />
            <button ng-click="saveOrUpdateLayout(false)">Save Layout</button>
            <select id="open_layout" ng-model="layout" ng-options="k as v for (k,v) in layouts"></select>
            <button ng-click="openLayout()">Open Layout</button>
            <button ng-click="saveOrUpdateLayout(true)">Update Layout</button>
        </div>
        <div id="aggregate_control_panel">
            <label style="display: block; margin: 8px; text-align: center; color: white;">Main Controls</label>
            <table style="border-collapse: collapse;">
                <tr>
                    <td><button ng-click="all_changeShowParams()" title="Show / Hide Parameters">&colone;</button></td>
                    <td><button ng-click="all_changeMinimized()" title="Minimize / Restore All">&ndash;</button></td>
                    <td><button ng-click="all_changeMaximized()" title="Maximize / Restore All">&#9744;</button></td>
                </tr>
                <tr>
                    <td><button ng-click="all_removeChart()" title="Remove All">&#215;</button></td>
                    <td><button ng-click="all_runQuery()" title="Render Charts">&#8635;</button></td>
                    <td><button ng-click="all_viewImage()" title="Download Images">&#9988;</button></td><!-- view as image -->
                </tr>
                <tr>
                    <td><button ng-click="all_getCSVFile()" title="Download CSV Files">&#8681;</button></td><!-- export -->
                    <td><button ng-click="all_changeShowTypes()" title="Show / Hide Chart Options">&#8735;</button></td><!-- change chart type -->
                    <td></td>
                </tr>
            </table>
        </div>
    </div>
    <div id="main_panel">
        <div ng-repeat="chart in charts" style="z-index: 0; height: {{ chart.maximized ? '500px' : chart.options.height }}; width: {{ chart.maximized ? '90%' : (chart.options.width.replace('%','') - 10) + '%'}}; position: relative; " ng-show="!chart.minimized">
            <!-- <h1>{{ chart.name }}</h1> -->
            <div class="chart_buttons" style="position: absolute; top: 2px; left: 2px; z-index: 1;">
                <button ng-click="changeIndex($index, $index-1)" title="Move Left">&lt;</button>
                <button ng-click="chart.showParams = !chart.showParams" title="Show / Hide Parameters">&colone;</button>
                <button ng-click="chart.minimized = true" title="Minimize">&ndash;</button>
                <button ng-click="chart.maximized = !chart.maximized;" title="Maximize / Restore">&#9744;</button>
                <button ng-click="removeChart($index)" title="Remove">&#215;</button>
                <button ng-click="runQuery($index)" title="Render Chart">&#8635;</button>
                <a ng-click="viewImage($index)" title="Download as Image"><button>&#9988;</button></a><!-- view as image -->
                <button ng-click="getCSVFile($index)" title="Download CSV File">&#8681;</button><!-- export -->
                <button ng-click="chart.showTypes = !chart.showTypes" title="Show / Hide Chart Options">&#8735;</button><!-- change chart type -->
                <button ng-click="changeIndex($index, $index+1)" title="Move Right">&gt;</button>
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
            </div>
            <div id="{{ chart.query }}" style="height: 90%; width: 90%;">
                <div ng-show="chart.status === 'loading'" class="spinner">
                    <div class="circle1 circle"></div>
                    <div class="circle2 circle"></div>
                    <div class="circle3 circle"></div>
                    <div class="circle4 circle"></div>
                    <div class="circle5 circle"></div>
                    <div class="circle6 circle"></div>
                    <div class="circle7 circle"></div>
                    <div class="circle8 circle"></div>
                    <div class="circle9 circle"></div>
                    <div class="circle10 circle"></div>
                    <div class="circle11 circle"></div>
                    <div class="circle12 circle"></div>
                </div>
                <h1 ng-show="chart.status === 'No Data'">Error: No Data</h1>
            </div>
        </div>
    </div>
    <div id="icon_panel" style="z-index: 2;">
        <span ng-repeat="chart in charts" style="width: 10%; height: 10%;" ng-show="chart.minimized">
            <a style="font-size: 0.75em;">{{ chart.options.title }}</a>
            <button style="display: inline;" ng-click="chart.minimized = false;">&#9744;</button>
        </span>
    </div>
</body>
</html>
