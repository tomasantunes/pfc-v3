export function toLocaleISOString() {
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

export default {
    toLocaleISOString
}