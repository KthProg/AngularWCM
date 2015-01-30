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
        table: this.table.name,
        fields: this.getFieldsDataObject()
    };
};

Record.prototype.getAllFKInfo = function () {
    var rec = this;
    Object.keys(this.fields).forEach(function (f) {
        var field = rec.fields[f];
        field.getFKTableInfo();
    });
};