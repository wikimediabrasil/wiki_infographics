import { createContext, useState, useEffect } from "react";
import languageToLocaleMap from '../utils/locale.js';
const translations = import.meta.glob(["../../translations/*.json", "!../../translations/qqq.json"], { import: "default", eager: true });

const LanguageContext = createContext();

function getContents() {
  var contents = {};
  for (const path in translations) {
    const languageCodeWithJson = path.split("/").slice(-1)[0];
    const languageCode = languageCodeWithJson.substring(0, languageCodeWithJson.length - 5);
    contents[languageCode] = translations[path];
  };
  return contents
}

function LanguageProvider(props) {
  const DEFAULT_LANGUAGE = "en";

  const contents = getContents();
  const availableLanguages = Object.keys(contents);

  const [language, setLanguage] = useState(() => localStorage.language || DEFAULT_LANGUAGE);
  const [translatedContent, setTranslatedContent] = useState(contents[language] || contents[DEFAULT_LANGUAGE]);
  const [locale, setLocale] = useState(undefined);

  useEffect(() => {
    if (language) {
      localStorage.language = language;
      setTranslatedContent(contents[language] || contents[DEFAULT_LANGUAGE]);
      setLocale(languageToLocaleMap[language] || undefined); // undefined uses the browser's default locale
    };
  }, [language]);

  const getContent = (key) => {
    return translatedContent[key] || contents[DEFAULT_LANGUAGE][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages, getContent, locale }}>
      {props.children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext, LanguageProvider };
