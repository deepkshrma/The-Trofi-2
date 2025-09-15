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

export default function RestroOwnerDashboard() {
  // === WIDGET DATA ===
  const widgets = [
    {
      title: "Total Reviews",
      value: "120",
      subValue: "Today: 5 | Week: 32 | Month: 120 | 6M: 580",
      icon: <FaComments className="text-blue-500 text-xl" />,
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

  // === INSIGHTS DATA ===
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

  const feedbackVolume = [
    { day: "Mon", reviews: 10 },
    { day: "Tue", reviews: 14 },
    { day: "Wed", reviews: 8 },
    { day: "Thu", reviews: 18 },
    { day: "Fri", reviews: 20 },
    { day: "Sat", reviews: 25 },
    { day: "Sun", reviews: 15 },
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

  // === FEEDBACK DRILLDOWN DATA ===
  const [view, setView] = useState("monthly"); // monthly | weekly | daily
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const monthlyData = [
    { month: "Jan", reviews: 120 },
    { month: "Feb", reviews: 90 },
    { month: "Mar", reviews: 150 },
    { month: "Apr", reviews: 110 },
  ];

  const weeklyData = {
    Jan: [
      { week: "W1", reviews: 30 },
      { week: "W2", reviews: 20 },
      { week: "W3", reviews: 40 },
      { week: "W4", reviews: 30 },
    ],
    Feb: [
      { week: "W1", reviews: 25 },
      { week: "W2", reviews: 15 },
      { week: "W3", reviews: 30 },
      { week: "W4", reviews: 20 },
    ],
  };

  const dailyData = {
    JanW1: [
      { day: "Mon", reviews: 5 },
      { day: "Tue", reviews: 6 },
      { day: "Wed", reviews: 8 },
      { day: "Thu", reviews: 4 },
      { day: "Fri", reviews: 7 },
      { day: "Sat", reviews: 10 },
      { day: "Sun", reviews: 5 },
    ],
  };

  const renderFeedbackChart = () => {
    if (view === "monthly") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyData}
            onClick={(data) => {
              if (data?.activeLabel) {
                setSelectedMonth(data.activeLabel);
                setView("weekly");
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="reviews" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (view === "weekly" && selectedMonth) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={weeklyData[selectedMonth] || []}
            onClick={(data) => {
              if (data?.activeLabel) {
                setSelectedWeek(selectedMonth + data.activeLabel);
                setView("daily");
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="reviews" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (view === "daily" && selectedWeek) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData[selectedWeek] || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="reviews" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  // === JSX ===
  return (
    <div className="main main_page duration-900 min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">🍽️ Restaurant Owner Dashboard</h1>

      {/* === WIDGETS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((w, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">{w.title}</h3>
              {w.icon}
            </div>
            <p className="text-2xl font-bold mt-2">{w.value}</p>
            <p className="text-sm text-gray-400 mt-1">{w.subValue}</p>
          </div>
        ))}
      </div>

      {/* === DISH & RESTAURANT INSIGHTS === */}
      <h2 className="text-xl font-bold mt-10 mb-4">
        📊 Dish & Restaurant Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Popularity */}
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="font-semibold mb-2">Dish Popularity Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={popularityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Paneer" stroke="#3b82f6" />
              <Line type="monotone" dataKey="Pasta" stroke="#f97316" />
              <Line type="monotone" dataKey="Dal" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Top vs Dropped */}
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="font-semibold mb-2">Top-rated vs Dropped Dishes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topDroppedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart - Feedback Volume */}
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="font-semibold mb-2">Daily Feedback Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={feedbackVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="reviews"
                stroke="#3b82f6"
                fill="#bfdbfe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dish Performance Table */}
      <div className="bg-white shadow rounded-xl p-4 mt-6">
        <h3 className="font-semibold mb-3">📋 Dish Performance</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Dish Name</th>
              <th className="p-2">Feedback Count</th>
              <th className="p-2">Avg. Rating</th>
              <th className="p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {dishPerformance.map((dish, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{dish.dish}</td>
                <td className="p-2">{dish.feedback}</td>
                <td className="p-2">{dish.rating}</td>
                <td className="p-2">{dish.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === FEEDBACK DRILLDOWN CHART === */}
      <div className="bg-white shadow rounded-xl p-4 mt-6">
        <h3 className="font-semibold mb-3">📊 Feedback Reviews (Drilldown)</h3>
        {renderFeedbackChart()}
        <div className="mt-3">
          {view !== "monthly" && (
            <button
              onClick={() => {
                if (view === "daily") {
                  setView("weekly");
                  setSelectedWeek(null);
                } else if (view === "weekly") {
                  setView("monthly");
                  setSelectedMonth(null);
                }
              }}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              🔙 Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
