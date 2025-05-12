/* eslint-disable react/prop-types */
"use client";
import api from "../../api/axios";
import { Button, Navbar, Dropdown } from "flowbite-react";

import { HiMiniLanguage } from "react-icons/hi2"

import wiki_infographics_logo from "../../assets/wiki_infographics_logo.png"


/**
 * Navigation bar component.
 * @returns {JSX.Element} The NavBar component.
 */
function NavBar({username}) {

  const logout = async () => {
    try {
      await api.get('/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (

    <Navbar fluid rounded className="bg-slate-200">
      <Navbar.Brand href="#">
        <img src={wiki_infographics_logo} className="mr-3 h-6 sm:h-9" alt="Wiki Infographics logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Wiki Infographics</span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <div className="hidden lg:block mr-2 mt-2 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">{username}</div>
        <Button onClick={logout}>Log Out</Button>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>

        <Navbar.Link href="#" >
          Wikimedia
        </Navbar.Link>

        <Navbar.Link href="#">Examples</Navbar.Link>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <Dropdown label="Help" inline>
            <Dropdown.Item>Help Portal</Dropdown.Item>
            <Dropdown.Item>User Manual</Dropdown.Item>
          </Dropdown>
        </div>

        <div className="block py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          <Dropdown label="More Tools" inline>
            <Dropdown.Item>Wikimedia Toolforge</Dropdown.Item>
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

        <div className="block lg:hidden py-2 pl-3 pr-4 md:p-0 border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-cyan-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
          {username}
        </div>
        
      </Navbar.Collapse>
    </Navbar>
    
  );
}

export default NavBar;
