const messages = {
  en: {
    welcome: "Welcome",
  },
};

type Locale = keyof typeof messages;

let locale: Locale = "en";

export function setLocale(nextLocale: Locale) {
  locale = nextLocale;
}

export function t(key: keyof typeof messages.en) {
  return messages[locale][key] ?? key;
}
