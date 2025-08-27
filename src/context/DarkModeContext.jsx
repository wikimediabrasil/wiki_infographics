import { createContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

function DarkModeProvider(props) {
  const [darkMode, setDarkMode] = useState(() => {
    const theme = localStorage.theme || "light";
    return theme === "dark" ? true : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((value) => !value);
  };

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      body.classList.remove("dark");
      localStorage.theme = "light";
    };
  }, [darkMode]);

  return (
    <div>
      <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
        {props.children}
      </DarkModeContext.Provider>
    </div>
  )
}

export { DarkModeContext, DarkModeProvider };
