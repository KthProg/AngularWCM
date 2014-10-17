function getByName(name) {
    return $("[name='" + name + "']");
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

// return array of parameters for this query
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
    pDiv.html(""); //clear parameters
    if (data.parameter != undefined) {
        if (data.parameter.length === undefined) {
            // if there is only one parameter
            var name = data.parameter["@attributes"].name;
            var type = data.parameter.type;
            pDiv.append("<label>" + name + "</label><input type='" + type + "' name='Params[]' placeholder='" + name + "' />");
        } else {
            // if there is more than one parameter
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
    // ensures that all parameters are filled
    // and all drop downs have a value
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

    // execute query with params
    // if successful call renderChartData
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
    // options for google vis
    var options = {
        title: $("[name='Query'] option:selected").text(),
        isStacked: true,
        curveType: 'function'
    };

    var type = $("[name='ChartAs'] option:selected").val();

    var firstCol = $("[name='Query'] option:selected").attr("data-firstcol") || "";

    // get the column info as a datatable (google vis)
    var cdata = getColData(data, firstCol);

    // chart that data based on the chart type and above options
    userChart(cdata, type, options);
}

function getColData(data, firstCol) {
    var dataTable = new google.visualization.DataTable();

    // TODO: keep column order
    // only move first col
    // reorder columns so that the x axis
    // labels are first
    var keys = Object.keys(data[0]);
    keys = keys.sort(
        function (a) {
            return a === firstCol ? -1 : 1;
        }
        );
    //keys.reverse();

    // adds type ifnormation for each column
    // also decides whether or not ALL columns
    // are numeric, which is important later
    // for determining the order of the x axis labels
    // they are sorted by their totals so that the stacked
    // column charts look correct
    var keyMetaData = {};
    var numericKeys = true;
    for (var i = 0, l = keys.length; i < l; ++i) {
        var k = keys[i];
        keyMetaData[k] = {};
        keyMetaData[k]["type"] = objectArrayKeyType(k, data);
        if (i === 0) continue;
        numericKeys = numericKeys && (keyMetaData[k]["type"] === "number");
    }

    // if the first column is of type string and all the other columns
    // are numeric, the sort the data based on the total of all the other columns
    // do this sort Asc or Desc as specified by the user
    if (keyMetaData[keys[0]]["type"] === "string" && numericKeys) {
        data = data.sort(function (a, b) {
            // i = 1, skip first key
            var totals = [0, 0];
            for (var i = 1, l = keys.length; i < l; ++i) {
                var k = keys[i];
                totals[0] += Number(a[k]);
                totals[1] += Number(b[k]);
            }

            if ($("[name='sortOrder'] option:selected").val() == "Asc") {
                return totals[0] - totals[1];
            } else {
                return -(totals[0] - totals[1]);
            }
        });
    }

    // add the first row of info to the data table (column headers)
    // and add to a firstRow array (used later to create CSV file)
    var firstRow = [];
    for (var i = 0, l = keys.length; i < l; ++i) {
        var k = keys[i];
        dataTable.addColumn(keyMetaData[k]["type"], k);
        firstRow.push(k);
    }

    // add all of the other rows
    // convert values to their detected types
    for (var i = 0, m = data.length; i < m; ++i) {
        var thisRow = [];
        for (var j = 0, l = keys.length; j < l; ++j) {
            var k = keys[j];
            data[i][k] = convertType(data[i][k], keyMetaData[k]["type"]);
            thisRow.push(data[i][k]);
        }
        dataTable.addRow(thisRow);
    }

    // create CSV text from data, set as value of hidden element
    // user click downloads the text from a URI
    userDataToCSV(dataTable, firstRow);

    return dataTable;
}

function convertType(val, typeStr) {
    // convert value based on three types
    // used by google vis
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

// filters values which are not of a certain type
// then compares the size of the filtered array
// to the size of the original array. if any values
// were removed, then the array is not entirely 
// of that type, default is string
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
    //datatabletocsv does not include the column headers
    // 
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