function getLocalDate() {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    var date = new Date();

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) ;
}

// Export in a way that works with both require() and import
module.exports = {
    getLocalDate,
    default: {
        getLocalDate,
    }
};