import React from "react";
import { Link } from "react-router-dom";
import trofilogo from "../../assets/images/trofititle.png";
import loginbg from "../../assets/images/loginimage.jpg";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${loginbg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Main card */}
      <div className="relative bg-white/90 w-full max-w-3xl rounded-xl shadow-lg flex flex-col items-center justify-center text-center p-10 z-10">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <img
            src={trofilogo}
            alt="Trofi Icon"
            className="w-12 h-12 object-contain"
          />
          <h2 className="ml-2 text-3xl font-bold text-[#F9832B]">Trofi</h2>
        </div>

        {/* Error content */}
        <h1 className="text-7xl font-extrabold text-[#F9832B] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Button */}
        <Link
          to="/Dashboard"
          className="px-6 py-2 rounded-lg bg-[#F9832B] text-white font-semibold hover:bg-[#e6731f] transition"
        >
          Go Back Home
        </Link>

        {/* Footer */}
        <div className="mt-10 text-sm text-gray-600">
          © {new Date().getFullYear()} Trofi Eat The Best. All rights reserved.
        </div>
      </div>
    </div>
  );
}
