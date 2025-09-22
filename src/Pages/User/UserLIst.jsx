import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { FaSearch } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import axios from "axios";
import guest from "../../assets/images/guest.png";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";
import { FiEye } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import UserUpdateStatus from "../../components/UserUpdateStatus/UserUpdateStatus";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaUsers, FaUserAlt } from "react-icons/fa";
import { FaUserXmark, FaUserShield } from "react-icons/fa6";
import { IoFilterSharp } from "react-icons/io5";

function UserList() {
  const [users, setUsers] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  const navigate = useNavigate();

  const fetchUsers = async (page = 1) => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/admin/get-all-users?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({
          currentPage: response.data.data.page,
          totalPages: response.data.data.totalPages,
          totalUsers: response.data.data.totalUsers,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleExport = () => {
    const exportData = users.map((user, index) => ({
      SL: index + 1,
      Name: user.name,
      Email: user.email,
      Phone: user.fullPhone,
      Status: user.account_status,
      Created_At: new Date(user.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Users.xlsx");
  };

  const openDeleteModal = (id) => {
    setSelectedCustomerId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedCustomerId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== selectedCustomerId)
    );
    closeDeleteModal();
  };

  return (
    <div className="main main_page font-Montserrat space-y-4 duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/CustomerList" }]}
      />
      <PageTitle title={"Users"} />

      {/* Summary Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Users</h4>
            <p className="text-[22px] font-semibold">{pagination.totalUsers}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUsers size={35} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Active Users</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "active").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserAlt size={35} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Inactive Users</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "inactive").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserXmark size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Suspended</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "suspended").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserShield size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="w-full h-auto p-2 mt-2 bg-white rounded-lg">
        <div className="flex justify-between h-[40px] mb-2">
          <form className="flex gap-1">
            <div className="relative flex gap-2 px-3 bg-blue-50 w-[300px] rounded-md">
              <FaSearch className="absolute opacity-40 top-3" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here"
                className="ml-6 text-[14px] outline-none bg-gray-100 appearance-none"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <div className="relative w-28 mr-2">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-500">
                <IoFilterSharp />
              </span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 pl-8 pr-2 py-2 rounded-md shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div
              className="flex gap-2 justify-center items-center rounded px-4 border-[1px] border-gray-300 cursor-pointer"
              onClick={handleExport}
            >
              <CiExport className="text-black" />
              <span className="text-[14px]">Export</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                {["SL", "User", "Contact Info", "Status", "Action"].map(
                  (head, i) => (
                    <th
                      key={head}
                      className={`text-[14px] ${
                        head === "Action" || head === "Status" ? "px-4" : "px-8"
                      } ${
                        i >= 3 ? "text-center" : "text-left"
                      } py-3 whitespace-nowrap`}
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users
                .filter(
                  (item) =>
                    (statusFilter === "all" ||
                      item.account_status === statusFilter) &&
                    `${item.name} ${item.email} ${item.fullPhone}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={item._id} className="border-b border-gray-200">
                    <td className="text-[14px] px-8 py-3 text-left">
                      {(pagination.currentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="text-[14px] px-8 py-3 text-left min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.profile_picture || guest}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover bg-amber-200"
                        />
                        <div className="whitespace-nowrap font-semibold">
                          {item.name}
                        </div>
                      </div>
                    </td>

                    <td className="text-[14px] px-8 py-3 text-left min-w-[250px]">
                      <div>
                        <div className="font-semibold">
                          {item.device_type || "N/A"}
                        </div>
                        <div className="text-gray-500">{item.fullPhone}</div>
                        <div className="text-gray-500">{item.email}</div>
                      </div>
                    </td>

                    <td className="text-[14px] px-4 py-2">
                      <div
                        onClick={() => {
                          // setSelectedCustomer(item);
                          // setShowStatusModal(true);
                        }}
                        className={`cursor-pointer px-2 py-1 w-full flex justify-center items-center ${
                          item.account_status === "active"
                            ? "bg-green-200 text-green-500"
                            : item.account_status === "inactive"
                            ? "bg-yellow-200 text-yellow-500"
                            : "bg-red-200 text-red-500"
                        } font-semibold rounded-full hover:opacity-90 transition`}
                        title="Click to change status"
                      >
                        {item.account_status}
                      </div>
                    </td>

                    <td className="text-[14px] px-8 py-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
                          onClick={() => navigate(`/UserProfile/${item._id}`)}
                        >
                          <FiEye size={16} />
                        </button>
                        {/* <button
                          className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 whitespace-nowrap"
                          onClick={() => openDeleteModal(item._id)}
                        >
                          <RiDeleteBinLine size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalUsers}
            itemsPerPage={10}
            onPageChange={(page) => fetchUsers(page)}
            totalPages={pagination.totalPages}
            type="backend"
          />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Yes, Delete"
        para="Do you really want to delete this User? This action cannot be undone."
      />

      {/* Status Update Modal */}
      {showStatusModal && selectedCustomer && (
        <UserUpdateStatus
          userId={selectedCustomer._id}
          status={selectedCustomer.account_status}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            fetchUsers(pagination.currentPage);
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

export default UserList;
