<!DOCTYPE HTML>
<html>
<head>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js"></script>
    <script src="scripts/js/wcm/wcm.js" type="text/javascript"></script>
	<script src="scripts/js/wcm/form.js" type="text/javascript"></script>
    <!-- <script src="scripts/js/wcm/query.js" type="text/javascript"></script> -->
    <script src="scripts/js/wcm/issue.js" type="text/javascript"></script>

	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>WCM Application Dashboard</title>

	<link rel="stylesheet" type="text/css" href="css/normalize.css">
	<link rel="stylesheet" type="text/css" href="css/issues.css">
</head>
<body onload="getAllIssues();">
	<nav id="left_nav">
		<img id="logo" src="res/mayco.png" alt="Mayco International">
        <input type="hidden" name="formname" />
		<ul>
            <li class="activated" onclick="filterForm($(this),'')">All</li>
            <?php foreach(array("SAFE","UCAN","WCC","EHS") as $form): ?>
            <li onclick="filterForm($(this),$(this).text())"><?php echo $form; ?></li>
            <?php endforeach; ?>
		</ul>
	</nav>
	<header>
		<h3><img id="menubutton" src="res/menubutton.png" onclick="$('#left_nav').slideToggle()" alt="Menu">WCM Application Dashboard</h3>
		<nav id="buttons">
			<ul>
				<a id="newForm" target="_blank" href="#"><li>+ New Form</li></a>
				<a id="viewCharts" target="_blank" href="Chart.html"><li>O View Charts</li></a>
			</ul>
		</nav>
	</header>
	<div>
		<div id="issuesFilter">
			<form name="FilterIssues" data-name="FilterIssues" data-table="" data-primarykey="" data-id="" data-connection="" data-email="" data-contacts="">
                <table>
                    <tr>
                        <td>Plant:</td>
                        <td>
					        <select name="plants" data-query='{ "Query" : "Plants", "Params" : []}' data-order="1.0">
						        <option value=""></option>
					        </select>
				        </td>
				        <td>Department:</td>
                        <td>
					        <select name="departments" data-query='{ "Query" : "Departments", "Params" : ["$plants$"]}' data-order="1.1">
						        <option value=""></option>
					        </select>
				        </td>
                        <td>Zone:</td>
                        <td>
					        <select name="zones" data-query='{ "Query" : "Zones", "Params" : ["$plants$", "$departments$"]}' data-order="1.2">
						        <option value=""></option>
					        </select>
                        </td>
                    </tr>
                    <tr>
					    <td>Machine:</td>
					    <td>
                            <select name="machines" data-query='{ "Query" : "Machines", "Params" : ["$plants$", "$departments$", "$zones$"]}' data-order="1.3">
						        <option value=""></option>
					        </select>
                        </td>
				        <td>Supervisor:</td>
                        <td>
					        <select name="supervisors" data-query='{ "Query" : "Supervisors", "Params" : []}'>
						        <option value=""></option>
					        </select>
				        </td>
					    <td>Shift:</td>
                        <td>
					        <select name="shifts" data-list='{ "list" : [1,2,3] }' data-format="int">
					        </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Severity:</td>
                        <td>
                            <select name="severities" data-list='{ "list" : ["Low","Medium","High"]}'></select>
                        </td>
                        <td>Category:</td>
                        <td>
                            <select name="categories" data-list='{ "list" : ["Housekeeping","None","Crane","Ergonomics","Emergency Evacuation Routes/Equipment","Ladders","Chemical Usage & Storage","Forklift","Warehouse/PIT Drivers","Electrical","Material/Waste Handling","Respiratory Compliance","Welding","PPE","Continual Training","Timely Incident Reporting"]}'></select>
                        </td>
                    </tr>
                    <tr>
                        <td><button type="button" onclick="getAllIssues()">Apply</button></td>
                        <td><button type="reset" onclick="getAllIssues()">Clear</button></td>
                    </tr>
                </table>
			</form>
        </div>
        <div id="current_issue">
        </div>
        <div id="issues">
			<div id="open_issues">
				<span class="toggleButton" onclick="$('#open_issues_div').toggle()">v</span><h3>Open Issues</h3>
				<div id="open_issues_div"></div>
			</div>
			<div id="closed_issues">
				<span class="toggleButton" onclick="$('#closed_issues_div').toggle()">v</span><h3>Closed Issues</h3>
				<div id="closed_issues_div"></div>
			</div>
		</div>
	</div>
</body>
</html>
