export var translations = {
    "Language": {"en-us": "Language", "pt-pt": "Língua"},
    "Income Per Hour": {"en-us": "Income Per Hour", "pt-pt": "Rendimento p/ hora"},
};

export function i18n(text) {
    var currentLanguage = localStorage.getItem("language");
    if (translations[text]?.[currentLanguage]) {
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