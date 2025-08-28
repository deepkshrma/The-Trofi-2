import React, { useState, useEffect } from "react";
import logo from "../../assets/images/logo.jpg";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { IoIosList, IoMdPersonAdd } from "react-icons/io";
import { MdCategory, MdPolicy } from "react-icons/md";
import { TbCategoryPlus } from "react-icons/tb";
import { BsPersonFillGear } from "react-icons/bs";
import { FaCircleUser, FaChevronDown } from "react-icons/fa6";
import { AiFillSound } from "react-icons/ai";
import { FaCaretLeft } from "react-icons/fa6";
import {
  Squares2X2Icon,
  CalendarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Import MUI icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import InsightsIcon from "@mui/icons-material/Insights";
import TagIcon from "@mui/icons-material/Tag";
import ReviewsIcon from "@mui/icons-material/RateReview";
import DownloadIcon from "@mui/icons-material/Download";

import PeopleIcon from "@mui/icons-material/People";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import FlagIcon from "@mui/icons-material/Flag";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import StarRateIcon from "@mui/icons-material/StarRate";
import AssessmentIcon from "@mui/icons-material/Assessment";

import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ListAltIcon from "@mui/icons-material/ListAlt";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import BadgeIcon from "@mui/icons-material/Badge";
import HistoryIcon from "@mui/icons-material/History";

import NotificationsIcon from "@mui/icons-material/Notifications";
import CampaignIcon from "@mui/icons-material/Campaign";
import SecurityIcon from "@mui/icons-material/Security";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BusinessIcon from "@mui/icons-material/Business";
import BackupIcon from "@mui/icons-material/Backup";
import MonitorIcon from "@mui/icons-material/Monitor";
import { GiChefToque } from "react-icons/gi";

function Sidebar({ setIs_Toggle, isToggle }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = "admin";
  const activePath = location.pathname;

  const filteredSidebarData = [
    // Dashboard
    {
      section: null,
      items: [
        ...(userRole === "admin"
          ? [
              {
                name: "Dashboard",
                icon: <DashboardIcon className="w-4 h-4" />,
                link: "#",
                dropdown: true,
                subItems: [{ name: "Dashboard", link: "/Dashboard" }],
              },
            ]
          : []),
        ...(userRole === "superadmin"
          ? [
              {
                name: "Dashboard",
                icon: <DashboardIcon className="w-4 h-4" />,
                link: "#",
                dropdown: true,
                subItems: [{ name: "Dashboard", link: "/Dashboard" }],
              },
            ]
          : []),
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Admin Management",
          icon: <AdminPanelSettingsIcon />,
          link: "#",
          dropdown: true,
          subItems: [{ name: "Admin List", link: "AdminList" }],
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
            { name: "Add Role", link: "RoleCreate" },
            { name: "Role List", link: "RoleList" },
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
          subItems: [{ name: "User List", link: "UserList" }],
        },
      ],
      border: true,
    },
    {
      section: "",
      items: [
        {
          name: "Restaurant Management",
          icon: <RestaurantIcon />,
          link: "#",
          dropdown: true,
          subItems: [
            {
              name: "Add Restaurant",
              link: "RestroAdd",
            },
            {
              name: " Restaurant List",
              link: "RestroList",
            },
            {
              name: " Restaurant Amenity",
              link: "RestroAmenity",
            },
            {
              name: " Restaurant Amenity List",
              link: "RestroAmenityList",
            },
            {
              name: " Restaurant Type",
              link: "RestroType",
            },
            {
              name: " Restaurant Type List",
              link: "RestroTypeList",
            },
            {
              name: " Restaurant Good For",
              link: "RestroGoodFor",
            },
            {
              name: " Restaurant Good For List",
              link: "RestroGoodForList",
            },
            {
              name: " Restaurant Cuisine",
              link: "RestroCuisine",
            },
            {
              name: " Restaurant Cuisine List",
              link: "RestroCuisineList",
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
          name: "Dish Management",
          icon: <RestaurantIcon />,
          link: "#",
          dropdown: true,
          subItems: [
            { name: "Add Dish", link: "AddDishes" },
            { name: "Dish Type", link: "RestroDishType" },
            { name: "Dish Category", link: "RestroDishCategory" },
            { name: "Dish Sub Category", link: "RestroDishSubCategory" },
          ],
        },
      ],
      border: true,
    },

    // // Feedback & Reviews
    // {
    //   section: "Feedback & Reviews Insights",
    //   items: [
    //     { name: "Insights & Graphs", icon: <InsightsIcon />, link: "#" },
    //     { name: "Hashtag Trends", icon: <TagIcon />, link: "#" },
    //     { name: "Review Moderation", icon: <ReviewsIcon />, link: "#" },
    //     { name: "Export Reports", icon: <DownloadIcon />, link: "#" },
    //   ],
    //   border: true,
    // },

    // // User Activity
    // {
    //   section: "User Activity & Demographics",
    //   items: [
    //     { name: "Demographics", icon: <PeopleIcon />, link: "#" },
    //     { name: "Tier Distribution", icon: <GroupWorkIcon />, link: "#" },
    //     { name: "Flags & Behavior", icon: <FlagIcon />, link: "#" },
    //     {
    //       name: "User Drilldown Profiles",
    //       icon: <PersonSearchIcon />,
    //       link: "#",
    //     },
    //   ],
    //   border: true,
    // },

    // // Restaurant Performance
    // {
    //   section: "Restaurant & Dish Performance",
    //   items: [
    //     { name: "Dish Trends", icon: <LocalDiningIcon />, link: "#" },
    //     { name: "Restaurant Trends", icon: <RestaurantIcon />, link: "#" },
    //     { name: "Hygiene Seal / Ratings", icon: <StarRateIcon />, link: "#" },
    //     {
    //       name: "Owner Insights & Reports",
    //       icon: <AssessmentIcon />,
    //       link: "#",
    //     },
    //   ],
    //   border: true,
    // },

    // // Flags & Moderation
    // {
    //   section: "Flags & Moderation",
    //   items: [
    //     { name: "Flagged Users", icon: <FlagIcon />, link: "#" },
    //     { name: "Flagged Feedbacks", icon: <ReportProblemIcon />, link: "#" },
    //     { name: "Bulk Moderation Actions", icon: <ListAltIcon />, link: "#" },
    //   ],
    //   border: true,
    // },

    // // Check-ins
    // {
    //   section: "Check-ins & Engagement",
    //   items: [
    //     { name: "Check-in Trends", icon: <LocationOnIcon />, link: "#" },
    //     {
    //       name: "Suspicious Behavior Alerts",
    //       icon: <WarningAmberIcon />,
    //       link: "#",
    //     },
    //   ],
    //   border: true,
    // },

    // // User & Tier Management
    // {
    //   section: "User & Tier Management",
    //   items: [
    //     { name: "User Profiles", icon: <PeopleIcon />, link: "#" },
    //     { name: "Tier Points & Badges", icon: <BadgeIcon />, link: "#" },
    //     { name: "Flagged Users History", icon: <HistoryIcon />, link: "#" },
    //   ],
    //   border: true,
    // },

    // // Notifications
    // {
    //   section: "Notifications",
    //   items: [
    //     {
    //       name: "Manage Notifications",
    //       icon: <NotificationsIcon />,
    //       link: "#",
    //     },
    //     { name: "Feedback Prompts", icon: <CampaignIcon />, link: "#" },
    //     { name: "Policy Alerts", icon: <SecurityIcon />, link: "#" },
    //     { name: "Notification History", icon: <HistoryEduIcon />, link: "#" },
    //   ],
    //   border: true,
    // },

    // // Menu & Dish Tools
    // {
    //   section: "Menu & Dish Tools",
    //   items: [
    //     { name: "Upload Menu Images", icon: <MenuBookIcon />, link: "#" },
    //     { name: "Ingredients Management", icon: <AddCircleIcon />, link: "#" },
    //     {
    //       name: "Dish Image Moderation",
    //       icon: <PhotoLibraryIcon />,
    //       link: "#",
    //     },
    //   ],
    //   border: true,
    // },

    // // Admin & System Controls
    // {
    //   section: "Admin & System Controls",
    //   items: [
    //     {
    //       name: "Role Management",
    //       icon: <AdminPanelSettingsIcon />,
    //       link: "#",
    //     },
    //     { name: "Restaurant Management", icon: <BusinessIcon />, link: "#" },
    //     { name: "Data Import / Backup", icon: <BackupIcon />, link: "#" },
    //     { name: "Monitoring & Logs", icon: <MonitorIcon />, link: "#" },
    //   ],
    //   border: true,
    // },
  ];

  const handleMainClick = (item) => {
    const newDropdown = openDropdown === item.name ? null : item.name;
    setOpenDropdown(newDropdown);
    localStorage.setItem("sidebar_open_dropdown", newDropdown || "");
  };

  useEffect(() => {
    const savedDropdown = localStorage.getItem("sidebar_open_dropdown");
    if (savedDropdown) {
      setOpenDropdown(savedDropdown);
    }
    const savedActiveItem = localStorage.getItem("sidebar_active_item");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const handleSubClick = (link) => {
    setActiveItem(link);
    localStorage.setItem("sidebar_active_item", link);
  };

  const handleToggle = () => {
    setIs_Toggle(!isToggle);
  };

  return (
    <>
      <div className="flex bg-[#F9832B]">
        <div
          className={` sidebar bg-[#F9832B] h-screen fixed  left-0 top-0 
    transition-transform duration-800  z-11
    ${isToggle ? "translate-x-0 " : "-translate-x-full "} shadow-lg`}
        >
          {/* {isToggle && (
            <FaCaretLeft
              size={25}
              onClick={handleToggle}
              className="scale-x-100 w-8 cursor-pointer  rounded text-white hover:text-[#0A2C38]  bg-[#F9832B] translate-x-[235px] mt-5 mb-3"
            />
          )} */}
          {/* Logo */}
          <div className="flex logo-container top-0 left-0 text-white font-[900] text-3xl px-4 py-5 z-10">
            <span className="mr-1">
              <GiChefToque />
            </span>
            <span className="whitespace-nowrap">TROFI</span>
          </div>

          {/* Navigation */}
          <nav className="relative">
            <ul className="flex flex-col h-[90vh] overflow-y-auto scrollbar-thin-line">
              {filteredSidebarData.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  {section.section && (
                    <span className="text-[12px] mx-4 text-white my-2">
                      {section.section}
                    </span>
                  )}
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className={`text-sm   ml-2 rounded-sm  leading-[100%] tracking-[0.3px] transition-colors duration-200 group relative`}
                    >
                      {item.dropdown ? (
                        <div
                          onClick={() => handleMainClick(item)}
                          className={`flex w-full justify-between items-center pl-3  pr-3 py-4 rounded-tl-full rounded-bl-full cursor-pointer  hover:bg-[#ffffff] text-white group 
                              hover:text-[#F9832B]`}
                        >
                          <div className="flex items-center gap-3 font-[200] text-[130%] ">
                            {item.icon}
                            {item.name}
                          </div>
                          <FaChevronDown
                            className={`w-2 transition-transform duration-200 ${
                              openDropdown === item.name ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      ) : (
                        <Link
                          to={item.link}
                          onClick={() => handleMainClick(item)}
                          className={`flex w-full justify-between items-center pl-2 py-2  rounded-tl-full rounded-bl-full cursor-pointer hover:bg-[#ffffff] text-white group hover:text-[#F9832B]`}
                        >
                          <div className="flex items-center justify-between gap-5 font-medium">
                            <span className="text-white  pl-3 py-3  group-hover:text-[#F9832B] transition-colors">
                              {item.icon}
                            </span>
                            {item.name}
                          </div>
                        </Link>
                      )}

                      {item.dropdown &&
                        openDropdown === item.name &&
                        item.subItems && (
                          <ul className="ml-6 mt-2 flex flex-col gap-1 list-disc pl-9 ">
                            {item.subItems.map((subItem, subIndex) => (
                              <li
                                key={subIndex}
                                className={` font-medium  cursor-pointer rounded ${
                                  activePath === subItem.link
                                    ? "text-white font-semibold"
                                    : "text-white  hover:text-gray-300"
                                }`}
                                onClick={() => handleSubClick(subItem.link)}
                              >
                                <Link
                                  to={subItem.link}
                                  className="block px-3 py-4"
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                    </li>
                  ))}
                  {/* {section.border && (
                    <span className="flex my-2 border-t-1 border-gray-200"></span>
                  )} */}
                </React.Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
