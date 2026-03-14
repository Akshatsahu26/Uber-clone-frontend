import { useState } from "react";
import { journeyApi } from "../../services/journeyApi";

const VEHICLES = [
  { value: "CAR",              label: "Car",        icon: "🚗", base: 50, perKm: 12 },
  { value: "BIKE",             label: "Bike",       icon: "🏍️", base: 20, perKm: 6  },
  { value: "AUTO",             label: "Auto",       icon: "🛺", base: 30, perKm: 8  },
  { value: "E_RICKSHAW",       label: "E-Rickshaw", icon: "⚡", base: 25, perKm: 7  },
  { value: "ELECTRIC_SCOOTER", label: "E-Scooter",  icon: "🛵", base: 15, perKm: 5  },
];

const PAYMENTS = ["CASH", "UPI", "CARD", "WALLET"];

// Haversine for client-side fare preview
function calcDistance([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Demo coordinates for Bhopal (used when browser geolocation is unavailable)
const DEMO_PICKUP_COORDS  = [77.4126, 23.2599];
const DEMO_DROPOFF_COORDS = [77.4352, 23.2333];

export default function RideRequestForm({ onJourneyCreated, city = "Bhopal, IN" }) {
  const [step, setStep]               = useState("form");   // "form" | "price" | "loading"
  const [pickupAddress, setPickup]    = useState("");
  const [dropoffAddress, setDropoff]  = useState("");
  const [vehicleType, setVehicle]     = useState("CAR");
  const [paymentMethod, setPayment]   = useState("CASH");
  const [errors, setErrors]           = useState({});
  const [apiError, setApiError]       = useState("");

  const vehicle = VEHICLES.find((v) => v.value === vehicleType);
  const dist    = calcDistance(DEMO_PICKUP_COORDS, DEMO_DROPOFF_COORDS);
  const fare    = Math.round(vehicle.base + dist * vehicle.perKm);

  function validate() {
    const e = {};
    if (!pickupAddress.trim())  e.pickup  = "Pickup location is required.";
    if (!dropoffAddress.trim()) e.dropoff = "Destination is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSeePrices() {
    if (!validate()) return;
    setStep("price");
  }

  async function handleBook() {
    setApiError("");
    setStep("loading");
    try {
      const res = await journeyApi.create({
        pickupAddress,
        pickupCoordinates:  DEMO_PICKUP_COORDS,   // replace with real geocoding
        dropoffAddress,
        dropoffCoordinates: DEMO_DROPOFF_COORDS,  // replace with real geocoding
        vehicleType,
        paymentMethod,
      });
      if (!res.success) throw new Error(res.message || "Booking failed.");
      onJourneyCreated && onJourneyCreated(res.data);
    } catch (e) {
      setApiError(e.response?.data?.message || e.message || "Something went wrong.");
      setStep("price");
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Booking your ride…</p>
      </div>
    );
  }

  // ── Price Confirm ──────────────────────────────────────────────────────────
  if (step === "price") {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => setStep("form")}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-black transition-colors w-fit"
        >
          ← Edit details
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 mb-3">
            <span>📍</span>
            <span>{city}</span>
          </div>
          <h2
            className="text-4xl font-black tracking-tight text-zinc-900 leading-none mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Choose vehicle
          </h2>
          <p className="text-zinc-400 text-sm">Select the ride type that suits you</p>
        </div>

        {/* Route summary */}
        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
            <div className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0" />
            <p className="text-sm text-zinc-700 font-medium truncate">{pickupAddress}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-2.5 h-2.5 rounded-sm bg-black flex-shrink-0" />
            <p className="text-sm text-zinc-700 font-medium truncate">{dropoffAddress}</p>
          </div>
        </div>

        {/* Vehicle options */}
        <div className="flex flex-col gap-2">
          {VEHICLES.map((v) => {
            const f = Math.round(v.base + dist * v.perKm);
            const selected = vehicleType === v.value;
            return (
              <button
                key={v.value}
                onClick={() => setVehicle(v.value)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150
                  ${selected
                    ? "bg-black text-white border-black"
                    : "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-800"
                  }`}
              >
                <span className="text-xl flex-shrink-0">{v.icon}</span>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${selected ? "text-white" : "text-zinc-900"}`}>
                    {v.label}
                  </p>
                  <p className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                    ~{Math.round(dist)} km · {Math.round(dist * 3)} min
                  </p>
                </div>
                <p className={`font-black text-base ${selected ? "text-white" : "text-zinc-900"}`}
                   style={{ fontFamily: "'Syne', sans-serif" }}>
                  ₹{f}
                </p>
              </button>
            );
          })}
        </div>

        {/* Payment */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Payment method
          </p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENTS.map((m) => (
              <button
                key={m}
                onClick={() => setPayment(m)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all
                  ${paymentMethod === m
                    ? "bg-black text-white border-black"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {apiError && <p className="text-xs text-red-500 font-medium">{apiError}</p>}

        <button
          onClick={handleBook}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-[15px] hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
        >
          Request {vehicle.label} · ₹{fare}
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500 mb-4">
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
      </div>

      {/* Pickup now pill */}
      <button className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors w-fit">
        <span>🕐</span>
        Pickup now
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Input group */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${errors.pickup ? "border-red-200 bg-red-50/30" : "border-zinc-200"}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter pickup location"
            value={pickupAddress}
            onChange={(e) => { setPickup(e.target.value); setErrors((p) => ({ ...p, pickup: "" })); }}
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
          />
          <button className="text-zinc-400 hover:text-black transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </button>
        </div>
        <div className={`flex items-center gap-3 px-4 py-3.5 ${errors.dropoff ? "bg-red-50/30" : ""}`}>
          <div className="w-2.5 h-2.5 rounded-sm bg-black flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter destination"
            value={dropoffAddress}
            onChange={(e) => { setDropoff(e.target.value); setErrors((p) => ({ ...p, dropoff: "" })); }}
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none font-medium"
          />
        </div>
      </div>

      {(errors.pickup || errors.dropoff) && (
        <p className="text-xs text-red-500 font-medium -mt-3">
          {errors.pickup || errors.dropoff}
        </p>
      )}

      <button
        onClick={handleSeePrices}
        className="w-full py-4 bg-black text-white rounded-xl font-bold text-[15px] hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
      >
        See prices
      </button>
    </div>
  );
}