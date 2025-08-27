import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import { FaChevronDown } from "react-icons/fa6";
import { GiChefToque } from "react-icons/gi";

function Sidebar({ setIs_Toggle, isToggle }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const activePath = location.pathname;

  // Sidebar Data
  const sidebarData = [
    {
      section: null,
      items: [
        {
          name: "Dashboard",
          icon: <DashboardIcon className="w-4 h-4" />,
          link: "/Dashboard",
        },
      ],
    },
    {
      section: "Admin Management",
      items: [
        { name: "Admin List", icon: <AdminPanelSettingsIcon />, link: "AdminList" },
      ],
    },
    {
      section: "Role Management",
      items: [
        { name: "Add Role", icon: <GroupWorkIcon />, link: "RoleCreate" },
        { name: "Role List", icon: <ListAltIcon />, link: "RoleList" },
      ],
    },
    {
      section: "User Management",
      items: [{ name: "User List", icon: <PeopleIcon />, link: "UserList" }],
    },
    {
      section: "Restaurant Management",
      items: [
        {
          name: "Restaurant",
          icon: <RestaurantIcon />,
          dropdown: true,
          subItems: [
            { name: "Add Restaurant", icon: <RestaurantIcon />, link: "/RestroAdd" },
            { name: "Restaurant List", icon: <LocalDiningIcon />, link: "/RestroList" },
          ],
        },
      ],
    },
  ];

  // Handle dropdown toggle
  const handleMainClick = (item) => {
    setOpenDropdown(openDropdown === item.name ? null : item.name);
  };

  useEffect(() => {
    const savedDropdown = localStorage.getItem("sidebar_open_dropdown");
    if (savedDropdown) setOpenDropdown(savedDropdown);
  }, []);

  return (
    <div className="flex bg-[#F9832B]">
      <div
        className={`sidebar bg-[#F9832B] h-screen fixed left-0 top-0 
        transition-all duration-500 z-20 
        ${isToggle ? "translate-x-0" : "-translate-x-full"} shadow-lg`}
      >
        {/* Logo */}
        <div className="flex items-center text-white font-extrabold text-2xl px-5 py-6">
          <GiChefToque className="mr-2 text-3xl" />
          <span className="italic tracking-wide">TROFI</span>
        </div>

        {/* Navigation */}
        <nav className="relative">
          <ul className="flex flex-col h-[82vh] overflow-y-auto">
            {sidebarData.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {section.section && (
                  <span className="text-[11px] font-semibold mx-5 text-white/80 my-2 uppercase tracking-wider">
                    {section.section}
                  </span>
                )}

                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="mb-1">
                    {item.dropdown ? (
                      <>
                        {/* Dropdown trigger */}
                        <div
                          onClick={() => handleMainClick(item)}
                          className={`flex items-center gap-4 py-3 px-5 cursor-pointer rounded-l-full transition-colors 
                            ${
                              openDropdown === item.name
                                ? "bg-white text-[#F9832B] font-semibold"
                                : "text-white hover:bg-white hover:text-[#F9832B]"
                            }`}
                        >
                          <span>{item.icon}</span>
                          <span className="text-sm">{item.name}</span>
                          <FaChevronDown
                            className={`ml-auto transition-transform duration-200 ${
                              openDropdown === item.name ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {/* Dropdown items */}
                        {openDropdown === item.name && item.subItems && (
                          <ul className="ml-6 mt-1 flex flex-col gap-1">
                            {item.subItems.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={subItem.link}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-l-full text-sm transition-colors
                                    ${
                                      activePath === subItem.link
                                        ? "text-[#F9832B] font-semibold bg-white"
                                        : "text-white hover:text-[#F9832B]"
                                    }`}
                                >
                                  {subItem.icon}
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.link}
                        className={`flex items-center gap-4 py-3 px-5 rounded-l-full transition-colors 
                          ${
                            activePath === "/" + item.link ||
                            activePath === item.link
                              ? "bg-white text-[#F9832B] font-semibold"
                              : "text-white hover:bg-white hover:text-[#F9832B]"
                          }`}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
