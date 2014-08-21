//
// ANGULAR (FORM) FUNCTIONS! ================================================
//

var app = angular.module("wcm", []);

app.controller("Form",
    function ($scope, $http) {

        $scope.$watch("lastImage.URI", function (n, o) {
            $scope.uploadImage();
        });

        $scope.lastImage = {
            name: "",
            URI: ""
        };

        $scope.fields = {};
        $scope.queries = [];

        $scope.name = "";
        $scope.table = "";
        $scope.pk = "";
        $scope.id = -1;
        $scope.contacts = "";
        $scope.emailBody = "";
        $scope.connection = "";

        $scope.hasRecord = false;
        $scope.sendEmail = true;

        $scope.setFormData = function (name) {
            $scope.name = name;
            $http.get("/json/FormData.json")
            .success(function (resp) {
                $scope.connection = resp[name]["Connection"];
                $scope.table = resp[name]["Table"];
                $scope.pk = resp[name]["PK"];
                $scope.contacts = resp[name]["Emails"];
                $scope.queries = resp[name]["Queries"];

                $scope.getInitialOptions();
                $scope.watchSelects();
            });
        };

        $scope.getInitialOptions = function () {
            for(var q in $scope.queries){
                if ($scope.queries[q].params.length == 0) {
                    $scope.getOptions(q);
                }
            }
        };

        $scope.paramToRefName = function (param) {
            if (param[0] == "_") {
                var refName = param.substr(1, param.length - 2);
                return refName;
            } else {
                return false;
            }
        };

        $scope.getOptions = function (field) {
            replaceParamsWithValues = function (params) {
                var results = [];
                for (var i = 0, l = params.length; i < l; ++i) {
                    var refName = $scope.paramToRefName(params[i]);
                    if (refName !== false) {
                        var refVal = $scope.fields[refName];
                        results.push(refVal);
                    } else {
                        results.push(params[i]);
                    }
                }
                return results;
            }
            var vals = replaceParamsWithValues($scope.queries[field].params);
            $http.get("/scripts/php/Query.php?Query=" + $scope.queries[field].name + "&Params=" + JSON.stringify(vals))
            .success(
            function (resp) {
                $scope.queries[field].options = resp;
            });
        };

        $scope.open = function () {
            var id = prompt('Enter the id of the form you would like to open');
            if (!(id == undefined || isNaN(id))) {
                $scope.id = id;
            }
            $http.get("/scripts/php/Open.php?" + $scope.getFormDataString())
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
                    $scope.formatSrvToClient();
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

        $scope.submit = function () {
            $scope.formatClientToSrv();
            $http({
                method: "POST",
                url: "/scripts/php/Submit.php?" + $scope.getFormDataString(),
                data: $scope.fieldsToRequestString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .success(
            function (resp) {
                $(document.body).html(resp);
            });
        };

        $scope.update = function () {
            $scope.formatClientToSrv();
            $http({
                method: "POST",
                url: "/scripts/php/Update.php?" + $scope.getFormDataString(),
                data: $scope.fieldsToRequestString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .success(
            function (resp) {
                $(document.body).html(resp);
            });
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

        $scope.fieldsToRequestString = function () {
            var rStr = "";
            for (var f in $scope.fields) {
                rStr += f + "=" + $scope.fields[f] + "&";
            }
            rStr = rStr.substr(0, rStr.length - 1);
            return rStr;
        };

        $scope.getFormDataString = function () {
            return "Name=" + $scope.name + "&Table=" + $scope.table + "&PK=" + $scope.pk + "&ID=" + $scope.id + "&Connection=" + $scope.connection + "&Contacts=" + $scope.contacts + "&EmailBody=" + $scope.emailBody + "&SendEmail=" + $scope.sendEmail;
        };

        $scope.clear = function () {
            for (var key in $scope.fields) {
                if ($scope.fields.hasOwnProperty(key)) {
                    $scope.fields[key] = "";
                }
            }
        };

        $scope.uploadImage = function () {
            if ($scope.lastImage.name != "" && $scope.lastImage.URI != "") {
                $http({
                    method: "POST",
                    url: "/scripts/php/SaveImage.php?" + $scope.getFormDataString(),
                    data: "Image=" + $scope.lastImage.URI + "&FileName=" + $scope.lastImage.name,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .success(alert);
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
                    (function(str){
                        $scope.$watch("fields['" + watch + "']", function () {
                            eval(str);
                        });
                    })(updateStr)
                }
            }
        };
    });

//
// IMAGE FUNCTIONS! =====================================================
//

function changeImage(input, imgEl) {
    var isBlank = (input.val() == "");
    imgEl.attr("src", (isBlank ? "res/upload.png" : "res/uploadgreen.png"));
    //console.log("src att changed to " + (isBlank ? "res/upload.png" : "res/uploadgreen.png"));
}


function imgToBase64(imgEl, hiddenEl) {

    var scope = angular.element($("[ng-app='wcm']")).scope();
    var fileReader = new FileReader();

    fileReader.onload = function (e) {
        scope.lastImage.URI = e.target.result;
        scope.$apply();
    }

    scope.lastImage.name = imgEl.files[0].fileName || imgEl.files[0].name;
    fileReader.readAsDataURL(imgEl.files[0]);
}

//
// SKETCH FUNCTIONS! ====================================================
//

/*
This doesn't work correctly if the sketch area has a size set manually
i.e. in CSS or some other attribute
*/

function drawSketch() {
    var sketchArea = $("#sketchArea");
    var sketchCtx = sketchArea[0].getContext("2d");

    var off = sketchArea.offset();

    var relX = (mouse.x - off.left);
    var relY = (mouse.y - off.top);

    sketchCtx.fillStyle = $("#colorPicker").val();
    if (mouse.left) {
        sketchCtx.fillRect(relX, relY, $("#brushSize").val(), $("#brushSize").val());
    }
    //console.log($("#colorPicker").val());
    //console.log("X: " + relX + ", Y: " + relY);
}

function showSketch(sketchURL) {
    var sketchArea = $("#sketchArea");
    var sketchCtx = sketchArea[0].getContext("2d");

    var img = new Image();
    img.src = sketchURL;
    img.onload = function () {
        sketchCtx.drawImage(img, 0, 0);
    }
}

function clearSketch() {
    var sketchArea = $("#sketchArea");
    var sketchCtx = sketchArea[0].getContext("2d");
    sketchCtx.clearRect(0, 0, sketchArea.width(), sketchArea.height());
}

function saveSketch() {
    var dataURL = $("#sketchArea")[0].toDataURL();
    $("#sketchUrl").val(dataURL);
}

var mouse = { x: 0, y: 0, left: false };

document.addEventListener('mousemove', function (e) {
    mouse.x = e.pageX || e.clientX;
    mouse.y = e.pageY || e.clientY;
}, false);

document.addEventListener('mousedown', function (e) {
    mouse.left = (e.button === 0);
}, false);

document.addEventListener('mouseup', function (e) {
    mouse.left = false;
}, false);