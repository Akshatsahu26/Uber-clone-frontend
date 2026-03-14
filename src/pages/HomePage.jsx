import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RideRequestForm from "../components/ride/RideRequestForm";
import RideStatusCard from "../components/ride/RideStatusCard";
import SuggestionCards from "../components/SuggestionCards";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeJourney, setActiveJourney] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("uber_user") || "null"); }
    catch { return null; }
  })();

  function handleJourneyCreated(journey) {
    setActiveJourney(journey);
    navigate(`/ride/${journey._id}`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-6 py-12" style={{ animation: "fadeIn 0.45s cubic-bezier(0.22,1,0.36,1) both" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT */}
          <div className="max-w-md">
            {activeJourney ? (
              <div>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>Ride Status</h2>
                <RideStatusCard
                  journey={activeJourney}
                  onCancel={() => setActiveJourney(null)}
                  onPaymentDone={() => {}}
                  onNewRide={() => setActiveJourney(null)}
                />
              </div>
            ) : (
              <RideRequestForm city="Bhopal, IN" onJourneyCreated={handleJourneyCreated} />
            )}
          </div>

          {/* RIGHT */}
          <div className="pt-2">
            <div className="flex gap-3 mb-6 flex-wrap">
              <button onClick={() => navigate("/history")} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-full text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-all">
                📋 Ride History
              </button>
              <button onClick={() => navigate("/help")} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-full text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-all">
                🆘 Help
              </button>
            </div>
            <SuggestionCards onSelect={(item) => console.log(item.label)} />
          </div>
        </div>
      </main>
    </div>
  );
}