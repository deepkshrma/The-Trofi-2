import React, { useState } from "react";
import { FaStar, FaUsers, FaChartLine, FaComments } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageTitle from "../../components/PageTitle/PageTitle";

export default function RestroOwnerDashboard() {
  const [feedbackView, setFeedbackView] = useState("daily");
  // === FILTER STATES ===
  const [selectedDish, setSelectedDish] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // === DATA ===
  const widgets = [
    {
      title: "Total Reviews",
      value: "120",
      subValue: "Today: 5 | Week: 32 | Month: 120 | 6M: 580",
      icon: <FaComments className="text-orange-500 text-xl" />,
    },
    {
      title: "Average Rating",
      value: "⭐ 4.3",
      subValue: "Dishes: 4.4 | Restaurant: 4.2",
      icon: <FaStar className="text-yellow-500 text-xl" />,
    },
    {
      title: "Check-ins",
      value: "540",
      subValue: "Today: 22 | Trend: +8%",
      icon: <FaUsers className="text-green-500 text-xl" />,
    },
    {
      title: "Engagement Trend",
      value: "+15%",
      subValue: "Visits ↑ | Reviews ↑ | Feedback steady",
      icon: <FaChartLine className="text-purple-500 text-xl" />,
    },
  ];

  const popularityData = [
    { month: "Jan", Paneer: 30, Pasta: 20, Dal: 50 },
    { month: "Feb", Paneer: 45, Pasta: 25, Dal: 60 },
    { month: "Mar", Paneer: 50, Pasta: 18, Dal: 65 },
    { month: "Apr", Paneer: 60, Pasta: 15, Dal: 67 },
  ];

  const topDroppedData = [
    { dish: "Paneer Tikka", rating: 4.6 },
    { dish: "Dal Makhani", rating: 4.8 },
    { dish: "Pasta Alfredo", rating: 3.9 },
  ];

  const dailyFeedback = [
    { day: "Mon", reviews: 10 },
    { day: "Tue", reviews: 14 },
    { day: "Wed", reviews: 8 },
    { day: "Thu", reviews: 18 },
    { day: "Fri", reviews: 20 },
    { day: "Sat", reviews: 25 },
    { day: "Sun", reviews: 15 },
  ];

  const monthlyFeedback = [
    { month: "Jan", reviews: 120 },
    { month: "Feb", reviews: 90 },
    { month: "Mar", reviews: 150 },
    { month: "Apr", reviews: 110 },
  ];

  const dishPerformance = [
    {
      dish: "Paneer Tikka",
      feedback: 45,
      rating: "⭐ 4.6",
      trend: "🔼 Gaining",
    },
    {
      dish: "Pasta Alfredo",
      feedback: 22,
      rating: "⭐ 3.9",
      trend: "🔽 Dropping",
    },
    { dish: "Dal Makhani", feedback: 67, rating: "⭐ 4.8", trend: "➡ Stable" },
  ];

  // Sample feedback data
  const feedbackList = [
    {
      dish: "Paneer Tikka",
      rating: 5,
      comment: "Absolutely delicious, loved the smoky flavor! #favorite",
      date: "2025-09-10",
    },
    {
      dish: "Pasta Alfredo",
      rating: 3,
      comment: "Too salty for my taste. #needsImprovement",
      date: "2025-09-12",
    },
    {
      dish: "Dal Makhani",
      rating: 4,
      comment: "Rich and creamy, perfect with naan. #mustTry",
      date: "2025-09-14",
    },
    {
      dish: "Paneer Tikka",
      rating: 4,
      comment: "Good portion size but a bit spicy. #spicy",
      date: "2025-09-15",
    },
    {
      dish: "Pasta Alfredo",
      rating: 5,
      comment: "Creamy and comforting, would order again! #favorite",
      date: "2025-09-16",
    },
    {
      dish: "Dal Makhani",
      rating: 2,
      comment: "Too oily this time, needs improvement. #inconsistent",
      date: "2025-08-20",
    },
    {
      dish: "Paneer Tikka",
      rating: 3,
      comment: "Average taste, not like before. #dropInQuality",
      date: "2025-07-05",
    },
    {
      dish: "Pasta Alfredo",
      rating: 4,
      comment: "Balanced flavor, kids loved it. #familyFavorite",
      date: "2025-07-22",
    },
    {
      dish: "Dal Makhani",
      rating: 5,
      comment: "Best in town, very authentic taste! #mustTry",
      date: "2025-06-30",
    },
  ];

  // === APPLY FILTERS ===
  const filteredFeedback = feedbackList.filter((fb) => {
    // Filter by dish
    const matchDish = selectedDish ? fb.dish === selectedDish : true;

    // Filter by rating (>= selected rating)
    const matchRating = selectedRating
      ? fb.rating >= parseInt(selectedRating)
      : true;

    // Convert to Date objects
    const fbDate = new Date(fb.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to
      ? new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)) // include full day
      : null;

    // Filter by date range
    const matchDate =
      (!fromDate || fbDate >= fromDate) && (!toDate || fbDate <= toDate);

    return matchDish && matchRating && matchDate;
  });

  return (
    <div className="main main_page min-h-screen p-6">
      {/* Page Title */}

      <PageTitle title={"Restaurant Owner Dashboard"} />

      {/* WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
        {widgets.map((w, idx) => (
          <div
            key={idx}
            className="bg-white border-l-4 border-orange-400 shadow-md rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600 text-sm font-medium">{w.title}</h3>
              {w.icon}
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">{w.value}</p>
            <p className="text-sm text-gray-500 mt-1">{w.subValue}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6  mt-10">
        {/* Line Chart */}
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-gray-700">
            Dish Popularity Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={popularityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Paneer" stroke="#f97316" />
              <Line type="monotone" dataKey="Pasta" stroke="#22c55e" />
              <Line type="monotone" dataKey="Dal" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-gray-700">
            Top-rated vs Dropped Dishes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topDroppedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart with Toggle */}
        <div className="bg-white shadow rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Feedback Volume</h3>
            <div className="space-x-2">
              <button
                onClick={() => setFeedbackView("daily")}
                className={`px-3 py-1 rounded ${
                  feedbackView === "daily"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setFeedbackView("monthly")}
                className={`px-3 py-1 rounded ${
                  feedbackView === "monthly"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={feedbackView === "daily" ? dailyFeedback : monthlyFeedback}
            >
              <defs>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={feedbackView === "daily" ? "day" : "month"} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="reviews"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorReviews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dish Performance */}
      <div className="bg-white shadow rounded-xl p-4 mt-6">
        <h3 className="font-semibold mb-3">📋 Dish Performance</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="p-2">Dish Name</th>
              <th className="p-2">Feedback Count</th>
              <th className="p-2">Avg. Rating</th>
              <th className="p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {dishPerformance.map((dish, idx) => (
              <tr key={idx} className="border-b text-gray-700">
                <td className="p-2">{dish.dish}</td>
                <td className="p-2">{dish.feedback}</td>
                <td className="p-2">{dish.rating}</td>
                <td className="p-2">{dish.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Viewer */}
      <div className="bg-white shadow rounded-xl p-4 mt-6">
        <h3 className="font-semibold mb-3 text-orange-600">
          💬 Feedback Viewer
        </h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Filter by Dish */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Dish
            </label>
            <select
              className="border rounded p-2 w-full"
              value={selectedDish}
              onChange={(e) => setSelectedDish(e.target.value)}
            >
              <option value="">All Dishes</option>
              <option value="Paneer Tikka">Paneer Tikka</option>
              <option value="Pasta Alfredo">Pasta Alfredo</option>
              <option value="Dal Makhani">Dal Makhani</option>
            </select>
          </div>

          {/* Filter by Rating */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Rating
            </label>
            <select
              className="border rounded p-2 w-full"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="5">⭐ 5</option>
              <option value="4">⭐ 4+</option>
              <option value="3">⭐ 3+</option>
              <option value="2">⭐ 2+</option>
              <option value="1">⭐ 1+</option>
            </select>
          </div>

          {/* Date Range From */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              From Date
            </label>
            <input
              type="date"
              className="border rounded p-2 w-full"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>

          {/* Date Range To */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              To Date
            </label>
            <input
              type="date"
              className="border rounded p-2 w-full"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedback.length > 0 ? (
          <ul className="divide-y">
            {filteredFeedback.map((fb, idx) => (
              <li key={idx} className="py-3">
                <p className="font-semibold text-gray-800">
                  {fb.dish} - ⭐ {fb.rating}
                </p>
                <p className="text-gray-600 text-sm mt-1">{fb.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{fb.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            No feedback matches your filters.
          </p>
        )}
      </div>
    </div>
  );
}
