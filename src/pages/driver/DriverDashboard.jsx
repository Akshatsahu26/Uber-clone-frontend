import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, List, User, LogOut, Power, Star, TrendingUp } from "lucide-react";
import { useDriver } from "../../context/DriverContext";
import AvailableRides from "../../components/driver/AvailableRides";
import ActiveRide from "../../components/driver/ActiveRide";
import DriverProfile from "../../components/driver/DriverProfile";
import { driverJourneyApi } from "../../services/driverApi";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history",   label: "History",   icon: List   },
  { id: "profile",   label: "Profile",   icon: User   },
];

function MapPlaceholder({ isOnline }) {
  return (
    <div className="relative w-full h-full min-h-[280px] bg-zinc-100 rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="absolute top-1/3 left-0 right-0 h-6 bg-white/60 rounded" />
      <div className="absolute top-0 bottom-0 left-1/2 w-6 bg-white/60 rounded" />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 transition-all duration-500 ${isOnline ? "bg-black border-white animate-bounce" : "bg-zinc-400 border-zinc-200"}`}>
          🚗
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${isOnline ? "bg-black text-white" : "bg-zinc-400 text-white"}`}>
          {isOnline ? "You're online" : "You're offline"}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "bg-zinc-50" }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col gap-2`}>
      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-zinc-700" />
      </div>
      <p className="text-xl font-black text-zinc-900" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

function DriverHistory() {
  const [rides, setRides]     = useState([]);
  const [loaded, setLoaded]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await driverJourneyApi.getHistory();
        if (res.success) setRides(res.data);
      } catch {}
      finally { setLoading(false); setLoaded(true); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

  if (loaded && rides.length === 0) return (
    <div className="flex flex-col items-center py-20 gap-3 text-center">
      <div className="text-5xl">🚗</div>
      <p className="font-bold text-zinc-700">No completed rides yet</p>
      <p className="text-sm text-zinc-400">Your ride history will appear here</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Ride History</h1>
      <div className="flex flex-col gap-3">
        {rides.map((r) => (
          <div key={r._id} className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚗</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">{r.pickup?.address} → {r.dropoff?.address}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{r.rider?.name} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-black text-zinc-900" style={{ fontFamily: "'Syne', sans-serif" }}>₹{r.actualFare ?? r.estimatedFare}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { driver, isOnline, toggleStatus, loading, error, needsSetup, activeRide, setActiveRide } = useDriver();
  const [tab, setTab]       = useState("dashboard");
  const [toggling, setToggling] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("uber_user") || "null"); }
    catch { return null; }
  })();

  // ── Redirect to setup if no driver profile exists ──
  useEffect(() => {
    if (!loading && needsSetup) {
      navigate("/driver/setup", { replace: true });
    }
  }, [loading, needsSetup, navigate]);

  function handleLogout() {
    localStorage.removeItem("uber_token");
    localStorage.removeItem("uber_user");
    localStorage.removeItem("uber_role");
    navigate("/login");
  }

  async function handleToggle() {
    setToggling(true);
    await toggleStatus();
    setToggling(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading driver dashboard…</p>
        </div>
      </div>
    );
  }

  if (needsSetup) return null; // useEffect handles redirect

  return (
    <div className="min-h-screen bg-zinc-50 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-black min-h-screen p-5 sticky top-0">
        <div className="mb-8">
          <span className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Uber</span>
          <span className="ml-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Driver</span>
        </div>

        <button onClick={handleToggle} disabled={toggling}
          className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border transition-all font-semibold text-sm ${
            isOnline ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
          }`}>
          <Power className={`w-4 h-4 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`} />
          {toggling ? "Updating…" : isOnline ? "Online — Go offline" : "Offline — Go online"}
          <span className={`ml-auto w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
        </button>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
                ${tab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>

        {driver && (
          <div className="bg-zinc-800 rounded-xl p-3 mb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {(driver.user?.name || user?.name || "D")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{driver.user?.name || user?.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] text-zinc-400">{driver.stats?.rating?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between bg-black text-white px-5 py-3 sticky top-0 z-50">
          <span className="text-lg font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
            Uber <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Driver</span>
          </span>
          <button onClick={handleToggle} disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isOnline ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
            <Power className="w-3 h-3" />
            {toggling ? "…" : isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <div className="flex-1 p-5 lg:p-8 max-w-4xl mx-auto w-full pb-24 lg:pb-8">

          {tab === "dashboard" && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {isOnline ? "You're online" : "Start driving"}
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                  {isOnline ? "Incoming ride requests will appear below." : "Toggle online to start receiving ride requests."}
                </p>
              </div>

              {driver && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={Star}       label="Rating"      value={driver.stats?.rating?.toFixed(1) || "5.0"} color="bg-amber-50" />
                  <StatCard icon={TrendingUp} label="Total Rides"  value={driver.stats?.totalRides || 0} />
                  <StatCard icon={Power}      label="Status"       value={isOnline ? "Online" : "Offline"} color={isOnline ? "bg-emerald-50" : "bg-zinc-100"} />
                  <StatCard icon={User}       label="Completion"   value={`${driver.status?.profileCompletionPercentage || 0}%`} />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3"><MapPlaceholder isOnline={isOnline} /></div>
                <div className="lg:col-span-2">
                  {activeRide
                    ? <ActiveRide ride={activeRide} onRideComplete={() => setActiveRide(null)} />
                    : <AvailableRides onAccepted={(ride) => setActiveRide(ride)} />
                  }
                </div>
              </div>
            </div>
          )}

          {tab === "history" && <DriverHistory />}
          {tab === "profile" && <DriverProfile />}
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 flex z-50">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${tab === id ? "text-black" : "text-zinc-400"}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
          <button onClick={handleLogout} className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold text-zinc-400">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </nav>
      </main>
    </div>
  );
}