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

function alterHTMLForEmail() {
    var currentHTML = "<html>\r\n\t<head>\r\n\t\t<style>\r\n";
    //add style rules
    currentHTML += getAllCSS();
    currentHTML += "\t\t</style>\r\n\t</head>\r\n\t<body>\r\n";
    currentHTML += $(document.body).html();
    $("input, select, textarea").each(function () {
        //regex is basically: <tagname(anything)field['whatever'](anything)(/> or > or </tagname>)
        //which essentially finds the element that's bound to that model field
        //the replace(],\\]) and replace([, \\[) are to escape the special characters [ and ] in the regex.
        var thisRegex = "<" + $(this).prop("tagName") + ".*" + $(this).attr("ng-model").replace("]", "\\]").replace("[", "\\[") + ".*(/>|>|</" + $(this).prop("tagName") + ">)";
        //the input is replaced with a textarea containing its value (if a select, then the selected text)
        currentHTML = currentHTML.replace(new RegExp(thisRegex, "i"), "<textarea>" + getInputValue($(this)) + "</textarea>");
    });
    currentHTML += "\t</body>\r\n</html>";
    
    return currentHTML;
}

function getInputValue(jqEl) {
    switch (jqEl.prop("tagName")) {
        case "SELECT":
            return jqEl.children("option:selected").text();
            break;
        case "INPUT":
        case "TEXTAREA":
            return jqEl.val()
            break;
    }
}

function getAllCSS() {
    var allCSS = "";
    for (var i = 0, l = document.styleSheets.length; i < l; ++i) {
        if (document.styleSheets[i].cssRules) { // if this css doc has any rules (sometimes it's null)
            for (var j = 0, l2 = document.styleSheets[i].cssRules.length; j < l2; ++j) {
                allCSS += document.styleSheets[i].cssRules[j].cssText;
            }
        }
    }
    return allCSS;
}