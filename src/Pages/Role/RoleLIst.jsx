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
import { FaSearch } from "react-icons/fa";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const navigate = useNavigate();

  // === Fetch roles from API ===
  const fetchRoles = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.get(
        "http://trofi-backend.apponedemo.top/api/admin/admins-roles",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rolesData = (res.data.roles || []).map((role) => ({
        id: role._id,
        name: role.name,
        description: role.description || "-",
        status: role.status?.toLowerCase() === "active" ? "active" : "inactive",
      }));

      setRoles(rolesData);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to fetch roles. Please retry.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // === filters & pagination ===
  const filteredRoles = useMemo(() => {
    const base =
      statusFilter === "All"
        ? roles
        : roles.filter(
            (r) => r.status.toLowerCase() === statusFilter.toLowerCase()
          );
    if (!search) return base;
    return base.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, statusFilter, search]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage]);

  // === delete & status toggle ===
  const openDeleteModal = (roleId) => {
    setSelectedRoleId(roleId);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRoleId(null);
  };

  const confirmDelete = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;
      await axios.delete(
        `http://trofi-backend.apponedemo.top/api/admin/delete-role/${selectedRoleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Role deleted");
      fetchRoles();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete role. Try again."
      );
    } finally {
      closeDeleteModal();
    }
  };

  const toggleRoleStatus = async (roleId, currentStatus) => {
    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await axios.patch(
        `http://trofi-backend.apponedemo.top/api/admin/change-status/${roleId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Role is now ${newStatus}`);
      setRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    }
  };

  // === columns ===
  const columns = useMemo(
    () => [
      {
        header: "SL",
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
      },
      {
        header: "Role Name",
        accessorKey: "name",
        cell: (info) => {
          const { name, status } = info.row.original;
          return (
            <span
              className={`font-semibold ${
                status === "inactive" ? "text-red-500" : "text-green-500"
              }`}
            >
              {name}
            </span>
          );
        },
      },
      { header: "Description", accessorKey: "description" },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <div
            className={`flex gap-1 justify-center items-center rounded-full px-4 py-1 ${
              info.row.original.status === "active"
                ? "bg-green-100 text-green-500 font-semibold"
                : "bg-red-100 text-red-500 font-semibold"
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
              className={`flex justify-center items-center w-[25px] h-[25px] border rounded
    border-red-500 text-red-500
    pointer-events-none cursor-not-allowed opacity-50  ${
      info.row.original.status === "active"
        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
    }`}
            >
              <TiTick className="text-[15px]" />
            </div>
            {/* <div
              onClick={() => openDeleteModal(info.row.original.id)}
              className="flex justify-center items-center w-[25px] h-[25px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded cursor-pointer"
            >
              <RiDeleteBin5Line className="text-[15px]" />
            </div> */}
          </div>
        ),
      },
    ],
    [navigate, currentPage, pageSize]
  );

  const table = useReactTable({
    data: paginatedRoles,
    columns,
    state: { globalFilter: search, sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="main main_page w-full h-full font-Montserrat space-y-4 duration-900">
      <BreadcrumbsNav customTrail={[{ label: "Role List", path: "/Roles" }]} />
      <div className="flex justify-between items-center">
        <PageTitle title={"All Roles"} />
      </div>

      <div className="px-4 rounded-lg shadow-md flex justify-between font-bold bg-white">
        <ul className="flex text-[12px] gap-2 ">
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
          <div className="relative flex gap-2 px-3 py-2 bg-gray-100 w-[300px] rounded-md">
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
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
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
                      className={`p-3 ${
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
        para="Do you really want to delete this Role? This action cannot be undone."
      />
    </div>
  );
}

export default RoleList;
