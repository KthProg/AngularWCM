var app = angular.module("wcm", []);

function Dashboard($scope, $http) {

    $scope.charts = [];

    $scope.addChart = function () {
        var paramsArr = [];
        $('#params input, #params select, #params textarea').each(function () {
            var elType = $(this).attr("type") || $(this).prop("tagName").toLowerCase();
            var value = formatValue($(this).val(), elType);
            var optionsCopy = [];
            if (this.options) {
                for (var i = 0, l = this.options.length; i < l; ++i) {
                    optionsCopy.push({
                        text: this.options[i].text,
                        value: this.options[i].value
                    });
                }
            }
            paramsArr.push({
                name: $(this).attr("name"),
                type: elType,
                value: value,
                options: optionsCopy
            });
        });

        $scope.charts.push({
            query: $('#chart_query').val(),
            params: paramsArr,
            showParams: false,
            showTypes: false,
            minimized: false,
            maximized: false,
            type: $("#chart_type").val(),
            sort: $("sort_order").val(),
            firstCol: $('#chart_query option:selected').attr("data-firstcol"),
            //vis : null,
            csv: "",
            dataTable: null,
            options: {
                height: $('#chart_height').val() + 'px',
                width: $('#chart_width').val() + '%',
                //chartArea: { left: 0, top: 0, width: $('#chart_width').val(), height: $('#chart_height').val() },
                title: $('#chart_query option:selected').text(),
                backgroundColor: 'transparent',
                curveType: 'function',
                isStacked: true
            },
            elID: $('#chart_query').val(),
            imgURI: null
        });

        console.log($scope.charts);
    };

    $scope.saveLayout = function () {
        /* using $http send request to PHP file with layoutName
        in the POST */
        console.log("Layout " + $('#layout_name').val() + " saved.");
    };

    $scope.removeChart = function (ci) {
        $scope.charts.splice(ci, 1);
    };

    $scope.runQuery = function (ci) {
        var chart = $scope.charts[ci];

        chartData(chart);
    };

    $scope.getCSVFile = function (ci) {
        var chart = $scope.charts[ci];
        download(chart.query + ".csv", chart.csv);
    };

    $scope.viewImage = function (ci) {
        var chart = $scope.charts[ci];
        window.open(chart.imgURI);
    };

    $scope.openLayout = function () {
        $http.get("/scripts/php/Query.php?ASSOC=true&Query=OpenDashboardLayout&Params=" + encodeURIComponent(JSON.stringify([$("#open_layout").val()])))
        .success(
        function (resp) {
            var newChartsArr = JSON.parse(resp[0]["LayoutJSON"]);
            // format values
            for (var i = 0, l = newChartsArr.length; i < l; ++i) {
                for (var j = 0, m = newChartsArr[i].params.length; j < m; ++j) {
                    var param = newChartsArr[i].params[j];
                    newChartsArr[i].params[j].value = formatValue(param.value, param.type);
                }
            }
            // if successful, update the options with the response array
            // angular will automatically reflect those changes in the DOM
            $scope.charts = newChartsArr;
        });
    };

    $scope.saveOrUpdateLayout = function (updating){
        var chartsCopy = makeChartsCopyForDatabase();
        var secondParam = (updating ? $("#open_layout").val() : $("#layout_name").val());
        $http({
            method: "POST",
            url: "/scripts/php/Query.php",
            data: "Query=" + (updating ? "Update" : "Save") + "DashboardLayout&Params=" + encodeURIComponent(JSON.stringify([JSON.stringify(chartsCopy), secondParam])),
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
            || from > ($scope.charts.length - 1)
            || to > ($scope.charts.length - 1)) {
            console.log("Invalid from or to indices.");
            return;
        }

        $scope.charts.splice(to, 0, $scope.charts.splice(from, 1)[0]);
    };

    var makeChartsCopyForDatabase = function(){
        var chartsCopy = [];
        for (var i = 0, l = $scope.charts.length; i < l; ++i) {
            var thisChart = $scope.charts[i];
            chartsCopy.push({
                name: thisChart.name,
                query: thisChart.query,
                params: thisChart.params,
                height: thisChart.height,
                width: thisChart.width,
                showParams: false,
                minimized: false,
                maximized: false,
                type: thisChart.type,
                firstCol: thisChart.firstCol,
                //vis : null,
                csv: "",
                dataTable: null,
                options: thisChart.options,
                elID: thisChart.elID,
                imgURI: null
            });
        }
        return chartsCopy;
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
            console.log($scope.charts);
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

    $("#open_layout").html(objectToOptionsHTML(sendNoParamQuery("GetDashboardLayouts")));
}

app.controller("Dashboard", Dashboard);