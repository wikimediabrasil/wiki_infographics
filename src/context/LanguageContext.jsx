import { createContext, useState, useEffect } from "react";
import languageToLocaleMap from '../utils/locale.js';
import content_en from "../../translations/en.json";
import content_pt from "../../translations/pt.json";
import content_qqq from "../../translations/qqq.json";

const LanguageContext = createContext();

function LanguageProvider(props) {
  const DEFAULT_LANGUAGE = "en";
  const CONTENTS = {
    "en": content_en,
    "pt": content_pt,
    "qqq": content_qqq,
  }
  const availableLanguages = Object.keys(CONTENTS);

  const [language, setLanguage] = useState(() => localStorage.language || DEFAULT_LANGUAGE);
  const [translatedContent, setTranslatedContent] = useState(CONTENTS[language]);
  const [locale, setLocale] = useState(undefined);

  useEffect(() => {
    if (language) {
      localStorage.language = language;
      setTranslatedContent(CONTENTS[language]);
      // undefined uses the browser's default locale
      setLocale(languageToLocaleMap[language] || undefined);
    };
  }, [language]);

  const getContent = (key) => {
    return translatedContent[key] || CONTENTS[DEFAULT_LANGUAGE][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages, getContent, locale }}>
      {props.children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext, LanguageProvider };
