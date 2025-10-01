import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

function CreatePolicy() {
  const [policyType, setPolicyType] = useState("Privacy");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const policyData = location.state?.policy;

  // If edit mode
  useEffect(() => {
    if (policyData) {
      const { _id, policyType, title, description } = policyData;
      setEditId(_id);
      setPolicyType(policyType || "Privacy");
      setTitle(title);
      setDescription(description);
    }
  }, [policyData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      toast.error("Please provide both Title and Description");
      return;
    }

    const payload = {
      policyType,
      title,
      description,
    };

    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      let res;
      if (editId) {
        // Edit mode (policy update)
        res = await axios.patch(
          `${BASE_URL}/admin/policy/${editId}`,
          { ...payload },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Create mode
        res = await axios.post(`${BASE_URL}/admin/policy`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || "Policy saved successfully");
        navigate("/PoliciesList");
        if (!editId) {
          setTitle("");
          setDescription("");
          setPolicyType("Privacy");
        }
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("API ERROR:", err);
      toast.error(err.response?.data?.message || "Error while saving policy");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Policies List", path: "/PoliciesList" },
          {
            label: editId ? "Edit Policy" : "Create Policy",
            path: "/CreatePolicy",
          },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title={editId ? "Edit Policy" : "Create Policy"} />

        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Policy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Type
            </label>
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-2 
              text-gray-700 shadow-sm focus:border-orange-400 focus:ring-2 
              focus:ring-orange-300 outline-none transition duration-200 bg-white cursor-pointer"
            >
              <option value="Privacy">Privacy</option>
              <option value="TermsOfService">Terms Of Service</option>
              <option value="Acknowledgment">Acknowledgment</option>
              <option value="AboutUs">About Us</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Policy Title"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
              shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
              outline-none transition duration-200"
              required
            />
          </div>

          {/* Description - SunEditor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <SunEditor
              setOptions={{
                buttonList: [
                  ["undo", "redo"],
                  ["bold", "underline", "italic", "strike"],
                  ["font", "fontSize", "formatBlock"],
                  ["fontColor", "hiliteColor", "align", "list", "table"],
                  ["link", "image", "video"],
                  ["removeFormat", "fullScreen"],
                ],
              }}
              height="300px"
              setContents={description}
              onChange={(content) => setDescription(content)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
              shadow-md transition hover:bg-orange-600 hover:shadow-lg 
              focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePolicy;
