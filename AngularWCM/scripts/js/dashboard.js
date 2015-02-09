function Dashboard($scope, $http) {

    $scope.charts = [];
    $scope.query = "";
    $scope.parameters = [];
    $scope.layouts = [];
    $scope.layout = "";

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

        var ch = new Chart(
            $('#chart_query').val(),
            paramsArr,
            $("#chart_type").val(),
            $("sort_order").val(),
            $('#chart_query option:selected').attr("data-firstcol"),
            {
                height: $('#chart_height').val() + 'px',
                width: $('#chart_width').val() + '%',
                //chartArea: { left: 0, top: 0, width: $('#chart_width').val(), height: $('#chart_height').val() },
                title: $('#chart_query option:selected').text(),
                backgroundColor: 'transparent',
                curveType: 'function',
                isStacked: true
            },
            $('#chart_query').val(),
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
        $http.get("/scripts/php/Form.php?ASSOC=true&Query=OpenDashboardLayout&Params=" + encodeURIComponent(JSON.stringify([$("#open_layout").val()])))
        .success(
        function (resp) {
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
        var secondParam = (updating ? $("#open_layout").val() : $("#layout_name").val());
        $http({
            method: "POST",
            url: "/scripts/php/Form.php",
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
        $http.get("/xml/queries.xml")
        .success(function (resp) {
            var xml = $.parseXML(resp);
            var parametersXML = $(xml).find("query[name='" + $scope.query + "'] parameter");
            var parameters = [];
            parametersXML.each(function () {
                parameters.push({});
                var thisParam = parameters[parameters.length - 1];
                thisParam["name"] = this.getAttribute("name");
                var properties = $(this).children();
                properties.each(function () {
                    if (this.tagName != "options") {
                        thisParam[this.tagName] = this.textContent;
                    } else {
                        var optionsXML = $(this).children();
                        var options = {};
                        optionsXML.each(function () {
                            options[this.getAttribute("value")] = this.textContent;
                        });
                        thisParam["options"] = options;
                    }
                });
                $scope.parameters = parameters;
            });
            $scope.getParameterOptions();
        });
    }

    $scope.getParameterOptions = function () {
        $scope.parameters.forEach(function (prm) {
            if (prm.query) {
                $.ajax({
                    type: "POST",
                    data: {
                        Query: prm.query,
                        Params: "[]",
                        Function: "Query"
                    },
                    dataType: "json",
                    success: function (data) {
                        prm.options = data;
                        $scope.$apply();
                    },
                    url: "/scripts/php/Form.php"
                });
            }
        });
    };

    $scope.getLayouts = function () {
        $.ajax({
            type: "POST",
            data: {
                Query: "GetDashboardLayouts",
                Params: "[]",
                Function: "Query"
            },
            dataType: "json",
            success: function (data) {
                $scope.layouts = data;
                $scope.$apply();
            },
            url: "/scripts/php/Form.php"
        });
    };

    $scope.getLayouts();
}

app.controller("Dashboard", Dashboard);