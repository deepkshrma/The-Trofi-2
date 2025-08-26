import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { FaSearch } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import axios from "axios";
import guest from "../../assets/images/guest.png";
import { USER_BASE_URL } from "../../config/Config";
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
import { FaUsers } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaUserXmark } from "react-icons/fa6";
import { FaUserShield } from "react-icons/fa6";

function UserList() {
  const [users, setUsers] = useState([
    {
      _id: "u1",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      status: "active",
      createdAt: "2024-07-12T10:20:30Z",
      profile_picture: null,
      address: { city: "Mumbai" },
    },
    {
      _id: "u2",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "+91 9988776655",
      status: "inactive",
      createdAt: "2024-06-20T14:05:00Z",
      profile_picture: null,
      address: { city: "Delhi" },
    },
    {
      _id: "u3",
      first_name: "Raj",
      last_name: "Kumar",
      email: "raj.kumar@example.com",
      phone: "+91 9123456780",
      status: "suspended",
      createdAt: "2024-05-01T09:45:15Z",
      profile_picture: null,
      address: { city: "Bangalore" },
    },
    {
      _id: "u4",
      first_name: "Emily",
      last_name: "Johnson",
      email: "emily.johnson@example.com",
      phone: "+91 9001122334",
      status: "active",
      createdAt: "2024-04-18T12:30:45Z",
      profile_picture: null,
      address: { city: "Hyderabad" },
    },
    {
      _id: "u5",
      first_name: "Amit",
      last_name: "Verma",
      email: "amit.verma@example.com",
      phone: "+91 9112233445",
      status: "inactive",
      createdAt: "2024-03-25T08:15:10Z",
      profile_picture: null,
      address: { city: "Kolkata" },
    },
  ]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;

      const response = await axios.get(
        `${USER_BASE_URL}/get-all-users?role=user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [pagination.currentPage]);

  const renderStatusBadge = (user) => {
    const colorMap = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer ${
          colorMap[user.status] || "bg-[#FFFEF6] text-gray-800"
        }`}
        onClick={() => {
          setSelectedCustomer(user);
          setShowStatusModal(true);
        }}
        title="Click to change status"
      >
        {user.status}
      </span>
    );
  };

  const handleDropdownClick = (userId, action) => {
    if (action === "status") {
      const customer = users.find((u) => u._id === userId);
      setSelectedCustomer(customer);
      setShowStatusModal(true);
    }
  };

  const openDeleteModal = (id) => {
    setSelectedCustomerId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedCustomerId(null);
    setShowDeleteModal(false);
  };
  const confirmDelete = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;

      const response = await axios.delete(
        `${USER_BASE_URL}/delete-user/${selectedCustomerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("User deleted successfully.");
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== selectedCustomerId)
        );
      } else {
        toast.error("Failed to delete user.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "failed to delete !";
      toast.error(errorMessage);
    } finally {
      closeDeleteModal();
    }
  };

  const handleExport = () => {
    const exportData = users.map((user, index) => ({
      SL: index + 1,
      Name: `${user.first_name} ${user.last_name}`,
      Email: user.email,
      Phone: user.phone,
      City: user.address?.city || "N/A",
      Status: user.status,
      Created_At: new Date(user.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Customers.xlsx");
  };

  return (
    <div className="main main_page bg-[#FFFEF6] font-Montserrat space-y-4">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/CustomerList" }]}
      />
      <PageTitle title={"Customer"} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Customers</h4>
            <p className="text-[22px] font-semibold">{users.length}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaUsers size={35} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Active Customers</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.status === "active").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaUserAlt size={35} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Inactive Customers</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.status === "inactive").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaUserXmark size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Suspended</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.status === "suspended").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaUserShield size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

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
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded-md shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                {["SL", "Customer", "Contact Info", "Status", "Action"].map(
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
                    (statusFilter === "all" || item.status === statusFilter) &&
                    `${item.first_name} ${item.last_name} ${item.email} ${item.phone}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={item._id} className="border-b border-gray-200">
                    <td className="text-[14px] px-8 py-3 text-left">
                      {(pagination.currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td className="text-[14px] px-8 py-3 text-left min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.profile_picture
                              ? `${USER_BASE_URL}/${item.profile_picture}`
                              : guest
                          }
                          alt={`${item.first_name} ${item.last_name}`}
                          className="w-10 h-10 rounded-full object-cover bg-amber-200"
                        />
                        <div className="whitespace-nowrap font-semibold">
                          {item.first_name} {item.last_name}
                        </div>
                      </div>
                    </td>

                    <td className="text-[14px] px-8 py-3 text-left min-w-[250px]">
                      <div>
                        <div className="font-semibold">
                          {item.address?.city || "N/A"}
                        </div>
                        <div className="text-gray-500">{item.phone}</div>
                        <div className="text-gray-500">{item.email}</div>
                      </div>
                    </td>

                    <td className="text-[14px] px-4 py-2">
                      <div
                        onClick={() => {
                          setSelectedCustomer(item);
                          setShowStatusModal(true);
                        }}
                        className={`cursor-pointer px-2 py-1 w-full flex justify-center items-center ${
                          item.status === "active"
                            ? "bg-green-200 text-green-500"
                            : item.status === "inactive"
                            ? "bg-yellow-200 text-yellow-500"
                            : "bg-red-200 text-red-500"
                        } font-semibold rounded-full hover:opacity-90 transition`}
                        title="Click to change status"
                      >
                        {item.status}
                      </div>
                    </td>

                    <td className="text-[14px] px-8 py-3 text-center">
                      <div className="w-full flex border-1 border-gray-300 rounded-md">
                        <div
                          className="w-1/2 flex justify-center items-center py-2 hover:bg-gray-100 cursor-pointer"
                          title="View"
                          onClick={() =>
                            navigate(`/CustomerProfile/${item._id}`)
                          }
                        >
                          <FiEye size={18} />
                        </div>
                        <div
                          className="w-1/2 flex justify-center items-center border-l border-gray-300 hover:bg-gray-100 cursor-pointer"
                          onClick={() => openDeleteModal(item._id)}
                          title="Delete"
                        >
                          <RiDeleteBinLine className="text-red-500" size={18} />
                        </div>
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
          {/* pagination button */}
          {/* <div className="flex justify-end mt-4 space-x-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: i + 1,
                  }))
                }
                className={`px-3 py-1 border rounded ${
                  pagination.currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div> */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalUsers}
            itemsPerPage={10} // Same limit as API
            onPageChange={(page) => fetchUsers(page)} // Call API on page change
            totalPages={pagination.totalPages} // Backend total pages
            type="backend"
          />
        </div>
      </div>
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
          status={selectedCustomer.status}
          reason={selectedCustomer.status_reason}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

export default UserList;
