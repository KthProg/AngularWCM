<?php if(isset($_GET["Pillar"])){ ?>
<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Bar Chart</title>

     <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="/scripts/js/chartFuncs.min.js"></script>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
        google.load("visualization", "1", { packages: ["corechart"] });
        google.load("visualization", "1", { packages: ["table"] });
    </script>
</head>
<style>
    @media screen and (min-device-width : 320px) and (max-device-width : 480px) {
        input, select, textarea, label {
            width: 100%;
            height: 50px;
        }

        button {
            width: 30%;
            height: 50px;
        }
    }

    @media screen and (min-device-width : 768px) and (max-device-width : 1024px) {
        input, select, textarea, label {
            width: 100%;
            height: 50px;
        }

        button {
            width: 30%;
            height: 50px;
        }
    }

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
<body>
    <select name="Query" onchange="getParams($(this).val())">
        <option value="" selected="selected">Select a Query</option>
        <?php if($_GET["Pillar"] == "PM"){ ?>
        <optgroup label="Averages">
            <option value="MachMTBF" data-firstcol="MachID">MTBF by Machine (Bar)</option>
            <option value="MachMTTR" data-firstcol="MachID">MTTR by Machine (Bar)</option>
        </optgroup>
        <optgroup label="Downtime">
            <option value="MachDowntime" data-firstcol="MachID">Downtime Reasons by Machine (Bar)</option>
            <option value="MachDownCodesByMonth" data-firstcol="Month">Machine Downtime Reasons by Month (Bar)</option>
            <option value="MaintDowntime" data-firstcol="MachID">Maintenance Downtime Reasons by Machine (Bar)</option>
        </optgroup>
        <optgroup label="Scrap">
            <option value="MachScrap" data-firstcol="MachID">Machine Scrap (Bar)</option>
        </optgroup>
        <optgroup label="OEE">
            <option value="MachOEE" data-firstcol="MachID">Machine OEE (Bar)</option>
            <option value="MachOEEByMonth" data-firstcol="MachID">Machine OEE By Month</option>
            <option value="MoldOEE" data-firstcol="MoldID">Tool OEE (Bar)</option>
        </optgroup>
        <optgroup label="Oil">
            <option value="OilPerPress" data-firstcol="Press">Oil per Press (Bar)</option>
        </optgroup>
        <optgroup label="EWOs">
            <option value="EWOsVsBreakdowns" data-firstcol="MachID">EWOs Vs Breakdowns (Table)</option>
            <option value="PressStratification" data-firstcol="Machine">Press Stratification for EWOs (Bar)</option>
        </optgroup>
        <optgroup label="Tags">
            <option value="TagTrend" data-firstcol="Date">PM Tag Trend (Line)</option>
            <option value="TagTrendMach" data-firstcol="Date">PM Tag Trend By Machine (Line)</option>
            <option value="PMTagDetail" data-firstcol="TagNo">PM Tag Details (Table)</option>
        </optgroup>
        <optgroup label="Tools">
            <option value="PMDue" data-firstcol="MoldID">PM Due per Tool (Table)</option>
        </optgroup>
        <?php } ?>
        <?php if($_GET["Pillar"] == "SA"){ ?>
        <optgroup label="Audits">
            <option value="AuditsPerAuditor" data-firstcol="AuditorName">Number of Audits by Auditor (Bar)</option>
            <option value="AuditsPerWorkCell" data-firstcol="WorkCell">Number of Audits by Work Cell (Bar)</option>
            <option value="AuditsPerZone" data-firstcol="DeptZone">Number of Audits by Zone (Bar)</option>
            <option value="AuditorsWithoutAudits" data-firstcol="AuditorName">Auditors With No Audits (Table)</option>
            <option value="WorkCellsNotAudited" data-firstcol="WorkCell">Work Cells Without Audits (Table)</option>
            <option value="ZonesNotAudited" data-firstcol="Zone">Zones Without Audits (Table)</option>
        </optgroup>
        <optgroup label="Issues">
            <option value="AgingReport" data-firstcol="Issue">Days Open per Issue (Bar)</option>
            <option value="SeverityReport" data-firstcol="Severity">Number of Issues By Severity (Pie)</option>
            <option value="IssuesBySeverity" data-firstcol="Issue">Issues By Severity (Table)</option>
            <option value="NumberOfIssuesByLine" data-firstcol="Line Item">Number of Issues by Line</option>
        </optgroup>
        <optgroup label="UCANs">
            <option value="UCANDetail" data-firstcol="ID">UCAN Detail (Table)</option>
        </optgroup>
        <?php } ?>
        <?php if($_GET["Pillar"] == "LO"){ ?>
        <optgroup label="5T">
            <option value="5TScoreByMachine" data-firstcol="Machine">Audit Score by Machine per Month (Bar)</option>
            <option value="5TScoreByZone" data-firstcol="Zone">Audit Score by Zone per Month (Bar)</option>
            <option value="5TScoreByDept" data-firstcol="Department">Audit Score by Department per Month (Bar)</option>
            <option value="5TAuditScores" data-firstcol="ID">Audit Scores and Details (Table)</option>
        </optgroup>
        <?php } ?>
    </select>
    <select name="ChartAs">
        <option value="" selected="selected">Choose a Chart Type</option>
        <option value="table">Table</option>
        <option value="bar">Bar</option>
        <option value="line">Line</option>
        <option value="pie">Pie</option>
    </select>
    <select name="sortOrder">
        <option value="Asc">Ascending</option>
        <option value="Desc">Descending</option>
    </select>
    <label for="showTrendCheck">Show Trendlines</label><input type="checkbox" id="showTrendCheck" />
    <div id="ParamDiv"></div>
    <button onclick="chartData()">Chart</button>
    <button onclick="download(getByName('Query').val() + '.csv',getByName('Data').val())">Export Data</button>
    <button id="print">Printable Chart</button>
    <input type="hidden" name="Data" value="" />
    <div id="chartDiv" style="width: 100%; height: 500px;">
    </div>
</body>
</html>
<?php } ?>