function Issues($scope, $http) {

    $scope.showOpen = true;
    $scope.showClosed = true;

    $scope.openIssues = [{ Name: "Initializing" }];
    $scope.closedIssues = [{ Name: "Initializing"}];

    $scope.getOpenIssues = function () {
        $http.get("/scripts/php/Query.php?Query=GetOpenIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            $scope.openIssues = resp;
        });
    };

    $scope.getClosedIssues = function () {
        $http.get("/scripts/php/Query.php?Query=GetClosedIssues&ASSOC=true&Params=[]")
        .success(function (resp) {
            $scope.closedIssues = resp;
        });
    };

    $scope.getOpenIssues();
    $scope.getClosedIssues();

}

app.controller("Issues", Issues);