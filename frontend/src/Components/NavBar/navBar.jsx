"use client";
import api from "../../api/axios";
import { Button, Navbar } from "flowbite-react";

import { HiMiniLanguage } from "react-icons/hi2"


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
        <img src="wiki_infographics_logo.png" className="mr-3 h-6 sm:h-9" alt="Wiki Infographics logo" />
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
        <Navbar.Link href="#">Help</Navbar.Link>
        <Navbar.Link href="#"><HiMiniLanguage className="text-xl"/></Navbar.Link>
        <Navbar.Link href="#">English</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>





    // <Navbar fluid rounded className="bg-slate-200">
    //   <Navbar.Brand as={Link} href="#">
    //     <img src="wiki_infographics_logo.png" className="mr-3 h-6 sm:h-9" alt="Wiki Infographics logo" />
    //     <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Wiki Infographics</span>
    //   </Navbar.Brand>
    //   <Navbar.Toggle />
    //   <Navbar.Collapse>
    //     <Navbar.Link href="#" active>
    //       Wikimedia
    //     </Navbar.Link>
    //     <Navbar.Link as={Link} href="#">
    //       Examples
    //     </Navbar.Link>
    //     <Navbar.Link href="#">Help</Navbar.Link>
    //     <Navbar.Link href="#"><HiMiniLanguage className="text-xl"/></Navbar.Link>
    //     <Navbar.Link href="#">English</Navbar.Link>
    //   </Navbar.Collapse>
    // </Navbar>
  );
}

export default NavBar;
