import { useState } from "react";
import { journeyAPI } from "../config/api";

const VEHICLE_TYPES = [
  { value: "CAR", label: "Car", icon: "🚗", base: 50, perKm: 12 },
  { value: "BIKE", label: "Bike", icon: "🏍️", base: 20, perKm: 6 },
  { value: "AUTO", label: "Auto", icon: "🛺", base: 30, perKm: 8 },
  { value: "E_RICKSHAW", label: "E-Rickshaw", icon: "⚡", base: 25, perKm: 7 },
  { value: "ELECTRIC_SCOOTER", label: "E-Scooter", icon: "🛵", base: 15, perKm: 5 },
];

const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "WALLET"];

export default function RideRequest({ city = "Bhopal, IN" }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState("form"); // "form" | "confirm" | "success"

  // Estimate fare client-side (mirrors service logic)
  function estimateFare() {
    // Dummy distance ~5km for preview (real app uses coordinates)
    const v = VEHICLE_TYPES.find((v) => v.value === vehicleType);
    return v ? v.base + 5 * v.perKm : 0;
  }

  async function handleSeePrices() {
    setError("");
    if (!pickup.trim()) return setError("Please enter a pickup location.");
    if (!dropoff.trim()) return setError("Please enter a destination.");
    setStep("confirm");
  }

  async function handleBookRide() {
    setLoading(true);
    setError("");
    try {
      // In production pass real coordinates from geocoding API.
      // Using dummy Bhopal coords here as placeholders.
      const data = {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        pickupCoordinates: [77.4126, 23.2599],  // [lon, lat]
        dropoffCoordinates: [77.4926, 23.3299],
        vehicleType,
        paymentMethod,
      };
      const res = await journeyAPI.create(data);
      if (!res.success) throw new Error(res.message || "Booking failed");
      setSuccess(res.data);
      setStep("success");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPickup("");
    setDropoff("");
    setVehicleType("CAR");
    setPaymentMethod("CASH");
    setStep("form");
    setSuccess(null);
    setError("");
  }

  // ── Success State ────────────────────────────────────────────────────────
  if (step === "success" && success) {
    return (
      <div className="flex flex-col gap-5 animate-[fadeIn_0.4s_ease]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</div>
          <div>
            <p className="font-bold text-zinc-900">Ride Requested!</p>
            <p className="text-sm text-zinc-500">Looking for nearby drivers…</p>
          </div>
        </div>
        <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 text-sm">
          <Row label="Status" value={<StatusBadge status={success.status} />} />
          <Row label="Vehicle" value={success.vehicleType} />
          <Row label="From" value={success.pickup?.address} />
          <Row label="To" value={success.dropoff?.address} />
          <Row label="Est. Fare" value={`₹${success.estimatedFare}`} bold />
          <Row label="Payment" value={success.paymentMethod} />
        </div>
        <button onClick={reset} className="w-full py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
          Book another ride
        </button>
      </div>
    );
  }

  // ── Confirm State ────────────────────────────────────────────────────────
  if (step === "confirm") {
    const fare = estimateFare();
    const v = VEHICLE_TYPES.find((v) => v.value === vehicleType);
    return (
      <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease]">
        <button onClick={() => setStep("form")} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black transition-colors w-fit">
          ← Back
        </button>
        <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Confirm your ride</h3>

        <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 text-sm">
          <Row label="From" value={pickup} />
          <Row label="To" value={dropoff} />
          <Row label="Vehicle" value={`${v?.icon} ${v?.label}`} />
          <Row label="Est. Fare" value={`₹${fare}`} bold />
        </div>

        {/* Vehicle selector */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Vehicle type</p>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLE_TYPES.map((v) => (
              <button
                key={v.value}
                onClick={() => setVehicleType(v.value)}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-150
                  ${vehicleType === v.value ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}
              >
                <span className="text-lg">{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Payment</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all
                  ${paymentMethod === m ? "bg-black text-white border-black" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          onClick={handleBookRide}
          disabled={loading}
          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : "Book ride"}
        </button>
      </div>
    );
  }

  // ── Form State ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
        <span>📍</span>
        <span>{city}</span>
        <button className="underline underline-offset-2 text-zinc-700 font-medium hover:text-black transition-colors ml-0.5">
          Change city
        </button>
      </div>

      <h2
        className="text-5xl font-black tracking-tight text-zinc-900 leading-none"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Request<br />a ride
      </h2>

      {/* Pickup now pill */}
      <div>
        <button className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors">
          <span>🕐</span>
          Pickup now
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Input group */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
        {/* Pickup */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200">
          <div className="w-3 h-3 rounded-full bg-black flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
          />
          <button className="text-zinc-400 hover:text-black transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        {/* Dropoff */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-3 h-3 rounded-sm bg-black flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter destination"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>}

      <button
        onClick={handleSeePrices}
        className="w-full py-4 bg-black text-white rounded-xl font-bold text-[15px] hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/10"
      >
        See prices
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-zinc-900 ${bold ? "font-bold text-base" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    REQUESTED: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-amber-100 text-amber-700",
    ARRIVED: "bg-purple-100 text-purple-700",
    STARTED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || "bg-zinc-100 text-zinc-600"}`}>
      {status}
    </span>
  );
}