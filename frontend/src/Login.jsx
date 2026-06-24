import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email,
          password
        }
      );

      if (res.data.role !== role) {
        alert(
          `This account is registered as ${res.data.role}. Please select the correct role.`
        );
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);

      if (res.data.role === "user") {
        navigate("/user");
      } else if (res.data.role === "merchant") {
        navigate("/merchant-dashboard");
      } else {
        navigate("/admin");
      }

    } catch (error) {

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server not responding");
      }

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl flex flex-col lg:flex-row overflow-hidden rounded-3xl shadow-2xl bg-white">

        {/* LEFT SIDE */}

        <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-600 text-white p-10 flex flex-col justify-center">

          <div className="text-7xl mb-6">
            💳
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Credit Card
            <br />
            Processing System
          </h1>

          <p className="text-lg opacity-90 mb-8">
            Secure Payments • Fraud Detection • Smart Monitoring
          </p>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Real-Time Transactions</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Fraud Detection System</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>QR Based Payments</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Admin Monitoring Dashboard</span>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="lg:w-1/2 bg-slate-50 p-8 md:p-12 flex items-center">

          <div className="w-full">

            <h2 className="text-4xl font-bold text-slate-800 mb-2 text-center">
              Welcome Back
            </h2>

            <p className="text-center text-slate-500 mb-8">
              Sign in to continue
            </p>

            {/* EMAIL */}

            <div className="mb-5">

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* PASSWORD */}

            <div className="mb-5">

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* ROLE */}

            <div className="mb-6">

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Login As
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">Customer</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>

            </div>

            {/* BUTTON */}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg hover:scale-105 transition duration-300"
            >
              Sign In
            </button>

            {/* REGISTER */}

            <div className="mt-8 text-center">

              <p className="text-gray-600">
                Don't have an account?
              </p>

              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;