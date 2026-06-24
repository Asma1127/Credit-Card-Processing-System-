import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Bar, Pie } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
);

function MerchantDashboard() {

const [transactions,setTransactions] = useState([]);
const [totalSales,setTotalSales] = useState(0);
const [topCustomers,setTopCustomers] = useState([]);
const [chartData,setChartData] = useState({});
const [fraudData,setFraudData] = useState({});

const navigate = useNavigate();

const merchantName =
localStorage.getItem("name") || "Merchant";

useEffect(()=>{
fetchTransactions();
},[]);

const fetchTransactions = async()=>{

try{

const token = localStorage.getItem("token");

const res = await axios.get(
"http://localhost:5000/api/merchant-transactions",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setTransactions(res.data);

const sales =
res.data.reduce(
(sum,t)=>sum + Number(t.amount),
0
);

setTotalSales(sales);

/* Daily Sales */

const daily = {};

res.data.forEach(t=>{

const date =
new Date(t.createdAt)
.toLocaleDateString();

daily[date] =
(daily[date] || 0) +
Number(t.amount);

});

setChartData({
labels:Object.keys(daily),
datasets:[
{
label:"Sales Revenue",
data:Object.values(daily),
backgroundColor:"#3b82f6"
}
]
});

/* Fraud Data */

const success =
res.data.filter(
t=>t.status==="success"
).length;

const failed =
res.data.filter(
t=>t.status==="failed"
).length;

setFraudData({
labels:["Success","Fraud"],
datasets:[
{
data:[success,failed],
backgroundColor:[
"#22c55e",
"#ef4444"
]
}
]
});

/* Top Customers */

const customers = {};

res.data.forEach(t=>{

customers[t.userId] =
(customers[t.userId] || 0)
+ Number(t.amount);

});

const sorted =
Object.entries(customers)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

setTopCustomers(sorted);

}catch(err){

console.log(err);

}

};

const handleLogout = ()=>{

localStorage.clear();
navigate("/");

};

const fraudCount =
transactions.filter(
t=>t.status==="failed"
).length;

return(

<div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

{/* HEADER */}

<div className="px-6 md:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4">

<div>

<h1 className="text-4xl font-bold">
🏪 Merchant Dashboard
</h1>

<p className="text-gray-300 mt-2">
Welcome, {merchantName}
</p>

</div>

<button
onClick={handleLogout}
className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl"
>
Logout
</button>

</div>

{/* STATS */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-10">

<div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 shadow-lg">

<p className="text-lg">
Total Revenue
</p>

<h2 className="text-4xl font-bold mt-2">
₹{totalSales}
</h2>

</div>

<div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-6 shadow-lg">

<p className="text-lg">
Transactions
</p>

<h2 className="text-4xl font-bold mt-2">
{transactions.length}
</h2>

</div>

<div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-6 shadow-lg">

<p className="text-lg">
Customers
</p>

<h2 className="text-4xl font-bold mt-2">
{topCustomers.length}
</h2>

</div>

<div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl p-6 shadow-lg">

<p className="text-lg">
Fraud Alerts
</p>

<h2 className="text-4xl font-bold mt-2">
{fraudCount}
</h2>

</div>

</div>

{/* FRAUD PANEL */}

<div className="mx-6 md:mx-10 mt-8 bg-red-900/20 border border-red-500 rounded-3xl p-6">

<h2 className="text-2xl font-bold text-red-400">
🚨 Fraud Detection Center
</h2>

<p className="mt-2 text-gray-300">
Failed Transactions:
{" "}
{fraudCount}
</p>

<p className="text-gray-300">
Success Rate:
{" "}
{
transactions.length
?
Math.round(
(
transactions.filter(
t=>t.status==="success"
).length
/
transactions.length
) * 100
)
:0
}
%
</p>

</div>

{/* CHARTS */}

<div className="grid lg:grid-cols-2 gap-8 px-6 md:px-10 mt-8">

<div className="bg-slate-800 rounded-3xl p-6 shadow-lg">

<h2 className="text-xl font-bold mb-4">
📈 Revenue Analytics
</h2>

{chartData.labels &&
<Bar data={chartData} />
}

</div>

<div className="bg-slate-800 rounded-3xl p-6 shadow-lg">

<h2 className="text-xl font-bold mb-4">
🛡 Fraud Analysis
</h2>

{fraudData.labels &&
<Pie data={fraudData} />
}

</div>

</div>

{/* TOP CUSTOMERS */}

<div className="mx-6 md:mx-10 mt-8 bg-slate-800 rounded-3xl p-6 shadow-lg">

<h2 className="text-2xl font-bold mb-4">
🏆 Top Customers
</h2>

<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="border-b border-slate-600">

<th className="p-3 text-left">
Customer ID
</th>

<th className="p-3 text-left">
Total Spent
</th>

</tr>

</thead>

<tbody>

{topCustomers.map((c,index)=>(

<tr
key={index}
className="border-b border-slate-700"
>

<td className="p-3">
{c[0]}
</td>

<td className="p-3 text-green-400 font-semibold">
₹{c[1]}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

{/* TRANSACTIONS */}

<div className="mx-6 md:mx-10 mt-8 mb-10 bg-slate-800 rounded-3xl p-6 shadow-lg">

<h2 className="text-2xl font-bold mb-6">
💳 Recent Transactions
</h2>

<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="border-b border-slate-600">

<th className="p-3 text-left">
User
</th>

<th className="p-3 text-left">
Amount
</th>

<th className="p-3 text-left">
Status
</th>

<th className="p-3 text-left">
Date
</th>

</tr>

</thead>

<tbody>

{transactions.map(t=>(

<tr
key={t._id}
className="border-b border-slate-700"
>

<td className="p-3">
{t.userName || t.userId?.slice(-6)}
</td>

<td className="p-3 text-green-400 font-semibold">
₹{t.amount}
</td>

<td className="p-3">

<span
className={`px-3 py-1 rounded-full text-sm font-semibold ${
t.status === "success"
?
"bg-green-500"
:
"bg-red-500"
}`}
>
{t.status}
</span>

</td>

<td className="p-3">
{
new Date(
t.createdAt
).toLocaleString()
}
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

export default MerchantDashboard;