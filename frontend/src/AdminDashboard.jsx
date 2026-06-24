import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    fraudAlerts: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [frauds, setFrauds] = useState([]);

  const [merchantData, setMerchantData] = useState({});
  const [statusData, setStatusData] = useState({});

  const [view, setView] = useState("transactions");
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/transactions",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTransactions(res.data);
      setView("transactions");
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFrauds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/fraud-alerts",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFrauds(res.data);
      setView("fraud");
    } catch (err) {
      console.log(err);
    }
  };

  const showAnalytics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/analytics",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMerchantData(res.data.merchantUsage || {});
      setStatusData(res.data.transactionStatus || {});

      setShowCharts(true);
    } catch (err) {
      console.log(err);
    }
  };

  const generateReport = async () => {
    const input = document.getElementById("reportSection");

    const canvas = await html2canvas(input);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Credit Card Processing System Report", 20, 20);

    pdf.setFontSize(12);

    pdf.text(`Total Users: ${stats.totalUsers}`, 20, 40);
    pdf.text(`Transactions: ${stats.totalTransactions}`, 20, 50);
    pdf.text(`Volume: $${stats.totalVolume}`, 20, 60);
    pdf.text(`Fraud Alerts: ${stats.fraudAlerts}`, 20, 70);

    pdf.addImage(imgData, "PNG", 10, 90, 190, 100);

    pdf.save("CreditCardReport.pdf");
  };

  const blockSuspicious = () => {
    alert("Suspicious cards blocked successfully");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const merchantChart = {
    labels: Object.keys(merchantData),
    datasets: [
      {
        label: "Merchant Transactions",
        data: Object.values(merchantData)
      }
    ]
  };

  const statusChart = {
    labels: ["Success", "Failed"],
    datasets: [
      {
        data: [
          statusData.success || 0,
          statusData.failed || 0
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            💳 Credit Card Processing System
          </h1>

          <p className="text-gray-400 mt-2">
            Real-Time Monitoring & Fraud Detection Center
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 px-6 py-3 rounded-xl mt-4 md:mt-0"
        >
          Logout
        </button>
      </div>

      {/* Status Banner */}

      <div className="bg-green-700 rounded-3xl p-6 mb-8">
        <h2 className="text-2xl font-bold">
          🟢 System Status : ACTIVE
        </h2>

        <p className="mt-2">
          Fraud Detection Running • Payment Gateway Online • Database Connected
        </p>
      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-purple-700 p-6 rounded-3xl">
          <h3>Total Users</h3>
          <p className="text-4xl font-bold mt-3">
            {stats.totalUsers}
          </p>
        </div>

        <div
          onClick={fetchTransactions}
          className="bg-blue-700 p-6 rounded-3xl cursor-pointer"
        >
          <h3>Transactions</h3>
          <p className="text-4xl font-bold mt-3">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-green-700 p-6 rounded-3xl">
          <h3>Total Volume</h3>
          <p className="text-4xl font-bold mt-3">
            ${stats.totalVolume}
          </p>
        </div>

        <div
          onClick={fetchFrauds}
          className="bg-red-700 p-6 rounded-3xl cursor-pointer"
        >
          <h3>Fraud Alerts</h3>
          <p className="text-4xl font-bold mt-3">
            {stats.fraudAlerts}
          </p>
        </div>

      </div>

      {/* Actions */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <button
          onClick={blockSuspicious}
          className="bg-red-600 p-5 rounded-2xl"
        >
          🚫 Block Suspicious Cards
        </button>

        <button
          onClick={showAnalytics}
          className="bg-purple-600 p-5 rounded-2xl"
        >
          📊 Analytics Dashboard
        </button>

        <button
          onClick={generateReport}
          className="bg-orange-500 p-5 rounded-2xl"
        >
          📄 Generate Report
        </button>

      </div>

      {/* Charts */}

      {showCharts && (
        <div id="reportSection">

          <div className="grid md:grid-cols-2 gap-8 mb-10">

            <div className="bg-slate-800 p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">
                Merchant Usage
              </h2>

              <Bar data={merchantChart} />
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">
                Transaction Status
              </h2>

              <Pie data={statusChart} />
            </div>

          </div>

        </div>
      )}

      {/* Tables */}

      <div className="bg-slate-800 rounded-3xl overflow-hidden">

        <div className="bg-indigo-700 p-5">
          <h2 className="text-2xl font-bold">
            Transaction Monitoring
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-900">

              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Merchant</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>

            </thead>

            <tbody>

              {(view === "transactions"
                ? transactions
                : frauds
              ).map((item, index) => (

                <tr
                  key={index}
                  className="border-b border-slate-700"
                >

                  <td className="p-4">
                    {item.userName || "User"}
                  </td>

                  <td className="p-4">
                    {item.merchantName || item.merchant}
                  </td>

                  <td className="p-4">
                    ${item.amount}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full ${
                        item.status === "success"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="p-4">
                    {new Date(
                      item.createdAt || item.date
                    ).toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;