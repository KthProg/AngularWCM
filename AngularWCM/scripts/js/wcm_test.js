// FORMS


function WCMTest() {
    return testFields().then(function () {
        console.log(true);
    });
}

function testFields() {
    if ($scope.form.tables['WCMTest'].records[0].fields['DateCreated'] !== undefined) return false;

    var defaults = {
        'WCMTest': {
            0: {
                // ID: ,
                // PlantID: ,
                DepartmentID: 1,
                ZoneID: 16,
                MachineID: 1,
                // DateCreated: ,
                SomeDate: "1/1/2015",
                // SomeTime: ,
                SomeDateTime: "1/1/2015 12:00:00.000",
                SomeDateTime2: "1/1/2015 12:30:00.000",
                SomeDateTimeOffset: "1/1/2015 12:45:00.000",
                SomeSmallDateTime: "1/1/2015 13:00:00.000",
                SomeChar: "char",
                SomeVarchar: "varchar",
                SomeNChar: "nchar",
                SomeNVarchar: "nvarchar",
                SomeInt: 1,
                SomeBigInt: 2,
                SomeSmallInt: 3,
                SomeTinyInt: 4,
                SomeFloat: 4.5,
                SomeReal: 5.5,
                SomeDecimal: 6.5,
                SomeNumeric: 7.5,
                SomeMoney: 8.55,
                SomeSmallMoney: 9.55,
                SomeBit: 1,
                SomeText: "text",
                SomeNText: "ntext"
            }
        }//,
        //'WCMTestLine': {
            //0: {
                // ID: ,
                // WCMTestID: ,
                // ImageURL: ,
                // SketchURL: 
            //}
        //}
    };

    $scope.form.setDefaultValues(defaults);
    $scope.$apply();

    if ($scope.form.tables['WCMTest'].records.length !== 1) {
        console.log("WCMTest records count incorrect.");
        return false;
    }
    if ($scope.form.tables['WCMTestLine'].records.length !== 3) {
        console.log("WCMTestLine records count incorrect.");
        return false;
    }

    if (new Date($scope.form.tables['WCMTest'].records[0].fields['SomeTime'].value).getHours() != new Date(new Date().setHours(12, 0, 0, 0)).getHours()) {
        console.log("SomeTime value incorrect.");
        return false;
    }
    if ($scope.form.tables['WCMTest'].records[0].fields['PlantID'].value != 1) {
        console.log("PlantID value incorrect.");
        return false;
    }

    for (var t in $scope.form.tables) {
        var tbl = $scope.form.tables[t];
        for (var i = 0, l = tbl.records.length; i < l; ++i) {
            var rec = tbl.records[i];
            for (var f in rec.fields) {
                var field = rec.fields[f];

                // type doesn't matter in this case
                if (field.value === null || field.value === undefined) {
                    continue;
                }

                if (['char', 'nchar', 'text', 'ntext', 'nvarchar', 'varchar'].indexOf(field.type) > -1) {
                    if (typeof field.value !== "string") {
                        console.log("wrong type (not string)");
                        return false;
                    }
                } else if (['decimal', 'numeric', 'float', 'real', 'int', 'bigint', 'smallint', 'tinyint', 'money', 'smallmoney', 'bit'].indexOf(field.type) > -1) {
                    if (typeof field.value !== "number") {
                        console.log("wrong type (not number)");
                        return false;
                    }
                } else if (['time', 'date', 'datetimeoffset', 'datetime', 'datetime2', 'smalldatetime'].indexOf(field.type) > -1) {
                    if (!(field.value instanceof Date)) {
                        console.log("wrong type (not date)");
                        return false;
                    }
                } 
            }

            for (var f in rec.fields) {
                var field = rec.fields[f];

                if (Object.keys(field.boundField).length == 0) continue;

                if (field.bindingType === "options") {
                    var initOps = JSON.stringify(field.options);
                    field.getOptions(-1).then(function () {
                        if (JSON.stringify(field.options) === initOps) {
                            console.log("options did not update." + initOps, field.options);
                            return false;
                        }
                    });
                } else if (field.bindingType === "value") {
                    var initVal = field.value;
                    field.boundField.setValue("");
                    $scope.$apply();

                    if (field.value == initVal) {
                        console.log("value did not update.");
                        return false;
                    }
                }
            }

            // OPTIONAL
            // test if images are accepted (how ?)
            // test if sketches are accepted (ok)
        }
    }

    return $scope.form.executeQueries().then(function () {
        // re-open and continue testing
        // check values are the same (as defaults)
        // by setting to defaults and checking vs. original values
    });
}

// CHARTS
// test render chart
// test open layout
// test save layout
// test update layout

// ISSUES
// test close issue
// test open issue
// test filter issues