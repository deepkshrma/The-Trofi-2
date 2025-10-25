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
  FiStar,
  FiCoffee,
  FiChevronDown,
  FiEye,
} from "react-icons/fi";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BASE_URL, IMAGE_URL } from "../../config/Config";


const FilterPills = ({
  active,
  onChange,
  labels = ["Yearly", "Monthly", "Weekly"], // 👈 new default
}) => (
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

  const [selectedCheckinRange, setSelectedCheckinRange] = useState("today");
  const [selectedRatingType, setSelectedRatingType] = useState("restaurant");
  const [selectedActiveType, setSelectedActiveType] = useState("daily");
  const [selectedReviewType, setSelectedReviewType] = useState("overall");

  const [ratingFilter, setRatingFilter] = useState("Monthly");
  const [ratingType, setRatingType] = useState("all"); // overall / dish / restaurant
  const [ratingData, setRatingData] = useState([]);
  const [reviewVolumeData, setReviewVolumeData] = useState([]);

  const [restaurantFilter, setRestaurantFilter] = useState("Monthly"); // for restaurant graph
  const [userFilter, setUserFilter] = useState("Monthly"); // for user graph

  // Users graph filter
  const [userGraphFilter, setUserGraphFilter] = useState("Monthly");

  // Rating graph filter
  const [ratingGraphFilter, setRatingGraphFilter] = useState("Monthly");

  const [triangleChartData, setTriangleChartData] = useState([]);
  const [triangleLoading, setTriangleLoading] = useState(false);


  const colors = ["#F97316", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA"];

  const triangleData = [
    { name: "Page A", uv: 4000 },
    { name: "Page B", uv: 3000 },
    { name: "Page C", uv: 2000 },
    { name: "Page D", uv: 2780 },
    { name: "Page E", uv: 1890 },
    { name: "Page F", uv: 2390 },
    { name: "Page G", uv: 3490 },
  ];

  const triangleColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink', '#A78BFA'];

  const getTrianglePath = (x, y, width, height) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} 
  ${x + width / 2}, ${y} 
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height} Z`;
  };

  const TriangleBar = ({ fill, x, y, width, height }) => {
    return <path d={getTrianglePath(x, y, width, height)} stroke="none" fill={fill} />;
  };




  const pieData = useMemo(() => {
    return ratingData.map((r) => ({
      name: r.name.charAt(0).toUpperCase() + r.name.slice(1), // Pending/Approved/etc
      value: r.value,
    }));
  }, [ratingData]);



  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        // 👇 Pass order param based on current filter
        const order = reviewsSort === "Oldest" ? "asc" : "desc";
        const res = await axios.get(`${BASE_URL}/admin/dashboard?order=${order}`, {
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
  }, [navigate, reviewsSort]);


  //  Fetch Restaurant Graph Data (Independent)
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

  //  Fetch User Graph Data (Independent)
  useEffect(() => {
    const fetchUserGraph = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(
          `${BASE_URL}/admin/dashboard-graphs?filter=${userGraphFilter.toLowerCase()}`,
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
  }, [userGraphFilter]);

  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    const fetchRatingStats = async () => {
      try {
        setRatingLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        // Pass correct query param 'type' as backend expects
        const endpoint =
          ratingType === "all"
            ? `${BASE_URL}/admin/stats`
            : `${BASE_URL}/admin/stats?type=${ratingType === "restaurant" ? "Restaurant" : "Dish"}`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setRatingData(res.data.data?.pieChartData || []);
        } else {
          setRatingData([]);
          toast.error(res.data.message || "Failed to fetch stats");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching rating stats");
      } finally {
        setRatingLoading(false);
      }
    };

    fetchRatingStats();
  }, [ratingType]);

  useEffect(() => {
    const fetchRatingGraph = async () => {
      try {
        setTriangleLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(
          `${BASE_URL}/admin/rating-graph-data?filter=${ratingGraphFilter.toLowerCase()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success && res.data.data.length > 0) {
          const mappedData = res.data.data.map(item => ({
            name: item.name,
            date: item.date,
            rating_5: item.rating_5 || 0,
            rating_4: item.rating_4 || 0,
            rating_3: item.rating_3 || 0,
            rating_2: item.rating_2 || 0,
            rating_1: item.rating_1 || 0,
            total: item.total || 0,
          }));
          setTriangleChartData(mappedData);
        } else {
          setTriangleChartData([]);
          toast.info("No rating graph data available");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching rating graph data");
        setTriangleChartData([]);
      } finally {
        setTriangleLoading(false);
      }
    };

    fetchRatingGraph();
  }, [ratingGraphFilter]); // ✅ dependency added

  const BadgeButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm  cursor-pointer font-medium transition 
      ${isActive
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
    >
      {label}
    </button>
  );

  const sortedReviews = dashboardData?.recentReviews || [];


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

  const formatTick = (value, filterType) => {
    if (!value) return "";

    // handle pure year strings like "2025"
    if (/^\d{4}$/.test(value)) return value;

    const parts = value.split("-").map(Number);
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day || 1);

    if (isNaN(date)) return value;

    if (filterType.toLowerCase() === "weekly")
      return date.toLocaleDateString("en-US", { weekday: "short" });
    else if (filterType.toLowerCase() === "monthly")
      return date.getDate();
    else if (filterType.toLowerCase() === "yearly")
      return date.toLocaleDateString("en-US", { month: "short" });
    else return "";
  };

  return (
    <div className="p-6 main main_page min-h-screen duration-800 ease-in-out">
      <BreadcrumbsNav />
      <PageTitle title={"Dashboard"} />

      {/* Top KPI Cards - Clickable */}
      <div className="space-y-6 mt-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Admins */}
          <div
            onClick={() => navigate("/AdminList")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title="Total Admins"
              value={dashboardData.kpis.totalAdmins}
              Icon={AdminPanelSettingsIcon}
              brand={BRAND}
            />
          </div>

          {/* Total Users */}
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

          {/* Total Restaurants */}
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

          {/* Pending Feedbacks */}
          <div
            onClick={() => navigate("/RestaurantReviewList?filter=pending")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title="Pending Feedbacks"
              value={dashboardData.kpis.pendingFeedbacks}
              Icon={FiFileText}
              brand={BRAND}
            />
          </div>

          {/* Total Reviews — unified badge style */}
          <div
            onClick={() => navigate("/RestaurantReviewList")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title={
                <div className="flex flex-col items-start w-full">
                  <span>Total Reviews</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { key: "overall", label: "All" },
                      { key: "dish", label: "Dish" },
                      { key: "restaurant", label: "Restaurant" },
                    ].map(({ key, label }) => (
                      <BadgeButton
                        key={key}
                        label={label}
                        isActive={selectedReviewType === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReviewType(key);
                        }}
                      />
                    ))}
                  </div>
                </div>
              }
              value={dashboardData.kpis.totalReviews?.[selectedReviewType] ?? 0}
              Icon={FiFileText}
              brand={BRAND}
            />
          </div>

          {/* Check-ins */}
          <div
            onClick={() => navigate("#")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title={
                <div className="flex flex-col items-start w-full">
                  <span>Check-ins</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["today", "week", "month"].map((key) => (
                      <BadgeButton
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        isActive={selectedCheckinRange === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCheckinRange(key);
                        }}
                      />
                    ))}
                  </div>
                </div>
              }
              value={dashboardData.kpis.totalCheckins[selectedCheckinRange]}
              Icon={FiUsers}
              brand={BRAND}
            />
          </div>

          {/* Average Ratings — unified badge style */}
          <div
            onClick={() => navigate("/RestaurantReviewList")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title={
                <div className="flex flex-col items-start w-full">
                  <span>Average Ratings</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { key: "dish", label: "Dish" },
                      { key: "restaurant", label: "Restaurant" },
                    ].map(({ key, label }) => (
                      <BadgeButton
                        key={key}
                        label={label}
                        isActive={selectedRatingType === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRatingType(key);
                        }}
                      />
                    ))}
                  </div>
                </div>
              }
              value={dashboardData.kpis.avgRatings[selectedRatingType]}
              Icon={FiStar}  // <-- changed icon here
              brand={BRAND}
            />
          </div>

          {/* Active Users */}
          <div
            onClick={() => navigate("/UserList?active=true")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <StatCard
              title={
                <div className="flex flex-col items-start w-full">
                  <span>Active Users</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { key: "daily", label: "Daily" },
                      { key: "monthly", label: "Month" },
                      { key: "3to6months", label: "3–6M" },
                    ].map(({ key, label }) => (
                      <BadgeButton
                        key={key}
                        label={label}
                        isActive={selectedActiveType === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActiveType(key);
                        }}
                      />
                    ))}
                  </div>
                </div>
              }
              value={dashboardData.kpis.activeUsers[selectedActiveType]}
              Icon={FiUsers}
              brand={BRAND}
            />
          </div>
        </div>

      </div>



      {/* Middle Graphs Section (old design restored) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Restaurant Graph */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between mb-0 mt-3 ml-0 mr-2">
            <h3
              onClick={() => navigate("/RestroList")}
              className="text-xl font-semibold cursor-pointer text-gray-800 hover:text-orange-600 transition"
            >
              Restaurant Count
            </h3>

            <FilterPills active={revenueFilter} onChange={setRevenueFilter} />
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={graphData.restaurantSeries}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRestro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatTick(value, revenueFilter)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#F97316"
                fillOpacity={1}
                fill="url(#colorRestro)"
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* pie chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between  mb-4">
            <h3
              onClick={() => navigate("/RestaurantReviewList")}
              className="text-xl font-semibold cursor-pointer text-gray-800 hover:text-orange-600 transition"
            >
              Rating Statistics
            </h3>

            <div className="flex gap-2">
              {["all", "restaurant", "dish"].map((type) => (
                <button
                  key={type}
                  onClick={() => setRatingType(type)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer font-medium transition ${ratingType === type
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}

            </div>
          </div>

          <div className="flex flex-col gap-6">
            {ratingLoading ? (
              <SkeletonGraph />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="55%"         // Move slightly down to balance top label space
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>


            ) : (
              <p className="text-gray-500 text-center py-6">No rating data available.</p>
            )}
          </div>


          {/* Cards aligned horizontally */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {pieData.map((item, i) => {
              const total = pieData.reduce((sum, x) => sum + x.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center p-3 rounded-lg border transition-all hover:shadow-md"
                  style={{ borderColor: colors[i % colors.length] }}
                >
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <p className="font-bold text-lg">{item.value}</p>
                  <p className="text-xs text-gray-400">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* bar chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3
              onClick={() => navigate("/RestaurantReviewList")}
              className="text-xl font-semibold cursor-pointer text-gray-800 hover:text-orange-600 transition"
            >
              Rating
            </h3>

            <FilterPills active={ratingGraphFilter} onChange={setRatingGraphFilter} />
          </div>

          {triangleLoading ? (
            <SkeletonGraph />
          ) : triangleChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={triangleChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (ratingGraphFilter.toLowerCase() === "weekly")
                      return date.toLocaleDateString("en-US", { weekday: "short" });
                    else if (ratingGraphFilter.toLowerCase() === "monthly")
                      return date.getDate();
                    else if (ratingGraphFilter.toLowerCase() === "yearly")
                      return date.toLocaleDateString("en-US", { month: "short" });
                    else
                      return value;
                  }}
                />

                <YAxis allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 shadow-md rounded-lg border text-sm">
                          {payload.map((entry, index) => {
                            const ratingNum = Number(entry.dataKey.split("_")[1]); // extract rating number (1-5)
                            const ratingInfo = STAR_RATINGS[ratingNum - 1]; // get star image
                            return (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                {ratingInfo?.img ? (
                                  <img
                                    src={ratingInfo.img}
                                    alt={ratingInfo.label}
                                    className="w-5 h-5"
                                  />
                                ) : (
                                  <span className="text-gray-500">⭐</span>
                                )}
                                <span className="font-medium text-gray-700">:- {entry.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {["rating_5", "rating_4", "rating_3", "rating_2", "rating_1"].map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key.replace("_", " ").toUpperCase()}
                    shape={<TriangleBar />}
                  >
                    {triangleChartData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={triangleColors[index % triangleColors.length]}
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-6">No chart data available.</p>
          )}
        </div>

        {/* User Graph */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3
              onClick={() => navigate("/UserList")}
              className="text-xl font-semibold cursor-pointer text-gray-800 hover:text-orange-600 transition"
            >
              Users Count
            </h3>

            <FilterPills active={userGraphFilter} onChange={setUserGraphFilter} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatTick(value, userGraphFilter)}
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
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <h3 className="text-xl font-semibold">Recent Reviews</h3>
            <FilterPills
              active={reviewsSort}
              onChange={setReviewsSort}
              labels={["Newest", "Oldest"]}
            />
          </div>

          <ul className="divide-y flex-1">
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
                        className={`px-3 py-1 rounded-md text-xs ${r.sentiment === "published"
                          ? "bg-green-100 text-green-700"
                          : r.sentiment === "approved"
                            ? "bg-blue-100 text-blue-700"
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

          {/* View More Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate("/RestaurantReviewList")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition transform hover:scale-105 font-semibold cursor-pointer"
            >
              View More
              <FiChevronDown className="animate-bounce" />
            </button>
          </div>

        </div>


        {/* Recent Restaurants */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
          <h3 className="text-xl font-semibold mb-2">Recent Restaurants</h3>
          <ul className="divide-y flex-1">
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
                  className="text-gray-500 cursor-pointer hover:text-orange-600"
                >
                  <FiEye size={18} />
                </button>
              </li>
            ))}
          </ul>

          {/* View More Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate("/RestroList")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition transform hover:scale-105 font-semibold cursor-pointer"
            >
              View More
              <FiChevronDown className="animate-bounce" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
