function Field(form, table, record, name, type, defaultValue, isPK, isFK, fkTable, fkColumn, nullable, bindingType, isID) {
    //this.scope = scope;
    //this.http = http;

    this.connection = "Safety";

    this.form = form;
    this.record = record;
    this.table = table;

    this.name = name;
    this.type = type;

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
    this.boundField = {}
    // field in the foreign key table which has
    // the text vallues for the options for this field 
    this.fkTextField = ""

    this.value = "";
    this.defaultValue = defaultValue;
    this.setValue(defaultValue);
}

Field.prototype.setValue = function (val) {
    this.value = val;
    this.format();
    if (this.isImageURI()) {
        this.renderSketch();
    } else {
        var se = this.getSketchOrImageEl();
        if (se) {
            this.clearSketch();
        }
    }
};

Field.prototype.clearValue = function () {
    this.setValue(this.defaultValue);
};

Field.prototype.format = function () {
    this.value = Formatter.stringToJSObj(this.value, this.type);
    this.value = Formatter.preventNullsIfNeccessary(this.value, this.type, this.bindingType, this.nullable);
};

Field.prototype.getAsString = function () {
    var val = Formatter.jsObjToString(this.value, this.type);
    val = Formatter.preventNullsIfNeccessary(this.value, this.type, this.bindingType, this.nullable);
    return val;
};

Field.prototype.saveSketch = function () {
    var sketchArea = this.getSketchOrImageEl();
    this.value = sketchArea[0].toDataURL().replace(/ /g, "+");
};

Field.prototype.getSketchOrImageEl = function () {
    var se = $('[id="tables[\'' + this.table.name + '\'].records[' + this.getRecordNumber() + '].fields[\'' + this.name + '\']"]');
    if (se.length !== 0) {
        return se;
    } else {
        return false;
    }
};

Field.prototype.clearSketch = function () {
    var sketchArea = this.getSketchOrImageEl();
    if (sketchArea && (sketchArea.prop("tagName") == "CANVAS")) {
        var sketchCtx = sketchArea[0].getContext("2d");
        sketchCtx.clearRect(0, 0, sketchArea.width(), sketchArea.height());
    }
};

Field.prototype.drawSketch = function () {
    var sketchArea = this.getSketchOrImageEl();
    var sketchCtx = sketchArea[0].getContext("2d");
    var sa = sketchArea;
    var sc = sketchCtx;

    var off = sa.offset();
    var relX = (mouse.x - off.left);
    var relY = (mouse.y - off.top);
    var pRelX = (mouse.prevX - off.left);
    var pRelY = (mouse.prevY - off.top);

    sc.strokeStyle = sa.siblings("input[type='color']").val();
    sc.lineWidth = sa.siblings("input[type='number']").val();

    if (mouse.leftDown) {
        sc.beginPath();
        sc.moveTo(pRelX, pRelY);
        sc.lineTo(relX, relY);
        sc.stroke();
    }
}

Field.prototype.renderSketch = function () {
        this.clearSketch();
        var sketchArea = this.getSketchOrImageEl();
        if (sketchArea && (sketchArea.prop("tagName") == "CANVAS")) {
            var sketchCtx = sketchArea[0].getContext("2d");
            var img = new Image();
            // string is invalid URL if spaces are not
            // replaced with +
            img.src = this.value.replace(/ /g, "+");
            img.onload = function () {
                sketchCtx.drawImage(img, 0, 0);
            };
        }
};

Field.prototype.isImageURI = function () {
    return (String(this.value).indexOf("data:image") > -1);
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

Field.prototype.toDataObject = function () {
    return {
        name: this.name,
        value: this.getAsString()
    };
};

Field.prototype.toDataString = function () {
    return encodeURIComponent(JSON.stringify(this.toDataObject));
};

Field.prototype.getBoundField = function () {
    var f1 = this;
    // bounnd field already set
    if(Object.keys(f1.boundField).length > 0){ return true; }

    Object.keys(f1.form.tables).some(function (t) {
        var recNum = f1.getRecordNumber();
        if (f1.form.tables[t].records[recNum] == undefined) { recNum = 0; }
        return Object.keys(f1.form.tables[t].records[recNum].fields).some(function (f) {
            var f2 = f1.form.tables[t].records[recNum].fields[f];
            if (f1.isFK && f2.isFK) {
                if (f2.fkTable != "" && f1.boundTable != ""
                    && f2.fkColumn != "" && f1.boundColumn != "") {
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
                }
            }
        });
    });
};

Field.prototype.getRecordNumber = function () {
    return this.table.records.indexOf(this.record);
};

Field.prototype.getFKTableInfo = function () {
    if (!this.isFK) { return false; }
    if (this.bindingType == "options") {
        var field = this;
        this.form.http.get("/scripts/php/Form.php?Function=Query&Query=GetTablesData&ASSOC=true&Params=" + encodeURIComponent(JSON.stringify(["'"+this.fkTable+"'"])))
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
            field.getInitialOptions();
            field.watchDependency();
        });
    } else if (this.bindingType == "values") {
        var f1 = this;
        Object.keys(f1.form.tables).some(function (t) {
            var recNum = f1.getRecordNumber();
            if (f1.form.tables[t].records[recNum] == undefined) { recNum = 0; }
            return Object.keys(f1.form.tables[t].records[recNum].fields).forEach(function (f) {
                var f2 = f1.form.tables[t].records[recNum].fields[f];
                if (f2.table.name == f1.fkTable
                    && f2.name == f1.fkColumn) {
                    f1.boundField = f2;
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
    var field = this;

    if (this.boundField.table.name != undefined
        //&& this.recNum != undefined
        && this.boundField.name != undefined) {
        var watchText = "tables['" + this.boundField.table.name + "'].records[" + this.getRecordNumber() + "].fields['" + this.boundField.name + "'].value";
        if (!field.form.scope.$eval(watchText)) {
            watchText = "tables['" + this.boundField.table.name + "'].records[0].fields['" + this.boundField.name + "'].value";
        }
        if (this.bindingType == "options") {
            (function (f, wt) {
                field.form.scope.$watch(wt,
                    function (n) {
                        f.getOptions(n);
                    });
            })(field, watchText);
            return true;
        } else if (this.bindingType == "values") {
            (function (f, wt) {
                field.form.scope.$watch(wt,
                    function (n) {
                        f.value = n;
                    });
            })(field, watchText);
        }
    }
};

Field.prototype.getInitialOptions = function () {
    var field = this;
    if (Object.keys(this.boundField).length == 0) {
        field.form.http.get("/scripts/php/Form.php?Function=Query&Query=SelectKeysAndValues&Params=" + encodeURIComponent(JSON.stringify([this.fkColumn, this.fkTextField, this.fkTable])))
        .success(function (resp) {
            field.options = Object.keys(resp).map(function (key) {
                return { k: key, v: resp[key] };
            });
        });
    }
};

Field.prototype.getOptions = function (val) {
    if (val) {
        var field = this;
        field.form.http.get("/scripts/php/Form.php?Function=Query&Query=SelectKeysAndValuesFilter&Params=" + encodeURIComponent(JSON.stringify([this.fkColumn, this.fkTextField, this.fkTable, this.fkFilterColumn, val])))
        .success(function (resp) {
            field.options = Object.keys(resp).map(function (key) {
                return { k: key, v: resp[key] };
            });
        });
    }
};

Field.prototype.getOptionText = function (value) {
    var text = "";
    this.options.some(function (op) {
        if (op.k == value) {
            text = op.v;
            return true;
        }
    });
    return text;
};

Field.prototype.resizeImage = function () {
    var MAX_WIDTH = 800;
    var MAX_HEIGHT = 600;

    var img = new Image();
    img.src = this.value;

    var width = img.width;
    var height = img.height;

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    this.value = canvas.toDataURL("image/jpeg", 0.5);

    canvas = null;
    img = null;
};

app.directive('field', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/field.html",
        scope : {
            field: "=name",
            ops: "=options"
        }
    };
});

app.directive('sketch', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/sketch.html",
        scope: {
            field: "=name"
        }
    };
});

app.directive('imageupload', function () {
    return {
        restrict: "E",
        templateUrl: "/templates/imageupload.html",
        scope: {
            field: "=name"
        }
    };
});

//update mouse for sketches

var mouse = { x: 0, y: 0, prevX: 0, prevY: 0, leftDown: false, leftUp: false };

document.addEventListener('mousemove', function (e) {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.pageX || e.clientX;
    mouse.y = e.pageY || e.clientY;
}, false);

document.addEventListener('mousedown', function (e) {
    mouse.leftDown = (e.button === 0);
}, false);

document.addEventListener('mouseup', function (e) {
    mouse.leftDown = false;
}, false);