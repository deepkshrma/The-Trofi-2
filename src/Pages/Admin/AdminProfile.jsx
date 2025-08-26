import React from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import profile_image from "../../assets/images/guest.png";

function AdminProfile() {
  const profileData = {
    first_name: "John",
    last_name: "Stephen",
    email: "john.stephen@example.com",
    phone: "+91 9876543210",
    dob: "15 Aug 1998",
    gender: "Male",
    fullAddress: "123, Green Avenue, Jaipur, Rajasthan, India",
    role: "Admin",
    profileImage: ""
  };

  const {
    first_name,
    last_name,
    email,
    phone,
    dob,
    gender,
    profile_picture,
    fullAddress,
  } = profileData;
  return (
    <>
      <div className="main main_page flex flex-col w-full h-screen">
        <div className="w-full flex items-center justify-start translate-x-28">
          <PageTitle title={"Profile"} />
        </div>
        <div className="w-5/6 p-8 mt-4 bg-white rounded-lg shadow-md pl-20">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left Section - Profile Image and Role */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <img
                src={
                profile_picture
                  ? `${BASE_URL}/${profile_picture}`
                  : profile_image
              }
                alt="Profile"
                className="w-32 h-32 rounded-full shadow-lg object-cover"
              />
              <h2 className="text-2xl font-bold text-gray-800">Admin</h2>
              <button className="text-white bg-[#e67220] focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer">
                Edit Profile
              </button>
            </div>

            {/* Right Section - User Details */}
            <div className="md:col-span-2 space-y-4 pr-0">
              <h2 className="text-lg font-semibold mb-5">Details</h2>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Name</span>
                <span className="text-gray-800">
                  {first_name} {last_name}
                </span>
              </div>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-800">{email}</span>
              </div>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Mobile Number</span>
                <span className="text-gray-800">{phone}</span>
              </div>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">DOB</span>
                <span className="text-gray-800">{dob}</span>
              </div>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Gender</span>
                <span className="text-gray-800">{gender}</span>
              </div>
              <div className="grid grid-cols-2  border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Address</span>
                <span className="text-gray-800">{fullAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminProfile;
