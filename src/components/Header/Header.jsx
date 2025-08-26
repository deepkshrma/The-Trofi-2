import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
import profilePhoto from "../../assets/images/loginImage.jpg";
import { FaChevronDown } from "react-icons/fa";
import headerlogo from "/favicon.png";
import { GoBellFill } from "react-icons/go";
import NotificationBell from "./NotificationBell";
import UserDropdown from "../common/UserDropdown/UserDropdown";
import { FaArrowRight } from "react-icons/fa";

function Header({ setIs_Toggle, isToggle }) {
  const [userDropdown, setUserDropdown] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState(null);

  const handleUserDropdown = () => {
    // setUserDropdown(!userDropdown);
    if (isAnimating) return;

    setIsAnimating(true);
    setUserDropdown((prev) => !prev);

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const onCloseDropdown = () => {
    setUserDropdown(false);
  };

  const handleToggle = () => {
    setIs_Toggle(!isToggle);
  };
  return (
    <>
      <div className="header header_top_menu fixed top-0 left-0 z-10 flex w-full py-2 items-center justify-between bg-white p-4 shadow-sm">
        <span
          className={`${
            isToggle ? "translate-x-[260px]" : ""
          } flex gap-5 items-center`}
        >
          <button
            onClick={handleToggle}
            className="relative w-8 h-14 flex flex-col justify-center items-center group"
          >
            {/* Top line → rotates down to form arrow head */}
            <span
              className={`block h-0.5   bg-[#F9832B] transition-all duration-300 ${
                isToggle ? "w-6" : "rotate-30 translate-y-1 translate-x-2 w-3"
              } group-hover:rotate-30 group-hover:translate-y-1 group-hover:translate-x-2 group-hover:w-3`}
            ></span>

            {/* Middle line → stays as arrow shaft */}
            <span className="block h-0.5 w-6 bg-[#F9832B] my-1.5 transition-all duration-300 "></span>

            {/* Bottom line → rotates up to form arrow head */}
            <span
              className={`block h-0.5   bg-[#F9832B] transition-all duration-300
              ${
                isToggle ? "w-6" : "-rotate-40 -translate-y-1 translate-x-2 w-3"
              } group-hover:-rotate-40 group-hover:-translate-y-1 group-hover:translate-x-2 group-hover:w-3`}
            ></span>
          </button>

          {/* {isToggle ? (
            <HiMenu
              size={25}
              onClick={handleToggle}
              className="scale-x-100 w-8 cursor-pointer  rounded text-[#F9832B] hover:text-[#0A2C38]  bg-white"
            />
          ) : (
            // <div className="aside-toggle">
            //   <span className="bg-black"></span>
            //   <span className="bg-black"></span>
            //   <span className="bg-black"></span>
            // </div>
            // <HiX size={18} onClick={handleToggle} />
            <FaArrowRight
              size={25}
              onClick={handleToggle}
              className="scale-x-100 w-8 cursor-pointer  rounded text-[#F9832B] hover:text-[#0A2C38]  bg-white"
            />
          )} */}
          <div>
            <img src={headerlogo} alt="" />
          </div>
        </span>

        <div className="flex justify-end">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 cursor-pointer px-3 py-1 rounded-[8px]">
              <NotificationBell />

              <div className="rounded-full bg-[#D8D8D8] overflow-hidden">
                <img
                  src={profilePhoto}
                  className="w-11 h-11 object-cover"
                  alt="profile_pic"
                />
              </div>
              <div>
                <p className="text-[14px] font-Montserrat font-[500] ">Admin</p>
                {/* <p className="text-[12px] font-Montserrat font-[400] text-[#9C9C9C]">
                  {roleName}
                </p> */}
              </div>
              <div
                className="w-5 h-5 rounded-full  bg-[#F9832B] flex items-center justify-center transition-all duration-300 ease-out"
                onClick={handleUserDropdown}
              >
                <span>
                  <FaChevronDown
                    className={`${
                      !userDropdown && "rotate-180"
                    } text-white hover:text-[#0A2C38]  `}
                    size={9}
                  />
                </span>
              </div>
            </div>
            <UserDropdown
              userDropdown={userDropdown}
              handleuserDropdown={handleUserDropdown}
              onClosedropdown={onCloseDropdown}
              user={user}
            />
          </div>
        </div>
      </div>

      <div className="mt-12"></div>
    </>
  );
}

export default Header;
