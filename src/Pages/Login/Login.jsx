import React from "react";
import { Link } from "react-router-dom";
import trofilogo from "../../assets/images/trofititle.png";
import loginbg from "../../assets/images/loginimage.jpg";
import loginleftbg from "../../assets/images/loginleftbg.jpg";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function Login() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{
        backgroundImage: `url(${loginbg})`,
      }}
    >
      {/* Blur Overlay for Page */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Main Card */}
      <div className="relative bg-white/80 w-full max-w-6xl rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[70vh]">
        {/* Left Side with Blurred Background */}
        {/* Left Side with Blurred Background */}
        <div className="relative w-full md:w-1/2 flex flex-col text-black">
          {/* Background Image for left side */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm"
            style={{
              backgroundImage: `url(${loginleftbg})`,
            }}
          ></div>
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-white/40"></div>

          {/* Content */}
          <div className="relative p-8 flex flex-col justify-center h-full">
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className=" p-2 rounded-lg flex items-center justify-center">
                  <img
                    src={trofilogo}
                    alt="Trofi Icon"
                    className="w-10 h-10 object-content translate-y-[-10%]"
                  />
                </div>
                <h2 className="ml-1 text-2xl font-bold">Trofi</h2>
              </div>

              <div className="translate-y-1/2">
                <h3 className="text-2xl font-semibold mb-4">Eat The Best</h3>
                <p className="text-gray-700 mb-6">
                  Trofi is a trusted restaurant review platform where customers
                  share their authentic dining experiences. Restaurant owners
                  can view feedback about their food and services, while admins
                  ensure transparency by moderating reviews.
                </p>
                <div className="flex space-x-4 text-[#F9832B]">
                  <a
                    href="#"
                    className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition"
                  >
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer bottom fix */}
            <div className="mt-auto text-sm text-gray-700 flex flex-wrap gap-4">
              <a href="#">Privacy Policy</a>
              <a href="#">Contact</a>
              <span>© 2025 Trofi</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 bg-[#F9832B] text-white p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Trofi</h2>
            <p className="mb-6 text-sm">
              Sign in by entering information below
            </p>

            <form className="space-y-4 translate-y-1/6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="test@example.com"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white/90 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="12345678"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white/90 focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="accent-[#F9832B] w-4 h-4"
                />
                <label htmlFor="remember" className="text-sm">
                  Remember my preference
                </label>
              </div>
              <button
                type="submit"
                onClick={() => navigate("/Dashboard")}
                className="w-full bg-white/90 cursor-pointer  text-[#F9832B] font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* <p className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="#" className="no-underline">
              Sign up
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
