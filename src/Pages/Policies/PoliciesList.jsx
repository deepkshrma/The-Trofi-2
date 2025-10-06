import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import {  FaTrash, FaEye } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";

const PoliciesList = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search & filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  // pagination
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPolicy(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.get(`${BASE_URL}/admin/policy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setPolicies(res.data.data);
        setPagination((p) => ({
          ...p,
          totalRecords: res.data.data.length,
          totalPages: Math.ceil(res.data.data.length / pageSize),
        }));
      } else {
        toast.error(res.data.message || "Failed to fetch policies");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPolicy) return;
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.delete(
        `${BASE_URL}/admin/policy/${selectedPolicy._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Policy deleted successfully");
        fetchPolicies(); // refresh list
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting");
    } finally {
      closeDeleteModal();
    }
  };

  // filter + search
  const filteredPolicies = policies.filter((p) => {
    const matchType = filterType === "All" ? true : p.policyType === filterType;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // pagination slice
  const start = (pagination.currentPage - 1) * pageSize;
  const paginated = filteredPolicies.slice(start, start + pageSize);

  return (
    <>
      <div className="main main_page p-6 duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Policies List", path: "/PoliciesList" }]}
        />

        <div className="flex justify-between items-center mb-3">
          <PageTitle title="Policies List" />

          <button
            onClick={() => navigate("/CreatePolicy")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md cursor-pointer hover:bg-orange-600"
          >
            + Add Policy
          </button>
        </div>

        {/* search + filter */}
        <div className="flex flex-wrap gap-4 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-300 outline-none"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-300 outline-none"
          >
            <option value="All">All Policies</option>
            <option value="Privacy">Privacy</option>
            <option value="TermsOfService">Terms Of Service</option>
            <option value="Acknowledgment">Acknowledgment</option>
            <option value="AboutUs">About Us</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3">
          {loading ? (
            <div className="text-center p-6">Loading Policies…</div>
          ) : error ? (
            <div className="text-center p-6 text-red-500">Error: {error}</div>
          ) : (
            <>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-700">
                    <th className="p-3 pl-4">S.No.</th>
                    <th className="p-3">Policy Type</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((p, index) => (
                      <tr
                        key={p._id}
                        className="border-b border-gray-300 hover:bg-orange-50 transition"
                      >
                        <td className="p-3 pl-4 font-medium text-gray-700">
                          {start + index + 1}
                        </td>
                        <td className="p-3 text-gray-700">{p.policyType}</td>
                        <td className="p-3 text-gray-500">{p.title}</td>
                        <td className="p-3 text-gray-500">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="flex p-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => navigate(`/Policies/${p._id}`)}
                              className="flex justify-center items-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                navigate("/CreatePolicy", {
                                  state: { policy: p },
                                })
                              }
                              className="flex justify-center items-center cursor-pointer bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded"
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPolicy(p);
                                setShowDeleteModal(true);
                              }}
                              className="flex justify-center items-center cursor-pointer bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center p-6 text-gray-500 italic"
                      >
                        No Policies found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={filteredPolicies.length}
                itemsPerPage={pageSize}
                onPageChange={(page) =>
                  setPagination((p) => ({ ...p, currentPage: page }))
                }
                totalPages={Math.ceil(filteredPolicies.length / pageSize)}
                type="frontend"
              />
            </>
          )}
        </div>
      </div>
      {/* Delete Modal */}
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete this Policy? This action cannot be undone."
      />
    </>
  );
};

export default PoliciesList;
