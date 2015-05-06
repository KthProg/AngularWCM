function Field(form, table, record, name, type, defaultValue, isPK, isFK, fkTable, fkColumn, nullable, bindingType, isID, fkfkTable, fkfkColumn, textColumn, filterColumn, boundTable, boundColumn) {
    this.form = form;
    this.record = record;
    this.table = table;

    this.name = name;
    this.type = type;

    // this.getHTMLInputType();
    // TODO: implement this
    // TONOTDO: never mind

    this.options = [{ k: -1, v: null}];

    this.nullable = nullable;
    this.bindingType = bindingType;

    this.isPK = isPK;
    this.isFK = isFK;
    this.isID = isID;
    this.isOpenBy = false;

    /*
    These attributes work under very strict circumstances
    The field must be a foreign key pointing to another
    table. That table must have a primary key, and a text
    field describing what the primary key identifies. The
    table MAY have another foreign key pointing to some
    other table, which is subject to the same restrictions.
    If the table does have a foreign key pointing to some
    other table, and another foreign key field in this table 
    points to THAT table, then the application will infer
    that the options for the second foreign key field are
    the values and text field of the second table, which
    is filtered based on the value of the first field.
    */

    // table and column which the foriegn key
    // points to
    this.fkTable = fkTable;
    this.fkColumn = fkColumn;

    // column which the results from the foreign
    // key table are filtered on
    this.fkFilterColumn = filterColumn;

    // table and column which the foreign key table itself
    // refers to from its own foreign key
    this.fkfkTable = fkfkTable;
    this.fkfkColumn = fkfkColumn;

    // table and column this field is bound to
    // (receives updated values from)
    this.boundTable = boundTable;
    this.boundColumn = boundColumn;

    // field which this field is bound to
    this.boundField = {};

    // field in the foreign key table which has
    // the text values for the options for this field 
    this.fkTextField = textColumn;

    this.defaultValue = defaultValue ? defaultValue : null;
    this.setValue(defaultValue || "");

    try {
        this.sketch = new Sketch(this.getIDString());
        this.watchSketch();
    } catch (e) {
        //console.log(e.message);
    }
    try {
        this.image = new ImageUpload(this.getIDString());
        this.watchImage();
    } catch (e) {
        //console.log(e.message);
    }

    
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

Field.prototype.watchSketch = function () {
    var f = this;
    var idStr = this.getIDString();
    $scope.$watch(idStr + ".sketch.uri", function (n) {
        var se = f.getSketchOrImageEl();
        if (se) {
            f.setValue(n);
        }
    });
};

Field.prototype.watchImage = function () {
    var f = this;
    var idStr = this.getIDString();
    $scope.$watch(idStr + ".image.uri", function (n) {
        var se = f.getSketchOrImageEl();
        if (se) {
            f.setValue(n);
        }
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
    return se ? se : false;
};

Field.prototype.makeCopy = function () {
    var field = new Field(this.form, this.table, this.record,
                          this.name, this.type, this.defaultValue,
                          this.isPK, this.isFK, this.fkTable,
                          this.fkColumn, this.nullable, this.bindingType,
                          this.isID, this.fkfkTable, this.fkfkColumn,
                          this.fkTextField, this.fkFilterColumn,
                          this.boundTable, this.boundColumn);
    for (var k in this) {
        if (!field[k])
            field[k] = this[k];
    }

    // so if it's in a new record, it will fetch
    // the bound field of that record later
    field.boundField = {};

    return field;
};

Field.prototype.getBoundField = function () {
    // bound field already set
    if(Object.keys(this.boundField).length > 0){ return true; }

    var recNum = this.getRecordNumber();
    if (this.form.tables[this.boundTable].records[recNum] === undefined) { recNum = 0; }

    var f2 = this.form.tables[this.boundTable].records[recNum].fields[this.boundColumn];
    this.boundField = f2;
};

Field.prototype.getRecordNumber = function () {
    return this.table.records.indexOf(this.record);
};

Field.prototype.getFKTableData = function () {
    if (!this.isFK) { return false; }
    if (this.bindingType == "options") {
        if(this.boundTable && this.boundColumn) this.getBoundField();
        this.getOptions();
        this.watchDependency();
    } else if (this.bindingType == "values") {
        var recNum = this.getRecordNumber();
        if (this.form.tables[this.fkTable].records[recNum] == undefined) { recNum = 0; }
        var f2 = this.form.tables[this.fkTable].records[recNum].fields[this.fkColumn];
        this.boundField = f2;
        if (f2.isPK) {
            this.isOpenBy = true;
        }
        this.watchDependency();
    }
};

Field.prototype.watchDependency = function () {
    if (Object.keys(this.boundField).length == 0) { return false; }

    if (this.boundField.table.name === undefined || this.boundField.name === undefined) { return false; }

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
        var bindingFunc = function (n) { field.setValue(n); };
    }

    $scope.$watch(watchText, bindingFunc);
};

Field.prototype.getOptions = function (val) {
    var field = this;
    var optionsSuccess = function (resp) {
        if (!(resp instanceof Array)) {
            console.log(resp);
            return;
        }
        field.options = resp.map(function (row) {
            return { k: Number(row[0]), v: row[1] };
        });
    };

    if (!(val == undefined || val == null)) {
        var query = "EXEC('SELECT ' + ? + ', ' + ? + ' FROM ' + ? + ' WHERE ' + ? + '=' + ?)";
        var params = [this.fkColumn, this.fkTextField, this.fkTable, this.fkFilterColumn, val];
    } else if (Object.keys(this.boundField).length == 0) {
        var query = "EXEC('SELECT ' + ? + ', ' + ? + ' FROM ' + ?)";
        var params = [this.fkColumn, this.fkTextField, this.fkTable];
    } else {
        return;
    }

    return $http.get("/scripts/php/Query.php?Query="+encodeURIComponent(query)+"&Connection="+this.form.connection+"&Params=" + encodeURIComponent(JSON.stringify(params))).success(optionsSuccess);
};

Field.prototype.getOptionText = function (key, ops) {
    var text = "";
    (ops || this.options).some(function (op) {
        if (op.k === key) {
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