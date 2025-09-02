/* eslint-disable react/prop-types */
"use client";
import { useContext } from "react";
import { Button, Navbar, Dropdown } from "flowbite-react";

import { HiMiniLanguage } from "react-icons/hi2"

import { DarkModeContext } from "../../context/DarkModeContext";
import { LanguageContext } from "../../context/LanguageContext";
import wiki_infographics_logo from "../../assets/wiki_infographics_logo.png"
import moonImg from "../../assets/moon.svg";
import sunImg from "../../assets/sun.svg";


/**
 * Navigation bar component.
 * @returns {JSX.Element} The NavBar component.
 */
function NavBar({ username }) {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { language, setLanguage, availableLanguages, getContent } = useContext(LanguageContext);
  return (

    <Navbar fluid rounded className="bg-slate-200">
      <Navbar.Brand href="#">
        <img src={wiki_infographics_logo} className="mr-3 h-6 sm:h-9" alt="Wiki Infographics logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">{getContent("navbar-title")}</span>
      </Navbar.Brand>
      <Navbar.Collapse>

        <button onClick={toggleDarkMode} className="block py-2 pl-3 pr-4 md:p-0 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white"><img width="18px" height="18px" src={darkMode ? sunImg : moonImg} /></button>

        <Navbar.Link href="#">{getContent("navbar-examples")}</Navbar.Link>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <Dropdown label={getContent("navbar-help")} inline>
            <Dropdown.Item href="https://github.com/wikimediabrasil/wiki_infographics">{getContent("navbar-repository")}</Dropdown.Item>
          </Dropdown>
        </div>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <div className="flex">
            <HiMiniLanguage className="text-xl mr-1" />
            <Dropdown label={language} inline>
              {
                availableLanguages.map((lang) => {
                  return <Dropdown.Item key={lang} onClick={() => setLanguage(lang)}>{lang}</Dropdown.Item>
                })
              }
            </Dropdown>
          </div>
        </div>

      </Navbar.Collapse>
    </Navbar>

  );
}

export default NavBar;
