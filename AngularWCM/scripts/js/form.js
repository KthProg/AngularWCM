function Form ($scope, $http) {

    $scope.fields = {};
    $scope.queries = {};

    var name = "";
    var table = "";
    var pk = "";
    $scope.id = -1;
    var contacts = [];
    var emailBody = "";
    var connection = "";

    $scope.hasRecord = false;
    //$scope.sendEmail = true;

    // given a form name, fetches the rest of the necessary data
    // from a JSON file. also sets the ID to the next ID (getMaxID)
    // gets the inital options for selects with no parameters
    // and watches the selects for changes so that it can update
    // their options asynchronously
    $scope.setFormData = function (formName) {
        name = formName;
        $http.get("/json/FormData.min.json") // FormData.json for development
        .success(function (resp) {
            connection = resp[name]["Connection"];
            table = resp[name]["Table"];
            pk = resp[name]["PK"];
            // concats in case Zone foremen emails are being set (as opposed to setting it directly)
            addContacts(resp[name]["Emails"]);
            $scope.queries = resp[name]["Queries"];
            getMaxID();
            getInitialOptions();
            watchSelects();
        });
    };

    var getMaxID = function () {
        $http({
            method: "POST",
            url: "/scripts/php/getMaxID.php",
            data: fieldsToRequestString() + "&" + getFormDataString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(
        function (resp) {
            // set ID to one more than ther Max ID (new form)
            $scope.id = Number(++resp);
        });
    };

    var getInitialOptions = function () {
        // get options for all selects who's queries have no parameters
        for (var q in $scope.queries) {
            if ($scope.queries[q].params.length == 0) {
                getOptions(q);
            }
        }
    };

    var getOptions = function (field) {
        // replaces query parameters witht he value they reference,
        // or the initial value if the parameter is not a reference
        var vals = replaceParamsWithValues($scope.queries[field].params);
        // execute the named query (stored in XML file) with the parameter values
        $http.get("/scripts/php/Query.php?Query=" + encodeURIComponent($scope.queries[field].name) + "&Params=" + encodeURIComponent(JSON.stringify(vals)))
        .success(
        function (resp) {
            // if successful, update the options with the response array
            // angular will automatically reflect those changes in the DOM
            $scope.queries[field].options = resp;
        });
    };

    var replaceParamsWithValues = function (params) {
        var results = [];
        for (var i = 0, l = params.length; i < l; ++i) {
            // if the parameter is a reference to another input (not a static value)
            // then get the value of that reference and push it onto the result array
            if (params[i].ref) {
                var refVal = refNameToValue(params[i].returns, params[i].name);
                results.push(refVal);
            } else {
                // otherwise, just add the static parameter value to the result array
                results.push(params[i].name);
            }
        }
        return results;
    };

    var refNameToValue = function (type, refName) {
        switch (type) {
            case 'value':
                // you can just use angular's internal value in the case that
                // the reference is by value
                var refVal = $scope.fields[refName];
                break;
            case 'text':
                // for a text value, you have to get the input that corresponds
                // to that field, then get the text of the selected option
                // TODO: allow this to handle inputs as well
                var refEl = getFieldEl(refName).find('option:selected');
                var refVal = refEl.text();
                break;
        }
        return refVal;
    };

    // don't even ask, it's crazy.
    var watchSelects = function () {
        for (var q in $scope.queries) {
            var prms = $scope.queries[q].params;
            // if this query has at least one parameter
            if (prms.length > 0) {
                // the last element is always the name of the field
                // that triggers this query when it is updated
                var lastEl = prms.slice(-1).pop();
                // the name of the field we want to watch is the
                // name of the reference the parameter refers to
                var watch = lastEl.name;
                // $scope.getOptions('nameOfQueryFieldHere')
                var updateStr = "getOptions('" + q + "')";
                // evaluating the anonymous function with the above text as an argument
                // sets a watch on the field which will trigger the query
                // when that field changes, the string above is eval'd
                // which gets the new options
                (function (str) {
                    $scope.$watch("fields['" + watch + "']", function () {
                        eval(str);
                    });
                })(updateStr)
            }
        }
    };

    $scope.open = function () {
        // if valid, set id equal to the id input by the user
        var id = prompt('Enter the id of the form you would like to open');
        if (!(id == undefined || isNaN(id))) {
            $scope.id = id;
        }
        $http({
            method: "POST",
            url: "/scripts/php/Open.php",
            data: getFormDataString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(
        function (resp) {
            if (resp !== null && typeof resp === 'object') {
                $scope.hasRecord = true;
                $scope.id = Number(resp[pk]);
                // remove the primary key (pk) value from the response object
                // so that it isn't sent on update / submit
                delete resp[pk];
                // for each key in the response
                // if an element bound to that field exists
                // set that fields value to the value
                // returned by the server
                for (var v in resp) {
                    if (getFieldEl(v)) {
                        $scope.fields[v] = resp[v];
                    }
                }
                // if this form has a sketch (SketchURL is the standard column name)
                // then render that sketch
                if (resp["SketchURL"] != undefined) {
                    $scope.fields["SketchURL"] = resp["SketchURL"];
                    showSketch($scope.fields["SketchURL"]);
                }
                // JSON arrays are used for multi-selects, the conversion of JSON text
                // in this context, to an array, appears to be automatic
                // other conversions are done by the formatSrvToClient function
                formatSrvToClient();
            } else {
                alert(name + " number " + $scope.id + " does not exist!");
            }
        });
    };

    var getFieldEl = function (field) {
        // returns the field when a matching input exists
        // otherwise, returns false
        // useful because it can be checked as 
        // if (fieldVar = getFieldEl(f))
        var fe = $('[ng-model="fields[\'' + field + '\']"]');
        if (fe.length !== 0) {
            return fe;
        } else {
            return false;
        }
    };

    var showSketch = function (sketchURL) {
        var sketchArea = $("canvas");
        var sketchCtx = sketchArea[0].getContext("2d");

        var img = new Image();
        // string is invalid URL if spaces are not
        // replaced with +
        img.src = sketchURL.replace(/ /g, "+");
        img.onload = function () {
            sketchCtx.drawImage(img, 0, 0);
        }
    };

    var formatSrvToClient = function () {
        for (var k in $scope.fields) {
            f = $scope.fields[k];
            // if the data from the server is null or undefined, set the value to blank
            // otherwise, convert to a string ("" + val) (implicit conversion)
            if (f == null || f == undefined) {
                $scope.fields[k] = "";
            } else {
                $scope.fields[k] = "" + f;
            }
            // if an input (select, textarea, input)
            // has a model with field name 'f' then 
            // convert it to the type appropriate for
            // that input
            var scopeField;
            if (scopeField = getFieldEl(k)) {
                switch (scopeField.attr("type")) {
                    case "date":
                    case "time":
                    case "datetime-local":
                        $scope.fields[k] = new Date(Date.parse(f));
                        break;
                    case "number":
                    case "range":
                    case "checkbox":
                        $scope.fields[k] = Number(f);
                        break;
                }
            }
        }
    };

    $scope.update = function () {
        updateOrSubmit(true);
    };

    $scope.submit = function () {
        updateOrSubmit(false);
    };

    var updateOrSubmit = function (updating) {
        if (formIsValid()) {
            emailBody = alterHTMLForEmail();
            formatClientToSrv();
            $http({
                method: "POST",
                url: "/scripts/php/" + (updating ? "Update" : "Submit") + ".php",
                data: fieldsToRequestString() + "&" + getFormDataString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .success(
            function (resp) {
                $(document.body).html(resp);
            });
        } else {
            alert("Some inputs are not valid, these should appear highlighted in red. Fill these out to submit the form.");
        }
    };

    var formIsValid = function () {
        return $.makeArray($("select, input, textarea")).reduce(
            function (p, c) {
                return (p && (([].indexOf.call(document.querySelectorAll(":invalid"), c) == -1) || $(c).is(':hidden')));
            }, true);
    };

    var formatClientToSrv = function () {
        for (var k in $scope.fields) {
            var f = $scope.fields[k];
            // if the data on the client is null or undefined, set the value to blank
            // otherwise, conver to a string ("" + val)
            if (f == null || f == undefined) {
                f = "";
            }
            // if an input (select, textarea, input)
            // has a model with field name 'f' then 
            // convert it to the format appropriate for
            // sql server, based on the input type
            var scopeField;
            if (scopeField = getFieldEl(f)) {
                switch (scopeField.attr("type")) {
                    // try to convert to ISO format
                    // if the date is not valid, set
                    // it blank
                    case "date":
                        try {
                            $scope.fields[k] = f.toISOString().split("T")[0] + " 00:00:00.000";
                        } catch (e) {
                            $scope.fields[k] = "";
                        }
                        break;
                    case "datetime-local":
                        $scope.fields[k].setHours(f.getHours() - 5);
                        try {
                            $scope.fields[k] = f.toISOString().replace("T", " ").replace("Z", "");
                        } catch (e) {
                            $scope.fields[k] = "";
                        }
                        break;
                    case "time":
                        $scope.fields[k].setHours(f.getHours() - 5); // -5 sets to EST
                        try {
                            $scope.fields[k] = f.toISOString().split("T")[1].replace("Z", "");
                        } catch (e) {
                            $scope.fields[k] = "";
                        }
                        break;
                }
            }
        }
    };

    var getFormDataString = function () {
        // creates a URL encoded JSON string
        // containing the data indentifying the form
        // this data is passed to PHP scripts
        // for opening a form and getting the next ID
        var dataObj = {
            Name: name,
            Table: table,
            PK: pk,
            ID: $scope.id,
            Contacts: contacts.join(";"),
            EmailBody: emailBody,
            Connection: connection
        }
        return "FormData=" + encodeURIComponent(JSON.stringify(dataObj));
    };

    var fieldsToRequestString = function () {
        // creates a URL encoded JSON string
        // containing the field data for this form
        // this data is passed to PHP scripts
        // for updating and submitting
        return "Fields=" + encodeURIComponent(JSON.stringify($scope.fields));
    };

    $scope.clear = function () {
        window.location.reload();
    };

    $scope.$on('uploadImage', function (event, args) { // args = { name: c, line: y, URI: z }
        // send data from asynchronously uploaded image (as image URI)
        // to PHP script which will write data to file
        if (args.name != "" && args.URI != "") {
            $http({
                method: "POST",
                url: "/scripts/php/SaveImage.php",
                data: "Image=" + encodeURIComponent(args.URI) + "&FileName=" + encodeURIComponent(args.name) + "&Line=" + encodeURIComponent(args.line) + "&" + getFormDataString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .success(alert);
        }
    });

    $scope.saveSketch = function (e) {
        // puts sketch data in sketchurl field
        // generally activated by leaving a canvas
        // sketch area
        // string is invalid URL if spaces are not
        // replaced with +
        $scope.fields["SketchURL"] = e.target.toDataURL().replace(/ /g, "+");
    };

    //updates the contacts list
    $scope.$watchCollection("[fields['PlantID'], fields['DepartmentID'], fields['ZoneID']]", function (n, o) {

        getSupervisorEmailsByLocation(o[0], o[1], o[2],
            function (resp) {
                var respArray = objectValuesToArray(resp);
                removeContacts(respArray);
            });

        getSupervisorEmailsByLocation(n[0], n[1], n[2],
            function (resp) {
                var respArray = objectValuesToArray(resp);
                addContacts(respArray);
            });
        
    }, true);

    var getSupervisorEmailsByLocation = function (plantid, deptid, zoneid, callback) {
        $http.get("/scripts/php/Query.php?Query=SupervisorEmailsByLocation&Params=" + encodeURIComponent(JSON.stringify([plantid || "1", deptid || "0", zoneid || "0"])))
        .success(callback)
    };

    var removeContacts = function (arr) {
        for (var i = 0, l = arr.length; i < l; ++i) {
            var index = contacts.indexOf(arr[i]);
            if (index > -1) {
                contacts.splice(index, 1);
            }
        }
        //console.log($scope.contacts);
    };

    var addContacts = function (arr) {
        contacts = contacts.concat(arr);
        //console.log($scope.contacts);
    };
}

// if you don't know what this does,
// get the hell out of here
app.controller("Form", Form);