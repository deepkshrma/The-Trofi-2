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
    profileImage: "",
  };

  const { first_name, last_name, email, phone, dob, gender, fullAddress } =
    profileData;

  return (
    <>
      <div className="main main_page flex flex-col w-full min-h-screen p-4 md:p-8 duration-900">
        {/* Page Title */}
        <div className="w-full flex items-center justify-start md:translate-x-28 mb-4 md:mb-6">
          <PageTitle title={"Profile"} />
        </div>

        {/* Profile Card */}
        <div className="w-full  p-4 md:p-8 bg-white rounded-lg shadow-md md:pl-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Section - Profile Image and Role */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <img
                src={profile_image}
                alt="Profile"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full shadow-lg object-cover"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Admin
              </h2>
              <button className="text-white bg-[#e67220] hover:bg-[#d45f16] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 cursor-pointer">
                Edit Profile
              </button>
            </div>

            {/* Right Section - User Details */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold mb-3 md:mb-5">Details</h2>

              {[
                ["Name", `${first_name} ${last_name}`],
                ["Email", email],
                ["Mobile Number", phone],
                ["DOB", dob],
                ["Gender", gender],
                ["Address", fullAddress],
              ].map(([label, value], idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-200 pb-2 gap-1"
                >
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="text-gray-800 break-words">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminProfile;
