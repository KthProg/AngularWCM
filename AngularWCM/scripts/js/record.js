function Record(form, table) {
    this.form = form;
    this.table = table;
    this.fields = {};
}

Record.prototype.makeCopy = function () {
    var rec = this;
    var recCopy = new Record(this.form, this.table);
    var fields = {};
    Object.keys(this.fields).forEach(function (f) {
        fields[f] = rec.fields[f].makeCopy();
        // don't copy values
        fields[f].setValue(null)
        fields[f].form = recCopy.form;
        fields[f].table = recCopy.table;
        fields[f].record = recCopy;
    });
    recCopy.fields = fields;
    return recCopy;
};

Record.prototype.getAllFKData = function () {
    var rec = this;
    Object.keys(this.fields).forEach(function (f) {
        var field = rec.fields[f];
        field.getFKTableData();
    });
};

Record.prototype.makeAppropriateQueryObject = function () {
    if (this.isNew()) {
        return this.makeInsertQueryObject();
    } else {
        return this.makeUpdateQueryObject();
    }
};

Record.prototype.makeUpdateQueryObject = function () {
    var r = this;
    var pk = this.table.getPK();

    var query = Object.keys(this.fields).reduce(function (prev, fk) {
        if (fk != pk) {
            return prev + "[" + fk + "]=:" + fk + ",";
        } else {
            return prev;
        }
    }, "UPDATE [" + this.table.name + "] SET ");

    query = query.substring(0, query.length - 1) + " WHERE [" + pk + "]=:" + pk;

    var values = Object.keys(this.fields).reduce(function (prev, fk) {
        var f = r.fields[fk];
        prev[fk] = f.getAsString();
        return prev;
    }, {});

    return { query: query, values: values };
};

Record.prototype.makeInsertQueryObject = function () {
    var r = this;
    var pk = this.table.getPK();
    var ob = this.table.getOpenBy();
    var columnsStr = Object.keys(this.fields).reduce(function (prev, fk) {
        if (fk == pk) {
            return prev;
        }
        return prev + "[" + fk + "],";
    }, "");
    columnsStr = columnsStr.substring(0, columnsStr.length - 1);
    var values = Object.keys(this.fields).reduce(function (prev, fk) {
        if (fk == pk || (fk == ob && !r.form.hasRecord)) {
            return prev;
        }
        var f = r.fields[fk];
        prev[fk] = f.getAsString();
        return prev;
    }, {});
    var mt = this.form.getMainTable();
    //replace '[' with ':' and remove ']' (creates named placeholders for parameters)
    var valuesStr = columnsStr.replace(/\[/g, ":").replace(/\]/g, "");
    // replace the open by (fk to main table) with a subquery selecting the largest id
    // of the main table. this maintains the association in the database
    if (!r.form.hasRecord) {
        valuesStr = valuesStr.replace(":" + ob, "(SELECT MAX([" + mt.getPK() + "]) FROM [" + mt.name + "])");
    }
    var query = "INSERT INTO [" + this.table.name + "] (" + columnsStr + ") VALUES (" + valuesStr + ")";
    return { query: query, values: values };

};

Record.prototype.IDIsSet = function () {
    return !!this.fields[this.table.getPK()].value;
};

Record.prototype.isNew = function () {
    return !this.IDIsSet();
};

Record.prototype.clearFields = function () {
    var r = this;
    Object.keys(this.fields).forEach(function (fk) {
        r.fields[fk].clearValue();
    });
};