// @ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { FiStar, FiCoffee, FiShoppingCart, FiFileText } from "react-icons/fi";
import { FaConciergeBell } from "react-icons/fa";

// ---------- Reusable UI ----------
const FilterPills = ({ active, onChange, labels = ["Yearly", "Monthly", "Weekly"] }) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
    {labels.map((label) => (
      <button
        key={label}
        onClick={() => onChange(label)}
        className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${active === label
          ? "bg-gray-800 text-white"
          : "text-gray-600 hover:text-gray-900"
          }`}
        type="button"
      >
        {label}
      </button>
    ))}
  </div>
);


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
    <div className="h-10 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-10 bg-gray-300 rounded w-full"></div>
  </div>
);

const SkeletonGraph = () => (
  <div className="bg-white p-6 rounded-2xl shadow-md animate-pulse h-[300px]"></div>
);

const SkeletonListItem = () => (
  <div className="flex items-center justify-between py-4 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-32"></div>
    <div className="h-6 bg-gray-300 rounded w-16"></div>
    <div className="h-6 bg-gray-300 rounded w-20"></div>
  </div>
);

const StatCard = ({ title, value, Icon, brand, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-md p-4 border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    style={{ borderLeftColor: brand }}
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-3xl font-bold leading-none">{value}</h3>
        <p className="mt-2 text-gray-600">{title}</p>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
        <Icon color={brand} size={20} />
      </div>
    </div>
  </div>
);


// ---------- MAIN ----------
export default function RestroOwnerDashboard() {
  const navigate = useNavigate();
  const BRAND = "#F97316";
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState({ ratingSeries: [], reviewSeries: [] });

  const [ratingFilter, setRatingFilter] = useState("Monthly");
  const [reviewFilter, setReviewFilter] = useState("Monthly");
  const [topDishesSort, setTopDishesSort] = useState("Newest");

  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;
  const restaurantId = authData?.restaurant?.restroId;

  if (!token) return <div className="p-6">Please login first</div>;

  // ✅ Fetch dashboard KPIs
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/admin/restro-dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { restroId: restaurantId },
        });

        if (res.data?.success) setDashboardData(res.data.data);
        else toast.error(res.data?.message || "Failed to fetch dashboard data");
      } catch (err) {
        console.error(err);
        toast.error("Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchDashboard();
  }, [token, restaurantId]);

  // ✅ Fetch Graphs (filter-based)
  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/admin/restro-dashboard-graphs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { restroId: restaurantId, filter: ratingFilter.toLowerCase() },
        });
        if (res.data?.success) {
          setGraphData((prev) => ({
            ...prev,
            ratingSeries: res.data.data.ratingSeries || [],
          }));
        }
      } catch (err) {
        console.error("Error fetching rating graph:", err);
      }
    };
    if (restaurantId) fetchGraphs();
  }, [ratingFilter, token, restaurantId]);

  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/admin/restro-dashboard-graphs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { restroId: restaurantId, filter: reviewFilter.toLowerCase() },
        });
        if (res.data?.success) {
          setGraphData((prev) => ({
            ...prev,
            reviewSeries: res.data.data.reviewSeries || [],
          }));
        }
      } catch (err) {
        console.error("Error fetching review graph:", err);
      }
    };
    if (restaurantId) fetchGraphs();
  }, [reviewFilter, token, restaurantId]);

  // ✅ Sort Top Dishes
  const sortedTopDishes = useMemo(() => {
    if (!dashboardData?.topDishes) return [];
    const copy = [...dashboardData.topDishes];
    return copy.sort((a, b) =>
      topDishesSort === "Newest"
        ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        : new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
  }, [dashboardData, topDishesSort]);

  const formatTick = (value, filterType) => {
    if (!value) return "";

    // 🧠 Handle different date formats safely
    if (filterType.toLowerCase() === "yearly") {
      // If backend sends only a year (e.g., "2025")
      if (/^\d{4}$/.test(value)) return value;
    }

    // Parse normally for monthly/weekly
    const parts = value.split("-").map(Number);
    if (parts.length < 3) return value; // fallback if format is not full date

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    if (isNaN(date)) return value; // prevent invalid date output

    if (filterType.toLowerCase() === "weekly")
      return date.toLocaleDateString("en-US", { weekday: "short" });
    else if (filterType.toLowerCase() === "monthly")
      return date.getDate();
    else if (filterType.toLowerCase() === "yearly")
      return date.toLocaleDateString("en-US", { month: "short" });
    else return "";
  };



  // Skeleton
  if (!dashboardData)
    return (
      <div className="p-6 main main_page min-h-screen">
        <BreadcrumbsNav />
        <PageTitle title="Restaurant Owner Dashboard" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonGraph />
          <SkeletonGraph />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            {Array(5).fill(0).map((_, i) => <SkeletonListItem key={i} />)}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            {Array(5).fill(0).map((_, i) => <SkeletonListItem key={i} />)}
          </div>
        </div>
      </div>
    );

  // ✅ MAIN RENDER
  return (
    <div className="p-6 main main_page min-h-screen duration-800 ease-in-out">
      <BreadcrumbsNav />
      <PageTitle title={"Restaurant Owner Dashboard"} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-4">
        <StatCard
          title="Total Dishes"
          value={dashboardData.kpis.totalDishes ?? 0}
          Icon={FaConciergeBell}
          brand={BRAND}
          onClick={() => navigate("/RestaurantDishes")}
        />

        <StatCard
          title="Total Reviews"
          value={dashboardData.kpis.totalReviews ?? 0}
          Icon={FiFileText}
          brand={BRAND}
          onClick={() => navigate("/RestaurantReviews")}
        />

        <StatCard
          title="Average Rating"
          value={`⭐ ${dashboardData.kpis.avgRating ?? "0.0"}`}
          Icon={FiStar}
          brand={BRAND}
          onClick={() => navigate("/RestaurantReviews")}
        />

        <StatCard
          title="Today's Check-ins"
          value={dashboardData.kpis.todayCheckins ?? 0}
          Icon={FiCoffee}
          brand={BRAND}
          onClick={() => navigate("")}
        />
      </div>


      {/* GRAPHS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* RATING GRAPH */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Ratings Trend</h3>
            <FilterPills active={ratingFilter} onChange={setRatingFilter} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.ratingSeries}>
              <defs>
                <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => formatTick(v, ratingFilter)} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#F97316" fillOpacity={1} fill="url(#colorRatings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* REVIEW GRAPH */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Review Trend</h3>
            <FilterPills active={reviewFilter} onChange={setReviewFilter} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.reviewSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => formatTick(v, reviewFilter)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#F9832B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP DISHES TABLE */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-800">Top Dishes</h3>
          <div className="space-x-2">
            {["Newest", "Oldest"].map((t) => (
              <button
                key={t}
                onClick={() => setTopDishesSort(t)}
                className={`px-3 py-1 rounded-md cursor-pointer text-sm transition ${topDishesSort === t
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {sortedTopDishes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700 font-semibold">
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Image</th>
                  <th className="p-3 border-b">Dish Name</th>
                  <th className="p-3 border-b text-center">Avg. Rating</th>
                  <th className="p-3 border-b text-center">Total Reviews</th>
                </tr>
              </thead>
              <tbody>
                {sortedTopDishes.map((dish, index) => (
                  <tr key={dish.id || index} className="border-b hover:bg-orange-50 transition">
                    <td className="p-3 text-gray-600">{index + 1}</td>
                    <td className="p-3">
                      <img
                        src={`${IMAGE_URL}/${dish.image}`}
                        alt={dish.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-800">{dish.name}</td>
                    <td className="p-3 text-center font-semibold text-yellow-500">
                      ⭐ {dish.avgRating ?? "-"}
                    </td>
                    <td className="p-3 text-center text-gray-700">
                      {dish.totalReviews ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-6 italic">
            No top dishes found.
          </p>
        )}
      </div>
    </div>
  );
}
