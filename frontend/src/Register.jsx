import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await axios.post(
        "http://localhost:5000/api/register",
        formData
      );

      alert("✅ Registration Successful");

      navigate("/");

    } catch (error) {

      if(error.response){
        alert(error.response.data.message);
      }else{
        alert("Server not responding");
      }

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl flex flex-col lg:flex-row overflow-hidden rounded-3xl shadow-2xl bg-white">

        {/* LEFT PANEL */}

        <div className="lg:w-1/2 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 text-white p-10 flex flex-col justify-center">

          <div className="text-7xl mb-6">
            💳
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Create Your
            <br />
            Secure Account
          </h1>

          <p className="text-lg opacity-90 mb-8">
            Join our Credit Card Processing System and enjoy secure digital payments.
          </p>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Secure User Authentication</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Credit Card Management</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Fraud Detection System</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✔</span>
              <span>Transaction Monitoring</span>
            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="lg:w-1/2 bg-slate-50 p-8 md:p-12 flex items-center">

          <div className="w-full">

            <h2 className="text-4xl font-bold text-slate-800 mb-2 text-center">
              Create Account
            </h2>

            <p className="text-center text-slate-500 mb-8">
              Register to continue
            </p>

            <form onSubmit={handleRegister}>

              {/* NAME */}

              <div className="mb-5">

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* EMAIL */}

              <div className="mb-5">

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* ROLE */}

              <div className="mb-6">

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Register As
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Customer</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:scale-105 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

            </form>

            {/* LOGIN */}

            <div className="mt-8 text-center">

              <p className="text-gray-600">
                Already have an account?
              </p>

              <Link
                to="/"
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Sign In
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Register;