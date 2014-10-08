<?php if(isset($_GET["Pillar"])){ ?>
<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Bar Chart</title>

    <script src="http://code.jquery.com/jquery-2.1.1.js"></script>
    <script src="/scripts/js/chartFuncs.js"></script>
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
</style>
<body>
    <select name="Query" onchange="getParams($(this).val())">
        <option value="" selected="selected">Select a Query</option>
        <?php if($_GET["Pillar"] == "PM"){ ?>
        <option value="MachMTBF" data-firstcol="MachID">MTBF by Machine (Bar)</option>
        <option value="MachMTTR" data-firstcol="MachID">MTTR by Machine (Bar)</option>
        <option value="MachDowntime" data-firstcol="MachID">Downtime Reasons by Machine (Bar)</option>
        <option value="MachScrap" data-firstcol="MachID">Machine Scrap (Bar)</option>
        <option value="MachOEE" data-firstcol="MachID">Machine OEE (Bar)</option>
        <option value="OilPerPress" data-firstcol="Press">Oil per Press (Bar)</option>
        <option value="TagTrend" data-firstcol="Date">PM Tag Trend (Line)</option>
        <option value="TagTrendMach" data-firstcol="Date">PM Tag Trend By Machine (Line)</option>
        <option value="PressStratification" data-firstcol="Machine">Press Stratification (Bar)</option>
        <option value="EWOsVsBreakdowns" data-firstcol="MachID">EWOs Vs Breakdowns (Table)</option>
        <option value="PMTagDetail" data-firstcol="TagNo">PM Tag Details (Table)</option>
        <option value="MoldOEE" data-firstcol="MoldID">Tool OEE (Bar)</option>
        <option value="PMDue" data-firstcol="MoldID">PM Due per Tool</option>
        <option value="MachOEEByMonth" data-firstcol="MoldID">Machine OEE By Month</option>
        <?php } ?>
        <?php if($_GET["Pillar"] == "SA"){ ?>
        <option value="AuditsPerAuditor" data-firstcol="AuditorName">Number of Audits by Auditor (Bar)</option>
        <option value="AuditsPerWorkCell" data-firstcol="WorkCell">Number of Audits by Work Cell (Bar)</option>
        <option value="AuditsPerZone" data-firstcol="DeptZone">Number of Audits by Zone (Bar)</option>
        <option value="AuditorsWithoutAudits" data-firstcol="AuditorName">Auditors With No Audits (Table)</option>
        <option value="WorkCellsNotAudited" data-firstcol="WorkCell">Work Cells Without Audits (Table)</option>
        <option value="ZonesNotAudited" data-firstcol="Zone">Zones Without Audits (Table)</option>
        <option value="AgingReport" data-firstcol="Issue">Days Open per Issue (Bar)</option>
        <option value="SeverityReport" data-firstcol="Severity">Number of Issues By Severity (Pie)</option>
        <option value="IssuesBySeverity" data-firstcol="Issue">Issues By Severity (Table)</option>
        <option value="UCANDetail" data-firstcol="ID">UCAN Detail (Table)</option>
        <option value="NumberOfIssuesByLine" data-firstcol="Name">Number of Issues by Line</option>
        <?php } ?>
        <?php if($_GET["Pillar"] == "OCI"){ ?>
        <option value="AllPlants">All Plants List</option>
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
        <option value="Asc">Choose a sort order</option>
        <option value="Asc">Ascending</option>
        <option value="Desc">Descending</option>
    </select>
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