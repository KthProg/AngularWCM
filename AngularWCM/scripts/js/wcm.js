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