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
                //console.log(data);
                renderParamInputs(data);
            }
        },
        error: logError
    });
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
        url: "../scripts/php/Query.php",
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
        title: $("[name='Query'] option:selected").text()
    };

    var type = $("[name='ChartAs'] option:selected").val();

    switch (Object.keys(data[0]).length) {
        case 1:
            var cdata = getOneColData(data);
            break;
        case 2:
            var cdata = getTwoColData(data);
            options.isStacked = false;
            break;
        case 3:
            var cdata = getThreeColData(data);
            options.isStacked = true;
            break;
    }

    userChart(cdata, type, options);
}

function getOneColData(data) {
    var objKeys = Object.keys(data[0]);
    var key = objKeys[0];   // key containing values for the only column

    var dataTable = new google.visualization.DataTable();

    var objData = getKeyValuesAndKeyTypeData(data);
    /*
data =  {
            key1 : {
                type: getArrType(values),
                values: values
            },
            key2 : {
                type: getArrType(values),
                values: values
            },
            etc.
        }
    */

    dataTable.addColumn(objData[key].type, key);

    for (var i = 0, j = objData[key].values.length; i < j; ++i) {
        dataTable.addRow([objData[key].values[i]]);
    }

    return dataTable;
}

function getTwoColData(data) {
    data.sort(sortResults);
    var objKeys = Object.keys(data[0]);

    var fieldInfo = {};
    var dataTable = new google.visualization.DataTable();

    var mainKey = objKeys[0];   // key containing values for the first column
    var valueKey = objKeys[1];  // key containing values for the datatable

    var firstRow = [mainKey, valueKey];

    var objData = getKeyValuesAndKeyTypeData(data);
    /*
data =  {
            key1 : {
                type: getArrType(values),
                values: values
            },
            key2 : {
                type: getArrType(values),
                values: values
            },
            etc.
        }
    */
    dataTable.addColumn(objData[mainKey].type, mainKey);
    dataTable.addColumn(objData[valueKey].type, valueKey);

    for (var i = 0, j = data.length; i < j; ++i) {
        var thisVal = data[i][valueKey];
        switch (keyTypes.value) {
            case "string":
                thisVal += "";
                break;
            case "number":
                thisVal = Number(thisVal);
                break;
        }
        dataTable.addRow([data[i][mainKey], thisVal]);
    }

    userDataToCSV(dataTable, firstRow);

    return dataTable;
}

function getThreeColData(data) {

    var objKeys = Object.keys(data[0]);

    var mainKey = objKeys[0];   // key containing values for the first column
    var secondKey = objKeys[1]; // key containing values for the other columns
    var valueKey = objKeys[2];  // key containing values for the datatable

    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn("string", mainKey);

    // returns only the unique values identified in the list of objects by the second key
    // i.e. the column names other than the first column name (mainKey)
    var secondColVals = objectArrayKeyValues(secondKey, data).filter(onlyUnique);
    for (var i = 0, j = secondColVals.length; i < j; ++i) {
        dataTable.addColumn("number", cols[i]);
    }

    // returns only the unique values idenitified in the list of objects by the first key
    // i.e. the values for the first column
    var firstColVals = objectArrayKeyValues(mainKey, data).filter(onlyUnique);

    var totals = [];
    for (var i = 0, j = firstColVals.length; i < j; ++i) {
        var total = 0;
        for (var k = 0, l = data.length; k < l; ++k) {
            if (data[k][mainKey] == firstColVals[i]) {
                var thisVal = Number(data[k][valueKey]);
                total += thisVal;
            }
        }
        var totalObj = {
            col: firstColVals[i],
            total : total
        };
        totals.push(totalObj);
    }

    totals.sort(
        function (a, b) {
           return a.total - b.total;
        }
    );

    var sortedFirstColVals = objectArrayKeyValues("col", totals);

    for (var i = 0, j = sortedFirstColVals.length; i < j; ++i) {
        // set value for the first column
        var thisData = [sortedFirstColVals[i]];
        for (var m = 0, n = secondColVals.length; m < n; ++m) {
            for (var k = 0, l = data.length; k < l; ++k) {
                if (data[k][mainKey] == sortedFirstColVals[i] && data[k][secondKey] == secondColVals[m]) {
                    var thisVal = data[k][valueKey] || 0;
                    thisData.push(Number(thisVal));
                }
            }
        }
        dataTable.addRow(thisData);
    }

    userDataToCSV(dataTable, [mainKey].concat(cols));

    return dataTable;
}


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

function barChart(dataTable) {
    var options = {
        title: $("[name='Query'] option:selected").text()
    };
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

    //console.log(dataTable);
    printableData(vis);
    vis.draw(dataTable, options);
}

function sortResults(a, b) {
    var firstKey = Object.keys(a).pop();
    return (a[firstKey] - b[firstKey]);
}

function getKeyValuesAndKeyTypeData(objArr) {
    var keys = Object.keys(objArr[0]);
    var data = {};
    for (var i = 0, l = keys.length; i < l; ++i) {
        var values = objectArrayKeyValues(keys[i], objArr);
        data[keys[i]] = {
            type: getArrType(values),
            values: values
        };
    }
    return data;
}

function objectArrayKeyType(key, objs) {
    return getArrType(objectArrayKeyType(key, objs));
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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function logError(xhr, status, error) {
    console.log(status + " : " + error);
    console.log(this);
}