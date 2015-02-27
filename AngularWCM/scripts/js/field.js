function Field(form, table, record, name, type, defaultValue, isPK, isFK, fkTable, fkColumn, nullable, bindingType, isID) {
    this.form = form;
    this.record = record;
    this.table = table;

    this.name = name;
    this.type = type;

    // this.getHTMLInputType();
    // TODO: implement this

    this.options = [];

    this.nullable = nullable;
    this.bindingType = bindingType;

    this.isPK = isPK;
    this.isFK = isFK;
    this.isID = isID;
    this.isOpenBy = false;

    // table and column which the foriegn key
    // points to
    this.fkTable = fkTable;
    this.fkColumn = fkColumn;

    // column which the results from the foreign
    // key table are filtered on
    this.fkFilterColumn = "";

    // table and column which the foreign key table itself
    // refers to as a foreign key
    this.boundTable = "";
    this.boundColumn = "";

    // field which this field is bound to
    this.boundField = {};
    // field in the foreign key table which has
    // the text vallues for the options for this field 
    this.fkTextField = "";

    this.defaultValue = defaultValue ? defaultValue : null;
    this.setValue(defaultValue || "");

    try {
        this.sketch = new Sketch(this.getIDString());
    } catch (e) {
        //console.log(e.message);
    }
    try {
        this.image = new ImageUpload(this.getIDString());
    } catch (e) {
        //console.log(e.message);
    }

    this.watchSketchOrImage();
}

Field.prototype.setValue = function (val) {
    this.format(val);
    this.updateSketchOrImage();
};

Field.prototype.updateSketchOrImage = function () {
    var se = this.getSketchOrImageEl();
    if (se && this.value) {
        if (se.tagName == "CANVAS") {
            this.sketch.uri = this.value.replace(/ /g, "+");
            this.sketch.render();
        } else if (se.tagName == "INPUT") {
            this.image.uri = this.value.replace(/ /g, "+");
        }
    }
};

Field.prototype.getIDString = function (tbl, recNum, field) {
    var table = tbl || this.table.name;
    var rec = recNum || this.getRecordNumber();
    var f = field || this.name;
    return "tables['" + table + "'].records[" + rec + "].fields['" + f + "']";
};

Field.prototype.watchSketchOrImage = function () {
    var f = this;
    var idStr = this.getIDString();
    $scope.$watch(idStr + ".sketch.uri", function (n) {
        f.setValue(n);
    });
    $scope.$watch(idStr + ".image.uri", function (n) {
        f.setValue(n);
    });
};

Field.prototype.clearValue = function () {
    this.setValue(this.defaultValue);
};

Field.prototype.format = function (val) {
    val = (val === undefined ? this.value : val);
    this.value = Formatter.stringToJSObj(val, this.type);
    this.value = Formatter.preventNullsIfNeccessary(this.value, this.type, this.nullable);
};

Field.prototype.getAsString = function () {
    var val = Formatter.jsObjToString(this.value, this.type);
    val = Formatter.preventNullsIfNeccessary(val, this.type, this.nullable);
    return val;
};

Field.prototype.getSketchOrImageEl = function () {
    var se = document.getElementById(this.getIDString());
    if (se) {
        return se;
    } else {
        return false;
    }
};

Field.prototype.makeCopy = function () {
    var field = new Field(this.form, this.table, this.record,
                          this.name, this.type, this.defaultValue,
                          this.isPK, this.isFK, this.fkTable,
                          this.fkColumn, this.nullable, this.bindingType,
                          this.isID);
    for (var k in this) {
        field[k] = this[k];
    }
    return field;
};

Field.prototype.getBoundField = function () {
    var f1 = this;
    // bound field already set
    if(Object.keys(f1.boundField).length > 0){ return true; }

    Object.keys(f1.form.tables).some(function (t) {
        var recNum = f1.getRecordNumber();
        if (f1.form.tables[t].records[recNum] == undefined) { recNum = 0; }
        return Object.keys(f1.form.tables[t].records[recNum].fields).some(function (f) {
            var f2 = f1.form.tables[t].records[recNum].fields[f];
            if (!(f1.isFK && f2.isFK)) {
                return false;
            }
            if (f2.fkTable == "" || f1.boundTable == ""
                && f2.fkColumn == "" || f1.boundColumn == "") {
                return false;
            }
            // if the foreign key of the field f2 points to the
            // table which the field f1 has as it's own foreign
            // key, the by extension the field f1 is bound to
            // the field f2, the converse is also true (else if)
            if (f2.fkTable == f1.boundTable
                && f2.fkColumn == f1.boundColumn) {
                f1.boundField = f2;
                return true;
            } else if (f1.fkTable == f2.boundTable
                && f1.fkColumn == f2.boundColumn) {
                f2.boundField = f1;
            }
        });
    });
};

Field.prototype.getRecordNumber = function () {
    return this.table.records.indexOf(this.record);
};

Field.prototype.getFKTableData = function () {
    if (!this.isFK) { return false; }
    if (this.bindingType == "options") {
        var field = this;
        $http.get("/scripts/php/Query.php?Query=GetTablesData&Named=true&ASSOC=true&Params=" + encodeURIComponent(JSON.stringify(["'" + this.fkTable + "'"])))
        .success(function (resp) {
            resp.forEach(function (f) {
                if (f.IsFK == "1") {
                    field.boundTable = f.REF_TABLE;
                    field.boundColumn = f.REF_COLUMN;
                    field.fkFilterColumn = f.COLUMN_NAME;
                } else if (f.IsPK != "1") {
                    field.fkTextField = f.COLUMN_NAME;
                }
            });
            field.getBoundField();
            field.getOptions();
            field.watchDependency();
        });
    } else if (this.bindingType == "values") {
        var f1 = this;
        Object.keys(f1.form.tables).some(function (t) {
            var recNum = f1.getRecordNumber();
            if (f1.form.tables[t].records[recNum] == undefined) { recNum = 0; }
            return Object.keys(f1.form.tables[t].records[recNum].fields).some(function (f) {
                var f2 = f1.form.tables[t].records[recNum].fields[f];
                if (f2.table.name == f1.fkTable
                    && f2.name == f1.fkColumn) {
                    f1.boundField = f2;
                    // if this field is bound to the primary key
                    // of another table which exists in this form (not external)
                    // then it must be the field which the records are filtered by
                    // for instance, TBL_1 is the main table with PK_1 as the primary key
                    // TBL_2 also has an ID field, but it will be 'opened' by
                    // a foreign key (FK_2_PK_1) pointing to the PK_1 field of TBL_1
                    // since FK_2_PK_1 then determines what record in TBL_1 each
                    // record in TBL_2 is associated with. thus the distinction
                    // between the primary key, and the field which the records are
                    // actually 'opened' by in secondary tables
                    if (f2.isPK) {
                        f1.isOpenBy = true;
                    }
                    return true;
                }
            });
        });
        this.watchDependency();
    }
};

Field.prototype.watchDependency = function () {
    if (Object.keys(this.boundField).length == 0) { return false; }

    if (this.boundField.table.name == undefined || this.boundField.name == undefined) { return false; }

    // watch the bound field associated with the same record number
    var watchText = this.boundField.getIDString() + ".value";
    // if the bound field does not exist for this record, 
    // then watch the bound field in the first record (record 0)
    if (!$scope.$eval(watchText)) {
        watchText = this.boundField.getIDString(undefined, 0) + ".value";
    }

    var field = this;
    if (this.bindingType == "options") {
        var bindingFunc = function (n) { field.getOptions(n); };
    } else if (this.bindingType == "values") {
        var bindingFunc = function (n) { field.value = n; };
    }

    $scope.$watch(watchText, bindingFunc);
};

Field.prototype.getOptions = function (val) {
    var field = this;
    var optionsSuccess = function (resp) {
        if (!(resp instanceof Array)) {
            console.log(resp);
            return [];
        }
        field.options = resp.map(function (row) {
            return { k: Number(row[0]), v: row[1] };
        });
    };

    if (val) {
        var query = "EXEC('SELECT ' + ? + ', ' + ? + ' FROM ' + ? + ' WHERE ' + ? + '=' + ?)";
        var params = [this.fkColumn, this.fkTextField, this.fkTable, this.fkFilterColumn, val];
    } else if (Object.keys(this.boundField).length == 0) {
        var query = "EXEC('SELECT ' + ? + ', ' + ? + ' FROM ' + ?)";
        var params = [this.fkColumn, this.fkTextField, this.fkTable];
    } else {
        return;
    }

    $http.get("/scripts/php/Query.php?Query="+encodeURIComponent(query)+"&Connection="+this.form.connection+"&Params=" + encodeURIComponent(JSON.stringify(params))).success(optionsSuccess);
};

Field.prototype.getOptionText = function (key, ops) {
    var text = "";
    (ops || this.options).some(function (op) {
        if (op.k == key) {
            text = op.v;
            return true;
        }
    });
    return text;
};

app.directive('field', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/field.html",
        scope : {
            field: "=field",
            ops: "=options",
            req: "=required",
            multiline: "=multiline"
        }
    };
});

app.directive('sketch', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/sketch.html",
        scope: {
            field: "=field"
        }
    };
});

app.directive('imageupload', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/imageupload.html",
        scope: {
            field: "=field"
        }
    };
});