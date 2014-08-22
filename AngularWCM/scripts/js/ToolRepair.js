﻿$(document.body).ready(function () {
    var scope = angular.element($("[ng-app='wcm']")).scope();
    scope.$apply(function () {
        scope.updateEmailBody = function () {
            if (scope.fields['RepairedLocation'] == "Mound" && !scope.hasRecord) {
                var bodyHTML = "<style>";
                bodyHTML += ".red {";
                bodyHTML += "	background-color: rgb(218,150,148);";
                bodyHTML += "}";
                bodyHTML += ".whitetext {";
                bodyHTML += "	color: rgb(255,255,255);";
                bodyHTML += "}";
                bodyHTML += ".dkgrey {";
                bodyHTML += "    background-color: rgb(89,89,89);";
                bodyHTML += "}";
                bodyHTML += "</style>";
                bodyHTML += "<table style='border: 1px solid grey;'>";
                bodyHTML += "<tr>";
                bodyHTML += "<td width='30px'></td>";
                bodyHTML += "<td width='200px'></td>";
                bodyHTML += "<td width='200px'></td>";
                bodyHTML += "<td width='200px'></td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td colspan='3' class='dkgrey whitetext'><h1>Tool Repair Form</h1></td>";
                bodyHTML += "<td class='dkgrey whitetext'><h2>Tool Repair # </h2>"
                bodyHTML += $("[name='ID']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td rowspan='16' class='red'>T<br />o<br />o<br />l<br /> <br />R<br />e<br />p<br />a<br />i<br />r</td>";
                bodyHTML += "<td class='red'>Tool Description</td>";
                bodyHTML += "<td colspan='2' class='red'>Problems (semi-colon separated [a; b; c])</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='ToolName']").val();
                bodyHTML += "</td>";
                bodyHTML += "<td rowspan='11' colspan='2'>";
                bodyHTML += $("[name='Problems']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Tool Number</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='ToolNumber']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Department</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='Department']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Zone</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='Zone']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Machine</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='Machine']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Reported By</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='ReportedBy']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Pick Up Date</td>";
                bodyHTML += "<td class='red'>Repair Location</td>";
                bodyHTML += "<td class='red'>Notes</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='DateShipped']").val();
                bodyHTML += "</td>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='RepairedLocation']").val();
                bodyHTML += "</td>";
                bodyHTML += "<td rowspan='3'>";
                bodyHTML += $("[name='Notes']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td class='red'>Due Date/Repair Date</td>";
                bodyHTML += "<td class='red'>Service</td>";
                bodyHTML += "</tr>";
                bodyHTML += "<tr>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='DateReceived']").val();
                bodyHTML += "</td>";
                bodyHTML += "<td>";
                bodyHTML += $("[name='IsService']").val();
                bodyHTML += "</td>";
                bodyHTML += "</tr>";
                bodyHTML += "</table>";
                scope.emailBody = bodyHTML;
            } else {
                scope.emailBody = "";
            }
        };
        scope.updateContacts = function () {
            var moundContacts = "jmurphy@venturecorporation.net; pillars@ventureglobalengineering.com; thomason@mayco-mi.com; dharper@mayco-mi.com; hooks@njt-na.com";
            var maycoContacts = "thomason@mayco-mi.com; hooks@njt-na.com; mbommarito@mayco-mi.com";
            if (scope.fields['RepairedLocation'] == "Mound") {
                scope.contacts = moundContacts + ";" + maycoContacts;
            } else {
                scope.contacts = maycoContacts;
            }
            var zone = scope.fields['Zone'];
            var foremen = new Array();
            foremen["Zone_1"] = "reese@mayco-mi.com; clay@mayco-mi.com; vernon@VNA1.onmicrosoft.com";
            foremen["Zone_2"] = "selliott@mayco-mi.com; green@njt-na.com; claes@mayco-mi.com";
            foremen["Zone_3"] = "fxake@mayco-mi.com; eweathers@mayco-mi.com; shah@mayco-mi.com";
            foremen["Zone_4"] = "haggerty@mayco-mi.com; sherbutte@njt-na.com; greer@mayco-mi.com";
            var foremenEmails = (foremen[zone] == undefined ? "" : "; " + foremen[zone]);
            scope.contacts += foremenEmails;
        };
        scope.$watch("fields['RepairedLocation']", function () {
            scope.updateEmailBody();
            scope.updateContacts();
            console.log(scope.contacts);
            console.log(scope.emailBody);
        });
        scope.$watch("fields['Zone']", function () {
            scope.updateContacts();
            console.log(scope.contacts);
            console.log(scope.emailBody);
        });
    });
});