function Sketch(id) {
    this.id = id;
    this.uri = "";
}

Sketch.prototype.render = function () {
    this.clear();
    var canvas = document.getElementById(this.id);
    if (canvas) {
        var sketchCtx = canvas.getContext("2d");
        var img = new Image();
        // string is invalid URL if spaces are not
        // replaced with +
        if (this.uri) {
            img.src = this.uri.replace(/ /g, "+");
            img.onload = function () {
                sketchCtx.drawImage(img, 0, 0);
            };
        }
    }
};

Sketch.prototype.draw = function () {
    var canvas = document.getElementById(this.id);
    var sketchCtx = canvas.getContext("2d");
    var sa = canvas;
    var sc = sketchCtx;

    var top = sa.documentOffsetTop;
    var left = sa.documentOffsetLeft;

    var relX = (mouse.x - left);
    var relY = (mouse.y - top);
    var pRelX = (mouse.prevX - left);
    var pRelY = (mouse.prevY - top);

    sc.strokeStyle = sa.parentNode.querySelector("input[type='color']").value;
    sc.lineWidth = sa.parentNode.querySelector("input[type='number']").value;

    if (mouse.leftDown) {
        sc.beginPath();
        sc.moveTo(pRelX, pRelY);
        sc.lineTo(relX, relY);
        sc.stroke();
    }
};

Sketch.prototype.clear = function () {
    var canvas = document.getElementById(this.id);
    if (canvas) {
        var sketchCtx = canvas.getContext("2d");
        sketchCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
};

Sketch.prototype.save = function () {
    var canvas = document.getElementById(this.id);
    this.uri = canvas.toDataURL().replace(/ /g, "+");
};

//update mouse for sketches

var mouse = { x: 0, y: 0, prevX: 0, prevY: 0, leftDown: false, leftUp: false };

document.addEventListener('mousemove', function (e) {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.pageX || e.clientX;
    mouse.y = e.pageY || e.clientY;
}, false);

document.addEventListener('mousedown', function (e) {
    mouse.leftDown = (e.button === 0);
}, false);

document.addEventListener('mouseup', function (e) {
    mouse.leftDown = false;
}, false);

window.Object.defineProperty(Element.prototype, 'documentOffsetTop', {
    get: function () {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop : 0);
    }
});

window.Object.defineProperty(Element.prototype, 'documentOffsetLeft', {
    get: function () {
        return this.offsetLeft + (this.offsetParent ? this.offsetParent.documentOffsetLeft : 0);
    }
});