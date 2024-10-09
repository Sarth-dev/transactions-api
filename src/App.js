import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const App = () => {
  const [month, setMonth] = useState("March");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChart, setBarChart] = useState({});
  const [pieChart, setPieChart] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transRes = await axios.get(
          `http://localhost:5000/api/transactions?month=${month}`
        );
        setTransactions(transRes.data);
        setFilteredTransactions(transRes.data); // Initialize filtered transactions

        // Fetch statistics
        const statsRes = await axios.get(
          `http://localhost:5000/api/statistics?month=${month}`
        );
        setStatistics(statsRes.data);

        // Fetch bar chart data
        const barRes = await axios.get(
          `http://localhost:5000/api/bar-chart?month=${month}`
        );
        setBarChart(barRes.data);

        // Fetch pie chart data
        const pieRes = await axios.get(
          `http://localhost:5000/api/pie-chart?month=${month}`
        );
        setPieChart(pieRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month]);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter transactions based on search term
    const filtered = transactions.filter((transaction) => {
      return (
        transaction.title.toLowerCase().includes(value) ||
        transaction.description.toLowerCase().includes(value) ||
        transaction.price.toString().includes(value)
      );
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  };

  // Pagination Logic
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Prepare data for the bar chart
  const barChartData = {
    labels: Object.keys(barChart), // Price ranges
    datasets: [
      {
        label: "Number of Items",
        data: Object.values(barChart),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Prepare data for the pie chart
  const pieChartData = {
    labels: Object.keys(pieChart), // Categories
    datasets: [
      {
        data: Object.values(pieChart),
        backgroundColor: [
          "#ff6f61", // Coral Red
          "#6b5b95", // Soft Purple
          "#88b04b", // Soft Green
          "#f7cac9", // Pink
          "#92a8d1", // Soft Blue
          "#ffcc5c", // Soft Yellow
        ],
      },
    ],
  };

  return (
    <div>
      <div className="w-full h-24  ">
        <div className="px-2 py-2">
          <h1 className="text-3xl font-semibold text-center ">Transactions Dashboard</h1>
        </div>
      </div>

      <div className="w-full h-30 shadow1 justify-between px-2 py-2 flex">
        <div className=" flex ml-20 w-full h-20 px-1 py-8">
          <div>
            <label className="mt-5 px-1 py-1 rounded-md">Select Month: </label>
            <select
              className="rounded-md px-1 py-1 shadow1"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((mon) => (
                <option key={mon} value={mon}>
                  {mon}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full h-full px-1 py-8 ml-72">
          <input
            type="text"
            placeholder="Search Transaction"
            value={searchTerm}
            onChange={handleSearch}
            className="border w-3/4 rounded-full outline-none shadow1 px-4 py-2 "
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="w-full h-full mt-0 p-10 shadow">
        <h2 className="text-center text-2xl font-medium">Transactions Table</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Date of Sale</th>
              <th>Sold</th>
            </tr>
          </thead>
          <tbody className="mb-5">
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                {/* Display image if the transaction has an image URL */}
                <td>
                  <img
                    src={transaction.image || "https://via.placeholder.com/100"} // Placeholder if image is missing
                    alt={transaction.title}
                    width="100"
                  />
                </td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>₹{transaction.price}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                <td>{transaction.sold ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            className="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Display statistics */}
      <div className="w-full h-full text-center p-5 rounded-lg shadow-lg">
        <div className="flex justify-center gap-5">
          <h2 className="text-teal-500 text-2xl">Statistics</h2>
          {/* Select Month Dropdown */}
          <label className="text-teal-700 mr-2 " htmlFor="month-select"></label>
          <select
            id="month-select"
            className="rounded-lg p-1 shadow1 outline-none"
            value={month}
            onChange={(e) => setMonth(e.target.value)} // Update month state
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((mon) => (
              <option key={mon} value={mon}>
                {mon}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-center flex-col">
          <p className="text-teal-600 flex justify-between w-full stat gap-5">
            <span>Total Sales:</span>
            <span className="text-right">₹{statistics.totalSales}</span>
          </p>
          <p className="text-teal-600 flex justify-between w-full stat gap-5">
            <span>Total Sold Items:</span>
            <span className="text-right">{statistics.totalSold}</span>
          </p>
          <p className="text-teal-600 flex justify-between w-full stat gap-5">
            <span>Total Not Sold Items:</span>
            <span className="text-right">{statistics.totalNotSold}</span>
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mt-4 w-full flex justify-center">
        <div className="w-[90%] h-60">
          {/* Month Selector for Bar Chart */}
          <label className="mr-2">Select Month:</label>
          <select
            className="rounded-lg px-1 py-1 shadow1"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((mon) => (
              <option key={mon} value={mon}>
                {mon}
              </option>
            ))}
          </select>
          <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="w-full h-60 flex flex-col shadow1 mt-10 rounded-lg shadow-lg p-5">
        <h2 className="text-center font-semibold text-3xl text-teal-800">Pie Chart</h2>
        <div className="mt-4 w-full flex justify-center flex-col items-center">
          <div className="mr-4"> {/* Space between label and dropdown */}
            <label className="text-teal-800 mr-2">Select Month:</label>
            <select
              className="rounded-lg px-2 py-1 shadow-md shadow1 outline-none focus:ring-2 focus:ring-orange-300"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((mon) => (
                <option key={mon} value={mon}>
                  {mon}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[21%] h-[16rem] mt-[40px] ">
            <Pie data={pieChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
