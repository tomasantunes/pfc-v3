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

function convertExcelDate(dateStr) {
  if (dateStr == "") return "1900-01-01";
  const [day, month, year] = dateStr.split('-'); // Split the input string by '-'
  return `${year}-${month}-${day}`; // Rearrange and return the new format
}

function convertPaypalDate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

function convertRevolutDate(dateStr) {
  const dateObj = new Date(dateStr.replace(' ', 'T'));
  return toMySQLDateTime(dateObj);
}

function toMySQLDateTime(jsDate) {
  const pad = (n) => (n < 10 ? '0' + n : n);

  return (
    jsDate.getFullYear() + '-' +
    pad(jsDate.getMonth() + 1) + '-' +
    pad(jsDate.getDate()) + ' ' +
    pad(jsDate.getHours()) + ':' +
    pad(jsDate.getMinutes()) + ':' +
    pad(jsDate.getSeconds())
  );
}

function formatDatePtVerbose(date) {
  const opcoes = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  let data = date.toLocaleDateString('pt-PT', opcoes);

  // Separar por espaços
  let partes = data.split(" ");

  // Capitalizar o primeiro termo (dia da semana)
  partes[0] = partes[0].charAt(0).toUpperCase() + partes[0].slice(1);

  // Capitalizar o mês
  partes[3] = partes[3].charAt(0).toUpperCase() + partes[3].slice(1);

  return partes.join(" ");
}

// Export in a way that works with both require() and import
module.exports = {
    getLocalDate,
    convertExcelDate,
    convertPaypalDate,
    convertRevolutDate,
    toMySQLDateTime,
    formatDatePtVerbose,
    default: {
        getLocalDate,
        convertExcelDate,
        convertPaypalDate,
        convertRevolutDate,
        toMySQLDateTime,
        formatDatePtVerbose
    }
};