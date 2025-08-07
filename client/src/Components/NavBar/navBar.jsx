/* eslint-disable react/prop-types */
"use client";
import { Button, Navbar, Dropdown } from "flowbite-react";

import { HiMiniLanguage } from "react-icons/hi2"

import wiki_infographics_logo from "../../assets/wiki_infographics_logo.png"


/**
 * Navigation bar component.
 * @returns {JSX.Element} The NavBar component.
 */
function NavBar({username}) {
  return (

    <Navbar fluid rounded className="bg-slate-200">
      <Navbar.Brand href="#">
        <img src={wiki_infographics_logo} className="mr-3 h-6 sm:h-9" alt="Wiki Infographics logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Wiki Infographics</span>
      </Navbar.Brand>
      <Navbar.Collapse>

        <Navbar.Link href="#">Examples</Navbar.Link>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <Dropdown label="Help" inline>
            <Dropdown.Item href="https://github.com/wikimediabrasil/wiki_infographics">Repository</Dropdown.Item>
          </Dropdown>
        </div>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <div className="flex">
            <HiMiniLanguage className="text-xl"/>
            <Dropdown label="English" inline>
              <Dropdown.Item>EN</Dropdown.Item>
              <Dropdown.Item>PT</Dropdown.Item>
            </Dropdown>
          </div>
        </div>

      </Navbar.Collapse>
    </Navbar>
    
  );
}

export default NavBar;
