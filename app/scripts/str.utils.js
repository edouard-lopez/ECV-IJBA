/*
Preserve keywords (CUB, COBAN, COBAS, CDC) in uppercase.
@return {string}
*/
function toProperCase(str) {
    var pc =  str.replace(/\w\S*/g, function (s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    });
    return pc.replace(/cub|coban|cobas|cdc/i, function (m) {
        return m.toUpperCase();
    });
}


function idify(s) {
    return s.replace(/[\s'\/]/g, '-').replace(/Œ/, 'oe').toLowerCase();
}