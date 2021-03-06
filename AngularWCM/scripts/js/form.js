﻿function FormController($scope, $http, $q) {
    // put in global scope so other 'classes'
    // can use $scope and $http without being
    // connected neccessarily to Angular
    // ($http replaceable with XMLHttpRequest
    // object, $scope gets replaced with model
    // object)
    // $q replaced with Promises?
    window.$scope = $scope;
    window.$http = $http;
    window.$q = $q;

    $scope.initialize = function (name, connection, tables, tableRecordCount, defaultValues) {
        $scope.form = new Form(name, connection, tables, tableRecordCount, defaultValues);
    };
}

function Form(name, connection, tables, tableRecordCount, defaultValues) {
    this.devMode = false;

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

    this.connection = this.devMode ? "WCMBackup" : connection;
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
    for(var t in defaultValues){
        for (var r in defaultValues[t]) {
            for (var f in defaultValues[t][r]) {
                var field = form.tables[t].records[r].fields[f];
                field.defaultValue = defaultValues[t][r][f];
                field.setValue(defaultValues[t][r][f]);
            }
        }
    }
};

Form.prototype.getMainTable = function () {
    return this.tables[Object.keys(this.tables)[0]];
};

Form.prototype.getAllFKData = function () {
    for(var tk in this.tables){
        this.tables[tk].getAllFKData();
    }
};

Form.prototype.clearAll = function () {
    for(var tk in this.tables){
        this.tables[tk].clearRecords();
    }
    this.hasRecord = false;
};

Form.prototype.reset = function () {
    location.reload();
};

Form.prototype.open = function () {
    for(var tk in this.tables){
        this.tables[tk].open();
    }
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

    // get all css, also add css to hide buttons
    var allCSS = [].slice.call(document.styleSheets).reduce(function (prev, styleSheet) {
        if (styleSheet.cssRules) {
            return prev +
                [].slice.call(styleSheet.cssRules).reduce(function (prev, cssRule) {
                    return prev + cssRule.cssText;
                }, "");
        } else {
            return prev;
        }
    }, "") + " button, .ng-hide { display: none; } ";

    //console.log(allCSS);

    var currentHTML = "<html><head><style>";
    //add style rules
    currentHTML += allCSS;
    currentHTML += "</style></head><body>";
    currentHTML += document.body.innerHTML;
    currentHTML += "</body></html>";

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

    var promises = [];

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

        promises.push(httpPromise);
    }



    // returns this promise in case you want to do something afterwards
    return $q.all(promises).then(function () {
        if (success) {
            form.addEmail().then(function(){
                document.body.innerHTML += "<h1>All changes were successful.</h1>";
            });
        } else {
            document.body.innerHTML += "<h1>Not all changes were successful.</h1><h2><br />Messages:<br />" + responses.join("<br />") + "</h2>";
        }
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
    // return this in case you want 'then' it (it's a promise)
    return $http({
        method: "POST",
        url: "/scripts/php/Query.php",
        data: "Query=" + encodeURIComponent(query) + "&Connection="+this.connection+"&Params=" + encodeURIComponent(JSON.stringify(params)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function (resp) {
        if (!(resp instanceof Array)) {
            if (resp[form.NO_ROWS]) {
                document.body.innerHTML = "<h2><br />Email sent.</h2>";
                return;
            }
            document.body.innerHTML = "<h2><br />Email not sent.</h2>";
            return;
        } 
        document.body.innerHTML = "<h2>" + resp + "</h2>";
    });
};

app.controller("Form", FormController);