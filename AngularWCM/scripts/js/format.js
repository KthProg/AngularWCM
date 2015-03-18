function Formatter() {
}

Formatter.stringToJSObj = function (val, type) {
    if (val === "null" || val === null || val === undefined) {
        return null;
    }
    if (['char', 'nchar', 'text', 'ntext', 'nvarchar', 'varchar'].indexOf(type) > -1) {
        return String(val);
    } else if (['decimal', 'numeric', 'float', 'real', 'int', 'bigint', 'smallint', 'tinyint', 'money', 'smallmoney', 'bit'].indexOf(type) > -1) {
        return Number(val);
    } else if (type == 'time') {
        try {
            var timePieces = val.split(":")
            var secPieces = timePieces[2].split(".");
            var d = new Date();
            d.setHours(Number(timePieces[0]));
            d.setMinutes(Number(timePieces[1]));
            d.setSeconds(Number(secPieces[0]));
            d.setMilliseconds(Number(secPieces[1]));
            return d;
        } catch (e) {
            console.log(e);
            return null;
        }
        return d;
    } else if (['date', 'datetimeoffset'].indexOf(type) > -1) {
        try {
            var d = new Date(Date.parse(val));
            d = this.fromLocalDateTime(d);
            return d;
        } catch (e) {
            console.log(e);
            return null;
        }
    } else if (['datetime', 'datetime2', 'smalldatetime'].indexOf(type) > -1) {
        try {
            var d = new Date(Date.parse(val));
            return d;
        } catch (e) {
            console.log(e);
            return null;
        }
    } else {
        return null;
    }
};

Formatter.jsObjToString = function (val, type) {
    if (val === "null" || val === null || val === undefined) {
        return null;
    }
    if (['char', 'nchar', 'text', 'ntext', 'nvarchar', 'varchar', 'decimal', 'numeric', 'float', 'real', 'int', 'bigint', 'smallint', 'tinyint', 'money', 'smallmoney', 'bit'].indexOf(type) > -1) {
        return String(val);
    } else if (['date', 'time', 'datetime', 'datetime2', 'datetimeoffset', 'smalldatetime'].indexOf(type) > -1) {
        try {
            var tm = val.getTime();
            var d = new Date(tm);
            d = this.toLocalDateTime(d);
            var datetimeStr = d.toISOString().replace("T", " ").replace("Z", "");
        } catch (e) {
            //console.log(e);
            return null;
        }

        if (type == 'date') {
            return datetimeStr.split(" ")[0];
        } else if (type == 'time') {
            return datetimeStr.split(" ")[1];
        } else if (['datetime', 'datetime2', 'datetimeoffset', 'smalldatetime'].indexOf(type) > -1) {
            return datetimeStr;
        }
    } else {
        return null;
    }
};

Formatter.getDefaultValueForType = function (type) {
    if (['char', 'nchar', 'text', 'ntext', 'nvarchar', 'varchar'].indexOf(type) > -1) {
        return "";
    } else if (['decimal', 'numeric', 'float', 'real', 'int', 'bigint', 'smallint', 'tinyint', 'money', 'smallmoney', 'bit'].indexOf(type) > -1) {
        return 0;
    } else if (['time', 'date', 'datetime', 'datetime2', 'datetimeoffset', 'smalldatetime'].indexOf(type) > -1) {
        return new Date();
    }
};

Formatter.preventNullsIfNeccessary = function (val, type, nullable) {
    if (val !== null) return val;
    if (!nullable) return Formatter.getDefaultValueForType(type);
    return val;
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