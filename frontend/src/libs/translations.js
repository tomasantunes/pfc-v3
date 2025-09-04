export var translations = {
    "Language": {"en-us": "Language", "pt-pt": "Língua"},
    "There has been an error updating this field.": {"en-us": "There has been an error updating this field.", "pt-pt": "Ocorreu um erro a atualizar este cmapo."},
    "Dashboard": {"en-us": "Dashboard", "pt-pt": "Painel de Estatísticas"},
    "General Stats": {"en-us": "General Stats", "pt-pt": "Estatísticas Gerais"},
    "Net Worth": {"en-us": "Net Worth", "pt-pt": "Património"},
    "Average Monthly Expense": {"en-us": "Average Monthly Expense", "pt-pt": "Despesa Média Mensal"},
    "Trading Profit": {"en-us": "Trading Profit", "pt-pt": "Lucro Comercial"},
    "Expense Last 12 Months": {"en-us": "Expense Last 12 Months", "pt-pt": "Despesa dos últimos 12 meses"},
    "Estimated Data": {"en-us": "Estimated Data", "pt-pt": "Dados Estimados"},
    "Income Per Hour": {"en-us": "Income Per Hour", "pt-pt": "Rendimento p/ hora"},
    "Income Per Day": {"en-us": "Income Per Day", "pt-pt": "Rendimento p/ dia"},
    "Income Per Week": {"en-us": "Income Per Week", "pt-pt": "Rendimento p/ semana"},
    "Income Per Month": {"en-us": "Income Per Month", "pt-pt": "Rendimento p/ mês"},
    "Income Per Year": {"en-us": "Income Per Year", "pt-pt": "Rendimento p/ ano"},
    "Net Monthly Salary": {"en-us": "Net Monthly Salary", "pt-pt": "Salário p/ Mês Líquido"},
    "Net Annual Salary": {"en-us": "Net Annual Salary", "pt-pt": "Salário p/ Ano Líquido"},
    "Gross Monthly Salary": {"en-us": "Gross Monthly Salary", "pt-pt": "Salário p/ Mês Bruto"},
    "Gross Annual Salary": {"en-us": "Gross Annual Salary", "pt-pt": "Salário p/ Ano Bruto"},
    "XLS has been imported successfully": {}
}

export function i18n(text) {
    var currentLanguage = localStorage.getItem("language");
    if (translations[text]?.[currentLanguage]) {
        return translations[text][currentLanguage];
    }
    else if (translations[text + "."]?.[currentLanguage]) {
        return translations[text][currentLanguage];
    }
    else if (translations[text.slice(0, -1)]?.[currentLanguage]) {
        return translations[text][currentLanguage];
    }
    else {
        return text;
    }
}

export function setLanguage(language) {
    localStorage.setItem("language", language);
    window.location.reload();
}

export function getLanguages() {
    return [
        {
            "languageName": "English",
            "languageCode": "en-us"
        },
        {
            "languageName": "Português",
            "languageCode": "pt-pt"
        }
    ];
}

export function init() {
    if (!localStorage.getItem("language")) {
        localStorage.setItem("language", "en-us");
    }
}