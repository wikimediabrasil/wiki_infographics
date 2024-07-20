"use client";
import api from "../../api/axios";
import { Button, Navbar, Dropdown } from "flowbite-react";

import { HiMiniLanguage } from "react-icons/hi2"

import wiki_infographics_logo from "../../assets/wiki_infographics_logo.png"


/**
 * Navigation bar component.
 * @returns {JSX.Element} The NavBar component.
 */
function NavBar() {

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
        <Button onClick={logout}>Log Out</Button>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>

        <Navbar.Link href="#" active>
          Wikimedia
        </Navbar.Link>

        <Navbar.Link href="#">Examples</Navbar.Link>
        <Navbar.Link >
          <Dropdown label="Help" inline>
            <Dropdown.Item>Help Portal</Dropdown.Item>
            <Dropdown.Item>User Manual</Dropdown.Item>
          </Dropdown>
        </Navbar.Link>

        <Navbar.Link >
          <Dropdown label="More Tools" inline>
            <Dropdown.Item>Wikimedia Toolforge</Dropdown.Item>
          </Dropdown>
        </Navbar.Link>
        
        <Navbar.Link >
          <div className="flex">
            <HiMiniLanguage className="text-xl"/>
            <Dropdown label="English" inline>
              <Dropdown.Item>EN</Dropdown.Item>
              <Dropdown.Item>PT</Dropdown.Item>
            </Dropdown>
          </div>
        </Navbar.Link>
        
      </Navbar.Collapse>
    </Navbar>
    
  );
}

export default NavBar;
