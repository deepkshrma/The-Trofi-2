import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageTitle from "../../components/PageTitle/PageTitle";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { TiTick } from "react-icons/ti";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { BASE_URL } from "../../config/Config";
import { FaSearch } from "react-icons/fa";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function RoleList() {
  const [roles, setRoles] = useState([
    {
      id: "1",
      name: "Admin",
      description: "Has full access to the system",
      status: "active",
    },
    {
      id: "2",
      name: "Editor",
      description: "Can edit content but has limited access",
      status: "inactive",
    },
    {
      id: "3",
      name: "Viewer",
      description: "Read-only access",
      status: "active",
    },
  ]);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const navigate = useNavigate();

  // Fetch all roles
  // const fetchRoles = async () => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     if (!token) {
  //       // toast.error("Token not found!");
  //       return;
  //     }

  //     const res = await axios.get(`${BASE_URL}/admin/get-all-roles`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const rolesData = res.data.data.map((role) => ({
  //       id: role._id,
  //       name: role.name,
  //       description: role.description || "-",
  //       status: role.isActive ? "active" : "inactive",
  //     }));

  //     setRoles(rolesData);
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message || "failed to fetch  roles !";
  //     // toast.error(errorMessage);
  //   }
  // };

  // useEffect(() => {
  //   fetchRoles();
  // }, []);

  // //pagination
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [search, statusFilter]);

  // Filtered roles by status
  const filteredRoles = useMemo(() => {
    if (statusFilter === "All") return roles;
    return roles.filter(
      (role) => role.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [statusFilter, roles]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRoles.slice(startIndex, startIndex + pageSize);
  }, [filteredRoles, currentPage]);

  // Handle role deletion
  const openDeleteModal = (roleId) => {
    setSelectedRoleId(roleId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRoleId(null);
  };

  const confirmDelete = async () => {
    
  };
  // const confirmDelete = async () => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     await axios.delete(`${BASE_URL}/admin/delete-role/${selectedRoleId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     fetchRoles();
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message ||
  //       "failed to delete role , please try again !";
  //     toast.error(errorMessage);
  //   } finally {
  //     closeDeleteModal();
  //   }
  // };

  // const toggleRoleStatus = async (roleId, currentStatus) => {
  //   try {
  //     const authData = JSON.parse(localStorage.getItem("broom_auth"));
  //     const token = authData?.token;

  //     if (!token) return toast.error("Unauthorized");

  //     const newStatus = currentStatus === "active" ? false : true;

  //     await axios.patch(
  //       `${BASE_URL}/admin/change-status/${roleId}`,
  //       { isActive: newStatus },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     toast.success(`Role is now ${newStatus ? "active" : "deactive"}`);

  //     setRoles((prev) =>
  //       prev.map((role) =>
  //         role.id === roleId
  //           ? {
  //               ...role,
  //               status: newStatus ? "active" : "inactive",
  //             }
  //           : role
  //       )
  //     );
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.message || "Failed to change status!";
  //     // toast.error(errorMessage);
  //   }
  // };

  const toggleRoleStatus = async (roleId, currentStatus) => {

  };
  const columns = useMemo(() => {
    return [
      {
        header: "SL",
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
      },
      {
        header: "Role Name",
        accessorKey: "name",
        cell: (info) => {
          const status = info.row.original.status;
          const name = info.row.original.name;
          return (
            <span
              className={`font-semibold  ${
                status === "inactive" ? "text-red-500" : "text-green-500"
              }`}
            >
              {name}
            </span>
          );
        },
      },

      {
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <div
            className={`flex gap-1 justify-center items-center rounded-full px-4 py-1   ${
              info.row.original.status === "active"
                ? "bg-green-100 text-green-500  font-semibold"
                : "bg-red-100 text-red-500  font-semibold"
            }`}
          >
            <span className="text-[14px] capitalize">
              {info.row.original.status}
            </span>
          </div>
        ),
      },
      {
        header: "Action",
        cell: (info) => (
          <div className="flex items-center gap-2 text-[14px] px-4 py-2 text-left">
            <div
              onClick={() => navigate(`/RoleUpdate/${info.row.original.id}`)}
              className="flex justify-center items-center w-[25px] h-[25px] border border-blue-500 rounded hover:bg-blue-500 text-blue-500 hover:text-white cursor-pointer"
            >
              <MdEdit className="text-[15px]" />
            </div>
            <div
              onClick={() =>
                toggleRoleStatus(info.row.original.id, info.row.original.status)
              }
              title={`Make ${
                info.row.original.status === "active" ? "Inactive" : "Active"
              }`}
              className={`flex justify-center items-center w-[25px] h-[25px] border rounded cursor-pointer ${
                info.row.original.status === "active"
                  ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              }`}
            >
              <TiTick className="text-[15px]" />
            </div>

            <div
              onClick={() => openDeleteModal(info.row.original.id)}
              className="flex justify-center items-center w-[25px] h-[25px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded cursor-pointer"
            >
              <RiDeleteBin5Line className="text-[15px]" />
            </div>
          </div>
        ),
      },
    ];
  }, [navigate, currentPage, pageSize]);

  const table = useReactTable({
    data: paginatedRoles,
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
      <BreadcrumbsNav customTrail={[{ label: "Role List", path: "/Roles" }]} />
      <div className="flex justify-between items-center">
        <PageTitle title={"All Roles"} />
        <button
          className="bg-[#F9832B] text-white cursor-pointer px-4 py-2 rounded hover:bg-[#e67220] text-[12px]"
          onClick={() => navigate("/RoleUpdate")}
        >
          <span className="font-bold">+ </span>ADD ROLE
        </button>
      </div>

      <div className="px-4 rounded-lg shadow-md flex justify-between font-bold">
        <ul className="flex text-[12px] gap-2">
          {["All", "Active", "Inactive"].map((status) => (
            <li
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-2 cursor-pointer capitalize ${
                statusFilter === status
                  ? "text-black font-semibold"
                  : "text-gray-400"
              }`}
            >
              {status}
            </li>
          ))}
        </ul>

        <div>
          <span className="text-[12px] text-gray-400">Total Roles: </span>
          {filteredRoles.length}
        </div>
      </div>

      <div className="bg-white p-3 shadow-xl">
        <form className="flex gap-1 mb-3">
          <div className="relative flex gap-2 px-3 py-2  bg-gray-100 w-[300px] rounded-md">
            <FaSearch className="absolute opacity-40 top-3" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here"
              className="ml-6 text-[14px] outline-none bg-gray-100 appearance-none"
            />
          </div>
        </form>

        <table className="w-full text-sm table-auto p-3">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`p-3 ${
                      ["Status", "Action"].includes(
                        header.column.columnDef.header
                      )
                        ? "text-center w-[140px]"
                        : "text-left"
                    }`}
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-500 py-6"
                >
                  {statusFilter === "Inactive"
                    ? "No role is inactive."
                    : statusFilter === "Active"
                    ? "No active roles found."
                    : "No roles available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRoles.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Yes, Delete"
        para="Do you really want to delete this Role? This action cannot be
            undone."
      />
    </div>
  );
}

export default RoleList;
