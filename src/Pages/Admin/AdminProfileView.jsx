import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import guest from "../../assets/images/guest.png";
import AdminUpdateStatusModal from "../../components/AdminUpdateStatusModal/AdminUpdateStatusModal ";
import { FaEdit, FaUserShield, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaVenusMars } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

function AdminProfileView() {
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionStats, setPermissionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  
  const { id } = useParams();
  const navigate = useNavigate();
  const permissionTableRef = useRef(null);

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  const scrollToPermissionTable = () => {
    permissionTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchAdminProfile();
  }, [id]);

  const fetchAdminProfile = async () => {
    setLoading(true);
    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;
    
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/admin/admin/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAdmin(response.data.admin);
        setPermissions(response.data.permissions || []);
        setPermissionStats(response.data.permissionStats || null);
      } else {
        toast.error("Failed to fetch admin profile");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || "Something went wrong while fetching admin profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="flex flex-col items-center justify-center ml-64 w-full">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="main main_page min-h-screen p-6">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Admin not found</p>
          <button
            onClick={() => navigate("/AdminList")}
            className="mt-4 bg-[#F9832B] text-white px-6 py-2 rounded hover:bg-[#e67220]"
          >
            Back to Admin List
          </button>
        </div>
      </div>
    );
  }

  const initials = admin.name ? admin.name.charAt(0).toUpperCase() : "A";
  const profilePhoto = admin.profile_picture ? `${IMAGE_URL}/${admin.profile_picture}` : guest;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-yellow-500 text-white";
      case "suspended":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter((perm) =>
    perm.module?.name?.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  return (
    <div className="main main_page min-h-screen p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Admin List", path: "/AdminList" },
          { label: "Admin Profile", path: `/AdminProfile/${id}` }
        ]}
      />
      
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Admin Profile" />
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/PermissionAssign/admin/${admin._id}`, {
              state: { name: admin.name, email: admin.email }
            })}
            className="flex items-center gap-2 bg-[#F9832B] text-white cursor-pointer px-4 py-2 rounded hover:bg-[#e67220] transition text-sm"
          >
            <MdAdminPanelSettings size={18} />
            Manage Permissions
          </button>
          <button
            onClick={() => navigate(`/UpdateAdmin/${admin._id}`, { 
              state: { 
                admin: {
                  empId: admin._id,
                  name: admin.name,
                  email: admin.email,
                  phone: admin.phone,
                  dob: admin.dob,
                  gender: admin.gender,
                  address: admin.address,
                  role: admin.role?.name,
                  status: admin.status,
                  status_reason: admin.status_reason,
                  profilePhoto: profilePhoto
                }
              }
            })}
            className="flex items-center gap-2 bg-green-500 text-white cursor-pointer px-4 py-2 rounded hover:bg-green-600 transition text-sm"
          >
            <FaEdit size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Card + Permission Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-5 flex flex-col lg:flex-row gap-6 items-center lg:items-start animate-fadeIn">
        
        {/* Left: Profile Info + Status */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full lg:w-1/2 lg:pr-6">
          
          {/* Profile Image */}
          <div
            className="relative w-32 h-32 rounded-full flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 overflow-hidden bg-gray-200 shadow-lg"
            onClick={openImageModal}
          >
            {admin.profile_picture ? (
              <>
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity">
                  View Profile
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                {initials}
              </div>
            )}
          </div>

          {/* Profile Info + Status Control */}
          <div className="flex-1 w-full">
            
            {/* Basic Info */}
            <div className="text-center lg:text-left mb-4">
              <h2 className="text-2xl font-semibold flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                {admin.name}
              </h2>
              <p className="text-gray-600 mt-1 flex items-center gap-2 justify-center lg:justify-start">
                <FaEnvelope size={14} />
                {admin.email}
              </p>
              {admin.phone && (
                <p className="text-gray-500 flex items-center gap-2 justify-center lg:justify-start">
                  <FaPhone size={14} />
                  {admin.phone}
                </p>
              )}
            </div>

            {/* Account Status Control Panel */}
            <div className="rounded-xl p-4 shadow-lg relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
              
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F9832B] opacity-80"></div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-700">Account Status</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#F9832B] text-white shadow-sm">
                    {admin.role?.name || "Admin"}
                  </span>
                </div>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="text-xs font-medium text-[#F9832B] underline cursor-pointer hover:text-[#e67600] transition-colors"
                >
                  Change Status
                </button>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div
                  onClick={() => setShowStatusModal(true)}
                  className={`cursor-pointer px-4 py-2 inline-flex justify-center items-center text-sm font-semibold rounded-lg hover:opacity-90 transition shadow-sm ${getStatusColor(admin.status)}`}
                  title="Click to change status"
                >
                  {admin.status.toUpperCase()}
                </div>

                {admin.status_reason && admin.status !== "active" && (
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Reason:</p>
                    <p className="text-xs text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 line-clamp-2">
                      {admin.status_reason}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-3 italic relative z-10">
                Click status badge or "Change Status" to manage admin status
              </p>
            </div>

          </div>
        </div>

        {/* Right: Permission Summary */}
        {permissionStats && (
          <div className="w-full lg:w-1/2 bg-gray-50 rounded-xl p-6 flex flex-col gap-4 text-gray-800 shadow-md">
            <h3 className="text-xl font-semibold mb-2">Permission Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-[#F9832B]">{permissionStats.totalModules}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-600">View Access</p>
                <p className="text-2xl font-bold text-green-600">{permissionStats.viewCount}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-600">Create Access</p>
                <p className="text-2xl font-bold text-blue-600">{permissionStats.createCount}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-600">Update Access</p>
                <p className="text-2xl font-bold text-yellow-600">{permissionStats.updateCount}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <p className="text-sm text-gray-600">Delete Access</p>
                <p className="text-2xl font-bold text-red-600">{permissionStats.deleteCount}</p>
              </div>
            </div>
            <button
              onClick={scrollToPermissionTable}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F9832B] to-[#F9A33B] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              View Full Permissions
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Personal Details */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Personal Details
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {admin.dob && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-3">
              <FaCalendar className="text-[#F9832B]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-base font-semibold">{new Date(admin.dob).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* {admin.gender && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-3">
              <FaVenusMars className="text-[#F9832B]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-base font-semibold">{admin.gender}</p>
              </div>
            </div>
          )} */}

          {admin.address && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#F9832B]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base font-semibold">{admin.address}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center gap-3">
            <FaUserShield className="text-[#F9832B]" size={20} />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-base font-semibold">{admin.role?.name || "N/A"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Assigned Permissions */}
      <div ref={permissionTableRef} className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#F9832B" }}>
            Assigned Permissions
          </h3>
          <input
            type="text"
            placeholder="Search permissions by module..."
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />
        </div>

        {filteredPermissions && filteredPermissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-6 py-3 font-semibold">Module Name</th>
                  <th className="px-6 py-3 font-semibold text-center">View</th>
                  <th className="px-6 py-3 font-semibold text-center">Create</th>
                  <th className="px-6 py-3 font-semibold text-center">Update</th>
                  <th className="px-6 py-3 font-semibold text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((perm, idx) => (
                  <tr key={perm._id || idx} className="border-t border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium">{perm.module?.name || "Unknown Module"}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        perm.permissions?.view 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {perm.permissions?.view ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        perm.permissions?.create 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {perm.permissions?.create ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        perm.permissions?.update 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {perm.permissions?.update ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        perm.permissions?.delete 
                          ? "bg-red-100 text-red-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {perm.permissions?.delete ? "✓" : "✗"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <MdAdminPanelSettings className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 mb-4">
              {permissionSearch 
                ? "No permissions found matching your search" 
                : "No permissions assigned yet"}
            </p>
            {!permissionSearch && (
              <button
                onClick={() => navigate(`/PermissionAssign/admin/${admin._id}`, {
                  state: { name: admin.name, email: admin.email }
                })}
                className="bg-[#F9832B] text-white cursor-pointer px-6 py-2 rounded hover:bg-[#e67220] transition"
              >
                Assign Permissions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Account Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Account Activity
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="text-base font-semibold">
              {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never"}
            </p>
          </div>
          {admin.lastLoginIp && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Last Login IP</p>
              <p className="text-base font-semibold">{admin.lastLoginIp}</p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Account Created</p>
            <p className="text-base font-semibold">
              {new Date(admin.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-base font-semibold">
              {new Date(admin.updatedAt).toLocaleString()}
            </p>
          </div>
          {admin.createdBy && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Created By</p>
              <p className="text-base font-semibold">{admin.createdBy.name}</p>
              <p className="text-xs text-gray-400">{admin.createdBy.email}</p>
            </div>
          )}
          {admin.updatedBy && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Updated By</p>
              <p className="text-base font-semibold">{admin.updatedBy.name}</p>
              <p className="text-xs text-gray-400">{admin.updatedBy.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && admin && (
        <AdminUpdateStatusModal
          onClose={() => setShowStatusModal(false)}
          adminId={admin._id}
          currentStatus={admin.status}
          defaultReason={admin.status_reason || ""}
          onStatusUpdated={(updatedStatus, updatedReason) => {
            setAdmin({
              ...admin,
              status: updatedStatus,
              status_reason: updatedReason
            });
            setShowStatusModal(false);
            
          }}
        />
      )}

      {/* Image Modal */}
      {isImageModalOpen && admin.profile_picture && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-auto z-10 overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-red-600 hover:text-white cursor-pointer text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center justify-center p-4 max-h-[90vh]">
              <img
                src={profilePhoto}
                alt="Profile"
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProfileView;