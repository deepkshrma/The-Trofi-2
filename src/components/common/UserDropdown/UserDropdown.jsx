import { useEffect, useRef, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInbox } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import ContextApi from "../../../ContextApi";
import DeleteModel from "../DeleteModel/DeleteModel";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

const UserDropdown = ({
  userDropdown,
  handleuserDropdown,
  onClosedropdown,
  user,
}) => {
  const dropdownRef = useRef(null);
  const { authData, setAuthData } = useContext(ContextApi);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    // setSelectedAdmin(null);
  };
  const confirmDelete = async () => {
    setAuthData(null);
    localStorage.removeItem("trofi_user");
    sessionStorage.removeItem("trofi_user");
    localStorage.removeItem("profile_photo");
    localStorage.removeItem("sidebar_open_dropdown");
    localStorage.removeItem("sidebar_active_item");
    navigate("/");
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".dropdown-toggle")
      ) {
        onClosedropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClosedropdown]);

  const fullName = user ? `${user.first_name} ${user.last_name}` : "User Name";
  const role = user?.role?.name || " Role";

  return (
    <>
      <div
        ref={dropdownRef}
        className={`relative ${userDropdown ? "block" : "hidden"}`}
      >
        <div className="absolute right-10 top-12 mt-[17px] flex flex-col rounded-xl border border-gray-200 bg-white shadow-lg min-w-[220px] z-11">
          {/* Center fullName and role */}
          {/* <div className="w-full flex flex-col justify-center items-center text-center py-2">
            <span className="block font-medium text-gray-700 text-sm">
              {fullName}
            </span>
            <span className="mt-0.5 block text-sm text-gray-500">{role}</span>
          </div> */}

          {/* <hr className="text-[#E0E0E0]" /> */}
          <ul className="flex flex-col ">
            {/* Profile */}
            <li onClick={handleuserDropdown}>
              <Link
                to="/AdminProfile"
                className="flex items-center gap-3 py-2 px-5 text-gray-700 group text-[14px] hover:bg-gray-100"
              >
                <FaUser size={16} className="text-orange-500" />
                <span className="whitespace-nowrap">Profile</span>
              </Link>
            </li>

            <hr className="text-[#E0E0E0]" />

            {/* Inbox */}
            {/* <li>
              <Link
                to="/AdminInbox"
                className="flex items-center gap-3 py-2 px-5 text-gray-700 group text-[14px] hover:bg-gray-100"
              >
                <FaInbox size={16} className="text-green-500" />
                <span className="whitespace-nowrap">Inbox</span>
              </Link>
            </li>
            <hr className="text-[#E0E0E0]" /> */}
            {/* Logout */}
            <li>
              <button
                className="flex w-full items-center gap-3 py-2 px-5 text-red-700 group text-[14px] hover:bg-gray-100 cursor-pointer rounded-b-xl"
                onClick={() => setShowDeleteModal(true)}
              >
                <FiLogOut size={16} className="text-red-500" />
                <span className="whitespace-nowrap">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to logout? This action cannot be
            undone."
      />
    </>
  );
};

export default UserDropdown;
