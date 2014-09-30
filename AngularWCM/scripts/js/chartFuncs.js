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
        success: renderParamInputs,
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
        if (data.parameter.length === undefined) {
            var name = data.parameter["@attributes"].name;
            var type = data.parameter.type;
            pDiv.append("<label>" + name + "</label><input type='" + type + "' name='Params[]' placeholder='" + name + "' />");
        } else {
            for (var i = 0, l = data.parameter.length; i < l; ++i) {
                var name = data.parameter[i]["@attributes"].name;
                var type = data.parameter[i].type;
                pDiv.append("<label>" + name + "</label><input type='" + type + "' name='Params[]' placeholder='" + name + "' />");
            }
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
    console.log(data);
    var options = {
        title: $("[name='Query'] option:selected").text(),
        isStacked: true,
        curveType: 'function'
    };

    var type = $("[name='ChartAs'] option:selected").val();

    var firstCol = $("[name='Query'] option:selected").attr("data-firstcol") || "";

    var cdata = getColData(data, firstCol);

    userChart(cdata, type, options);
}

function getColData(data, firstCol) {
    var dataTable = new google.visualization.DataTable();

    var keys = Object.keys(data[0]);
    /*keys = keys.sort(
        function (a) {
            return a === firstCol ? -1 : 1;
        }
        );*/
    //keys.reverse();

    var keyMetaData = {};
    var numericKeys = true;
    for (var i = 0, l = keys.length; i < l; ++i) {
        var k = keys[i];
        keyMetaData[k] = {};
        keyMetaData[k]["type"] = objectArrayKeyType(k, data);
        if (i === 0) continue;
        numericKeys = numericKeys && (keyMetaData[k]["type"] === "number");
    }

    if (keyMetaData[keys[0]]["type"] === "string" && numericKeys) {
        data = data.sort(function (a, b) {
            // i = 1, skip first key
            var totals = [0, 0];
            for (var i = 1, l = keys.length; i < l; ++i) {
                var k = keys[i];
                totals[0] += Number(a[k]);
                totals[1] += Number(b[k]);
            }
            return totals[0] - totals[1];
        });
    }

    var firstRow = [];
    for (var i = 0, l = keys.length; i < l; ++i) {
        var k = keys[i];
        dataTable.addColumn(keyMetaData[k]["type"], k);
        firstRow.push(k);
    }

    for (var i = 0, m = data.length; i < m; ++i) {
        var thisRow = [];
        for (var j = 0, l = keys.length; j < l; ++j) {
            var k = keys[j];
            data[i][k] = convertType(data[i][k], keyMetaData[k]["type"]);
            thisRow.push(data[i][k]);
        }
        dataTable.addRow(thisRow);
    }

    userDataToCSV(dataTable, firstRow);

    return dataTable;
}

function convertType(val, typeStr) {
    switch (typeStr) {
        case "number":
            return Number(val);
            break;
        case "datetime":
            return new Date(val);
            break;
        case "string":
            return String(val)
            break
    }
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
        return "datetime";
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

function clearPrintableData(){
    document.getElementById('print').innerHTML = '<a href="">Printable Chart</a>';
}

function userChart(dataTable, type, options) {
    switch (type) {
        case "bar":
            var vis = new google.visualization.ColumnChart(document.getElementById("chartDiv"));
            printableData(vis);
            break;
        case "table":
            var vis = new google.visualization.Table(document.getElementById("chartDiv"));
            break;
        case "line":
            var vis = new google.visualization.LineChart(document.getElementById("chartDiv"));
            printableData(vis);
            break;
        case "pie":
            var vis = new google.visualization.PieChart(document.getElementById("chartDiv"));
            printableData(vis);
            break;
    }
    vis.draw(dataTable, options);
}

/*
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
*/