function Issues($scope, $http) {

    $scope.XML = {};
    $scope.filter = {};

    $scope.$on('filter', function (event, args) {
        $("select option:selected").each(function () {
            $scope.filter[$(this).parent().attr("name")] = $(this).text();
        });
        //console.log($scope.filter);
        $scope.getOpenIssues();
        $scope.getClosedIssues();
    });

    $scope.showOpen = true;
    $scope.showClosed = true;

    $scope.openIssues = [{ Name: "Initializing" }];
    $scope.closedIssues = [{ Name: "Initializing"}];

    $scope.getOpenIssues = function () {
        $scope.getIssues("GetOpenIssues", "openIssues");
    };

    $scope.getClosedIssues = function () {
        $scope.getIssues("GetClosedIssues", "closedIssues");
    };

    $scope.getAllIssues = function () {
        $scope.getOpenIssues();
        $scope.getClosedIssues();
    };

    $scope.getIssues = function (query, assignTo) {
        $http.get("/scripts/php/Query.php?Query=" + query + "&ASSOC=true&Params=[]")
        .success(function (resp) {
            var formatted = $scope.formatResponse(resp);
            var filtered = $scope.filterResponse(formatted);
            var lineItemsAdded = $scope.addLineItems(filtered);
            $scope[assignTo] = lineItemsAdded;
        });
    };

    $scope.addLineItems = function (resp) {
        for (k in $scope.XML) {
            var count = 0;
            var groups = $($scope.XML[k]).find("group");
            groups.each(function () {
                //var header = $(this).filter("header");
                var labels = $(this).children("label");
                labels.each(function () {
                    ++count;
                    for (var i = 0, l = resp.length; i < l; ++i) {
                        if (resp[i].LineNum == count && resp[i]["LineItem"] == undefined && resp[i].Name == k) {
                            resp[i]["LineItem"] = $(this).text();
                        }
                    }
                });
            });
        }
        return resp;
    };

    $scope.getLineItemsXML = function () {
        $.ajax({
            url: "/xml/ehslabels.xml",
            dataType: "xml",
            async: false,
            success: function (data){
                $scope.XML["EHS"] = data;
            }
        });
        $.ajax({
            url: "/xml/wcclabels.xml",
            dataType: "xml",
            async: false,
            success: function (data) {
                $scope.XML["WCC"] = data;
            }
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

    $scope.getLineItemsXML();

    $scope.getAllIssues();
}

app.controller("Issues", Issues);