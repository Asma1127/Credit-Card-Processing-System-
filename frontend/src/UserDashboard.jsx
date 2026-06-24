import { useState, useEffect } from "react";
import axios from "axios";

function UserDashboard() {
  const name = localStorage.getItem("name");

  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notification, setNotification] = useState("");

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardType: "Visa",
    expiryDate: "",
    cvv: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    merchant: "",
    amount: "",
    cardId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const cardsRes = await axios.get(
        "http://localhost:5000/api/cards",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const transRes = await axios.get(
        "http://localhost:5000/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCards(cardsRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const addCard = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/cards",
        cardForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification("✅ Card Added Successfully");

      setCardForm({
        cardNumber: "",
        cardType: "Visa",
        expiryDate: "",
        cvv: "",
      });

      fetchData();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  const removeCard = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `http://localhost:5000/api/cards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification("❌ Card Removed");

      fetchData();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  const makePayment = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/pay",
        {
          merchantId: paymentForm.merchant,
          merchantName: paymentForm.merchant,
          cardId: paymentForm.cardId,
          amount: Number(paymentForm.amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification(res.data.message);

      setPaymentForm({
        merchant: "",
        amount: "",
        cardId: "",
      });

      fetchData();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  const payWithQR = () => {
    alert("📷 QR Code Scanned");

    setPaymentForm({
      ...paymentForm,
      merchant: "QR Merchant",
    });
  };

  const totalSpent = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">

      {/* HEADER */}

      <div className="backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              💳 Credit Card Processing System
            </h1>
            <p className="text-gray-300 mt-1">
              Welcome Back, {name}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-5">

        {notification && (
          <div className="bg-green-600 p-3 rounded-lg text-center mb-6">
            {notification}
          </div>
        )}

        {/* DASHBOARD STATS */}

        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl">
            <h3 className="text-gray-300">My Cards</h3>
            <p className="text-3xl font-bold">{cards.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl">
            <h3 className="text-gray-300">Transactions</h3>
            <p className="text-3xl font-bold">{transactions.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl">
            <h3 className="text-gray-300">Total Spent</h3>
            <p className="text-3xl font-bold">
              ₹{totalSpent}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl">
            <h3 className="text-gray-300">Active Cards</h3>
            <p className="text-3xl font-bold text-green-400">
              {cards.length}
            </p>
          </div>

        </div>

        {/* ADD CARD */}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-5">
            Add New Card
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Card Number"
              value={cardForm.cardNumber}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  cardNumber: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            />

            <input
              type="text"
              placeholder="Expiry MM/YY"
              value={cardForm.expiryDate}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  expiryDate: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            />

            <input
              type="text"
              placeholder="CVV"
              value={cardForm.cvv}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  cvv: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            />

            <select
              value={cardForm.cardType}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  cardType: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            >
              <option>Visa</option>
              <option>Mastercard</option>
            </select>
          </div>

          <button
            onClick={addCard}
            className="mt-5 bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Add Card
          </button>
        </div>

        {/* MY CARDS */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-5">
            My Cards
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            {cards.map((card) => (
              <div
                key={card._id}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-xl relative"
              >
                <button
                  onClick={() => removeCard(card._id)}
                  className="absolute top-3 right-3 bg-red-500 px-3 py-1 rounded"
                >
                  ✕
                </button>

                <p className="text-lg tracking-widest">
                  **** **** **** {card.cardNumber.slice(-4)}
                </p>

                <p className="mt-3">{card.cardType}</p>

                <p>Expiry : {card.expiryDate}</p>

                <p className="mt-3 font-semibold">
                  Balance : ₹{card.balance || 5000}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* PAYMENT */}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Make Payment
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <select
              value={paymentForm.merchant}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  merchant: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            >
              <option value="">Select Merchant</option>
              <option>Amazon</option>
              <option>Netflix</option>
              <option>Swiggy</option>
              <option>Uber</option>
              <option>Zomato</option>
            </select>

            <input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  amount: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            />

            <select
              value={paymentForm.cardId}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  cardId: e.target.value,
                })
              }
              className="p-3 rounded-lg text-black"
            >
              <option value="">Select Card</option>

              {cards.map((card) => (
                <option
                  key={card._id}
                  value={card._id}
                >
                  {card.cardType} ****
                  {card.cardNumber.slice(-4)}
                </option>
              ))}
            </select>

            <button
              onClick={payWithQR}
              className="bg-purple-600 rounded-lg"
            >
              Scan QR
            </button>

          </div>

          <button
            onClick={makePayment}
            className="mt-5 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Pay Now
          </button>

        </div>

        {/* TRANSACTION HISTORY */}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            Transaction History
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-3 text-left">Merchant</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>

                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-white/10"
                  >
                    <td className="p-4">
 {t.merchantName}
</td>

                    <td className="p-3">
                      ₹{t.amount}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          t.status === "success"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {new Date(
                        t.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}

export default UserDashboard;