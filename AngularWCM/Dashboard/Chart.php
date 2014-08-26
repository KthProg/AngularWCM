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
        @media screen and (max-width: 809px) {
            input, select, textarea, label {
                width: 100%;
                height: 50px;
            }

            textarea {
                height: 200px;
            }

            h2, h1 {
                width: 100%;
                font-family: Calibri;
                text-align: center;
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
            <?php if(isset($_GET["Pillar"])){ ?>
                <?php if($_GET["Pillar"] == "PM"){ ?>
            <option value="MachMTBF">MTBF by Machine</option>
            <option value="MachMTTR">MTTR by Machine</option>
            <option value="MachDowntime">Downtime Reasons by Machine</option>
            <option value="MachScrap">Machine Scrap</option>
            <option value="MachOEE">Machine OEE</option>
            <option value="OilPerPress">Oil per Press</option>
                <?php }?>
                <?php if($_GET["Pillar"] == "TR"){ ?>
            <option value="MoldOEE">Tool OEE</option>
            <option value="PMDue">PM Due per Tool</option>
                <?php } ?>
                <?php if($_GET["Pillar"] == "SA"){ ?>
            <option value="AuditsPerAuditor">Number of Audits by Auditor</option>
            <option value="AuditsPerWorkCell">Number of Audits by Work Cell</option>
            <option value="AuditsPerZone">Number of Audits by Zone</option>
            <option value="AuditorsWithoutAudits">Auditors With No Audits</option>
            <option value="WorkCellsNotAudited">Work Cells Without Audits</option>
            <option value="ZonesNotAudited">Zones Without Audits</option>
            <option value="AgingReport">Days Open per Issue</option>
            <option value="SeverityReport">Number of Issues By Severity</option>
                <?php } ?>
            <?php } ?>
        </select>
        <select name="ChartAs">
            <option value="" selected="selected">Choose a Chart Type</option>
            <option value="table">Table</option>
            <option value="bar">Chart</option>
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