import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import trofilogo from "../../assets/images/trofititle.png";
import loginbg from "../../assets/images/loginimage.jpg";
import loginleftbg from "../../assets/images/loginleftbg.jpg";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "http://trofi-backend.apponedemo.top/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/admin/admin-login`, {
        email,
        password,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Login successful");

        // Save token, name, email
        const { token, admin } = res.data;
        const userData = {
          token,
          name: admin.name,
          email: admin.email,
        };

        // remember → localStorage, else sessionStorage
        localStorage.setItem("trofi_user", JSON.stringify(userData));

        navigate("/Dashboard");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${loginbg})` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative bg-white/80 w-full max-w-6xl rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[70vh]">
        {/* Left side */}
        <div className="relative w-full md:w-1/2 flex flex-col text-black">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm"
            style={{ backgroundImage: `url(${loginleftbg})` }}
          ></div>
          <div className="absolute inset-0 bg-white/40"></div>

          <div className="relative p-8 flex flex-col justify-center h-full">
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <img
                  src={trofilogo}
                  alt="Trofi Icon"
                  className="w-10 h-10 object-content translate-y-[-10%]"
                />
                <h2 className="ml-1 text-2xl font-bold">Trofi</h2>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Eat The Best</h3>
              <p className="text-gray-700 mb-6">
                Trofi is a trusted restaurant review platform where customers
                share their authentic dining experiences. Restaurant owners can
                view feedback while admins ensure transparency.
              </p>
              <div className="flex space-x-4 text-[#F9832B]">
                <a href="#" className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition">
                  <FaFacebookF />
                </a>
                <a href="#" className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition">
                  <FaTwitter />
                </a>
                <a href="#" className="w-9 h-9 border border-[#F9832B] rounded-full flex items-center justify-center hover:bg-[#F9832B] hover:text-white transition">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            <div className="mt-auto text-sm text-gray-700 flex flex-wrap gap-4">
              <a href="#">Privacy Policy</a>
              <a href="#">Contact</a>
              <span>© 2025 Trofi</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/2 bg-[#F9832B] text-white p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Trofi</h2>
            <p className="mb-6 text-sm">Sign in by entering information below</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white/90 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white/90 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                {/* <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[#F9832B] w-4 h-4"
                /> */}
                {/* <label htmlFor="remember" className="text-sm text-white">
                  Remember my preference
                </label> */}
              </div>
              <button
                type="submit"
                className="w-full bg-white/90 text-[#F9832B] font-semibold py-2  cursor-pointer rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                disabled={!email || !password || loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
