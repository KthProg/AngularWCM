function Issues($scope, $http) {

    $scope.showOpen = true;
    $scope.showClosed = true;

    $scope.openIssues = [{ Name: "Initializing" }];
    $scope.closedIssues = [{ Name: "Initializing"}];

    $scope.getOpenIssues = function () {
        $http.get("/scripts/php/Query.php?Query=GetOpenIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            var formatted = $scope.formatResponse(resp);
            $scope.openIssues = formatted;
        });
    };

    $scope.getClosedIssues = function () {
        $http.get("/scripts/php/Query.php?Query=GetClosedIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            console.log(resp);
            var formatted = $scope.formatResponse(resp);
            $scope.closedIssues = formatted;
        });
    };

    $scope.formatResponse = function (resp) {
        for (var i in resp) {
            for (var k in resp[i]) {
                if (!isNaN(resp[i][k])) {
                    resp[i][k] = Number(resp[i][k]);
                }
            }
        }
        return resp;
    };

    $scope.getOpenIssues();
    $scope.getClosedIssues();

}

app.controller("Issues", Issues);