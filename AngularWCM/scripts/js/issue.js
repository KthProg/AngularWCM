﻿function Issues($scope, $http) {

    $scope.filter = {};

    $scope.showOpen = true;
    $scope.showClosed = true;

    $scope.openIssues = [{ Name: "Initializing" }];
    $scope.closedIssues = [{ Name: "Initializing" }];

    $scope.$on('filter', function (event, args) {
        [].slice.call(document.querySelectorAll("select")).forEach(function (sel) {
            var opText;
            [].slice.call(sel.querySelectorAll("option")).some(function (op) {
                if (op.value == sel.value) {
                    opText = op.innerText;
                    return true;
                }
            });
            $scope.filter[sel.parentNode.parentNode.parentNode.id] = opText;
        });
        console.log($scope.filter);
        $scope.getAllIssues();
    });

    $scope.$on('export', function (event, args) {
        var csv = "Open Issues\r\n";
        csv += $scope.objArrayToCSV($scope.openIssues);

        csv += "\r\nClosed Issues\r\n";
        csv += $scope.objArrayToCSV($scope.closedIssues);
        
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
        pom.setAttribute('download', 'SafetyIssues.csv');
        pom.click();
        return csv;
    });

    $scope.objArrayToCSV = function (objArray) {
        csv = "";
        for (var c in objArray[0]) {
            if (objArray[0].hasOwnProperty(c)) {
                csv += c + ",";
            }
        }
        csv = csv.substring(0, csv.length - 1);
        csv += "\r\n";
        for (var i = 0, l = objArray.length; i < l; ++i) {
            for (var f in objArray[i]) {
                if (objArray[i].hasOwnProperty(f)) {
                    csv += String(objArray[i][f]).replace(/(\r\n|\n|\r|,)/gm, "") + ",";
                }
            }
            csv = csv.substring(0, csv.length - 1);
            csv += "\r\n";
        }
        return csv;
    };

    $scope.getAllIssues = function () {
        $scope.getIssues("GetOpenIssues", "openIssues");
        $scope.getIssues("GetClosedIssues", "closedIssues");
    };

    $scope.getIssues = function (query, assignTo) {
        $http.get("/scripts/php/Query.php?Query=" + query + "&Named=true&ASSOC=true&Params=[]")
        .success(function (resp) {
            var formatted = $scope.formatResponse(resp);
            var filtered = $scope.filterResponse(formatted);
            $scope[assignTo] = filtered;
        });
    };

    $scope.formatResponse = function (resp) {
        for (var i = 0, l = resp.length; i < l; ++i) {
            for (var k in resp[i]) {
                if (!isNaN(resp[i][k])) {
                    resp[i][k] = Number(resp[i][k]);
                }
            }
        }
        return resp;
    };

    $scope.filterResponse = function (resp) {
        return resp.filter(function (n) {
            return Object.keys($scope.filter).reduce(function (prev, el) {
                if (!$scope.filter[el]) { return prev && true; }
                return prev && (n[el] == undefined || n[el] == $scope.filter[el]);
            }, true);
        });
    };

    $scope.openIssue = function (name, id, subcategory) {
        $http.get("/scripts/php/Query.php?Query=OpenIssue&Named=true&Params=" + encodeURIComponent(JSON.stringify([name, id, subcategory])))
        .success(function (resp) {
            console.log(resp);
            $scope.getAllIssues();
        });
    };

    $scope.closeIssue = function (name, id, subcategory) {
        var actionTaken = prompt("Enter in the action taken to close this issue.");
        if (actionTaken) {
            $http.get("/scripts/php/Query.php?Query=CloseIssue&Named=true&Params=" + encodeURIComponent(JSON.stringify([name, id, subcategory, actionTaken])))
            .success(function (resp) {
                console.log(resp);
                $scope.getAllIssues();
            });
        } else {
            alert("Action taken is invalid.");
        }
    };

    $scope.getAllIssues();
}

app.directive('issueheader', function () {
    var template = '<span class="issueHeader">{{i.Name}} {{i.ID}}.{{i.SubCategoryID}} - {{i.Compliancy}}</span> ';

    return {
        restrict: "E",
        template: template,
        scope: {
            i: "=issue"
        }
    };
});

app.directive('issuedetails', function () {
    var
    template = '<table>'
    template += '   <tr>';
    template += '      <td>Line Item</td><td>{{i.SubCategory}}</td>';
    template += '   </tr>';
    template += '   <tr>';
    template += '       <td>Category</td><td>{{i.Category}}</td>';
    template += '   </tr>';
    template += '   <tr>';
    template += '       <td>Location</td><td>{{i.Plant}}, {{i.Department}}, {{i.Zone}}, {{i.Machine}}</td>';
    template += '   </tr>';
    template += '   <tr>';
    template += '       <td>Created</td><td>{{i.OpenDate}}</td>';
    template += '   </tr>';
    template += '   <tr>';
    template += '       <td>Days Open</td><td>{{i.DaysOpen}}</td>';
    template += '   </tr>';
    template += '   <tr>';
    template += '       <td>Details</td><td>{{i.Details}}</td>';
    template += '   </tr>';
    template += '</table>';

    return {
        restrict: "E",
        template: template,
        scope: {
            i: "=issue"
        }
    };
});

app.controller("Issues", Issues);