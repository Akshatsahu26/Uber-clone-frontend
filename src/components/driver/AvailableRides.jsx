import { useState } from "react";
import { Clock, IndianRupee, Navigation, ChevronRight } from "lucide-react";
import { driverJourneyApi } from "../../services/driverApi";
import { useDriver } from "../../context/DriverContext";

const VEHICLE_ICONS = {
  CAR: "🚗", BIKE: "🏍️", AUTO: "🛺", E_RICKSHAW: "⚡", ELECTRIC_SCOOTER: "🛵",
};

function RideCard({ ride, onAccepted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { fetchAvailable }    = useDriver();

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      const res = await driverJourneyApi.acceptRide(ride._id);
      if (!res.success) throw new Error(res.message || "Failed to accept ride");
      onAccepted(res.data);
      fetchAvailable();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to accept ride.");
    } finally {
      setLoading(false);
    }
  }

  const distance = Number(ride.distance);
  const distanceLabel = Number.isFinite(distance) ? `${distance.toFixed(1)} km` : "~5 km";
  const durationVal = Number(ride.duration);
  const durationLabel = Number.isFinite(durationVal) ? `${durationVal} min` : "~15 min";

  const timeSince = (dateStr) => {
    const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    return mins < 1 ? "Just now" : `${mins}m ago`;
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:border-zinc-200 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{VEHICLE_ICONS[ride.vehicleType] || "🚗"}</span>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{ride.vehicleType?.replace("_", " ")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{timeSince(ride.requestedAt || ride.createdAt)}</span>
        </div>
      </div>

      {/* Route */}
      <div className="px-4 py-3">
        <div className="flex gap-3">
          {/* Line */}
          <div className="flex flex-col items-center pt-1 gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
            <div className="w-px flex-1 bg-zinc-200 my-0.5" style={{ minHeight: 24 }} />
            <div className="w-2.5 h-2.5 rounded-sm bg-black shrink-0" />
          </div>
          {/* Addresses */}
          <div className="flex flex-col justify-between flex-1 min-w-0 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Pickup</p>
              <p className="text-sm font-medium text-zinc-800 truncate">{ride.pickup?.address || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Drop</p>
              <p className="text-sm font-medium text-zinc-800 truncate">{ride.dropoff?.address || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100">
        {[
          { icon: IndianRupee, label: "Est. Fare", value: `₹${ride.estimatedFare ?? "—"}` },
          { icon: Navigation,  label: "Distance",  value: distanceLabel },
          { icon: Clock,       label: "Est. Time",  value: durationLabel },
        ].map(({ icon, label, value }) => {
          const Icon = icon;
          return (
            <div key={label} className="flex flex-col items-center py-3 gap-0.5">
              <Icon className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
              <p className="text-xs font-bold text-zinc-900">{value}</p>
              <p className="text-[10px] text-zinc-400">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Rider info */}
      {ride.rider && (
        <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 uppercase">
            {(ride.rider?.name || "R")[0]}
          </div>
          <p className="text-xs text-zinc-500">{ride.rider?.name || "Rider"}</p>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 font-semibold rounded-full uppercase tracking-wider">{ride.status}</span>
        </div>
      )}

      {/* Error */}
      {error && <p className="px-4 pb-2 text-xs text-red-500 font-medium">{error}</p>}

      {/* Accept button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-black/10"
        >
          {loading
            ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" /></svg>
            : <><span>Accept Ride</span><ChevronRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </div>
  );
}

export default function AvailableRides({ onAccepted }) {
  const { available, isOnline, fetchAvailable } = useDriver();

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-3xl">😴</div>
        <p className="font-bold text-zinc-800 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>You're offline</p>
        <p className="text-sm text-zinc-400 max-w-xs">Go online to start receiving ride requests from nearby riders.</p>
      </div>
    );
  }

  if (available.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-3xl animate-pulse">🔍</div>
        <p className="font-bold text-zinc-800 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Looking for rides…</p>
        <p className="text-sm text-zinc-400 max-w-xs">New requests will appear here automatically. We're polling every 6 seconds.</p>
        <button onClick={fetchAvailable} className="px-4 py-2 border border-zinc-200 rounded-full text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          Refresh now
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-500">{available.length} ride{available.length !== 1 ? "s" : ""} nearby</h3>
        <button onClick={fetchAvailable} className="text-xs text-zinc-400 hover:text-black transition-colors">↻ Refresh</button>
      </div>
      {available.map((ride) => (
        <RideCard key={ride._id} ride={ride} onAccepted={onAccepted} />
      ))}
    </div>
  );
}