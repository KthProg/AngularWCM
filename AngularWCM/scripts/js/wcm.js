var app = angular.module("wcm", []);

function logError(xhr, status, error) {
    console.log(xhr);
    console.log(status + " : " + error);
    console.log(this);
}