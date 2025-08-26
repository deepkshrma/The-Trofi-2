import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  FaSearch,
  FaCaretDown,
  FaCaretLeft,
  FaCaretRight,
} from "react-icons/fa";
import guestImg from "../../assets/images/guest.png";
import axios from "axios";
import { toast } from "react-toastify";
import PageTitle from "../../components/PageTitle/PageTitle";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import AdminRoleChangeModel from "../../components/AdminRoleChangeModal/AdminRoleChangeModal";
import { BASE_URL } from "../../config/Config";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { Navigate, useNavigate } from "react-router-dom";
import { TfiLayoutMenuSeparated } from "react-icons/tfi";
import AdminRoleModel from "../../components/AdminRoleModel/AdminRoleModel";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

const AdminList = () => {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [admins, setAdmins] = useState([{
    empId: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Super Admin",
    profilePhoto: guestImg,
    status: "active",
  },
  {
    empId: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    profilePhoto: guestImg,
    status: "inactive",
  },
  {
    empId: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Manager",
    profilePhoto: guestImg,
    status: "suspended",
  },]);
  const [rolesMap, setRolesMap] = useState({});
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAdminForRoleChange, setSelectedAdminForRoleChange] =
    useState(null);

  // const fetchAdminDetails = async (empId) => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     const res = await axios.get(`${BASE_URL}/admin/get-admin-byId/${empId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const admin = res.data.data;

  //     setSelectedAdmin({
  //       empId: admin._id,
  //       status: admin.status,
  //       status_reason: admin.status_reason || "",
  //     });

  //     setShowStatusModal(true);
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message || "Failed to fetch admin details";
  //     toast.error(errorMessage);
  //   }
  // };

  // const handleStatusChangeConfirm = async (newStatus) => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     await axios.put(
  //       `${BASE_URL}/admin/update-admin-status/${currentStatusAdmin.empId}`,
  //       {
  //         status: newStatus,
  //         status_reason: "",
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     setAdmins((prevAdmins) =>
  //       prevAdmins.map((admin) =>
  //         admin.empId === currentStatusAdmin.empId
  //           ? { ...admin, status: newStatus }
  //           : admin
  //       )
  //     );
  //   } catch (error) {
  //     toast.error("Failed to change status !");
  //   } finally {
  //     setShowStatusModal(false);
  //     setCurrentStatusAdmin(null);
  //   }
  // };

  {
    showStatusModal && (
      <AdminRoleModel
        onClose={() => setShowStatusModal(false)}
        adminId={selectedAdmin?.empId}
        currentStatus={selectedAdmin?.status}
        onStatusUpdated={handleStatusChangeConfirm}
      />
    );
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //       const token = authData?.token;

  //       if (!token) {
  //         // toast.error("Token not found !! login again ");
  //         return;
  //       }

  //       const [adminRes, rolesRes] = await Promise.all([
  //         axios.get(`${BASE_URL}/admin/get-all-admins`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get(`${BASE_URL}/admin/get-all-roles`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //       ]);
  //       setAllRoles(rolesRes.data.data);
  //       // Build role map
  //       const roleMap = {};
  //       rolesRes.data.data.forEach((role) => {
  //         roleMap[role._id] = role.name;
  //       });
  //       setRolesMap(roleMap);

  //       // Transform admins
  //       const transformedAdmins = adminRes.data.data.map((admin) => ({
  //         name: `${admin.first_name} ${admin.last_name}`,
  //         email: admin.email,
  //         empId: admin._id,
  //         role:
  //           typeof admin.role === "string"
  //             ? roleMap[admin.role] || "Unknown"
  //             : admin.role?.name || roleMap[admin.role?._id] || "Unknown",
  //         profilePhoto: admin.profile_picture
  //           ? `${BASE_URL}/${admin.profile_picture}`
  //           : guestImg,
  //         status: admin.status,
  //       }));

  //       setAdmins(transformedAdmins);
  //     } catch (error) {
  //       const errorMessage =
  //         error?.response?.data?.message ||
  //         "failed to fetch admins and roles !";
  //       // toast.error(errorMessage);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [search, statusFilter]);

  const openDeleteModal = (empId) => {
    setSelectedAdmin(empId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedAdmin(null);
  };

  const confirmDelete = async () => {
    
  }

  // const confirmDelete = async () => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     await axios.delete(`${BASE_URL}/admin/delete-admin/${selectedAdmin}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     toast.success("Admin Successfully Delete !");
  //     // Remove the deleted admin from local state
  //     setAdmins((prevAdmins) =>
  //       prevAdmins.filter((admin) => admin.empId !== selectedAdmin)
  //     );
  //   } catch (error) {
  //     const errorMessage = error?.response?.data?.message || "failed to delete";
  //     // toast.error(errorMessage);
  //   } finally {
  //     closeDeleteModal();
  //   }
  // };

  const columns = useMemo(
    () => [
      {
        header: "SL",
        size: 50,
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
      },
      {
        header: "Image",
        size: 70,
        accessorKey: "profilePhoto",
        cell: (info) => {
          const imageUrl = info.row.original.profilePhoto || guestImg;
          return (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img
                src={imageUrl}
                alt="profile_pic"
                className="w-full h-full object-cover"
              />
            </div>
          );
        },
      },
      {
        header: "Admin Name",
        accessorKey: "name",
        cell: (info) => {
          const status = info.row.original.status;

          const nameColor =
            status === "active"
              ? "text-green-600"
              : status === "inactive"
              ? "text-yellow-600"
              : "text-red-600";

          return (
            <div>
              <div className={`font-semibold ${nameColor}`}>
                {info.row.original.name}
              </div>
              <div className="text-gray-500 text-sm">
                {info.row.original.email}
              </div>
            </div>
          );
        },
      },

      {
        header: "Role",
        accessorKey: "role",
        cell: (info) => {
          const row = info.row.original;
          return <div className="text-sm text-gray-800">{row.role}</div>;
        },
      },

      {
        header: "Status",
        accessorKey: "status",
        size: 50,
        cell: (info) => {
          const status = info.row.original.status;

          const statusColor =
            status === "active"
              ? "bg-green-100 text-green-600"
              : status === "inactive"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600";

          return (
            <div
              className={`flex gap-1 justify-center items-center rounded-full px-2 py-1 cursor-pointer font-semibold text-[14px] capitalize ${statusColor}`}
              onClick={() => fetchAdminDetails(info.row.original.empId)}
            >
              {status}
            </div>
          );
        },
      },

      {
        header: "Action",
        size: 100,
        cell: ({ row }) => {
          const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
          const dropdownRef = React.useRef(null);

          React.useEffect(() => {
            const handleClickOutside = (event) => {
              if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
              ) {
                setIsDropdownOpen(false);
              }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
              document.removeEventListener("mousedown", handleClickOutside);
            };
          }, []);

          return (
            <div className="relative flex items-center gap-2 text-[14px]  py-2 text-left">
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`flex justify-center items-center w-[40px] h-[25px] border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded cursor-pointer ${
                    isDropdownOpen ? "bg-blue-400 text-white" : ""
                  }`}
                >
                  <TfiLayoutMenuSeparated className="text-[15px]" />
                </div>

                {isDropdownOpen && (
                  <ul className="absolute bottom-[-340%] right-[-165%] text-sm shadow-lg bg-blue-50   rounded z-10 ">
                    <li
                      className="flex gap-3 hover:shadow-md  px-4 py-1 rounded cursor-pointer text-green-500 font-[600]"
                      onClick={() =>
                        navigate(`/update_profile/${row.original.empId}`)
                      }
                    >
                      <MdEdit className="text-[15px]" />
                      Edit
                    </li>
                    <li
                      className="flex gap-3 hover:shadow-md  px-4 py-1 rounded cursor-pointer text-red-500 font-[600]"
                      onClick={() => openDeleteModal(row.original.empId)}
                    >
                      <RiDeleteBin5Line className="text-[15px] " />
                      Delete
                    </li>
                    <li
                      className="flex gap-3 hover:shadow-md px-4 py-1 rounded cursor-pointer text-yellow-700 font-[600]"
                      onClick={() => {
                        setSelectedAdminForRoleChange({
                          id: row.original.empId,
                          currentRoleId:
                            allRoles.find((r) => r.name === row.original.role)
                              ?._id || "",
                        });
                        setShowRoleModal(true);
                      }}
                    >
                      <AiOutlineExclamationCircle className="text-[15px]" />
                      Role
                    </li>
                  </ul>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    [currentPage, pageSize],
    []
  );

  const filteredAdmins = useMemo(() => {
    if (statusFilter === "active") {
      return admins.filter((admin) => admin.status === "active");
    } else if (statusFilter === "inactive") {
      return admins.filter((admin) => admin.status === "inactive");
    } else if (statusFilter === "suspended" || statusFilter === "Suspend") {
      return admins.filter((admin) => admin.status === "suspended");
    }
    return admins;
  }, [admins, statusFilter]);

  const totalPages = Math.ceil(filteredAdmins.length / pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredAdmins, pageSize, totalPages]);

  // Pagination data
  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(startIndex, startIndex + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  const table = useReactTable({
    data: paginatedAdmins,
    columns,
    state: {
      globalFilter: search,
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="main main_page bg-[#FFFEF6] font-Montserrat space-y-4">
      <BreadcrumbsNav
        customTrail={[{ label: "Admin List", path: "/admin_list" }]}
      />
      <div className="flex justify-between items-center">
        <PageTitle title={"Admin List"} />
        <button
          className="bg-[#F9832B] text-white cursor-pointer px-4 py-2 rounded hover:bg-[#e67220] text-[12px]"
          onClick={() => navigate("/CreateAdmin")}
        >
          <span className="font-bold">+ </span>ADD ADMIN
        </button>
      </div>

      <div className="px-4 rounded-lg shadow-md flex justify-between font-bold">
        <ul className="flex text-[12px] gap-2">
          {["all", "active", "inactive", "Suspend"].map((status) => (
            <li
              key={status}
              className={`p-2 cursor-pointer ${
                statusFilter === status ? "text-black" : "text-gray-400"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === "Suspend"
                ? "Suspended"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </li>
          ))}
        </ul>

        <div>
          <span className="text-[12px] text-gray-400">Total Admins: </span>
          <span className="text-[12px] text-black">
            {table.getRowModel().rows.length}
          </span>
        </div>
      </div>

      <div className="bg-white p-3 shadow-xl">
        <form className="flex gap-1 mb-3">
          <div className="relative flex gap-2 px-3 py-2  bg-blue-50 w-[300px] rounded-md">
            <FaSearch className="absolute opacity-40 top-3" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here"
              className="ml-6 text-[14px] outline-none bg-blue-50 appearance-none"
            />
          </div>
        </form>

        {table.getRowModel().rows.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-medium">
            {statusFilter === "active" && "No active admins found."}
            {statusFilter === "inactive" && "No inactive admins found."}
            {statusFilter === "Suspend" && "No suspended admins found."}
            {statusFilter === "all" && "No admins available."}
          </div>
        ) : (
          <table className="w-full text-sm table-auto p-3">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`p-3 ${
                        header.column.columnDef.header === "Status"
                          ? "text-center px-10"
                          : "text-left"
                      }`}
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-b-[#E0E0E0] hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`p-3  ${
                        cell.column.columnDef.header === "Status"
                          ? "text-center px-10"
                          : "text-left"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showRoleModal && selectedAdminForRoleChange && (
        <AdminRoleChangeModel
          onClose={() => setShowRoleModal(false)}
          adminId={selectedAdminForRoleChange.id}
          currentRoleId={selectedAdminForRoleChange.currentRoleId}
          allRoles={allRoles}
          onRoleUpdated={(newRoleId) => {
            const newRoleName = rolesMap[newRoleId] || "Updated";
            setAdmins((prev) =>
              prev.map((admin) =>
                admin.empId === selectedAdminForRoleChange.id
                  ? { ...admin, role: newRoleName }
                  : admin
              )
            );
          }}
        />
      )}

      {showStatusModal && selectedAdmin && (
        <AdminRoleModel
          onClose={() => setShowStatusModal(false)}
          adminId={selectedAdmin.empId}
          currentStatus={selectedAdmin.status}
          defaultReason={selectedAdmin.status_reason}
          onStatusUpdated={(updatedStatus, updatedReason) => {
            setAdmins((prevAdmins) =>
              prevAdmins.map((admin) =>
                admin.empId === selectedAdmin.empId
                  ? {
                      ...admin,
                      status: updatedStatus,
                      status_reason: updatedReason,
                    }
                  : admin
              )
            );
            setShowStatusModal(false);
          }}
        />
      )}

      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Yes, Delete"
        para="Do you really want to delete this admin? This action cannot be undone."
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredAdmins.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AdminList;
