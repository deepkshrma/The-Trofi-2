import React, { useState, createContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

// Create context
export const LayoutContext = createContext();

function Layout() {
  const [isToggle, setIs_Toggle] = useState(true);
  return (
    <>
      <LayoutContext.Provider value={{ isToggle, setIs_Toggle }}>
        <div
          className={`flex relative w-full h-full bg-[#fcf2e6] ${
            isToggle ? null : "side_menu"
          }`}
        >
          <Sidebar isToggle={isToggle} setIs_Toggle={setIs_Toggle} />
          <div className="w-full h-full bg-[#fcf2e6] duration-900">
            <Header
              setIs_Toggle={setIs_Toggle}
              isToggle={isToggle}
              className="fixed top-0"
            />

            <Outlet />
          </div>
        </div>
      </LayoutContext.Provider>
    </>
  );
}

export default Layout;
