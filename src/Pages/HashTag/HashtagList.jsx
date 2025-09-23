import React, { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit, MdDelete } from "react-icons/md";
import { PlusCircle } from "lucide-react";

function HashtagList() {
  const [hashtags, setHashtags] = useState([]);
  const [type, setType] = useState("Restaurant"); // default type
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);

  const navigate = useNavigate();

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedHashtag(null);
  };

  const fetchHashtags = async (page = 1, selectedType = type) => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axios.get(
        `${BASE_URL}/restro/get-admin-hashtags?type=${selectedType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        // Flatten the object into an array
        const flattened = Object.keys(res.data.data || {}).flatMap((key) =>
          res.data.data[key].map((item) => ({
            ...item,
            star_value: key,
            type: selectedType,
          }))
        );

        setHashtags(flattened);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalRecords: flattened.length,
          totalPages: 1,
        }));
      } else {
        toast.error(res.data?.message || "Failed to fetch hashtags");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching hashtags");
    }
  };

  useEffect(() => {
    fetchHashtags(1);
    // eslint-disable-next-line
  }, []);

  const filteredHashtags = hashtags.filter((tag) =>
    tag.hashTagTitle.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!selectedHashtag) return;
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axios.delete(
        `${BASE_URL}/restro/delete-hashtags/${selectedHashtag._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data?.success) {
        toast.success("Hashtag deleted successfully");
        fetchHashtags(pagination.currentPage, type);
      } else {
        toast.error(res.data?.message || "Failed to delete hashtag");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting hashtag");
    } finally {
      closeDeleteModal();
    }
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    fetchHashtags(1, selectedType);
  };

  return (
    <>
      <div className="p-6 main main_page duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Hashtags", path: "/HashtagList" }]}
        />

        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Hashtags"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/CreateHashtag")}
          >
            <PlusCircle size={18} /> Add Hashtag
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 m-3 items-center">
            <select
              value={type}
              onChange={handleTypeChange}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Dish">Dish</option>
            </select>

            <input
              type="text"
              placeholder="Search by hashtag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div>

          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="p-3 pl-4">S.No.</th>
                <th className="p-3">Type</th>
                <th className="p-3">Star Value</th>
                <th className="p-3">Hashtag</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHashtags.length > 0 ? (
                filteredHashtags.map((tag, index) => (
                  <tr
                    key={tag._id}
                    className="border-b border-gray-300 hover:bg-orange-50 transition"
                  >
                    <td className="p-3 pl-4 font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700">{tag.type}</td>
                    <td className="p-3 text-gray-700">{tag.star_value}</td>
                    <td className="p-3 text-gray-700">{tag.hashTagTitle}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate("/CreateHashtag", {
                              state: { rowData: tag },
                            })
                          }
                          className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8 cursor-pointer rounded text-sm"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedHashtag(tag);
                            setShowDeleteModal(true);
                          }}
                          className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8 cursor-pointer rounded text-sm"
                        >
                          <MdDelete size={18} />
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
                    No hashtags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            onPageChange={(page) => fetchHashtags(page, type)}
            totalPages={pagination.totalPages}
            type="backend"
          />
        </div>
      </div>

      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete this hashtag? This action cannot be undone."
      />
    </>
  );
}

export default HashtagList;
