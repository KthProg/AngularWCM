function Chart(query, params, type, sortOrder, firstCol, options, elID, showTrendline) {
    // non-empty
    this.query = query;
    this.sortOrder = sortOrder;
    this.firstCol = firstCol
    this.options = options;
    this.params = params;
    this.type = type;
    this.elID = elID;
    this.showTrendline = showTrendline;
    this.status = "new";
    // default empty values
    this.showParams = false;
    this.showTypes = false;
    this.minimized = false;
    this.maximized = false;
    this.dataTable = null;
    this.data = null;
    this.vis = null;
    this.imgURI = null;
    this.csv = "";
};

Chart.prototype.chartData = function () {
    var params = this.params.map(function (prm) {
        return prm.value;
    });

    console.log(params);

    var chart = this;
    $http({
        method: "POST",
        url: "/scripts/php/Query.php",
        data: "Query="+this.query+"&Named=true&ASSOC=true&Params="+encodeURIComponent(JSON.stringify(params)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function (resp) {
        console.log(resp);
        chart.renderChartData(resp);
    });

    this.status = "loading";
};

Chart.prototype.renderChartData = function (data) {
    this.data = data;
    if (this.data.length === 0) {
        this.status = "No Data";
        return;
    }
    // options for google vis
    this.options["trendlines"] = this.getTrendlineObject(Object.keys(this.data[0]).length);

    // get the column info as a datatable (google vis) 'cdata.datatable'
    // also returns new options 'cdata.options'
    this.getColData();

    // chart that data based on the chart type and above options
    this.userChart();
};

Chart.prototype.getTrendlineObject = function (seriesCount) {
    if (this.showTrendline) {
        var tlObj = {};
        for (var i = 0; i < seriesCount; ++i) {
            tlObj[i] = {};
        }
        return tlObj;
    } else {
        return {};
    }
};


Chart.prototype.getColData = function () {
    this.dataTable = new google.visualization.DataTable();
    // TODO: keep column order
    // only move first col
    // reorder columns so that the x axis
    // labels are first
    var keys = Object.keys(this.data[0]);
    keys.splice(keys.indexOf(this.firstCol), 1);
    keys.unshift(this.firstCol);

    var objectArrayKeyValues = function (key, objs) {
        return objs.map(function (curr) {
            return curr[key];
        });
    };

    // filters values which are not of a certain type
    // then compares the size of the filtered array
    // to the size of the original array. if any values
    // were removed, then the array is not entirely 
    // of that type, default is string
    var getArrType = function (arr) {
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

    var objectArrayKeyType = function (key, objs) {
        return getArrType(objectArrayKeyValues(key, objs));
    };

    // adds type information for each column
    // also decides whether or not ALL columns
    // are numeric, which is important later
    // for determining the order of the x axis labels
    // they are sorted by their totals so that the stacked
    // column charts look correct
    var keyMetaData = {};
    for (var i = 0, l = keys.length; i < l; ++i) {
        var k = keys[i];
        keyMetaData[k] = {
            type: objectArrayKeyType(k, this.data)
        };
    }

    var numericKeys = Object.keys(keyMetaData).reduce(function (prev, key, i) {
        // don't include the first column (key) in calculating
        // whether or not this coluumns values are numeric
        if (i === 0) {
            return prev;
        } else {
            return prev && (keyMetaData[key].type === "number");
        }
    }, true);

    // if the first column is of type string and all the other columns
    // are numeric, the sort the data based on the total of all the other columns
    // do this sort Asc or Desc as specified by the user
    if (keyMetaData[keys[0]].type === "string" && numericKeys) {
        this.sortData();
        var minVal = this.getMin();
        var maxVal = this.getMax();
    }

    var ch = this;
    // add the first row of info to the data table (column headers)
    // and add to a firstRow array (used later to create CSV file)
    this.firstRow = keys.map(function (k) {
        ch.dataTable.addColumn(keyMetaData[k].type, k);
        return k;
    });

    var convertType = function (val, typeStr) {
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
    };

    // add all of the other rows
    // convert values to their detected types
    this.data.forEach(function (el) {
        var thisRow = keys.map(function (k) {
            el[k] = convertType(el[k], keyMetaData[k].type);
            return el[k];
        });
        ch.dataTable.addRow(thisRow);
    });

    this.options["vAxis"] = {};
    this.options.vAxis["logScale"] = false //Boolean((maxVal/minVal) > 30)

    // create CSV text from data, set as value of hidden element
    // user click downloads the text from a URI
    this.csv = this.toCSV();
};

Chart.prototype.getRowTotal = function (row) {
    var total = Object.keys(row).reduce(function (prev, curr, i) {
        if (i === 0) {
            return prev;
        } else {
            return prev + Number(row[curr]);
        }
    }, 0.0)
    return total;
};

Chart.prototype.sortData = function () {
    var ch = this;
    this.data = this.data.sort(function (a, b) {
        var prevTotal = ch.getRowTotal(a); // previous item total
        var currTotal = ch.getRowTotal(b); // this item total

        if (this.sortOrder) {
            return prevTotal - currTotal;
        } else {
            return -(prevTotal - currTotal);
        }
    });
};

Chart.prototype.getMin = function () {
    var ch = this;
    return this.data.reduce(function (prev, curr) {
        var total = ch.getRowTotal(curr); // this item total
        return total < prev || prev == null ? total : prev;
    }, null);
};

Chart.prototype.getMax = function () {
    var ch = this;
    return this.data.reduce(function (prev, curr) {
        var total = ch.getRowTotal(curr); // this item total
        return total > prev || prev == null ? total : prev;
    }, null);
};

Chart.prototype.toCSV = function () {
    // datatabletocsv does not include the column headers
    // so they are added here
    var csv = this.firstRow.reduce(function (prev, k) {
        return prev += k + ","
    }, "");
    csv = csv.substr(0, csv.length - 1);
    csv += "\r\n";
    csv += google.visualization.dataTableToCsv(this.dataTable);

    return csv;
};

Chart.prototype.userChart = function () {
    var chartEl = document.getElementById(this.elID);
    chartEl.innerHTML = "";
    switch (this.type) {
        case "bar":
            this.vis = new google.visualization.ColumnChart(chartEl);
            this.printableData();
            break;
        case "table":
            this.vis = new google.visualization.Table(chartEl);
            break;
        case "line":
            this.vis = new google.visualization.LineChart(chartEl);
            this.printableData();
            break;
        case "pie":
            this.vis = new google.visualization.PieChart(chartEl);
            this.printableData();
            break;
    }
    this.vis.draw(this.dataTable, this.options);
};

Chart.prototype.printableData = function () {
    var ch = this;
    google.visualization.events.addListener(this.vis, 'ready', function () {
        ch.imgURI = ch.vis.getImageURI();
    });
};

// converts the chart to a minimal representation,
// only including the fields necessary to render the chart
Chart.prototype.toSmallObject = function () {
    return {
        query: this.query,
        params: this.params,
        showParams: this.showParams,
        minimized: this.minimized,
        maximized: this.maximized,
        type: this.type,
        firstCol: this.firstCol,
        options: this.options,
        elID: this.elID,
    }
};