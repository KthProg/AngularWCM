function getByName(name) {
    return $("[name='" + name + "']");
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function getParams(query) {
    $.ajax({
        url: "../scripts/php/getParams.php",
        type: "POST",
        dataType: "json",
        data: { Query: query },
        success: function (data, status, xhr) {
            if (status == "success" && xhr.readyState == 4) {
                renderParamInputs(data);
            }
        },
        error: logError
    });
}

function logError(xhr, status, error) {
    console.log(status + " : " + error);
    console.log(this);
}

function renderParamInputs(data) {
    var pDiv = $("#ParamDiv");
    pDiv.html("");
    if (data.parameter != undefined) {
        for (var i = 0; i < data.parameter.length; ++i) {
            var name = data.parameter[i]["@attributes"].name;
            var type = data.parameter[i].type;
            pDiv.append("<label>" + name + "</label><input type='" + type + "' name='Params[]' placeholder='" + name + "' />");
        }
    }
}

function paramsToArray() {
    var params = [];
    $("[name='Params[]']").each(function () {
        params.push($(this).val());
    });
    return params;
}

function checkFilledOut() {
    var params = paramsToArray();
    var query = $("[name='Query']").val();
    var type = $("[name='ChartAs'] option:selected").val();

    var emptyParam = (params.indexOf("") > -1);
    var noQuery = (query == "" || query == undefined);
    var noType = (type == "" || type == undefined);
    if (noQuery || noType || emptyParam) {
        var msg = (noQuery ? "Select a query to run. " : "") + (noType ? "Select a chart type. " : "") + (emptyParam ? "Fill in all parameters." : "");
        alert(msg);
        return false;
    }
    return true;
}

function chartData() {
    var params = paramsToArray();
    var query = $("[name='Query']").val();
    var type = $("[name='ChartAs'] option:selected").val();

    if (!checkFilledOut()) {
        return;
    }

    $.ajax({
        url: "/scripts/php/Query.php",
        type: "GET",
        dataType: "json",
        data: {
            Query: query,
            Params: JSON.stringify(params),
            ASSOC: "true"
        },
        success: renderChartData,
        error: logError
    });
}

function renderChartData(data) {
    var options = {
        title: $("[name='Query'] option:selected").text(),
        isStacked: true
    };

    var type = $("[name='ChartAs'] option:selected").val();

    var cdata = getColData(data);

    userChart(cdata, type, options);
}

function getColData(data) {
    var dataTable = new google.visualization.DataTable();

    var firstRow = [];

    for (var k in data[0]) {
        var keyType = objectArrayKeyType(k, data);
        dataTable.addColumn(keyType, k);
        firstRow.push(k);
    }

    for (var i = 0, l = data.length; i < l; ++i) {
        var thisRow = [];
        for (var k in data[i]) {
            var keyType = objectArrayKeyType(k, data);
            switch (keyType) {
                case "number":
                    data[i][k] = Number(data[i][k]);
                    break;
                case "string":
                    break
            }
            thisRow.push(data[i][k]);
        }
        dataTable.addRow(thisRow);
    }

    userDataToCSV(dataTable, firstRow);

    return dataTable;
}

function objectArrayKeyType(key, objs) {
    return getArrType(objectArrayKeyValues(key, objs));
}

function objectArrayKeyValues(key, objs) {
    var results = [];
    for (var i = 0, l = objs.length; i < l; ++i) {
        results.push(objs[i][key]);
    }
    return results;
}

function getArrType(arr) {
    var numArr = arr.filter(function (n) {
        return !isNaN(n);
    });
    var dateArr = arr.filter(function (n) {
        var d = new Date(n);
        return !isNaN(d.valueOf());
    });
    if (numArr.length === arr.length) {
        return "number";
    }
    if (dateArr.length === arr.length) {
        return "date";
    }
    return "string";
};

function userDataToCSV(dataTable, firstRow) {
    var csv = "";
    for (var j = 0, k = firstRow.length; j < k; ++j) {
        csv += firstRow[j] + ","
    }
    csv = csv.substr(0, csv.length - 1);
    csv += "\r\n";
    csv += google.visualization.dataTableToCsv(dataTable);

    getByName("Data").val(csv);
}

function printableData(chart) {
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById('print').innerHTML = '<a href="' + chart.getImageURI() + '">Printable Chart</a>';
    });
}

function userChart(dataTable, type, options) {
    switch (type) {
        case "bar":
            var vis = new google.visualization.ColumnChart(document.getElementById("chartDiv"));
            break;
        case "table":
            var vis = new google.visualization.Table(document.getElementById("chartDiv"));
            break;
    }
    printableData(vis);
    vis.draw(dataTable, options);
}

/*
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
*/