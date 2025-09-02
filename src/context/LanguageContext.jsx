import { createContext, useState, useEffect } from "react";
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

  useEffect(() => {
    if (language) {
      localStorage.language = language;
      setTranslatedContent(CONTENTS[language]);
    };
  }, [language]);

  const getContent = (key) => {
    let value = translatedContent[key];
    if (value) {
      return value;
    } else {
      return CONTENTS[DEFAULT_LANGUAGE][key];
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages, getContent }}>
      {props.children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext, LanguageProvider };
