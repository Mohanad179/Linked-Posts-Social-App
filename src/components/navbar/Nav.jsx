import { Button, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";

import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authContext } from './../authContext/AuthContext';


export default function Nav() {

  const { token , setToken} = useContext(authContext)

  const { pathname: path } = useLocation()

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const nav = useNavigate()

  function handleLogout(){
    localStorage.removeItem("token")
    setToken(null)
    nav("/login")
  }

  return (
    <>
      <div className="sticky top-0 z-50">
        <Navbar fluid rounded>
        <div className="max-w-7xl mx-auto flex w-full items-center justify-between">
      <NavbarBrand href="">
        {/* <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />  */}
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">LinkedPosts</span>
      </NavbarBrand>
      <div className="flex md:order-2">

        {
          token ? 
            <Button onClick={handleLogout} className=" bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 mr-5 cursor-pointer">Logout</Button>  :  
          <> 
            <Button as={Link} to={"/login"} className="mr-2 cursor-pointer">Login</Button>
            <Button as={Link} to={"/signup"} className="mr-5 cursor-pointer">Signup</Button>
          </>   
        }
        <button onClick={() => setDark(!dark)} className="cursor-pointer hover:scale-110 ">
              {dark ? "☀️" : "🌙"}
        </button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>

        { token && 
        <>
          <NavbarLink className="cursor-pointer" 
            as={Link} 
            to="/" 
            active={path === "/"}>
              Home
          </NavbarLink>

          <NavbarLink className="cursor-pointer" 
            as={Link} 
            to="/profile" 
            active={path === "/profile"}>
              Profile
          </NavbarLink>
        </> 
        }

      </NavbarCollapse>
      </div>
    </Navbar>
      </div>
    </>
  );
}













