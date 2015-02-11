function Table(form, name, connection, isMain, recCount) {
    this.form = form;

    this.name = name;
    this.connection = connection;
    this.openBy = "";
    this.isMain = isMain;
    this.records = [];
    this.minRecordCount = recCount;
}

Table.prototype.watchIDForOpen = function () {
    var tbl = this;
    $scope.$watch("tables['" + this.name + "'].records[0].fields['" + tbl.getPK() + "'].value", function (n, o) {
        if (n) {
            tbl.form.open();
        } else {
            tbl.form.clearAll();
        }
    });
};

Table.prototype.getPK = function () {
    var rec = this.records[0];
    for (var f in rec.fields) {
        var field = rec.fields[f];
        if (field.isPK) {
            return field.name;
        }
    }
    return false;
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

Table.prototype.getOpenBy = function () {
    var rec = this.records[0];
    for (var f in rec.fields) {
        var field = rec.fields[f];
        if (field.isOpenBy) {
            return field.name;
        }
    }
    return this.getPK();
};

Table.prototype.getOpenByValue = function () {
    var ob = this.getOpenBy();
    if (ob) {
        return this.records[0].fields[ob].value;
    } else {
        console.log("Error no open by field, got " + ob);
        return 0;
    }
};

Table.prototype.open = function () {
    var tbl = this;

    $http({
        method: "POST",
        url: "/scripts/php/Query.php",
        data: "Query=SELECT * FROM ["+tbl.name+"] WHERE ["+tbl.getOpenBy()+"]=?&ASSOC=true&Connection="+tbl.connection+"&Params="+JSON.stringify([tbl.getOpenByValue()]),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function (resp) {
        tbl.clear();
        if (!(resp instanceof Array)) {
            tbl.form.hasRecord = false;
            alert(resp[Object.keys(resp)[0]]);
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
    this.records[this.records.length - 1].getAllFKData();
};

Table.prototype.makeQueryObjects = function () {
    var queries = this.records.map(function (r) {
        return r.makeAppropriateQueryObject();
    });
    return queries;
};


Table.prototype.getAllFKData = function () {
    this.records.forEach(function (r) {
        r.getAllFKData();
    });
};

Table.prototype.clearRecords = function () {
    this.records.forEach(function (r) {
        r.clearFields();
    });
};