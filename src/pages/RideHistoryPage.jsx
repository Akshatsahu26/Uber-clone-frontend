import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { journeyApi } from "../services/journeyApi";

const STATUS_COLORS = {
  REQUESTED:  "bg-blue-100 text-blue-700",
  ACCEPTED:   "bg-amber-100 text-amber-700",
  ARRIVED:    "bg-purple-100 text-purple-700",
  STARTED:    "bg-emerald-100 text-emerald-700",
  COMPLETED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

const FILTER_OPTIONS = [
  { label: "All",       value: ""          },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Active",    value: "STARTED"   },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function RideHistoryPage() {
  const navigate     = useNavigate();
  const [rides,    setRides]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("uber_user") || "null"); }
    catch { return null; }
  })();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await journeyApi.getRiderHistory(filter || null);
        if (res.success) setRides(res.data);
        else throw new Error(res.message);
      } catch (e) {
        setError(e.response?.data?.message || e.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-black transition-colors mb-2"
            >
              ← Back to Home
            </button>
            <h1
              className="text-3xl font-black tracking-tight text-zinc-900"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Ride History
            </h1>
            <p className="text-zinc-400 text-sm mt-1">All your past trips in one place</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            + New ride
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all
                ${filter === f.value
                  ? "bg-black text-white border-black"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400">Loading your rides…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rides.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚗</div>
            <p className="font-semibold text-zinc-700">No rides found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {filter ? "Try a different filter" : "Your ride history will appear here"}
            </p>
          </div>
        )}

        {/* Ride list */}
        {!loading && rides.length > 0 && (
          <div className="flex flex-col gap-3">
            {rides.map((ride) => (
              <button
                key={ride._id}
                onClick={() => navigate(`/ride/${ride._id}`)}
                className="w-full text-left bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-sm rounded-2xl p-4 transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
                      <span className="text-base">
                        {ride.vehicleType === "CAR" ? "🚗" :
                         ride.vehicleType === "BIKE" ? "🏍️" :
                         ride.vehicleType === "AUTO" ? "🛺" :
                         ride.vehicleType === "E_RICKSHAW" ? "⚡" : "🛵"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Route */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                        <p className="text-xs text-zinc-500 truncate">{ride.pickup?.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-sm bg-black flex-shrink-0" />
                        <p className="text-xs font-medium text-zinc-800 truncate">{ride.dropoff?.address}</p>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5">{formatDate(ride.requestedAt)}</p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${STATUS_COLORS[ride.status] || "bg-zinc-100 text-zinc-500"}`}
                    >
                      {ride.status}
                    </span>
                    <p
                      className="font-black text-zinc-900 text-base"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      ₹{ride.actualFare ?? ride.estimatedFare}
                    </p>
                    <p className="text-[11px] text-zinc-400">{ride.paymentMethod}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}