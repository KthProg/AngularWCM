function Form($scope, $http) {
    $scope.form = this;
    $scope.tables = {};
    //$scope.records = [];
    $scope.fields = {};

    $scope.isObject = angular.isObject;
    $scope.isArray = angular.isArray;

    this.scope = $scope;
    this.http = $http;
    this.name = "";
    this.view = "";
    this.emailBody = "";
    this.hasRecord = false;
    this.tables = {};
    this.mainTable = "";
}

Form.prototype.initialize = function (name, connection, tables, view, tableRecordCount, defaultValues) {
    tableRecordCount = tableRecordCount || {};

    this.connection = connection;
    this.name = name;
    this.view = view;
    this.mainTable = tables[0];
    var form = this;
    tables.forEach(function (tbl, i) {
        form.scope.tables[tbl] = new Table(form.scope, form.http, tbl, connection, undefined, [], (i == 0), Number(tableRecordCount[tbl] || 1))
        form.scope.tables[tbl].addRecord();
    });

    // if there is only one table, add the fields to the scope for convenience
    // since there won't be any name conflicts anyways
    if (tables.length == 1) {
        form.scope.fields = form.scope.tables[this.mainTable].records[0].fields;
    }

    var tblStr = "'" + tables.join("','") + "'";
    form.http.get("/scripts/php/Query.php?Query=GetTablesData&ASSOC=true&Params=" + encodeURIComponent(JSON.stringify([tblStr])))
    .success(function (resp) {
        resp.forEach(function (f) {
            form.scope.tables[f.TABLE_NAME].records[0].fields[f.COLUMN_NAME] = new Field(form.scope, form.http, f.TABLE_NAME,
                                                        f.COLUMN_NAME, f.DATA_TYPE, f.COLUMN_DEFAULT,
                                                        (f.IsPK == "1"), (f.IsFK == "1"), f.REF_TABLE,
                                                        f.REF_COLUMN, f.IS_NULLABLE == "YES",
                                                        (f.REF_TABLE ? (tblStr.indexOf("'"+f.REF_TABLE+"'") > -1 ? "values" : "options") : "none"),
                                                        (f.IS_IDENTITY == "1"), 0);
        });
        form.getAllFKData();
        form.scope.tables[form.mainTable].getMaxID();
        form.scope.tables[form.mainTable].watchIDForOpen();
        form.addDefaultRecords();
        form.setDefaultValues(defaultValues);
        console.log(form.scope.tables);
    });
    this.setRightClickEventToSearch();
    //this.watchForImageUpload();
};

Form.prototype.setDefaultValues = function (defaultValues) {
    var form = this;
    if (defaultValues) {
        defaultValues.forEach(function (dv) {
            form.scope.tables[dv.table].records[dv.record].fields[dv.field].defaultValue = dv.value;
            form.scope.tables[dv.table].records[dv.record].fields[dv.field].setValue(dv.value);
        });
    }
};

Form.prototype.addDefaultRecords = function () {
    this.applyToAllTables("addDefaultRecords");
};

Form.prototype.setRightClickEventToSearch = function () {
    var form = this;
    $("select, input, textarea").each(function () {
        this.oncontextmenu = function () { return false; };
        $(this).mousedown(function (e) {
            if (e.which != 3) { return true; }
            var field = $(e.target).attr("ng-model").split("'")[1];
            var ops = e.target.options;
            var optionText = "";
            if (ops) {
                for (var i = 0, l = ops.length; i < l; ++i) {
                    optionText += ops[i].text + " : " + ops[i].value + "\n";
                }
            }
            var searchFor = prompt("Enter a search term.\nFor drop-downs, a list of possible search terms are below (use the number, not the text).\n" + (optionText || ""));
            if (searchFor) {
                form.searchForms(field, searchFor);
            } else {
                alert("Empty or invalid search term.");
            }
            return false;
        });
    });
};

Form.prototype.searchForms = function (field, searchFor) {
    this.http.get("/scripts/php/Query.php?Query=SearchForm&Params=" + JSON.stringify([this.scope.tables[this.mainTable].getPK(), this.view, field, searchFor]))
    .success(function (resp) {
        var ids = objectValuesToArray(resp);
        if (ids.length > 0) {
            var userFriendlyIDs = ids.reduce(function (prev, curr) {
                return prev + ", " + curr;
            });
            alert(userFriendlyIDs);
        } else {
            alert("No results.");
        }
    });
};

Form.prototype.getAllFKData = function () {
    this.applyToAllFields("getFKTableInfo", null);
};

Form.prototype.applyToAllFields = function (funcStr) {
    var form = this;
    Object.keys(form.scope.tables).forEach(function (t) {
        form.scope.tables[t].records.forEach(function (rec) {
            Object.keys(rec.fields).forEach(function (f) {
                var field = rec.fields[f];
                field[funcStr]();
            });
        });
    });
};

Form.prototype.clearAll = function () {
    this.applyToAllFields("clearValue");
    this.hasRecord = false;
};

Form.prototype.reset = function () {
    location.reload();
};

Form.prototype.open = function () {
    this.applyToAllTables("open");
};

Form.prototype.applyToAllTables = function (funcStr) {
    var form = this;
    Object.keys(form.scope.tables).forEach(function (t) {
        var tbl = form.scope.tables[t];
        tbl[funcStr]();
    });
};

Form.prototype.setPKs = function () {
    this.applyToAllTables("setPKFromFields");
};

Form.prototype.getFormDataObjectWithTables = function () {
    var formDataObj = this.toDataObj();
    var tblsDataObj = this.getTablesDataObj();
    formDataObj["tables"] = tblsDataObj;
    return formDataObj;
};

Form.prototype.getFormDataStringWithTables = function () {
    return "Form=" + encodeURIComponent(JSON.stringify(this.getFormDataObjectWithTables()));
};

Form.prototype.toDataObj = function () {
    return {
        Name: this.name,
        View: this.view,
        EmailBody: this.emailBody
    };
};

Form.prototype.getTablesDataObj = function () {
    var tblsDataObj = [];
    var form = this;
    Object.keys(form.scope.tables).forEach(function (t) {
        tblsDataObj.push(form.scope.tables[t].getDataObjectWithRecords());
    });
    return tblsDataObj;
};

Form.prototype.getTablesDataString = function () {
    return "Tables=" + encodeURIComponent(JSON.stringify(this.getTablesDataObj()));
};

Form.prototype.update = function () {
    this.updateOrSubmit(true);
};

Form.prototype.submit = function () {
    this.updateOrSubmit(false);
};

Form.prototype.updateOrSubmit = function (updating) {
    var form = this;
    if (this.formIsValid()) {
        this.emailBody = alterHTMLForEmail();
        this.http({
            method: "POST",
            url: "/scripts/php/Form.php",
            data: form.getFormDataStringWithTables() + "&Function=" + (updating ? "Update" : "Submit"),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (resp) {
            $(document.body).html(resp);
        });
    } else {
        alert("Some inputs are not valid, these should appear highlighted in red. Fill these out to submit the form.");
    }
};

Form.prototype.formIsValid = function () {
    return $.makeArray($("select, input, textarea")).reduce(
        function (p, c) {
            return (p && (([].indexOf.call(document.querySelectorAll(":invalid"), c) == -1) || $(c).is(':hidden')));
        }, true);
};

app.controller("Form", Form);