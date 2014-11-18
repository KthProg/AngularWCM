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
    var pDiv = $("#params");
    pDiv.html(""); //clear parameters
    if (data.parameter != undefined) {
        if (data.parameter.length === undefined) {
            var params = [data.parameter];
        } else {
            var params = data.parameter;
        }
        // if there is more than one parameter
        for (var i = 0, l = params.length; i < l; ++i) {
            var name = params[i]["@attributes"].name;
            var type = params[i].type || "text";
            var options = params[i].options ? params[i].options.option || "" : "";
            var query = params[i].query || "";

            addParameterInput(name, type, options, query);
        }
    }
}

function addParameterInput(name, type, options, query) {
    var pDiv = $("#params");
    if (type == "select") {
        if(query){
            var optionsHTML = objectToOptionsHTML(sendNoParamQuery(query));
        }else{
            var optionsHTML = arrayToOptionsHTML(options);
        }
        pDiv.append("<label>" + name + "</label><select name='Params[]'><option value=''>"+name+"</option>"+optionsHTML+"</select>");
    } else {
        pDiv.append("<label>" + name + "</label><input type='" + type + "' name='Params[]' placeholder='" + name + "' />");
    }
}

function sendNoParamQuery(query) {
    var queryResult;
    $.ajax({
        async: false,
        data: {
            Query: query,
            Params: "[]"
        },
        dataType: "json",
        success: function (data) {
            queryResult = data;
        },
        url : "/scripts/php/Query.php"
    });
    return queryResult;
}

function arrayToOptionsHTML(arr) {
    return arr.reduce(function (prev, curr) {
        return prev + "<option value='" + curr + "'>" + curr + "</option>";
    }, "");
}

function objectToOptionsHTML(obj) {
    var resultHTML = "";
    for (key in obj) {
        resultHTML += "<option value='" + key + "'>" + obj[key] + "</option>";
    }
    return resultHTML;
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
    /*var params = paramsToArray();
    var query = $("[name='Query']").val();
    var type = $("[name='ChartAs'] option:selected").val();

    var emptyParam = (params.indexOf("") > -1);
    var noQuery = (query == "" || query == undefined);
    var noType = (type == "" || type == undefined);
    if (noQuery || noType || emptyParam) {
        var msg = (noQuery ? "Select a query to run. " : "") + (noType ? "Select a chart type. " : "") + (emptyParam ? "Fill in all parameters." : "");
        alert(msg);
        return false;
    }*/
    return true;
}

function chartData(ch) {
    var params = ch.params.map(function (cur) {
        return cur.value;
    });

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
            Query: ch.query,
            Params: JSON.stringify(params),
            ASSOC: "true"
        },
        success: renderChartData,
        error: logError,
        context: ch
    });

    $("#"+ch.elID).html('<div class="spinner"><div class="circle1 circle"></div><div class="circle2 circle"></div><div class="circle3 circle"></div><div class="circle4 circle"></div><div class="circle5 circle"></div><div class="circle6 circle"></div><div class="circle7 circle"></div><div class="circle8 circle"></div><div class="circle9 circle"></div><div class="circle10 circle"></div><div class="circle11 circle"></div><div class="circle12 circle"></div></div>');
}

function renderChartData(data) {
    if (data.length === 0) {
        $("#"+this.elID).html("<h1>Error: No Data</h1>");
        return;
    }
    console.log(data);
    // options for google vis
    this.options["trendlines"] = getTrendlineObject(Object.keys(data[0]).length);

    // get the column info as a datatable (google vis) cdata.datatable
    // also returns new options cdata["options"]
    var cdata = getColData(data, this);

    this.dataTable = cdata.datatable;

    for (var k in cdata.options) {
        this.options[k] = cdata.options[k];
    }

    // chart that data based on the chart type and above options
    userChart(this);
    console.log(this.options);
}

function getTrendlineObject(seriesCount) {
    if ($("#showTrendCheck:checked").length > 0) {
        var tlObj = {};
        for (var i = 0; i < seriesCount; ++i) {
            tlObj[i] = {};
        }
        console.log(tlObj);
        return tlObj;
    } else {
        return {};
    }
}

function getColData(data, ch) {
    var dataTable = new google.visualization.DataTable();
    var firstCol = ch.firstCol;

    // TODO: keep column order
    // only move first col
    // reorder columns so that the x axis
    // labels are first
    var keys = Object.keys(data[0]);
    keys.splice(keys.indexOf(firstCol), 1);
    keys.unshift(firstCol);

    // adds type information for each column
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

    var minVal = null;
    var maxVal = null;

    // if the first column is of type string and all the other columns
    // are numeric, the sort the data based on the total of all the other columns
    // do this sort Asc or Desc as specified by the user
    if (keyMetaData[keys[0]]["type"] === "string" && numericKeys) {
        data = data.sort(function (a, b) {
            // i = 1, skip first key
            // TODO: calculate max and min here
            // if the difference is very large > (1:10), use a log scale.
            var totals = [0, 0];
            totals[0] = getRowTotal(a); // previous item total
            totals[1] = getRowTotal(b); // this item total

            minVal = totals[0] < minVal || minVal == null ? totals[0] : minVal;
            minVal = totals[1] < minVal || minVal == null ? totals[1] : minVal;
            maxVal = totals[0] > maxVal || maxVal == null ? totals[0] : maxVal;
            maxVal = totals[1] > maxVal || maxVal == null ? totals[1] : maxVal;

            if (ch.sortOrder) {
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

    var ops = {
        vAxis: {
            logScale: false //Boolean((maxVal/minVal) > 30)
        }
    };

    // create CSV text from data, set as value of hidden element
    // user click downloads the text from a URI
    ch.csv = userDataToCSV(dataTable, firstRow);

    return { datatable: dataTable, options : ops };
}

function getRowTotal(row) {
    var keys = Object.keys(row);
    var total = 0.0;
    for (var i = 1, l = keys.length; i < l; ++i) {
        total += Number(row[keys[i]]);
    }
    console.log(row[keys[0]], total);
    return total;
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

    return csv;
}

function printableData(chart, vis) {
    google.visualization.events.addListener(vis, 'ready', function () {
        chart.imgURI = vis.getImageURI();
        console.log(chart);
    });
}

function userChart(ch) {
    $("#" + ch.elID).html("");
    var chartEl = $("#" + ch.elID)[0];
    switch (ch.type) {
        case "bar":
            var vis = new google.visualization.ColumnChart(chartEl);
            printableData(ch, vis);
            break;
        case "table":
            var vis = new google.visualization.Table(chartEl);
            break;
        case "line":
            var vis = new google.visualization.LineChart(chartEl);
            printableData(ch, vis);
            break;
        case "pie":
            var vis = new google.visualization.PieChart(chartEl);
            printableData(ch, vis);
            break;
    }
    vis.draw(ch.dataTable, ch.options);
}