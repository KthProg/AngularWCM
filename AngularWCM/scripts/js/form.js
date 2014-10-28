function Form ($scope, $http) {

    $scope.fields = {};
    $scope.queries = {};

    $scope.name = "";
    $scope.table = "";
    $scope.pk = "";
    $scope.id = -1;
    $scope.contacts = [];
    $scope.emailBody = "";
    $scope.connection = "";

    $scope.hasRecord = false;
    //$scope.sendEmail = true;

    // given a form name, fetches the rest of the necessary data
    // from a JSON file. also sets the ID to the next ID (getMaxID)
    // gets the inital options for selects with no parameters
    // and watches the selects for changes so that it can update
    // their options asynchronously
    $scope.setFormData = function (name) {
        $scope.name = name;
        $http.get("/json/FormData.json")
        .success(function (resp) {
            $scope.connection = resp[name]["Connection"];
            $scope.table = resp[name]["Table"];
            $scope.pk = resp[name]["PK"];
            // concats in case Zone foremen emails are being set (as opposed to setting it directly)
            $scope.addContacts(resp[name]["Emails"]);
            $scope.queries = resp[name]["Queries"];
            $scope.getMaxID();
            $scope.getInitialOptions();
            $scope.watchSelects();
        });
    };

    $scope.getMaxID = function () {
        $http({
            method: "POST",
            url: "/scripts/php/getMaxID.php",
            data: $scope.fieldsToRequestString() + "&" + $scope.getFormDataString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(
        function (resp) {
            // set ID to one more than ther Max ID (new form)
            $scope.id = Number(++resp);
        });
    };

    $scope.getInitialOptions = function () {
        // get options for all selects who's queries have no parameters
        for (var q in $scope.queries) {
            if ($scope.queries[q].params.length == 0) {
                $scope.getOptions(q);
            }
        }
    };

    $scope.getOptions = function (field) {
        // TODO: simplify the query process

        // set vals to an array containing the values of the 
        // parameters (from other selects) including static values
        // non static values are designated by _Reference_
        // in the master JSON file
        var vals = $scope.replaceParamsWithValues($scope.queries[field].params);
        // execute the named query (stored in XML file) with the parameter values
        $http.get("/scripts/php/Query.php?Query=" + encodeURIComponent($scope.queries[field].name) + "&Params=" + encodeURIComponent(JSON.stringify(vals)))
        .success(
        function (resp) {
            // if successful, update the options with the response array
            // angular will automatically reflect those changes in the DOM
            $scope.queries[field].options = resp;
        });
    };

    $scope.replaceParamsWithValues = function (params) {
        var results = [];
        for (var i = 0, l = params.length; i < l; ++i) {
            // basically just gets the text between the first and last
            // underscore. If there are no underscores, then the parameter
            // is a static value, and it will return false
            var refName = $scope.paramToRefName(params[i]);
            // if the parameter was a reference to another input (not a static value)
            // then get the value of that reference and push it onto the result array
            if (refName !== false) {
                // params[i][0] is always the 'reference type'
                // _ is default, so it is a value reference
                // v is also a value reference
                // t means it is a text reference
                // so it will use the text of the selected option of the reference
                // rather than the value
                refVal = $scope.refNameToValue(params[i][0], refName);
                results.push(refVal);
            } else {
                // otherwise, just add the static parameter value to the result array
                results.push(params[i]);
            }
        }
        return results;
    }

    $scope.paramToRefName = function (param) {
        var firstUnderscore = param.indexOf("_");
        // all parameters should start with either
        // _, v_ or t_
        // this finds the first _, if it's within the first 2 characters (0 or 1)
        // then gets the text between that and 1 character before the end
        // essentially removing the ending _ that should be there
        // and returns the text in-between -- the name of the reference
        if ([0, 1].indexOf(firstUnderscore) > -1) {
            var refName = param.substring(firstUnderscore + 1, param.length - 1);
            return refName;
        } else {
            return false;
        }
    };

    // type refers to the first letter of the parameter
    // for instance 'v_field1' is a reference to the text
    // of the selected option of the select bound to the 
    // field 'field1'
    $scope.refNameToValue = function (type, refName) {
        switch (type) {
            case 'v':
            case '_':
            default:
                // you can just use angular's internal value in the case that
                // the reference is by value
                var refVal = $scope.fields[refName];
                break;
            case 't':
                // for a text value, you have to get the input that corresponds
                // to that field, then get the text of the selected option
                var refEl = $scope.getFieldEl(refName).find('option:selected');
                var refVal = refEl.text();
                break;
        }
        return refVal;
    };

    // don't even ask, it's crazy.
    $scope.watchSelects = function () {
        for (var q in $scope.queries) {
            var prms = $scope.queries[q].params;
            // if this query has at least one parameter
            if (prms.length > 0) {
                // the last element is always the name of the field
                // that triggers this query when it is updated
                var lastEl = prms.slice(-1).pop();
                // the name of the field we want to watch is the
                // name of the reference the parameter refers to
                var watch = $scope.paramToRefName(lastEl);
                // $scope.getOptions('nameOfQueryFieldHere')
                var updateStr = "$scope.getOptions('" + q + "')";
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
            data: $scope.getFormDataString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(
        function (resp) {
            if (resp !== null && typeof resp === 'object') {
                $scope.hasRecord = true;
                $scope.id = Number(resp[$scope.pk]);
                // remove the primary key (pk) value from the response object
                // so that it isn't sent on update / submit
                delete resp[$scope.pk];
                // for each key in the response
                // if an element bound to that field exists
                // set that fields value to the value
                // returned by the server
                for (var v in resp) {
                    if ($scope.getFieldEl(v)) {
                        $scope.fields[v] = resp[v];
                    }
                }
                // if this form has a sketch (SketchURL is the standard column name)
                // then render that sketch
                if (resp["SketchURL"] != undefined) {
                    $scope.fields["SketchURL"] = resp["SketchURL"];
                    $scope.showSketch($scope.fields["SketchURL"]);
                }
                // JSON arrays are used for multi-selects, the conversion of JSON text
                // in this context, to an array, appears to be automatic
                // other conversions are done by the formatSrvToClient function
                $scope.formatSrvToClient();
            } else {
                alert($scope.name + " number " + $scope.id + " does not exist!");
            }
        });
    };

    $scope.getFieldEl = function (field) {
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

    $scope.showSketch = function (sketchURL) {
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

    $scope.formatSrvToClient = function () {
        for (var f in $scope.fields) {
            // if the data from the server is null or undefined, set the value to blank
            // otherwise, convert to a string ("" + val) (implicit conversion)
            if ($scope.fields[f] == null || $scope.fields == undefined) {
                $scope.fields[f] = "";
            } else {
                $scope.fields[f] = "" + $scope.fields[f];
            }
            // if an input (select, textarea, input)
            // has a model with field name 'f' then 
            // convert it to the type appropriate for
            // that input
            var scopeField;
            if (scopeField = $scope.getFieldEl(f)) {
                switch (scopeField.attr("type")) {
                    case "date":
                    case "time":
                    case "datetime-local":
                        $scope.fields[f] = new Date(Date.parse($scope.fields[f]));
                        break;
                    case "number":
                    case "range":
                    case "checkbox":
                        $scope.fields[f] = Number($scope.fields[f]);
                        break;
                }
            }
        }
    }

    $scope.update = function () {
        if ($scope.formIsValid()) {
            $scope.formatClientToSrv();
            $http({
                method: "POST",
                url: "/scripts/php/Update.php",
                data: $scope.fieldsToRequestString() + "&" + $scope.getFormDataString(),
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

    $scope.submit = function () {
        if ($scope.formIsValid()){
            $scope.formatClientToSrv();
            $http({
                method: "POST",
                url: "/scripts/php/Submit.php",
                data: $scope.fieldsToRequestString() + "&" + $scope.getFormDataString(),
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

    $scope.formIsValid = function () {
        return $.makeArray($("select, input, textarea")).reduce(
            function (p, c) {
                return (p && (([].indexOf.call(document.querySelectorAll(":invalid"), c) == -1) || $(c).is(':hidden')));
            }, true);
    };

    $scope.formatClientToSrv = function () {
        for (var f in $scope.fields) {
            // if the data on the client is null or undefined, set the value to blank
            // otherwise, conver to a string ("" + val)
            if ($scope.fields[f] == null || $scope.fields[f] == undefined) {
                $scope.fields[f] = "";
            }
            // if an input (select, textarea, input)
            // has a model with field name 'f' then 
            // convert it to the format appropriate for
            // sql server, based on the input type
            var scopeField;
            if (scopeField = $scope.getFieldEl(f)) {
                switch (scopeField.attr("type")) {
                    // try to convert to ISO format
                    // if the date is not valid, set
                    // it blank
                    case "date":
                    case "datetime-local":
                        try {
                            $scope.fields[f] = $scope.fields[f].toISOString().replace("T", " ").replace("Z", "");
                        } catch (e) {
                            $scope.fields[f] = "";
                        }
                        break;
                }
            }
        }
    }

    $scope.getFormDataString = function () {
        // creates a URL encoded JSON string
        // containing the data indentifying the form
        // this data is passed to PHP scripts
        // for opening a form and getting the next ID
        var dataObj = {
            Name: $scope.name,
            Table: $scope.table,
            PK: $scope.pk,
            ID: $scope.id,
            Contacts: $scope.contacts.join(";"),
            EmailBody: $scope.emailBody,
            Connection: $scope.connection
        }
        return "FormData=" + encodeURIComponent(JSON.stringify(dataObj));
    };

    $scope.fieldsToRequestString = function () {
        // creates a URL encoded JSON string
        // containing the field data for this form
        // this data is passed to PHP scripts
        // for updating and submitting
        return "Fields=" + encodeURIComponent(JSON.stringify($scope.fields));
    };

    $scope.clear = function () {
        // may be replaced with refresh code
        // may not behave as the user expects
        // (id is not reset)
        /*for (var key in $scope.fields) {
            if ($scope.fields.hasOwnProperty(key)) {
                $scope.fields[key] = "";
            }
        }*/
        //replaced with refresh code
        window.location.reload();
    };

    $scope.$on('uploadImage', function (event, args) { // args = { name: c, line: y, URI: z }
        // send data from asynchronously uploaded image (as image URI)
        // to PHP script which will write data to file
        if (args.name != "" && args.URI != "") {
            $http({
                method: "POST",
                url: "/scripts/php/SaveImage.php",
                data: "Image=" + encodeURIComponent(args.URI) + "&FileName=" + encodeURIComponent(args.name) + "&Line=" + encodeURIComponent(args.line) + "&" + $scope.getFormDataString(),
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

    // updates the email HTML rendering of the form
    // when a field is changed, but only works
    // when one field is changed at a time, otherwise
    // it may update the HTML before all of the fields are updated
    // such as when a form is opened.
    $scope.$watch("fields", function (n, o) {
        $scope.emailBody = alterHTMLForEmail();
        var oldVals = [o["PlantID"] || "1",o["DepartmentID"],o["ZoneID"]];
        // if the old zone id is valid (on change) then remove the emails associated with that zone id
        if (oldVals) {
            $http.get("/scripts/php/Query.php?Query=SupervisorEmailsByLocation&Params=" + encodeURIComponent(JSON.stringify(oldVals)))
            .success(
            function (resp) {
                var respArray = objectValuesToArray(resp);
                $scope.removeContacts(respArray);
            });
        }
        var newVals = [n["PlantID"] || "1", n["DepartmentID"], n["ZoneID"]];
        // if the new zone id is valid, then add the emails associated with that zone id
        if (newVals) {
            $http.get("/scripts/php/Query.php?Query=SupervisorEmailsByLocation&Params=" + encodeURIComponent(JSON.stringify(newVals)))
            .success(
            function (resp) {
                var respArray = objectValuesToArray(resp);
                $scope.addContacts(respArray);
            });
        }
    }, true);

    $scope.removeContacts = function (arr) {
        for (var i = 0, l = arr.length; i < l; ++i) {
            var index = $scope.contacts.indexOf(arr[i]);
            if (index > -1) {
                $scope.contacts.splice(index, 1);
            }
        }
    };

    $scope.addContacts = function (arr) {
        $scope.contacts = $scope.contacts.concat(arr);
    };
}

// if you don't know what this does,
// get the hell out of here
app.controller("Form", Form);