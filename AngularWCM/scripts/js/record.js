function Record(scope, table) {
    this.scope = scope;
    this.table = table;
    this.fields = {};
}

Record.prototype.makeCopy = function () {
    var rec = this;
    var recCopy = new Record(this.scope, this.table);
    var fields = {};
    Object.keys(this.fields).forEach(function (f) {
        fields[f] = rec.fields[f].makeCopy();
        // don't copy primary key values
        if (fields[f].isPK) {
            fields[f].setValue(null);
        }
        fields[f].recNum = rec.scope.tables[rec.table].records.length;
        fields[f].getFKTableInfo();
    });
    recCopy.fields = fields;
    return recCopy;
};

Record.prototype.getFieldsDataObject = function () {
    var rec = this;
    var fields = [];
    Object.keys(this.fields).forEach(function (f) {
        var field = rec.fields[f];
        fields.push(field.toDataObject());
    });
    return fields;
};

Record.prototype.toDataObject = function () {
    return {
        table: this.table,
        fields: this.getFieldsDataObject()
    };
};