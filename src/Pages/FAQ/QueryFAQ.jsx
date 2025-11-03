import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel"; // ✅ import modal

import { FaTrash, FaEye } from "react-icons/fa";

const QueryFAQ = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedQuery(null);
  };

  const confirmDelete = async () => {
    if (!selectedQuery) return;
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.delete(
        `${BASE_URL}/admin/faq-query/${selectedQuery._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Query deleted successfully");
        fetchQueries();
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.get(`${BASE_URL}/admin/faq-query`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setQueries(res.data.data);
        setPagination((p) => ({
          ...p,
          totalRecords: res.data.data.length,
          totalPages: Math.ceil(res.data.data.length / pageSize),
        }));
      } else {
        toast.error(res.data.message || "Failed to fetch queries");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch FAQ Queries");
    } finally {
      setLoading(false);
    }
  };

  // Pagination slice
  const start = (pagination.currentPage - 1) * pageSize;
  const paginated = queries.slice(start, start + pageSize);

  return (
    <>
      <div className="main main_page p-6 duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Query FAQs", path: "/QueryFAQ" }]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Query FAQ List"} />
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
          {loading ? (
            <div className="text-center p-6">Loading Query FAQs…</div>
          ) : error ? (
            <div className="text-center p-6 text-red-500">Error: {error}</div>
          ) : (
            <>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-700">
                    <th className="p-3 pl-4">S.No.</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((q, index) => (
                      <tr
                        key={q._id}
                        className="border-b border-gray-300 hover:bg-orange-50 transition"
                      >
                        <td className="p-3 pl-4 font-medium text-gray-700">
                          {start + index + 1}
                        </td>
                        <td className="p-3 text-gray-700">{q.email}</td>
                        <td className="p-3 text-gray-500">{q.message}</td>
                        <td className="p-3 text-gray-500">
                          {new Date(q.createdAt).toLocaleString()}
                        </td>
                        <td className="flex p-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => navigate(`/QueryFAQSee/${q._id}`)}
                              className="flex justify-center items-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuery(q);
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
                        No Query FAQs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={queries.length}
                itemsPerPage={pageSize}
                onPageChange={(page) =>
                  setPagination((p) => ({ ...p, currentPage: page }))
                }
                totalPages={pagination.totalPages}
                type="frontend"
              />
            </>
          )}
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete this query? This action cannot be undone."
      />
    </>
  );
};

export default QueryFAQ;
