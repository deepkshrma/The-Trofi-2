import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

function Layout() {
  const [isToggle, setIs_Toggle] = useState(true);
  return (
    <>
      <div className={`flex relative w-full ${isToggle ? null : "side_menu"}`}>
        <Sidebar isToggle={isToggle} setIs_Toggle={setIs_Toggle} />
        <div className="w-full bg-[#FFFEF6] duration-900">
          <Header
            setIs_Toggle={setIs_Toggle}
            isToggle={isToggle}
            className="fixed top-0"
          />
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
