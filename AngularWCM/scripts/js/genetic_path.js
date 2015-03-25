function GeneticPathController($scope) {
    $scope.svgdata = "<circle cx='50' cy='50' r='40' stroke='black' stroke-width='4' fill='blue' />";

    var gpc = this;
    this.points = [[0, 1], [1, 2]];
    this.badSolutionCount = 0;
    $scope.totalDistance = 0;
    $scope.initialDistance = 0;
    $scope.initialsvgdata = "";

    $scope.initialize = function (points){
        gpc.points = points;
        $scope.initialPoints = JSON.parse(JSON.stringify(points));
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

GeneticPathController.prototype.swapPoints = function (i1, i2) {
    for(var i = 0; i <= 1; ++i){
        var temp = this.points[i1][i]
        this.points[i1][i] = this.points[i2][i];
        this.points[i2][i] = temp;
    }
};

GeneticPathController.prototype.getRandomIndex = function (maxLength) {
    return Math.floor(Math.random() * maxLength);
};

GeneticPathController.prototype.pointsToSvg = function () {
    var gpc = this;
    return this.points.reduce(function (svgStr, point, i) {
        if (i === (gpc.points.length - 1)) return svgStr;
        return svgStr + gpc.pointsToSvgLine(gpc.points[i], gpc.points[i + 1]);
    }, "");
};

GeneticPathController.prototype.tryNewCoords = function () {
    var initDist = this.getTotalDistance();

    var i1 = i2 = 0;

    while (i1 === i2) {
        i1 = this.getRandomIndex(this.points.length);
        i2 = this.getRandomIndex(this.points.length);
    }

    this.swapPoints(i1, i2);

    var newDist = this.getTotalDistance();

    if (newDist > initDist) {
        this.swapPoints(i2, i1);
        this.badSolutionCount += 1;
    } else {
        console.log("better solution");
        this.badSolutionCount = 0;
    }

    return !(this.badSolutionCount >= (Math.pow(2, this.points.length) - 3));
};

app.controller("GeneticPath", GeneticPathController);