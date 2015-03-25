var app = angular.module("wcm", ['ngSanitize']);

function logError(xhr, status, error) {
    console.log(xhr);
    console.log(status + " : " + error);
    console.log(this);
}