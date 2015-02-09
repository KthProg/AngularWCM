function ImageUpload(id) {
    this.id = id;
    this.uri = "";
}

ImageUpload.prototype.resize = function () {
    var MAX_WIDTH = 800;
    var MAX_HEIGHT = 600;

    var img = new Image();
    img.src = this.uri;
    var width = img.width;
    var height = img.height;

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    this.uri = canvas.toDataURL("image/jpeg", 0.5).replace(/ /g, "+");

    canvas = null;
    img = null;
};

ImageUpload.prototype.save = function () {
    var fu = this;
    var fileInput = document.getElementById(this.id);
    var reader = new FileReader();
    reader.onload = function (e) {
        fu.uri = e.target.result.replace(/ /g, "+");
        fu.resize();
        // register changes in angular
        angular.element(document.querySelector('[ng-app=wcm]')).scope().$apply();
    };
    reader.readAsDataURL(fileInput.files[0]);
};