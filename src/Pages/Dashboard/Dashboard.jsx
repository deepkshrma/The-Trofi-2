import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiCoffee,
  FiChevronDown,
  FiEye,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { BASE_URL, IMAGE_URL } from "../../config/Config";

const FilterPills = ({ active, onChange, labels = ["Monthly", "Weekly", "Today"] }) => (
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


const StatCard = React.memo(function StatCard({
  title,
  value,
  change,
  changeType,
  Icon,
  brand,
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md p-4 border-l-4"
      style={{ borderLeftColor: brand }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold leading-none">{value}</h3>
            {change && (
              <span
                className={`text-sm ${changeType === "up" ? "text-green-600" : "text-red-500"
                  }`}
              >
                {change}
              </span>
            )}
          </div>
          <p className="mt-2 text-gray-600">{title}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Icon color={brand} size={20} />
        </div>
      </div>
    </div>
  );
});

export default function Dashboard() {
  const navigate = useNavigate();
  const BRAND = "#F9832B";

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [graphData, setGraphData] = useState({ userSeries: [], restaurantSeries: [] });

  const [revenueFilter, setRevenueFilter] = useState("Monthly");
  const [customerFilter, setCustomerFilter] = useState("Monthly");
  const [reviewsSort, setReviewsSort] = useState("Newest");

  // Fetch Dashboard KPIs and lists
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setDashboardData(res.data.data);
        else toast.error(res.data.message || "Failed to fetch dashboard data");
      } catch (err) {
        console.error(err);
        toast.error("Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  // 🍽️ Fetch Restaurant Graph Data (Independent)
  useEffect(() => {
    const fetchRestaurantGraph = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(
          `${BASE_URL}/admin/dashboard-graphs?filter=${revenueFilter.toLowerCase()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setGraphData((prev) => ({
            ...prev,
            restaurantSeries: res.data.data.restaurantSeries,
          }));
        } else {
          toast.error(res.data.message || "Failed to fetch restaurant graph data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching restaurant graph data");
      }
    };

    fetchRestaurantGraph();
  }, [revenueFilter]);

  // 👥 Fetch User Graph Data (Independent)
  useEffect(() => {
    const fetchUserGraph = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(
          `${BASE_URL}/admin/dashboard-graphs?filter=${customerFilter.toLowerCase()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setGraphData((prev) => ({
            ...prev,
            userSeries: res.data.data.userSeries,
          }));
        } else {
          toast.error(res.data.message || "Failed to fetch user graph data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching user graph data");
      }
    };

    fetchUserGraph();
  }, [customerFilter]);



  const sortedReviews = useMemo(() => {
    if (!dashboardData?.recentReviews) return [];
    const copy = [...dashboardData.recentReviews];
    copy.sort((a, b) =>
      reviewsSort === "Newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return copy;
  }, [dashboardData, reviewsSort]);

  if (!dashboardData) {
    return (
      <div className="p-6 main main_page min-h-screen">
        <BreadcrumbsNav />
        <PageTitle title="Dashboard" />

        {/* Top KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Graphs Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SkeletonGraph />
          <SkeletonGraph />
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            {Array(5).fill(0).map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            {Array(5).fill(0).map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 main main_page min-h-screen duration-800 ease-in-out">
      <BreadcrumbsNav />
      <PageTitle title={"Dashboard"} />

      {/* Top KPI Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-4">
        <div
          onClick={() => navigate("/UserList")}
          className="cursor-pointer transform transition hover:scale-105"
        >
          <StatCard
            title="Total Users"
            value={dashboardData.kpis.totalUsers}
            Icon={FiUsers}
            brand={BRAND}
          />
        </div>

        <div
          onClick={() => navigate("/RestaurantReviewList")}
          className="cursor-pointer transform transition hover:scale-105"
        >
          <StatCard
            title="Total Reviews"
            value={dashboardData.kpis.totalReviews}
            Icon={FiFileText}
            brand={BRAND}
          />
        </div>

        <div
          onClick={() => navigate("/AdminList")}
          className="cursor-pointer transform transition hover:scale-105"
        >
          <StatCard
            title="Total Admins"
            value={dashboardData.kpis.totalAdmins}
            Icon={FiUsers}
            brand={BRAND}
          />
        </div>

        <div
          onClick={() => navigate("/RestroList")}
          className="cursor-pointer transform transition hover:scale-105"
        >
          <StatCard
            title="Total Restaurants"
            value={dashboardData.kpis.totalRestaurants}
            Icon={FiCoffee}
            brand={BRAND}
          />
        </div>
      </div>


      {/* Middle Graphs Section (old design restored) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Restaurant Graph */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Restaurant Count</h3>
            <FilterPills active={revenueFilter} onChange={setRevenueFilter} labels={["Monthly", "Weekly"]} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.restaurantSeries}>
              <defs>
                <linearGradient id="colorRestro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  if (!value) return "";

                  const [year, month, day] = value.split("-").map(Number);
                  const date = new Date(year, month - 1, day); // Local date, not UTC

                  if (revenueFilter.toLowerCase() === "weekly") {
                    return date.toLocaleDateString("en-US", { weekday: "short" }); // Sun, Mon, ...
                  } else if (revenueFilter.toLowerCase() === "yearly") {
                    return date.toLocaleDateString("en-US", { month: "short" }); // Jan, Feb, ...
                  } else {
                    return date.getDate(); // 1, 2, 3...
                  }
                }}
              />


              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#F97316" fillOpacity={1} fill="url(#colorRestro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Graph */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Users Count</h3>
            <FilterPills active={customerFilter} onChange={setCustomerFilter} labels={["Monthly", "Weekly"]} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  if (!value) return "";

                  // Split YYYY-MM-DD safely (avoid timezone shift issues)
                  const parts = value.split("-");
                  const year = parseInt(parts[0]);
                  const month = parseInt(parts[1]);
                  const day = parts[2] ? parseInt(parts[2]) : 1;
                  const date = new Date(year, month - 1, day); // local date

                  if (customerFilter.toLowerCase() === "weekly") {
                    return date.toLocaleDateString("en-US", { weekday: "short" }); // Sun, Mon, Tue
                  } else if (customerFilter.toLowerCase() === "yearly") {
                    return date.toLocaleDateString("en-US", { month: "short" }); // Jan, Feb, Mar
                  } else {
                    return date.getDate(); // 1, 2, 3...
                  }
                }}
              />


              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#F9832B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Recent Reviews */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <h3 className="text-xl font-semibold">Recent Reviews</h3>
            <FilterPills
              active={reviewsSort}
              onChange={setReviewsSort}
              labels={["Newest", "Oldest"]}
            />
          </div>

          <ul className="divide-y">
            {sortedReviews.length > 0 ? (
              sortedReviews.map((r) => {
                const ratingInfo = STAR_RATINGS[Number(r.rating) - 1];
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-4"
                  >
                    {/* Reviewer Info */}
                    <div className="flex-1 min-w-[150px]">
                      <p className="font-semibold capitalize">{r.reviewer}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.date).toLocaleDateString()} |{" "}
                        {new Date(r.date).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Star */}
                    <div className="flex-1 flex justify-center min-w-[50px]">
                      {ratingInfo ? (
                        <img
                          src={ratingInfo.img}
                          alt={ratingInfo.label}
                          className="w-7 h-7 drop-shadow-sm"
                        />
                      ) : (
                        <span className="text-lg text-gray-400">⭐</span>
                      )}
                    </div>

                    {/* Sentiment */}
                    <div className="flex-1 flex justify-end min-w-[80px]">
                      <span
                        className={`px-3 py-1 rounded-md text-xs ${r.sentiment === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.sentiment === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                          }`}
                      >
                        {r.sentiment}
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-center text-gray-500 italic py-6">
                No recent reviews.
              </li>
            )}
          </ul>
        </div>

        {/* Recent Restaurants */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">Recent Restaurants</h3>
          <ul className="divide-y">
            {dashboardData.recentRestaurants.map((rest) => (
              <li
                key={rest.id}
                className="flex items-center justify-between py-4 gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_URL}/${rest.image}`}
                    alt={rest.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{rest.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(rest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/RestroProfile/${rest.id}`)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <FiEye size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
