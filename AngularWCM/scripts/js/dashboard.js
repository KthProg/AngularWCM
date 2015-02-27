function Dashboard($scope, $http) {

    window.$http = $http;

    $scope.charts = [];
    $scope.query = "";
    $scope.parameters = [];
    $scope.layouts = [];
    $scope.layout = "";

    $scope.addChart = function () {
        var paramsArr = [].slice.call(document.getElementById('params').querySelectorAll('input, select, textarea')).map(function (el) {
            var elType = el.getAttribute("type") || el.tagName.toLowerCase();
            var value = formatValue(el.value, elType);
            var opsCopy = [];
            if (el.options) {
                opsCopy = [].slice.call(el.options).map(function (op) {
                    return {
                        text: op.text,
                        value: op.value
                    }
                });
            }
            return {
                name: el.getAttribute("name"),
                type: elType,
                value: value,
                options: opsCopy
            };
        });

        var cq = document.getElementById('chart_query');
        var cqOp;
        [].slice.call(cq.options).forEach(function (op) {
            if (op.value == cq.value) {
                cqOp = op;
            }
        });

        var ch = new Chart(
            cq.value,
            paramsArr,
            document.getElementById("chart_type").value,
            document.getElementById("sort_order").value,
            cqOp.getAttribute("data-firstcol"),
            {
                height: document.getElementById('chart_height').value + 'px',
                width: document.getElementById('chart_width').value + '%',
                //chartArea: { left: 0, top: 0, width: $('#chart_width').val(), height: $('#chart_height').val() },
                title: cqOp.innerText,
                backgroundColor: 'transparent',
                curveType: 'function',
                isStacked: true
            },
            cq.value + $scope.charts.length,
            false);

        $scope.charts.push(ch);

        //console.log($scope.charts);
    };

    $scope.removeChart = function (ci) {
        $scope.charts.splice(ci, 1);
    };

    $scope.runQuery = function (ci) {
        var chart = $scope.charts[ci];
        //console.log(chart);
        chart.chartData();
    };

    $scope.getCSVFile = function (ci) {
        var chart = $scope.charts[ci];
        var download = function (filename, text) {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);
            pom.click();
        };
        download(chart.query + ".csv", chart.csv);
    };

    $scope.viewImage = function (ci) {
        var chart = $scope.charts[ci];
        window.open(chart.imgURI);
    };

    $scope.openLayout = function () {
        $http.get("/scripts/php/Query.php?ASSOC=true&Query=OpenDashboardLayout&Named=true&Params=" + encodeURIComponent(JSON.stringify([$scope.layout])))
        .success(
        function (resp) {
            console.log(resp);
            var newChartsArr = JSON.parse(resp[0]["LayoutJSON"]);
            // format values
            newChartsArr.forEach(function (el) {
                el.params.forEach(function(pr){
                    pr.value = formatValue(pr.value, pr.type);
                })
            });
            //create new chart objects with db json info
            var chartsWithFuncsArr = newChartsArr.map(function (el) {
                return new Chart(el.query, el.params, el.type,
                    el.sortOrder, el.firstCol, el.options,
                    el.elID, el.showTrendline);
            });
            // if successful, update the options with the response array
            // angular will automatically reflect those changes in the DOM
            $scope.charts = chartsWithFuncsArr;
        });
    };

    $scope.saveOrUpdateLayout = function (updating){
        var chartsCopy = makeChartsCopyForDatabase();
        var secondParam = (updating ? $scope.layout : document.getElementById("layout_name").value);
        $http({
            method: "POST",
            url: "/scripts/php/Query.php",
            data: "Query=" + (updating ? "Update" : "Save") + "DashboardLayout&Named=true&Params=" + encodeURIComponent(JSON.stringify([JSON.stringify(chartsCopy), secondParam])),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(
        function (resp) {
            alert("Dashboard layout " + (updating ? "updated." : "saved."));
        });
    };

    $scope.changeIndex = function (from, to) {
        if (from == to
            || from < 0
            || to < 0
            || from >= $scope.charts.length
            || to >= $scope.charts.length) {
            //console.log("Invalid from or to indices.");
            return;
        }

        $scope.charts.splice(to, 0, $scope.charts.splice(from, 1)[0]);
    };

    var makeChartsCopyForDatabase = function(){
        return $scope.charts.map(function (el) {
            return el.toSmallObject();
        });
    }

    var formatValue = function (value, type) {
        switch (type) {
            case "date":
            case "datetime-local":
            case "time":
                return (new Date(Date.parse(value)));
                break;
            case "range":
            case "number":
                return Number(value);
                break;
        }
        return value;
    };

    $scope.all_changeShowParams = function () {
        $scope.charts.forEach(function (el) {
            el.showParams = !el.showParams;
        });
    };

    $scope.all_changeMinimized = function () {
        $scope.charts.forEach(function (el) {
            el.minimized = !el.minimized;
        });
    };

    $scope.all_changeMaximized = function () {
        $scope.charts.forEach(function (el) {
            el.maximized = !el.maximized;
        });
    };

    $scope.all_removeChart = function () {
        for (var i = 0, l = $scope.charts.length; i < l; ++i) {
            $scope.removeChart(0);
            //console.log($scope.charts);
        };
    };

    $scope.all_runQuery = function () {
        for (var i = 0, l = $scope.charts.length; i < l; ++i) {
            $scope.runQuery(i);
        };
    };

    $scope.all_viewImage = function () {
        for (var i = 0, l = $scope.charts.length; i < l; ++i) {
            $scope.viewImage(i);
        };
    };

    $scope.all_getCSVFile = function () {
        for (var i = 0, l = $scope.charts.length; i < l; ++i) {
            $scope.getCSVFile(i);
        };
    };

    $scope.all_changeShowTypes = function () {
        $scope.charts.forEach(function (el) {
            el.showTypes = !el.showTypes;
        });
    };

    $scope.getParams = function () {
        $http.get("/json/queries.json")
        .success(function (resp) {
            var prms = resp[$scope.query].parameters;
            if (!prms) {
                $scope.parameters = [];
                return;
            }
            $scope.parameters = Object.keys(prms).map(function (prmk) {
                var newPrm = prms[prmk];
                newPrm["name"] = prmk;
                return newPrm;
            });
            $scope.getParameterOptions();
        });
    }

    $scope.getParameterOptions = function () {
        $scope.parameters.forEach(function (prm) {
            if (prm.query) {
                $http({
                    method: "POST",
                    url: "/scripts/php/Query.php",
                    data: "Query=" + prm.query + "&Named=true&Params=[]",
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (resp) {
                    prm.options = resp.map(function (row) {
                        return { value: row[0], text: row[1] };
                    });
                });
            }
        });
    };

    $scope.getLayouts = function () {
        $http({
            method: "POST",
            url: "/scripts/php/Query.php",
            data: "Query=GetDashboardLayouts&Named=true&Params=[]",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(
        function (resp) {
            $scope.layouts = resp.map(function (row) {
                return { value: row[0], text: row[1] };
            });
        });
    };

    $scope.getLayouts();
}

app.controller("Dashboard", Dashboard);