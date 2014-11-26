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

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function logError(xhr, status, error) {
    console.log(status + " : " + error);
    console.log(this);
}

function sendNoParamQuery(query) {
    var queryResult;
    $.ajax({
        async: false,
        data: {
            Query: query,
            Params: "[]"
        },
        dataType: "json",
        success: function (data) {
            queryResult = data;
        },
        url: "/scripts/php/Query.php"
    });
    return queryResult;
}

function alterHTMLForEmail()  {
    var currentHTML = "<html>\r\n\t<head>\r\n\t\t<style>\r\n";
    //add style rules
    currentHTML += getAllCSS();
    currentHTML += "\t\t</style>\r\n\t</head>\r\n\t<body>\r\n";
    currentHTML += $(document.body).html();
    $("input, select, textarea").each(function () {
        var model = "", tag = "";
        if ((model = $(this).attr("ng-model"))
            && (tag = $(this).prop("tagName"))
            ) {
            //regex is basically: <tagname(anything)field['whatever'](anything)(/> or > or </tagname>)
            //which essentially finds the element that's bound to that model field
            //the replace(],\\]) and replace([, \\[) are to escape the special characters [ and ] in the regex.
            var thisRegex = "<" + tag + ".*" + model.replace("]", "\\]").replace("[", "\\[") + ".*(/>|>|</" + tag + ">)";
            //the input is replaced with a textarea containing its value (if a select, then the selected text)
            currentHTML = currentHTML.replace(new RegExp(thisRegex, "i"), "<textarea>" + getInputValue($(this)) + "</textarea>");
        }
    });
    currentHTML += "\t</body>\r\n</html>";

    return currentHTML;
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

function objectArrayKeyType(key, objs) {
    return getArrType(objectArrayKeyValues(key, objs));
}

function objectArrayKeyValues(key, objs) {
    return objs.map(function (curr) {
        return curr[key];
    });
}

// filters values which are not of a certain type
// then compares the size of the filtered array
// to the size of the original array. if any values
// were removed, then the array is not entirely 
// of that type, default is string
function getArrType(arr) {
    var numArr = arr.filter(function (n) {
        return !isNaN(n);
    });
    var dateArr = arr.filter(function (n) {
        var d = new Date(n);
        return !isNaN(d.valueOf());
    });
    if (numArr.length === arr.length) {
        return "number";
    }
    if (dateArr.length === arr.length) {
        return "datetime";
    }
    return "string";
};

function convertType(val, typeStr) {
    // convert value based on three types
    // used by google vis
    switch (typeStr) {
        case "number":
            return Number(val);
            break;
        case "datetime":
            return new Date(val);
            break;
        case "string":
            return String(val)
            break
    }
}

function objectValuesToArray(obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}