import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaCog } from "react-icons/fa";
import { FaStore, FaConciergeBell } from "react-icons/fa";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import headerlogo from "/trofititle.png";

/* 🔹 Recursive Sidebar Item */
const SidebarItem = ({
  item,
  openMain,
  setOpenMain,
  openNested,
  setOpenNested,
  activePath,
  handleSubClick,
  isMain = false,
}) => {
  const isOpen = isMain
    ? openMain === item.name
    : openNested[item.name] || false;

  const handleClick = () => {
    if (item.dropdown) {
      if (isMain) {
        // Accordion: only one main open
        setOpenMain(isOpen ? null : item.name);
      } else {
        // Inner dropdown: toggle only itself
        setOpenNested((prev) => ({
          ...prev,
          [item.name]: !isOpen,
        }));
      }
    } else {
      handleSubClick(item.link);
    }
  };

  return (
    <li className="text-sm ml-2 rounded-sm group relative">
      {item.dropdown ? (
        <div
          onClick={handleClick}
          className={`flex w-full justify-between mb-2 items-center pl-3 pr-3 py-4 cursor-pointer 
            rounded-tl-full rounded-bl-full 
            hover:bg-white hover:text-[#F9832B] 
            ${isOpen ? "bg-white text-[#F9832B]" : "text-white"}`}
        >
          <div className="flex items-center gap-3 text-[100%]">
            {item.icon}
            {item.name}
          </div>
          <FaChevronDown
            className={`w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      ) : (
        <Link
          to={item.link}
          onClick={handleClick}
          className={`flex w-full justify-between items-center pl-3 pr-3 py-4 cursor-pointer 
            rounded-tl-full rounded-bl-full ${
              item.name === "Dashboard" ? "" : "hover:text-gray-300"
            }   
             
            ${
              activePath === item.link
                ? "bg-white text-[#F9832B] mb-2"
                : "text-white"
            }`}
        >
          <div className="flex items-center gap-3 text-[100%]">
            {item.icon}
            {item.name}
          </div>
        </Link>
      )}

      {/* 🔹 Recursive Sub Items */}
      {item.dropdown && isOpen && item.subItems && (
        <ul className="ml-6 mt-2 flex flex-col gap-1 list-none pl-4 ">
          {item.subItems.map((subItem, idx) => (
            <SidebarItem
              key={idx}
              item={subItem}
              openMain={openMain}
              setOpenMain={setOpenMain}
              openNested={openNested}
              setOpenNested={setOpenNested}
              activePath={activePath}
              handleSubClick={handleSubClick}
              isMain={false}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

function Sidebar({ setIs_Toggle, isToggle }) {
  const [openMain, setOpenMain] = useState(null); // only for main dropdowns
  const [openNested, setOpenNested] = useState({}); // for inner dropdowns
  const [activeItem, setActiveItem] = useState("Dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = "admin";
  const activePath = location.pathname;

  const filteredSidebarData = [
    {
      section: null,
      items: [
        ...(userRole === "admin"
          ? [
              {
                name: "Dashboard",
                icon: <DashboardIcon className="w-4 h-4" />,
                link: "/Dashboard",
                dropdown: false,
                // subItems: [{ name: "Dashboard", link: "/Dashboard" }],
              },
            ]
          : []),
        ...(userRole === "superadmin"
          ? [
              {
                name: "Dashboard",
                icon: <DashboardIcon className="w-4 h-4" />,
                link: "#",
                dropdown: false,
                subItems: [{ name: "Dashboard", link: "/Dashboard" }],
              },
            ]
          : []),
      ],
    },
    {
      section: "",
      items: [
        {
          name: "Admin Management",
          icon: <AdminPanelSettingsIcon />,
          link: "#",
          dropdown: true,
          subItems: [
            { name: "Admin List", link: "AdminList", dropdown: false },
          ],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Role Management",
          icon: <GroupWorkIcon />,
          link: "#",
          dropdown: true,
          subItems: [
            { name: "Add Role", link: "RoleCreate", dropdown: false },
            { name: "Role List", link: "RoleList", dropdown: false },
          ],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "User Management",
          icon: <PeopleIcon />,
          link: "#",
          dropdown: true,
          subItems: [{ name: "User List", link: "UserList", dropdown: false }],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Restaurant",
          icon: <FaStore />,
          link: "#",
          dropdown: true,
          subItems: [
            {
              name: "Add Restaurant",
              link: "RestroAdd",
              dropdown: false,
            },
            {
              name: " Restaurant List",
              link: "RestroList",
              dropdown: false,
            },
          ],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Restaurant Management",
          icon: <FaCog />,
          link: "#",
          dropdown: true,
          subItems: [
            {
              name: "Restaurant Amenity",
              link: "#",
              dropdown: true, // nested
              subItems: [
                { name: "Add Amenity", link: "RestroAmenity", dropdown: false },
                {
                  name: "Amenity List",
                  link: "RestroAmenityList",
                  dropdown: false,
                },
              ],
            },
            {
              name: "Restaurant Type",
              link: "#",
              dropdown: true, // nested
              subItems: [
                { name: "Add Type", link: "RestroType", dropdown: false },
                { name: "Type List", link: "RestroTypeList", dropdown: false },
              ],
            },
            {
              name: "Restaurant Good For",
              link: "#",
              dropdown: true, // nested
              subItems: [
                {
                  name: "Add Good For",
                  link: "RestroGoodFor",
                  dropdown: false,
                },
                {
                  name: "Good For List",
                  link: "RestroGoodForList",
                  dropdown: false,
                },
              ],
            },
            {
              name: "Restaurant Cuisine",
              link: "#",
              dropdown: true, // nested
              subItems: [
                {
                  name: "Add Cuisine",
                  link: "RestroCuisine",
                  dropdown: false,
                },
                {
                  name: "Cuisine List",
                  link: "RestroCuisineList",
                  dropdown: false,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      section: "",
      items: [
        {
          name: "Dish",
          icon: <RestaurantIcon />,
          link: "#",
          dropdown: true,
          subItems: [
            { name: "Add Dish", link: "AddDishes", dropdown: false },
            { name: "Dishes List", link: "DishesList", dropdown: false },
          ],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Dish Management",
          icon: <FaConciergeBell />,
          link: "#",
          dropdown: true,
          subItems: [
            {
              name: "Dish Type",
              link: "#",
              dropdown: true,
              subItems: [
                {
                  name: "Add Dish Type",
                  link: "RestroDishType",
                  dropdown: false,
                },
                {
                  name: "Dish Type List",
                  link: "RestroDishTypeList",
                  dropdown: false,
                },
              ],
            },
            {
              name: "Dish Category",
              link: "#",
              dropdown: true,
              subItems: [
                {
                  name: "Add Dish Category",
                  link: "RestroDishCategory",
                  dropdown: false,
                },
                {
                  name: "Category List",
                  link: "RestroDishCategoryList",
                  dropdown: false,
                },
              ],
            },
            {
              name: "Dish Sub Category",
              link: "#",
              dropdown: true,
              subItems: [
                {
                  name: "Add Sub Category",
                  link: "RestroDishSubCategory",
                  dropdown: false,
                },
                {
                  name: "Sub Category List",
                  link: "RestroDishSubCategoryList",
                  dropdown: false,
                },
              ],
            },
          ],
        },
      ],
      border: true,
    },
  ];

  const handleSubClick = (link) => {
    setActiveItem(link);
    localStorage.setItem("sidebar_active_item", link);
    navigate(link);
  };

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("sidebar_active_item");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  return (
    <div className="flex bg-[#F9832B]">
      <div
        className={`sidebar fixed left-0 top-0 transition-transform duration-900 z-20 bg-[#F9832B] 
          ${isToggle ? "translate-x-0" : "-translate-x-full"} shadow-lg`}
      >
        {/* Logo */}
        <div className=" flex items-center gap-2 text-white font-bold text-2xl px-4 py-5">
          <div
            className="bg-white p-2 rounded-full"
            style={{
              boxShadow: `
      inset 6px 6px 12px rgba(249, 115, 22, 0.35),  /* orange shadow bottom-right */
      inset -6px -6px 12px rgba(255, 200, 150, 0.6) /* soft orange highlight top-left */
    `,
            }}
          >
            <img src={headerlogo} alt="" className="w-8 h-8" />
          </div>
          <span className="whitespace-nowrap">TROFI</span>
        </div>
        <div className="bg-[#F9832B] h-[90vh] overflow-y-auto scrollbar-thin-line">
          {/* Navigation */}
          <nav>
            <ul className="flex flex-col h-[90vh]">
              {filteredSidebarData.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  {section.items.map((item, idx) => (
                    <SidebarItem
                      key={idx}
                      item={item}
                      openMain={openMain}
                      setOpenMain={setOpenMain}
                      openNested={openNested}
                      setOpenNested={setOpenNested}
                      activePath={activePath}
                      handleSubClick={handleSubClick}
                      isMain={true} // only top-level marked as main
                    />
                  ))}
                </React.Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
