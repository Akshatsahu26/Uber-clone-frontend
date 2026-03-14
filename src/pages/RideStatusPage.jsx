import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RideStatusCard from "../components/ride/RideStatusCard";
import { journeyApi } from "../services/journeyApi";

const POLL_INTERVAL = 5000; // poll every 5 seconds
const TERMINAL     = ["COMPLETED", "CANCELLED"];

export default function RideStatusPage() {
  const { journeyId } = useParams();
  const navigate      = useNavigate();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("uber_user") || "null"); }
    catch { return null; }
  })();

  const fetchJourney = useCallback(async () => {
    try {
      const res = await journeyApi.getById(journeyId);
      if (res.success) setJourney(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load journey.");
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchJourney();
    const id = setInterval(() => {
      setJourney((prev) => {
        if (prev && TERMINAL.includes(prev.status)) {
          clearInterval(id);
          return prev;
        }
        fetchJourney();
        return prev;
      });
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchJourney]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Navbar user={user} />

      <main className="max-w-lg mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-black transition-colors mb-6"
        >
          ← Back to Home
        </button>

        <h1
          className="text-3xl font-black tracking-tight text-zinc-900 mb-6"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Ride Status
        </h1>

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400">Loading ride details…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {journey && !loading && (
          <RideStatusCard
            journey={journey}
            onCancel={() => { fetchJourney(); }}
            onPaymentDone={() => { fetchJourney(); }}
            onNewRide={() => navigate("/home")}
          />
        )}
      </main>
    </div>
  );
}