function Form ($scope, $http) {

    $scope.fields = {};
    $scope.queries = {};

    $scope.name = "";
    $scope.table = "";
    $scope.pk = "";
    $scope.id = -1;
    $scope.contacts = "";
    $scope.emailBody = "";
    $scope.connection = "";

    $scope.hasRecord = false;
    //$scope.sendEmail = true;

    $scope.setFormData = function (name) {
        $scope.name = name;
        $http.get("/json/FormData.json")
        .success(function (resp) {
            $scope.connection = resp[name]["Connection"];
            $scope.table = resp[name]["Table"];
            $scope.pk = resp[name]["PK"];
            $scope.contacts = resp[name]["Emails"];
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
            $scope.id = Number(++resp);
        });
    };

    $scope.getInitialOptions = function () {
        for (var q in $scope.queries) {
            if ($scope.queries[q].params.length == 0) {
                $scope.getOptions(q);
            }
        }
    };

    $scope.getOptions = function (field) {
        //console.log(field);
        var vals = (function replaceParamsWithValues(params) {
            var results = [];
            for (var i = 0, l = params.length; i < l; ++i) {
                var refName = $scope.paramToRefName(params[i]);
                if (refName !== false) {
                    refVal = $scope.refNameToValue(params[i][0], refName);
                    results.push(refVal);
                } else {
                    results.push(params[i]);
                }
            }
            return results;
        })($scope.queries[field].params);
        //console.log(vals);
        $http.get("/scripts/php/Query.php?Query=" + encodeURIComponent($scope.queries[field].name) + "&Params=" + encodeURIComponent(JSON.stringify(vals)))
        .success(
        function (resp) {
            $scope.queries[field].options = resp;
        });
    };

    $scope.refNameToValue  = function (type, refName){
        switch (type) {
            case 'v':
            case '_':
            default:
                var refVal = $scope.fields[refName];
                break;
            case 't':
                var refEl = $scope.getFieldEl(refName).find('option:selected');
                var refVal = refEl.text();
                break;
        }
        return refVal;
    };

    $scope.paramToRefName = function (param) {
        var firstUnderscore = param.search("_");
        if (firstUnderscore == 0 || firstUnderscore == 1) {
            var refName = param.substring(firstUnderscore + 1, param.length - 1);
            return refName;
        } else {
            return false;
        }
    };

    // don't even ask, it's crazy.
    $scope.watchSelects = function () {
        for (var p in $scope.queries) {
            var prms = $scope.queries[p].params;
            if (prms.length > 0) {
                var lastEl = prms.slice(-1).pop();
                var watch = $scope.paramToRefName(lastEl);
                // this line might help you understand
                // console.log("if " + watch + " changes, then update " + p);
                var updateStr = "$scope.getOptions('" + p + "')";
                (function (str) {
                    $scope.$watch("fields['" + watch + "']", function () {
                        eval(str);
                    });
                })(updateStr)
            }
        }
    };

    $scope.open = function () {
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
                // remove the primary key/ pk value from the response array
                delete resp[$scope.pk];
                for (var v in resp) {
                    if ($scope.getFieldEl(v)) {
                        $scope.fields[v] = resp[v];
                    }
                }
                if (resp["SketchURL"] != undefined) {
                    $scope.fields["SketchURL"] = resp["SketchURL"];
                    $scope.showSketch($scope.fields["SketchURL"]);
                }
                var IsJsonString = function (str) {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                }
                $scope.formatSrvToClient();
                /*for (var v in $scope.fields) {
                    if (IsJsonString($scope.fields[v])) {
                        $scope.fields[v] = JSON.parse($scope.fields[v]);
                    }
                }*/
                //console.log($scope.fields);
            } else {
                alert($scope.name + " number " + $scope.id + " does not exist!");
            }
        });
    };

    $scope.getFieldEl = function (field) {
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
        // string is invalid URL is spaces are not
        // replaced with +
        img.src = sketchURL.replace(/ /g, "+");
        img.onload = function () {
            sketchCtx.drawImage(img, 0, 0);
        }
    };

    $scope.formatSrvToClient = function () {
        for (var f in $scope.fields) {
            if ($scope.fields[f] == null || $scope.fields == undefined) {
                $scope.fields[f] = "";
            } else {
                $scope.fields[f] = "" + $scope.fields[f];
            }
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
        if ($.makeArray($("select, input, textarea")).reduce(
            function (p, c) {
                return (p && ($(c).css("background-color") != "rgb(250, 184, 183)"));
        }, true)) {
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
        if ($.makeArray($("select, input, textarea")).reduce(
            function (p, c) {
                return (p && ($(c).css("background-color") != "rgb(250, 184, 183)"));
        }, true)) {
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

    $scope.formatClientToSrv = function () {
        for (var f in $scope.fields) {
            if ($scope.fields[f] == null || $scope.fields[f] == undefined) {
                $scope.fields[f] = "";
            }
            var scopeField;
            if (scopeField = $scope.getFieldEl(f)) {
                switch (scopeField.attr("type")) {
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
        var dataObj = {
            Name: $scope.name,
            Table: $scope.table,
            PK: $scope.pk,
            ID: $scope.id,
            Contacts: $scope.contacts,
            EmailBody: $scope.emailBody,
            Connection: $scope.connection
        }
        return "FormData=" + encodeURIComponent(JSON.stringify(dataObj));
    };

    $scope.fieldsToRequestString = function () {
        return "Fields=" + encodeURIComponent(JSON.stringify($scope.fields));
    };

    $scope.clear = function () {
        for (var key in $scope.fields) {
            if ($scope.fields.hasOwnProperty(key)) {
                $scope.fields[key] = "";
            }
        }
    };

    $scope.$on('uploadImage', function (event, args) { // args = { name: c, line: y, URI: z }
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
        // string is invalid URL is spaces are not
        // replaced with +
        $scope.fields["SketchURL"] = e.target.toDataURL().replace(/ /g, "+");
    };
}

app.controller("Form", Form);