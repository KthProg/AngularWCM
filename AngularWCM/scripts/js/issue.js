function Issues($scope, $http) {

    $scope.filter = {};

    $scope.showOpen = true;
    $scope.showClosed = true;

    $scope.openIssues = [{ Name: "Initializing" }];
    $scope.closedIssues = [{ Name: "Initializing" }];

    $scope.$on('filter', function (event, args) {
        $("select option:selected").each(function () {
            $scope.filter[$(this).parent().attr("name")] = $(this).text();
        });
        $scope.getAllIssues();
    });

    $scope.$on('export', function (event, args) {
        var csv = "Open Issues\r\n";
        for (var c in $scope.openIssues[0]) {
            csv += c + ",";
        }
        csv = csv.substring(0, csv.length - 1);
        csv += "\r\n";
        for (var a = 0, b = $scope.openIssues.length; a < b; ++a) {
            for (var c in $scope.openIssues[a]) {
                csv += String($scope.openIssues[a][c]).replace(/(\r\n|\n|\r|,)/gm, "") + ",";
            }
            csv = csv.substring(0, csv.length - 1);
            csv += "\r\n";
        }

        csv += "\r\nClosed Issues\r\n";
        for (var c in $scope.closedIssues[0]) {
            csv += c + ",";
        }
        csv = csv.substring(0, csv.length - 1);
        csv += "\r\n";
        for (var d = 0, e = $scope.closedIssues.length; d < e; ++d) {
            for (var f in $scope.closedIssues[d]) {
                csv += String($scope.closedIssues[d][f]).replace(/(\r\n|\n|\r|,)/gm, "") + ",";
            }
            csv = csv.substring(0, csv.length - 1);
            csv += "\r\n";
        }
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
        pom.setAttribute('download', 'SafetyIssues.csv');
        pom.click();
        return csv;
    });

    $scope.getAllIssues = function () {
        $scope.getIssues("GetOpenIssues", "openIssues");
        $scope.getIssues("GetClosedIssues", "closedIssues");
    };

    $scope.getIssues = function (query, assignTo) {
        $http.get("/scripts/php/Query.php?Query=" + query + "&ASSOC=true&Params=[]")
        .success(function (resp) {
            console.log(resp);
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
        resp = resp.filter(function (n) {
            var valid = true;
            for (var k in $scope.filter) {
                if ($scope.filter[k]) {
                    if (n[k] == undefined || n[k] == $scope.filter[k]) {
                        valid = true;
                    } else {
                        valid = false;
                        break;
                    }
                }
            }
            return valid;
        });
        return resp;
    };

    $scope.openIssue = function (name, id, line) {
        $http.get("/scripts/php/Query.php?Query=OpenIssue&Params=" + JSON.stringify([name, id, line]))
        .success(function (resp) {
            $scope.getAllIssues();
        });
    };

    $scope.closeIssue = function (name, id, line) {
        var actionTaken = prompt("Enter in the action taken to close this issue.");
        if (actionTaken) {
            $http.get("/scripts/php/Query.php?Query=CloseIssue&Params=" + JSON.stringify([name, id, line, actionTaken]))
            .success(function (resp) {
                $scope.getAllIssues();
            });
        } else {
            alert("Action taken is invalid.");
        }
    };

    //$scope.getLineItemsXML();

    $scope.getAllIssues();
}

app.controller("Issues", Issues);