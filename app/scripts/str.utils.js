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

function getEpci(centre) {
     for (var e in epci2centre)
         if (epci2centre[e].length > 0)
            for (var c in epci2centre[e]) 
                if (centre == epci2centre[e][c]) return e
}

/**
 * Return the given EPCI and the list of matching centres
 * @param  {string} epci current EPCI
 * @return {array}       list of centre+ current EPCI
 */
function getCentres(epci) {
    var centres = ecpi2centre[epci] || [];
    centres.push(epci);
    return jQuery.unique(centres);
}

/**
 * Format string to be valid XML attribute
 * @param  {string} s input name
 * @return {string}   formatted string
 */
function idify(s) {
    o = s.replace(/[\s\/\']/g, '-')
            .toLowerCase()
            .replace(/Œ|œ/, 'oe')
            .replace(/[éèè]/, 'e')
            .replace(/cdc|centre|transfert/g, '')
            .replace(/-(d[uea]*)-/g, '')
            .replace(/-(l[ea]*)-/g, '-')
            .replace(/[-]+/g, '-')
            .replace(/^-/, '')
    ;
    return o;
}

