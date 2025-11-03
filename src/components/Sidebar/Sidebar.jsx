import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaCog } from "react-icons/fa";
import { FaStore, FaConciergeBell, FaCommentDots } from "react-icons/fa";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import headerlogo from "/trofititle.png";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";

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
            className={`w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      ) : (
        <Link
          to={item.link}
          onClick={handleClick}
          className={`
    flex w-full justify-between items-center pl-3 pr-3 py-4 mb-2 cursor-pointer
    rounded-tl-full rounded-bl-full
    ${item.indent ? "ml-6" : ""}
    hover:bg-white hover:text-[#F9832B]
    ${activePath === "/" + item.link ? "bg-white text-[#F9832B]" : "text-white"}
  `}
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
  const storedUser = JSON.parse(localStorage.getItem("trofi_user"));
  const userRole = storedUser?.role || "restaurant_owner";
  const activePath = location.pathname;

  // Role-based Sidebar Data
  const sidebarDataByRole = {
    superadmin: [
      {
        section: null,
        items: [
          {
            name: "Dashboard",
            icon: <DashboardIcon className="w-4 h-4" />,
            link: "/Dashboard",
            dropdown: false,
          },
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
            subItems: [{ name: "Admins", link: "AdminList", dropdown: false }],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "Master Tools",
            icon: <SettingsIcon className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [{ name: "Manage Restro Group", link: "RestroGroup", dropdown: false },{ name: "Manage HashTag's", link: "HashtagList", dropdown: false }, { name: "Manage Dish Type", link: "RestroDishTypeList", dropdown: false }, { name: "Manage Dish Category", link: "RestroDishCategoryList", dropdown: false },
            {
              name: "Manage Dish Sub Category",
              link: "RestroDishSubCategoryList",
              dropdown: false,
            },],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "Restaurant",
            icon: <FaStore className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [

              {
                name: "Restaurant Management",
                link: "#",
                dropdown: true,
                subItems: [
                  { name: "Amenities", link: "RestroAmenityList", dropdown: false },
                  {
                    name: "Type",
                    link: "RestroTypeList",
                    dropdown: false,
                  },
                  {
                    name: "Good For",
                    link: "RestroGoodForList",
                    dropdown: false,
                  },
                  {
                    name: "Cuisine",
                    link: "RestroCuisineList",
                    dropdown: false,
                  },
                ],
              },
              { name: "Restaurant's List", link: "RestroList", dropdown: false },

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
            subItems: [{ name: "Users", link: "UserList", dropdown: false },{ name: "Deleted Users", link: "DeletedUserList", dropdown: false }],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "CMS Management",
            icon: <GroupWorkIcon />,
            link: "#",
            dropdown: true,
            subItems: [

              { name: "FAQ", link: "FAQList", dropdown: false },
              { name: "Policies", link: "PoliciesList", dropdown: false },
            ],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "Report & Feedback Management",
            icon: <GroupWorkIcon />,
            link: "#",
            dropdown: true,
            subItems: [
              { name: "Reports", link: "ReportList", dropdown: false },
              {
                name: "Query & Feedback",
                link: "#",
                dropdown: true,
                subItems: [
                  { name: "Query FAQ", link: "QueryFAQ", dropdown: false },
                  {
                    name: "App Feedback",
                    link: "AppFeedback",
                    dropdown: false,
                  },
                ],
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
            name: "Review & Notification",
            icon: <FaCommentDots className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [
              {
                name: "Feedback",
                link: "#",
                dropdown: true,
                subItems: [{ name: "Add Review", link: "CreateReview", dropdown: false },
                  { name: "Restaurants Review", link: "RestaurantReviewList", dropdown: false },
                  {
                    name: "Dishes Review",
                    link: "DishReviewList",
                    dropdown: false,
                  },
                ],
              },
              { name: "Notification", link: "NotificationList", dropdown: false },

            ],
          },
        ],
        border: true,
      },



    ],

    admin: [
            {
        section: null,
        items: [
          {
            name: "Dashboard",
            icon: <DashboardIcon className="w-4 h-4" />,
            link: "/Dashboard",
            dropdown: false,
          },
        ],
      },
      {
        section: "",
        items: [
          {
            name: "Master Tools",
            icon: <SettingsIcon className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [{ name: "Manage HashTag's", link: "HashtagList", dropdown: false }, { name: "Manage Dish Type", link: "RestroDishTypeList", dropdown: false }, { name: "Manage Dish Category", link: "RestroDishCategoryList", dropdown: false },
            {
              name: "Manage Dish Sub Category",
              link: "RestroDishSubCategoryList",
              dropdown: false,
            },],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "Restaurant",
            icon: <FaStore className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [

              {
                name: "Restaurant Management",
                link: "#",
                dropdown: true,
                subItems: [
                  { name: "Amenities", link: "RestroAmenityList", dropdown: false },
                  {
                    name: "Type",
                    link: "RestroTypeList",
                    dropdown: false,
                  },
                  {
                    name: "Good For",
                    link: "RestroGoodForList",
                    dropdown: false,
                  },
                  {
                    name: "Cuisine",
                    link: "RestroCuisineList",
                    dropdown: false,
                  },
                ],
              },
              { name: "Restaurant's List", link: "RestroList", dropdown: false },

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
            subItems: [{ name: "Users", link: "UserList", dropdown: false }],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "CMS Management",
            icon: <GroupWorkIcon />,
            link: "#",
            dropdown: true,
            subItems: [

              { name: "FAQ", link: "FAQList", dropdown: false },
              { name: "Policies", link: "PoliciesList", dropdown: false },
            ],
          },
        ],
        border: true,
      },
      {
        section: "",
        items: [
          {
            name: "Report & Feedback Management",
            icon: <GroupWorkIcon />,
            link: "#",
            dropdown: true,
            subItems: [
              { name: "Reports", link: "ReportList", dropdown: false },
              {
                name: "Query & Feedback",
                link: "#",
                dropdown: true,
                subItems: [
                  { name: "Query FAQ", link: "QueryFAQ", dropdown: false },
                  {
                    name: "App Feedback",
                    link: "AppFeedback",
                    dropdown: false,
                  },
                ],
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
            name: "Review & Notification",
            icon: <FaCommentDots className="w-5 h-5" />,
            link: "#",
            dropdown: true,
            subItems: [
              {
                name: "Feedback",
                link: "#",
                dropdown: true,
                subItems: [
                  { name: "Restaurants Review", link: "RestaurantReviewList", dropdown: false },
                  {
                    name: "Dishes Review",
                    link: "DishReviewList",
                    dropdown: false,
                  },
                ],
              },
              { name: "Notification", link: "NotificationList", dropdown: false },

            ],
          },
        ],
        border: true,
      },



      
      ...[],
    ],

    restaurant_owner: [
      {
        section: null,
        items: [
          {
            name: "Dashboard",
            icon: <DashboardIcon className="w-4 h-4" />,
            link: "/RestroOwnerDashboard",
            dropdown: false,
          },
          {
            name: "Restaurant ",
            icon: <FaStore className="w-5 h-5" />,
            link: "/RestaurantProfile",
            dropdown: false,
          },
          {
            name: "Dishes ",
            icon: <FaConciergeBell className="w-5 h-5" />,
            link: "/RestaurantDishes",
            dropdown: false,
          },
          {
            name: "Reviews ",
            icon: <FaCommentDots className="w-5 h-5" />,
            link: "/RestaurantReviews",
            dropdown: false,
          },
        ],
      },
    ],
  };

  // Use role-based sidebar
  const filteredSidebarData = sidebarDataByRole[userRole] || [];

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
        className={`sidebar fixed left-0 top-0 h-full transition-transform duration-900 z-20 bg-[#F9832B] 
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
            <ul className="flex flex-col ">
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
