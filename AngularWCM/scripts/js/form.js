function Form($scope, $http) {
    $scope.form = this;
    window.form = this;

    this.scope = $scope;
    this.http = $http;

    this.name = "";
    this.emailBody = "";
    this.mainTable = "";

    this.tables = $scope.tables = {};
    $scope.fields = {};

    this.hasRecord = false;
    this.viewing = false;

    this.INVALID_CONNECTION = -1;
    this.EXECUTION_FAILED = -2;
    this.NO_ROWS = -3;
}

Form.prototype.initialize = function (name, connection, tables, tableRecordCount, defaultValues) {
    this.connection = connection;
    this.name = name;

    //this.mainTable = tables[0];

    this.createInitialTablesAndRecords(tables, tableRecordCount || {}, connection);
    this.createInitialFields(tables, tableRecordCount || {}, defaultValues);

    // if there is only one table, add the fields to the scope for convenience
    // since there won't be any name conflicts anyways
    if (tables.length == 1) {
        this.scope.fields = this.getMainTable().records[0].fields;
    }
};

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
    form.http.get("/scripts/php/Form.php?Query=GetTablesData&Named=true&ASSOC=true&Params=" + encodeURIComponent(JSON.stringify([tblStr])))
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
                var nullable = (f.IS_NULLABLE == "YES");
                var bindingType;
                // it is bound to the value of another field
                // in the form if its reference table (fk)
                // is in this form. if its reference table
                // is not in this form, then its options
                // are retrieved via info given by its
                // reference table and column
                // if it has no reference table, then
                // it is not bound to any other field
                if (f.REF_TABLE) {
                    if (tables.indexOf(f.REF_TABLE) > -1) {
                        bindingType = "values";
                    } else {
                        bindingType = "options";
                    }
                } else {
                    bindingType = "none";
                }
                var isID = (f.IS_IDENTITY == "1");
                form.tables[f.TABLE_NAME].records[i].fields[f.COLUMN_NAME] = new Field(form, table, rec,
                                                                                f.COLUMN_NAME, f.DATA_TYPE, f.COLUMN_DEFAULT,
                                                                                isPK, isFK, f.REF_TABLE, f.REF_COLUMN,
                                                                                nullable, bindingType, isID);
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
    //this.scope.$apply();

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
    var success = true;
    var responses = [];
    queries.forEach(function (qry) {
        console.log(qry);
        form.http({
            method: "POST",
            url: "/scripts/php/Form.php",
            data: "Query=" + qry.query + "&Connection=Safety&Params=" + encodeURIComponent(JSON.stringify(qry.values)),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (resp) {
            if ((resp instanceof Array) && ("-3" in resp)) {
                success = success && true;
            } else {
                responses.push(resp[Object.keys(resp)[0]]);
                success = false;
            }
        });
    });
    if (success) {
        this.addEmail();
        document.body.innerHTML = "All changes were successful.";
    } else {
        document.body.innerHTML = "Not all changes were successful.<br />Messages:<br />" + responses.join("<br />");
    }
};

Form.prototype.addEmail = function () {
    var mt = this.getMainTable();
    var params = {
        Subj: this.hasRecord ? this.name + " number " + mt.getID() + " updated." : "New " + this.name + " submitted.",
        Body: this.alterHTMLForEmail(),
        //FormID: this.getMainTable().getID(),
        TableName: mt.name,
        New: this.hasRecord ? 0 : 1
    };
    if (this.hasRecord) {
        var query = "INSERT INTO Emails ([Subj], [Body], [FormID], [TableName], [New]) VALUES (:Subj, :Body, :FormID, :TableName, :New)";
        params["FormID"] = this.getMainTable().getID();
    } else {
        var query = "INSERT INTO Emails ([Subj], [Body], [FormID], [TableName], [New]) VALUES (:Subj, :Body, (SELECT MAX([" + mt.getPK() + "]) FROM [" + mt.name + "]), :TableName, :New)";
    }

    // send query to insert email into the emails table
    this.http({
        method: "POST",
        url: "/scripts/php/Form.php",
        data: "Query=" + query + "&Connection=Safety&Params=" + encodeURIComponent(JSON.stringify(params)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function (resp) {
        if (!(resp instanceof Array)) {
            if ("-3" in resp) {
                document.body.innerHTML += "<br />Email sent.";
            } else {
                document.body.innerHTML += "<br />Email not sent.";
            }
        } else {
            document.body.innerHTML += resp;
        }
    });
};

app.controller("Form", Form);