function FormController($scope, $http) {
    window.$scope = $scope;
    window.$http = $http;

    $scope.initialize = function (name, connection, tables, tableRecordCount, defaultValues) {
        $scope.form = new Form(name, connection, tables, tableRecordCount, defaultValues);
    };
}

function Form(name, connection, tables, tableRecordCount, defaultValues) {
    this.emailBody = "";
    this.mainTable = "";

    $scope.tables = {};
    $scope.fields = {};

    this.tables = $scope.tables;

    this.hasRecord = false;
    this.viewing = false;

    this.INVALID_CONNECTION = -1;
    this.EXECUTION_FAILED = -2;
    this.NO_ROWS = -3;

    this.connection = connection;
    this.name = name;

    this.createInitialTablesAndRecords(tables, tableRecordCount || {}, connection);
    this.createInitialFields(tables, tableRecordCount || {}, defaultValues);

    // if there is only one table, add the fields to the scope for convenience
    if (tables.length == 1) {
        $scope.fields = this.getMainTable().records[0].fields;
    }
}

Form.prototype.createInitialTablesAndRecords = function (tables, tableRecordCount, connection) {
    var form = this;
    tables.forEach(function (tbl, i) {
        form.tables[tbl] = new Table(form, tbl, connection, (i == 0), Number(tableRecordCount[tbl] || 1))
        for (var j = 0, l = Number(tableRecordCount[tbl] || 1) ; j < l; ++j) {
            form.tables[tbl].addRecord();
        }
    });
};

Form.prototype.createInitialFields = function (tables, tableRecordCount, defaultValues) {
    var form = this;
    var tblStr = "'" + tables.join("','") + "'";
    $http.get("/scripts/php/Query.php?Query=GetTablesData&Named=true&ASSOC=true&Params=" + encodeURIComponent(JSON.stringify([tblStr])))
    .success(function (resp) {
        if (!(resp instanceof Array)) {
            alert("Something went wrong!");
            console.log(resp);
            return;
        }
        resp.forEach(function (f) {
            for (var i = 0, l = Number(tableRecordCount[f.TABLE_NAME] || 1) ; i < l; ++i) {
                var table = form.tables[f.TABLE_NAME];
                var rec = table.records[i];
                var isPK = (f.IsPK == "1");
                var isFK = (f.IsFK == "1");
                var nullable = (f.IS_NULLABLE == "1");
                var getBindingType = function (refTable, tableList) {
                    if (!refTable) return "none";
                    if (tableList.indexOf(refTable) > -1) return "values";
                    return "options";
                };
                var bindingType = getBindingType(f.REF_TABLE, tables);
                
                var isID = (f.IS_IDENTITY == "1");

                form.tables[f.TABLE_NAME].records[i].fields[f.COLUMN_NAME] =
                    new Field(form, table, rec, f.COLUMN_NAME, f.DATA_TYPE, f.COLUMN_DEFAULT,
                        isPK, isFK, f.REF_TABLE, f.REF_COLUMN, nullable, bindingType, isID,
                        f.REF_REF_TABLE, f.REF_REF_COLUMN, f.REF_TEXT_COLUMN, f.REF_FILTER_COLUMN,
                        f.BOUND_TABLE, f.BOUND_COLUMN);
            }
        });
        form.getAllFKData();
        form.setDefaultValues(defaultValues);
        form.getMainTable().watchIDForOpen();
    });
};

Form.prototype.setDefaultValues = function (defaultValues) {
    var form = this;
    if (!defaultValues) { return; }
    Object.keys(defaultValues).forEach(function (t) {
        Object.keys(defaultValues[t]).forEach(function (r) {
            Object.keys(defaultValues[t][r]).forEach(function (f) {
                var field = form.tables[t].records[r].fields[f];
                field.defaultValue = defaultValues[t][r][f];
                field.setValue(defaultValues[t][r][f]);
            });
        })
    });
};

Form.prototype.getMainTable = function () {
    return this.tables[Object.keys(this.tables)[0]];
};

Form.prototype.getAllFKData = function () {
    var f = this;
    Object.keys(this.tables).forEach(function (tk) {
        f.tables[tk].getAllFKData();
    });
};

Form.prototype.clearAll = function () {
    var f = this;
    Object.keys(this.tables).forEach(function (tk) {
        f.tables[tk].clearRecords();
    });
    this.hasRecord = false;
};

Form.prototype.reset = function () {
    location.reload();
};

Form.prototype.open = function () {
    var f = this;
    Object.keys(this.tables).forEach(function (tk) {
        f.tables[tk].open();
    });
};

Form.prototype.update = function () {
    this.executeQueries();
};

Form.prototype.submit = function () {
    this.executeQueries();
};

Form.prototype.isValid = function () {
    return [].slice.call(document.querySelectorAll("select, input, textarea"))
        .reduce(function (p, c) {
            return p
                && (
                    ([].indexOf.call(document.querySelectorAll(":invalid"), c) == -1)
                    || ([].indexOf.call(document.querySelectorAll("[type='hidden']"), c) > -1)
                );
        }, true);
};

Form.prototype.alterHTMLForEmail = function () {
    this.viewing = true;
    $scope.$apply();

    var allCSS = [].slice.call(document.styleSheets).reduce(function (prev, styleSheet) {
        if (styleSheet.cssRules) {
            return prev +
                [].slice.call(styleSheet.cssRules).reduce(function (prev, cssRule) {
                    return prev + cssRule.cssText;
                }, "");
        } else {
            return prev;
        }
    }, "");

    var currentHTML = "<html>\r\n\t<head>\r\n\t\t<style>\r\n";
    //add style rules
    currentHTML += allCSS;
    currentHTML += "\r\n button { display: none; }\r\n";
    currentHTML += "\t\t</style>\r\n\t</head>\r\n\t<body>\r\n";
    currentHTML += document.body.innerHTML;
    currentHTML += "\t</body>\r\n</html>";

    return currentHTML;
};

Form.prototype.makeQueryObjects = function () {
    var form = this;
    var queries = Object.keys(form.tables).map(function (tk) {
        var t = form.tables[tk];
        return t.makeQueryObjects();
    }).reduce(function (prev, curr) { return prev.concat(curr); });

    return queries;
};

Form.prototype.executeQueries = function () {
    if (!this.isValid()) {
        alert("Some fields are still empty or invalid, these should be highlighted in red.\r\nFill these out to submit the form.");
        return;
    }
    var form = this;
    var queries = this.makeQueryObjects();
    var responses = [];
    var success = true;
    for (var i = 0, l = queries.length; i < l; ++i) {
        var qry = queries[i];
        var httpPromise = $http({
            method: "POST",
            url: "/scripts/php/Query.php",
            data: "Query=" + encodeURIComponent(qry.query) + "&Connection=" + form.connection + "&Params=" + encodeURIComponent(JSON.stringify(qry.values)),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (resp) {
            if (resp[form.NO_ROWS] !== undefined) {
                success = success && true;
            } else {
                responses.push(resp[Object.keys(resp)[0]]);
                success = false; // success && false, which is always false
            }
        });
    }

    httpPromise.then(function () {
        if (success) form.addEmail();
        document.body.innerHTML = success ? "<h1>All changes were successful.</h1>" : "<h1>Not all changes were successful.</h1><h2><br />Messages:<br />" + responses.join("<br />") + "</h2>";
    });
};

Form.prototype.addEmail = function () {
    var form = this;
    var mt = this.getMainTable();
    var params = {
        Subj: this.hasRecord ? this.name + " number " + mt.getID() + " updated." : "New " + this.name + " submitted.",
        Body: this.alterHTMLForEmail(),
        TableName: mt.name,
        New: this.hasRecord ? 0 : 1
    };
    if (this.hasRecord) {
        params["FormID"] = this.getMainTable().getID();
    }
    var query = this.hasRecord ?
        "INSERT INTO Emails ([Subj], [Body], [FormID], [TableName], [New]) VALUES (:Subj, :Body, :FormID, :TableName, :New)"
        : "INSERT INTO Emails ([Subj], [Body], [FormID], [TableName], [New]) VALUES (:Subj, :Body, (SELECT MAX([" + mt.getPK() + "]) FROM [" + mt.name + "]), :TableName, :New)";

    // send query to insert email into the emails table
    $http({
        method: "POST",
        url: "/scripts/php/Query.php",
        data: "Query=" + encodeURIComponent(query) + "&Connection="+this.connection+"&Params=" + encodeURIComponent(JSON.stringify(params)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function (resp) {
        if (!(resp instanceof Array)) {
            if (resp[form.NO_ROWS]) {
                document.body.innerHTML += "<h2><br />Email sent.</h2>";
                return;
            }
            document.body.innerHTML += "<h2><br />Email not sent.</h2>";
            return;
        } 
        document.body.innerHTML += "<h2>" + resp + "</h2>";
    });
};

app.controller("Form", FormController);