function Formatter() {
}

Formatter.stringToJSObj = function (val, type) {
    if (val == "null" || val == null) {
        return null;
    }
    switch (type) {
        case 'text':
        case 'ntext':
        case 'nvarchar':
        case 'varchar':
            return String(val);
            break;
        case 'time':
            try {
                var timePieces = val.split(":")
                var secPieces = timePieces[2].split(".");
                var d = new Date();
                d.setHours(Number(timePieces[0]));
                d.setMinutes(Number(timePieces[1]));
                d.setSeconds(Number(secPieces[0]));
                d.setMilliseconds(Number(secPieces[1]));
            } catch (e) {
                console.log(e.message);
                return null;
            }
            return d;
            break;
        case 'date':
            try {
                var d = new Date(Date.parse(val));
                d = this.fromLocalDateTime(d);
                return d;
            } catch (e) {
                console.log(e.message);
                return null;
            }
            break;
        case 'datetime':
            try {
                var d = new Date(Date.parse(val));
                return d;
            } catch (e) {
                console.log(e.message);
                return null;
            }
            break;
        case 'double':
        case 'float':
        case 'int':
        case 'bit':
        case 'money':
            return Number(val);
            break;
        default:
            return "";
    }
};

Formatter.jsObjToString = function (val, type) {
    if (val == "null" || val == null) {
        return null;
    }
    switch (type) {
        case 'text':
        case 'ntext':
        case 'nvarchar':
        case 'varchar':
        case 'double':
        case 'float':
        case 'int':
        case 'bit':
        case 'money':
            return String(val);
            break;
        case 'date':
            try {
                var d = new Date(val.getTime());
                d = this.toLocalDateTime(d);
                var datetimeStr = d.toISOString().replace("T", " ").replace("Z", "");
                return datetimeStr.split(" ")[0];
            } catch (e) {
                console.log(e.message);
                return "";
            }
            break;
        case 'time':
            try {
                var d = new Date(val.getTime());
                d = this.toLocalDateTime(d);
                var datetimeStr = d.toISOString().replace("T", " ").replace("Z", "");
                return datetimeStr.split(" ")[1];
            } catch (e) {
                console.log(e.message);
                return "";
            }
            break;
        case 'datetime':
            try {
                var d = new Date(val.getTime());
                d = this.toLocalDateTime(d);
                var datetimeStr = d.toISOString().replace("T", " ").replace("Z", "");
                return datetimeStr;
            } catch (e) {
                console.log(e.message);
                return "";
            }
            break;
        default:
            return "";
    }
};

Formatter.toLocalDateTime = function (UTCDateTime) {
    var ud = UTCDateTime;
    var offset = ud.getTimezoneOffset();
    ud.setMinutes(ud.getMinutes() - offset);
    return ud;
};

Formatter.fromLocalDateTime = function (LocalDateTime) {
    var ld = LocalDateTime;
    var offset = ld.getTimezoneOffset();
    ld.setMinutes(ld.getMinutes() + offset);
    return ld;
};