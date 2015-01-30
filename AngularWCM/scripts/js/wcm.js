var app = angular.module("wcm", []);

app.filter('toArray', function () {
    'use strict';

    return function (obj) {
        console.log(obj);
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).map(function (key) {
            return { k: key, v: obj[key] };
        });
    }
});

function logError(xhr, status, error) {
    console.log(xhr);
    console.log(status + " : " + error);
    console.log(this);
}