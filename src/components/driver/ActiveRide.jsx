import { useState } from "react";
import { Phone, MapPin, Navigation, CheckCircle, XCircle } from "lucide-react";
import { driverJourneyApi } from "../../services/driverApi";

const STEPS = ["ACCEPTED", "ARRIVED", "STARTED", "COMPLETED"];

const STEP_CONFIG = {
  ACCEPTED: {
    label: "Head to pickup",
    sub: "Navigate to the rider's pickup location.",
    color: "bg-amber-50 border-amber-100",
    dot: "bg-amber-500",
    next: "ARRIVED",
    nextLabel: "I've Arrived",
    nextColor: "bg-amber-500 hover:bg-amber-600",
  },
  ARRIVED: {
    label: "Waiting for rider",
    sub: "You've arrived at the pickup point.",
    color: "bg-purple-50 border-purple-100",
    dot: "bg-purple-500",
    next: "STARTED",
    nextLabel: "Start Ride",
    nextColor: "bg-purple-600 hover:bg-purple-700",
  },
  STARTED: {
    label: "Trip in progress",
    sub: "Navigate to the drop-off location.",
    color: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-500",
    next: "COMPLETED",
    nextLabel: "Complete Ride",
    nextColor: "bg-emerald-600 hover:bg-emerald-700",
  },
  COMPLETED: {
    label: "Ride completed!",
    sub: "Great job! The ride has been completed.",
    color: "bg-green-50 border-green-100",
    dot: "bg-green-600",
  },
  CANCELLED: {
    label: "Ride cancelled",
    sub: "This ride was cancelled.",
    color: "bg-red-50 border-red-100",
    dot: "bg-red-500",
  },
};

export default function ActiveRide({ ride, onRideComplete }) {
  const [status, setStatus]         = useState(ride.status);
  const [journey, setJourney]       = useState(ride);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [actualFare, setActualFare] = useState(ride.estimatedFare ?? "");

  const config = STEP_CONFIG[status] || STEP_CONFIG.ACCEPTED;
  const currentStep = STEPS.indexOf(status);

  async function handleNext() {
    const next = config.next;
    if (!next) return;
    setLoading(true);
    setError("");
    try {
      let res;
      if (next === "COMPLETED") {
        res = await driverJourneyApi.completeRide(
          journey._id,
          Number(actualFare) || journey.estimatedFare,
          5,   // distance placeholder — replace with real value
          15   // duration placeholder
        );
      } else {
        res = await driverJourneyApi.updateRideStatus(journey._id, next);
      }
      if (!res.success) throw new Error(res.message);
      setJourney(res.data);
      setStatus(res.data.status);
      if (res.data.status === "COMPLETED") {
        setTimeout(() => onRideComplete && onRideComplete(), 2500);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to update ride.");
    } finally {
      setLoading(false);
    }
  }

  const rider = journey.rider;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Banner */}
      <div className={`rounded-2xl border p-4 ${config.color}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-zinc-900">{config.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{config.sub}</p>
          </div>
          <span className={`w-3 h-3 rounded-full shrink-0 mt-1 ${config.dot} ${
            !["COMPLETED", "CANCELLED"].includes(status) ? "animate-pulse" : ""
          }`} />
        </div>
      </div>

      {/* Progress Steps */}
      {status !== "CANCELLED" && (
        <div className="flex items-center gap-1 px-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${i <= currentStep ? "bg-black scale-110" : "bg-zinc-200"}`} />
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < currentStep ? "bg-black" : "bg-zinc-200"}`} />}
            </div>
          ))}
        </div>
      )}

      {/* Rider Info */}
      {rider && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
            {(rider.name || "R")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-900 text-sm">{rider.name}</p>
            <p className="text-xs text-zinc-400">{rider.phone}</p>
          </div>
          {rider.phone && (
            <a href={`tel:${rider.phone}`} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0">
              <Phone className="w-4 h-4 text-zinc-700" />
            </a>
          )}
        </div>
      )}

      {/* Route */}
      <div className="bg-zinc-50 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3 items-start">
          <div className="w-2.5 h-2.5 rounded-full bg-black mt-1 shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Pickup</p>
            <p className="text-zinc-800 font-medium text-sm">{journey.pickup?.address}</p>
          </div>
        </div>
        <div className="ml-1.5 w-px h-3 bg-zinc-300" />
        <div className="flex gap-3 items-start">
          <div className="w-2.5 h-2.5 rounded-sm bg-black mt-1 shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Dropoff</p>
            <p className="text-zinc-800 font-medium text-sm">{journey.dropoff?.address}</p>
          </div>
        </div>
      </div>

      {/* Fare — editable at completion */}
      <div className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Fare</p>
          {status === "STARTED" ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-zinc-500 text-sm">₹</span>
              <input
                type="number"
                value={actualFare}
                onChange={(e) => setActualFare(e.target.value)}
                className="w-24 text-lg font-black text-zinc-900 bg-transparent outline-none border-b border-zinc-300 focus:border-black"
                style={{ fontFamily: "'Syne', sans-serif" }}
              />
            </div>
          ) : (
            <p className="text-zinc-900 font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              ₹{journey.actualFare ?? journey.estimatedFare}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Payment</p>
          <p className="text-zinc-700 font-semibold text-sm">{journey.paymentMethod}</p>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* Action button */}
      {config.next && (
        <button
          onClick={handleNext}
          disabled={loading}
          className={`w-full py-4 text-white rounded-xl font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${config.nextColor}`}
        >
          {loading
            ? <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" /></svg>
            : config.nextLabel
          }
        </button>
      )}

      {/* Completed state */}
      {status === "COMPLETED" && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-800">Ride Completed!</p>
          <p className="text-xs text-green-600 mt-1">Returning to dashboard…</p>
        </div>
      )}
    </div>
  );
}