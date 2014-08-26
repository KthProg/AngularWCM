function Issues($scope, $http) {

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
        $http.get("/scripts/php/Query.php?Query=GetOpenIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            var formatted = $scope.formatResponse(resp);
            var filtered = $scope.filterResponse(formatted);
            $scope.openIssues = filtered;
        });
    };

    $scope.getClosedIssues = function () {
        $http.get("/scripts/php/Query.php?Query=GetClosedIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            var formatted = $scope.formatResponse(resp);
            var filtered = $scope.filterResponse(formatted);
            $scope.closedIssues = filtered;
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
            $scope.getOpenIssues();
            $scope.getClosedIssues();
        });
    };

    $scope.closeIssue = function (name, id, line) {
        var actionTaken = prompt("Enter in the action taken to close this issue.");
        if (actionTaken) {
            $http.get("/scripts/php/Query.php?Query=CloseIssue&Params=" + JSON.stringify([name, id, line, actionTaken]))
            .success(function (resp) {
                $scope.getOpenIssues();
                $scope.getClosedIssues();
            });
        } else {
            alert("Action taken is invalid.");
        }
    };
    
    /*$scope.getUniqueIssue = function (name, id, line) {
        var issueArr = resp.filter(function (n) {
            return 
            n.Name == name && 
            n.ID == id &&
            n.LineNum == line;
        });
        var issueObj = issueArr[0];
        return issueObj;
    };*/

    $scope.getOpenIssues();
    $scope.getClosedIssues();

}

app.controller("Issues", Issues);