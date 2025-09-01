import React, { useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
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
import {
  FiCoffee,
  FiFileText,
  FiUsers,
  FiDollarSign,
  FiChevronDown,
} from "react-icons/fi";

import image1 from "../../assets/images/pizza1.jpg";
import image2 from "../../assets/images/pizza2.jpg";
import image3 from "../../assets/images/tuna1.jpg";
import tuna2 from "../../assets/images/tuna2.jpg";
import pizza3 from "../../assets/images/pizza3.jpg";
import pizza4 from "../../assets/images/pizza4.jpg";
import pizza1 from "../../assets/images/pizza1.jpg";
import pizza2 from "../../assets/images/pizza2.jpg";

const SPARK_MENUS = [10, 18, 14, 22, 19, 30, 24, 28, 22, 26, 20, 24].map(
  (v, i) => ({ i, v })
);
const SPARK_ORDERS = [24, 28, 20, 34, 30, 26, 32, 18, 22, 20, 16, 24].map(
  (v, i) => ({ i, v })
);
const SPARK_CUSTOMERS = [12, 20, 26, 22, 28, 24, 20, 18, 22, 16, 14, 10].map(
  (v, i) => ({ i, v })
);
const SPARK_INCOME = [18, 16, 22, 24, 28, 26, 30, 34, 28, 32, 30, 36].map(
  (v, i) => ({ i, v })
);

// Revenue + Profit series for filters
const REVENUE_DATA = {
  Monthly: [
    { name: "Jan", revenue: 12, profit: 8 },
    { name: "Feb", revenue: 30, profit: 16 },
    { name: "Mar", revenue: 35, profit: 22 },
    { name: "Apr", revenue: 32, profit: 18 },
    { name: "May", revenue: 34, profit: 16 },
    { name: "Jun", revenue: 52, profit: 38 },
    { name: "Jul", revenue: 40, profit: 28 },
  ],
  Weekly: [
    { name: "Mon", revenue: 12, profit: 8 },
    { name: "Tue", revenue: 20, profit: 10 },
    { name: "Wed", revenue: 25, profit: 12 },
    { name: "Thu", revenue: 30, profit: 14 },
    { name: "Fri", revenue: 22, profit: 12 },
    { name: "Sat", revenue: 28, profit: 18 },
    { name: "Sun", revenue: 18, profit: 10 },
  ],
  Today: [
    { name: "Morning", revenue: 10, profit: 6 },
    { name: "Afternoon", revenue: 15, profit: 8 },
    { name: "Evening", revenue: 20, profit: 12 },
    { name: "Night", revenue: 12, profit: 6 },
  ],
};

// Customers + Loss series for filters
const CUSTOMER_DATA = {
  Monthly: [
    { name: "01", customers: 35, loss: -15 },
    { name: "02", customers: 40, loss: -10 },
    { name: "03", customers: 50, loss: -20 },
    { name: "04", customers: 60, loss: -25 },
    { name: "05", customers: 75, loss: -35 },
    { name: "06", customers: 40, loss: -22 },
    { name: "07", customers: 70, loss: -15 },
    { name: "08", customers: 20, loss: -30 },
    { name: "09", customers: 40, loss: -18 },
    { name: "10", customers: 55, loss: -28 },
    { name: "11", customers: 70, loss: -14 },
    { name: "12", customers: 50, loss: -26 },
    { name: "13", customers: 20, loss: -20 },
    { name: "14", customers: 60, loss: -22 },
    { name: "15", customers: 30, loss: -10 },
    { name: "16", customers: 50, loss: -32 },
    { name: "17", customers: 40, loss: -12 },
    { name: "18", customers: 72, loss: -30 },
    { name: "19", customers: 28, loss: -20 },
    { name: "20", customers: 18, loss: -16 },
  ],
  Weekly: [
    { name: "Mon", customers: 20, loss: -5 },
    { name: "Tue", customers: 25, loss: -8 },
    { name: "Wed", customers: 30, loss: -10 },
    { name: "Thu", customers: 22, loss: -6 },
    { name: "Fri", customers: 28, loss: -12 },
    { name: "Sat", customers: 32, loss: -8 },
    { name: "Sun", customers: 18, loss: -5 },
  ],
  Today: [
    { name: "Morning", customers: 12, loss: -4 },
    { name: "Afternoon", customers: 18, loss: -6 },
    { name: "Evening", customers: 25, loss: -8 },
    { name: "Night", customers: 15, loss: -5 },
  ],
};

// Recent reviews (static demo data with timestamps so sorting works)
const REVIEWS = [
  {
    id: "r1",
    menu: "Mozarella Pizza",
    orderId: "#0010299",
    reviewer: "Kinda Alexa",
    rating: 5,
    sentiment: "POSITIVE",
    img: pizza3,
    // ISO strings make sorting reliable
    date: "2025-08-22T14:20:00+05:30",
  },
  {
    id: "r2",
    menu: "Sweet Cheezy Pizza",
    orderId: "#0010235",
    reviewer: "Peter Parkur",
    rating: 2,
    sentiment: "NEGATIVE",
    img: pizza2,
    date: "2025-08-20T19:05:00+05:30",
  },
  {
    id: "r3",
    menu: "Tuna Soup Spinach",
    orderId: "#0010237",
    reviewer: "Jimmy Kueai",
    rating: 4,
    sentiment: "POSITIVE",
    img: tuna2,
    date: "2025-08-21T09:45:00+05:30",
  },
  // A couple more so sort differences are visible
  {
    id: "r4",
    menu: "Italiano Pizza with Garlic",
    orderId: "#0010308",
    reviewer: "Ria Sen",
    rating: 5,
    sentiment: "POSITIVE",
    img: pizza4,
    date: "2025-08-24T16:10:00+05:30",
  },
  {
    id: "r5",
    menu: "Watermelon Juice with Ice",
    orderId: "#0010311",
    reviewer: "Aman Verma",
    rating: 4,
    sentiment: "POSITIVE",
    img: pizza1,
    date: "2025-08-23T11:30:00+05:30",
  },
];

/***************************
 * UI SUB-COMPONENTS
 ***************************/
const FilterPills = ({
  active,
  onChange,
  labels = ["Monthly", "Weekly", "Today"],
}) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
    {labels.map((label) => (
      <button
        key={label}
        onClick={() => onChange(label)}
        className={`px-3 py-1 text-sm rounded-full transition ${
          active === label
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

const DropdownPill = ({ label, onChange }) => (
  <div className="relative">
    <select
      value={label}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border rounded-full px-4 py-2 text-sm pr-8"
    >
      <option>Monthly</option>
      <option>Weekly</option>
      <option>Today</option>
    </select>
    <FiChevronDown className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
  </div>
);

const StatCard = React.memo(function StatCard({
  title,
  value,
  change,
  changeType,
  Icon,
  data,
  gid,
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
            <span
              className={`text-sm ${
                changeType === "up" ? "text-green-600" : "text-red-500"
              }`}
            >
              {change}
            </span>
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
  const BRAND = "#F9832B"; // theme color

  const [revenueFilter, setRevenueFilter] = useState("Monthly");
  const [customerFilter, setCustomerFilter] = useState("Monthly");

  // Review sort (Newest/Oldest)
  const [reviewsSort, setReviewsSort] = useState("Newest");

  // Derived series from static pools
  const revenueSeries = useMemo(
    () => REVENUE_DATA[revenueFilter] || [],
    [revenueFilter]
  );
  const customerSeries = useMemo(
    () => CUSTOMER_DATA[customerFilter] || [],
    [customerFilter]
  );

  // Sort reviews based on choice (static data, but dynamic ordering)
  const sortedReviews = useMemo(() => {
    const copy = [...REVIEWS];
    copy.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return reviewsSort === "Newest" ? db - da : da - db;
    });
    return copy;
  }, [reviewsSort]);

  return (
    <div className="p-6  main main_page min-h-screen duration-800 ease-in-out">
      <BreadcrumbsNav />
      <PageTitle title={"DashBoard"} />
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-4">
        <StatCard
          title="Menus"
          value="56"
          changeType="up"
          Icon={FiCoffee}
          gid="menus"
          brand={BRAND}
        />
        <StatCard
          title="Orders"
          value="785"
          changeType="up"
          Icon={FiFileText}
          gid="orders"
          brand={BRAND}
        />
        <StatCard
          title="Customers"
          value="56"
          changeType="down"
          Icon={FiUsers}
          gid="customers"
          brand={BRAND}
        />
        <StatCard
          title="Income"
          value="$6231"
          changeType="down"
          Icon={FiDollarSign}
          gid="income"
          brand={BRAND}
        />
      </div>

      {/* Middle Graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-semibold">Revenue</h3>
              <p className="text-sm text-gray-400">
                Performance based on {revenueFilter}
              </p>
            </div>
            <DropdownPill
              label={revenueFilter}
              onChange={(val) => setRevenueFilter(val)}
            />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-gray-500 text-sm">Income</p>
              <p className="text-2xl font-extrabold">$561,623</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Expense</p>
              <p className="text-2xl font-extrabold">$126,621</p>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueSeries}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#C084FC"
                  fill="url(#grad-profit)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={BRAND}
                  fill="url(#grad-revenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: "#C084FC" }}
              ></span>
              <span className="text-gray-600">Net Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: BRAND }}
              ></span>
              <span className="text-gray-600">Revenue</span>
            </div>
          </div>
        </div>

        {/* Customer Map Bar Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-semibold">Customer Map</h3>
              <p className="text-sm text-gray-400">
                Data based on {customerFilter}
              </p>
            </div>
            <FilterPills
              active={customerFilter}
              onChange={(val) => setCustomerFilter(val)}
            />
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={customerSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill={BRAND} radius={[6, 6, 0, 0]} />
                <Bar dataKey="loss" fill="#374151" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Reviews (with Newest/Oldest filter) */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-xl font-semibold">Recent Reviews</h3>
            <FilterPills
              active={reviewsSort}
              onChange={(val) => setReviewsSort(val)}
              labels={["Newest", "Oldest"]}
            />
          </div>

          <ul className="divide-y">
            {sortedReviews.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={r.img}
                    alt="menu"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{r.menu}</p>
                    <p className="text-xs text-gray-400">{r.orderId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{r.reviewer}</p>
                  <p className="text-xs text-gray-400">
                    {"⭐".repeat(r.rating)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-md text-xs ${
                    r.sentiment === "POSITIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {r.sentiment}
                </span>
              </li>
            ))}
          </ul>

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-[color:var(--brand,#F9832B)] font-medium hover:underline"
            >
              View More
            </a>
          </div>
        </div>

        {/* Daily Trending Menus (static) */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">Daily Trending Menus</h3>
          <ul className="divide-y">
            <li className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img
                  src={image1}
                  alt="menu"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Watermelon juice with ice</p>
                  <p className="text-xs text-gray-400">⭐ 4.8 avg</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">70 Reviews</span>
            </li>
            <li className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img
                  src={image2}
                  alt="menu"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Italiano pizza with garlic</p>
                  <p className="text-xs text-gray-400">⭐ 4.6 avg</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">60 Reviews</span>
            </li>
            <li className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img
                  src={image3}
                  alt="menu"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    Tuna soup spinach with himalaya
                  </p>
                  <p className="text-xs text-gray-400">⭐ 4.2 avg</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">50 Reviews</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
