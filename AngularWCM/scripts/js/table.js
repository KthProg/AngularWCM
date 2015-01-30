function Table(form, name, connection, pk, ids, isMain, recCount) {
    this.form = form;

    this.name = name;
    this.connection = connection;
    this.pk = pk;
    this.openBy = "";
    this.ids = ids;
    this.isMain = isMain;
    this.records = [];
    this.minRecordCount = recCount;
}

Table.prototype.setPKFromFields = function () {
    var tbl = this;
    var ret = false;
    Object.keys(tbl.records[0].fields).forEach(function (f) {
        var field = tbl.records[0].fields[f];
        if (field.isPK) {
            tbl.pk = field.name;
            ret = true;
        }
    });
    return ret;
};

Table.prototype.getMaxID = function () {
    var tbl = this;
    this.form.http({
        method: "POST",
        url: "/scripts/php/Form.php",
        data: tbl.toDataString() + "&Function=getMaxID",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function (resp) {
        tbl.setID(++resp);
    });
}

Table.prototype.watchIDForOpen = function () {
    var tbl = this;
    this.form.scope.$watch("tables['" + this.name + "'].records[0].fields['" + tbl.getPK() + "'].value", function (n, o) {
        if (n) {
            tbl.form.open();
        } else {
            tbl.form.clearAll();
        }
    });
};

Table.prototype.setID = function (id) {
    var pk = this.getPK();
    if (pk) {
        //this.records[0].fields[this.getPK()].setValue(id);
        this.records[0].fields[this.getPK()].defaultValue = id;
    } else {
        console.log("Error no pk, got " + pk);
    }
};

Table.prototype.getIDs = function () {
    var tbl = this;
    this.ids = this.records.map(function (rec) {
        return rec.fields[tbl.getPK()].value;
    });
};

Table.prototype.getDataObjectWithRecords = function () {
    var tbl = this;
    var recs = [];
    this.records.forEach(function (rec) {
        recs.push(rec.toDataObject());
    });
    var tblObj = this.toDataObj();
    tblObj["records"] = recs;
    return tblObj;
};

Table.prototype.getPK = function () {
    if (this.pk) {
        return this.pk;
    } else {
        var pk = this.setPKFromFields();
        if (pk) {
            return this.pk;
        } else {
            console.log("No pk found, got " + pk);
            return false;
        }
    }
};

Table.prototype.getOpenBy = function () {
    if (this.openBy) {
        return this.openBy;
    } else {
        this.setOpenByFromFields();
        return this.openBy;
    }
};

Table.prototype.setOpenByFromFields = function () {
    var tbl = this;
    var ret = false;
    Object.keys(this.records[0].fields).forEach(function (f) {
        var field = tbl.records[0].fields[f];
        if (field.isOpenBy) {
            tbl.openBy = field.name;
            ret = true
        }
    });
    if (!tbl.openBy) {
        var pk = this.getPK();
        if (pk) {
            ret = true;
            tbl.openBy = pk;
        } else {
            ret = false;
        }
    }
    return ret;
};

Table.prototype.getID = function () {
    var pk = this.getPK();
    if (pk) {
        return this.records[0].fields[pk].value;
    } else {
        console.log("could not get ID value, no pk");
        return 0;
    }
};

Table.prototype.getOpenByValue = function () {
    var ob = this.getOpenBy();
    if (ob) {
        return this.records[0].fields[ob].value;
    } else {
        console.log("Error no ob, got " + ob);
        return 0;
    }
};

Table.prototype.toDataObj = function () {
    return {
        Name: this.name,
        Table: this.name,
        PK: this.getPK(),
        OpenBy: this.getOpenBy(),
        OpenByValue: this.getOpenByValue(),
        ID: this.getID(),
        IsMain: this.isMain,
        Connection: this.connection
    };
};

Table.prototype.toDataString = function () {
    return "Form=" + encodeURIComponent(JSON.stringify(this.toDataObj()));
};

Table.prototype.open = function () {
    var tbl = this;

    this.form.http({
        method: "POST",
        url: "/scripts/php/Form.php",
        data: tbl.toDataString() + "&Function=Open",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function (resp) {
        if (resp.length == 0) {
            alert(tbl.name + " number " + tbl.getOpenByValue() + " does not exist.");
            tbl.clear();
            tbl.form.hasRecord = false;
            return;
        }
        tbl.clear();
        if (!(resp instanceof Array)) {
            alert("Invalid data returned: expected Array.");
            return;
        }
        resp.forEach(function (row, rowi) {
            if (tbl.records.length < (rowi + 1)) {
                tbl.copyRecord(0);
            }
            for (var f in row) {
                tbl.records[rowi].fields[f].setValue(row[f]);
            }
        });
        tbl.form.hasRecord = true;
    });
};

Table.prototype.clear = function () {
    while(this.records.length > this.minRecordCount){
        this.records.pop();
    }
    this.records.forEach(function (rec) {
        for (var f in rec.fields) {
            rec.fields[f].clearValue();
        }
    });
};


Table.prototype.addRecord = function () {
    this.records.push(new Record(this.form, this));
};

Table.prototype.copyRecord = function (i) {
    var newRec = this.records[i].makeCopy();
    this.records.push(newRec);
    this.records[this.records.length - 1].getAllFKInfo();
};

Table.prototype.addDefaultRecords = function () {
    while (this.records.length < this.minRecordCount) {
        this.copyRecord(0);
    }
};