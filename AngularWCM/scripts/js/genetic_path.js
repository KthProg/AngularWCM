function GeneticPathController($scope) {
    $scope.svgdata = "";
    $scope.totalDistance = 0;
    $scope.initialDistance = 0;
    $scope.initialsvgdata = "";

    var gpc = this;
    $scope.points = "[[0, 20], [100, 120], [140, 180]]";
    $scope.possiblePoints = "[[[0, 20], [100, 120], [140, 180]], [[144, 172], [68, 134], [154, 196], [126, 178], [58, 130]], [[0, 10], [34, 67], [77, 98], [63, 89], [29, 65]]]";
    this.points = [[0, 0]];
    this.possiblePoints = [[0, 0]];
    this.combinations = 0;
    this.badSwapPoints = [];

    $scope.startAlgorithm = function () {
        gpc.badSwapPoints = [];
        try {
            gpc.points = JSON.parse($scope.points);
            gpc.possiblePoints = JSON.parse($scope.possiblePoints);
        } catch (e) {
            alert("That was not a valid list of points.");
        }
        // gpc.combinations = factorial(gpc.points.length) / (2 * (factorial(gpc.points.length - 2)));
        gpc.combinations = gpc.possiblePoints.reduce(function (combs, pp) {
            return combs * pp.length;
        }, 1);
        gpc.combinations = gpc.combinations / (2 * (gpc.combinations - 2));
        $scope.initialPoints = JSON.parse(JSON.stringify(gpc.points));
        $scope.initialsvgdata = gpc.pointsToSvg();
        $scope.initialDistance = gpc.getTotalDistance();
        while (gpc.tryNewCoords()) {
            $scope.svgdata = gpc.pointsToSvg();
            $scope.totalDistance = gpc.getTotalDistance();
            $scope.finalPoints = JSON.parse(JSON.stringify(gpc.points));
        }
    };
}

GeneticPathController.prototype.getDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
};

GeneticPathController.prototype.getTotalDistance = function (p1, p2) {
    var gpc = this;
    return this.points.reduce(function (len, point, i) {
        if (i === (gpc.points.length - 1)) return len;
        return len + gpc.getDistance(gpc.points[i], gpc.points[i + 1]);
    }, 0);
};

GeneticPathController.prototype.pointsToSvgLine = function (p1, p2) {
    return '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" />';
};

GeneticPathController.prototype.pointToSvgPoint = function (p1) {
    return '<circle cx="' + p1[0] + '" cy="' + p1[1] + '" r="2" />';
};

//GeneticPathController.prototype.swapPoints = function (i1, i2) {
//    for(var i = 0; i <= 1; ++i){
//        var temp = this.points[i1][i]
//        this.points[i1][i] = this.points[i2][i];
//        this.points[i2][i] = temp;
//    }
//};

GeneticPathController.prototype.changePoint = function (i1, i2) {
    for (var i = 0; i <= 1; ++i) {
        this.points[i1][i] = this.possiblePoints[i1][i2][i];
    }
};

GeneticPathController.prototype.getRandomIndex = function (maxLength) {
    return Math.floor(Math.random() * maxLength);
};

GeneticPathController.prototype.pointsToSvg = function () {
    var gpc = this;
    return this.points.reduce(function (svgStr, point, i) {
        if (i === (gpc.points.length - 1)) return svgStr;
        return svgStr + gpc.pointsToSvgLine(gpc.points[i], gpc.points[i + 1]) + gpc.pointToSvgPoint(gpc.points[i]) + gpc.pointToSvgPoint(gpc.points[i + 1]);
    }, "");
};

GeneticPathController.prototype.tryNewCoords = function () {

    if (this.badSwapPoints.length >= this.combinations) return false;

    var initDist = this.getTotalDistance();

    var i1 = i2 = 0;

    // don't swap the same indices
    // don't swap points which were already swapped and failed
    var pointArrayJSON = "[]";
    while (this.badSwapPoints.indexOf(pointArrayJSON) > -1) {
        i1 = this.getRandomIndex(this.points.length);
        // i2 = this.getRandomIndex(this.points.length);
        i2 = this.getRandomIndex(this.possiblePoints[i1].length);
        pointArrayJSON = JSON.stringify([i1, i2]);
    }

    this.changePoint(i1, i2);
    // this.swapPoints(i1, i2);

    var newDist = this.getTotalDistance();

    if (newDist > initDist) {
        this.changePoint(i2, i1);
        // this.swapPoints(i2, i1);
        this.badSwapPoints.push(pointArrayJSON);
    } else {
        this.badSwapPoints = [];
    }

    // false if every combination was tried and failed
    return this.badSwapPoints.length < this.combinations;
};

var factorial = function (n) {
    if (n >= 2) {
        return n * factorial(n - 1);
    } else {
        return n;
    }
};

var app = angular.module("LO", ['ngSanitize']);
app.controller("GeneticPath", GeneticPathController);