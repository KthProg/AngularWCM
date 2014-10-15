//
// ANGULAR (FORM) FUNCTIONS! ================================================
//

var app = angular.module("wcm", []);

//
// IMAGE FUNCTIONS! =====================================================
//
function changeImage(input, imgEl) {
    var isBlank = (input.val() == "");
    imgEl.attr("src", (isBlank ? "res/upload.png" : "res/uploadgreen.png"));
    //console.log("src att changed to " + (isBlank ? "res/upload.png" : "res/uploadgreen.png"));
}

function imgToBase64(imgEl, line) {

    var fileReader = new FileReader();

    fileReader.onload = function (e) {
        args = {
            name: name,
            line: line,
            URI: e.target.result
        };
        angular.element("[ng-app='wcm']").injector().get('$rootScope').$broadcast('uploadImage', args);
    }

    var name = imgEl.files[0].fileName || imgEl.files[0].name;
    var line = line;
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
    var sketchArea = $("canvas");
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

function clearSketch() {
    var sketchArea = $("canvas");
    var sketchCtx = sketchArea[0].getContext("2d");
    sketchCtx.clearRect(0, 0, sketchArea.width(), sketchArea.height());
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

function getInputValue(jqEl) {
    switch(jqEl.prop("tagName")){
        case "SELECT":
            return jqEl.children("option:selected").text();
            break;
        case "INPUT":
        case "TEXTAREA":
            return jqEl.val()
            break;
    }
}

function alterHTMLForEmail() {
    var inputVals = {};
    $("input, select, textarea").each(function () {
        inputVals[$(this).attr("ng-model")] = { val: null, type: null };
        inputVals[$(this).attr("ng-model")]["val"] = getInputValue($(this));
        inputVals[$(this).attr("ng-model")]["tag"] = $(this).prop("tagName");
        inputVals[$(this).attr("ng-model")]["type"] = $(this).attr("type");
    });
    var currentHTML = "<html><head><style>";
    //add style rules
    for (var i = 0, l = document.styleSheets.length; i < l; ++i) {
        if (document.styleSheets[i].cssRules) {
            for (var j = 0, l2 = document.styleSheets[i].cssRules.length; j < l2; ++j) {
                currentHTML += document.styleSheets[i].cssRules[j].cssText;
            }
        }
    }
    currentHTML += "</style></head><body>";
    currentHTML += $(document.body).html();
    for (var k in inputVals) {
        var thisRegex = "<" + inputVals[k].tag + ".*" + k.replace("]", "\\]").replace("[", "\\[") + ".*(/>|>|</" + inputVals[k].tag + ">)";
        currentHTML = currentHTML.replace(new RegExp(thisRegex, "i"), "<textarea>" + inputVals[k].val + "</textarea>");
    }
    currentHTML += "</body></html>";
    
    return currentHTML;
}

function getZoneContacts (zoneID) {
    var foremen = {
        16 : "reese@mayco-mi.com; clay@mayco-mi.com; vernon@VNA1.onmicrosoft.com",
        17 : "selliott@mayco-mi.com; green@njt-na.com; claes@mayco-mi.com",
        18 : "fxake@mayco-mi.com; eweathers@mayco-mi.com; shah@mayco-mi.com",
        19 : "haggerty@mayco-mi.com; sherbutte@njt-na.com; greer@mayco-mi.com"
    };
    var foremenEmails = foremen[zoneID] ? foremen[zoneID] : "";
    return foremenEmails;
};

$(document.body).ready(function () {
    var scope = angular.element($("[ng-app='wcm']")).scope();
    scope.$apply(
        function () {
            scope.$watch("fields", function () {
                scope.emailBody = alterHTMLForEmail();
                //console.log(scope.emailBody);
            }, true);
            scope.$watch("fields['ZoneID']", function (n, o) {
                if (scope.contacts) {
                    if (o && n) {
                        scope.contacts = scope.contacts.replace(getZoneContacts(o), getZoneContacts(n));
                        //console.log(scope.contacts);
                    } else if (n) {
                        scope.contacts += "; " + getZoneContacts(n);
                        //console.log(scope.contacts);
                    }
                }
            });
        });
});