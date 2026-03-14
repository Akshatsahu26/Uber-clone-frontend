import { useState } from "react";
import { CheckCircle, Clock, XCircle, MapPin, Navigation } from "lucide-react";
import DriverInfoCard from "../ride/DriverInfoCrad";
import { journeyApi } from "../../services/journeyApi";

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Searching for drivers…",
    sub: "Hang tight! We're finding the best driver for you.",
    color: "bg-blue-50 border-blue-100",
    dot: "bg-blue-500",
    icon: Clock,
    iconColor: "text-blue-500",
  },
  ACCEPTED: {
    label: "Driver is on the way",
    sub: "Your driver has accepted the ride and is heading to you.",
    color: "bg-amber-50 border-amber-100",
    dot: "bg-amber-500",
    icon: Navigation,
    iconColor: "text-amber-500",
  },
  ARRIVED: {
    label: "Driver has arrived",
    sub: "Your driver is at the pickup location. Please head out!",
    color: "bg-purple-50 border-purple-100",
    dot: "bg-purple-500",
    icon: MapPin,
    iconColor: "text-purple-500",
  },
  STARTED: {
    label: "Your trip has started",
    sub: "Sit back and enjoy the ride!",
    color: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-500",
    icon: Navigation,
    iconColor: "text-emerald-500",
  },
  COMPLETED: {
    label: "Trip completed",
    sub: "Hope you had a great ride! Please rate your experience.",
    color: "bg-green-50 border-green-100",
    dot: "bg-green-600",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  CANCELLED: {
    label: "Trip cancelled",
    sub: "This journey was cancelled.",
    color: "bg-red-50 border-red-100",
    dot: "bg-red-500",
    icon: XCircle,
    iconColor: "text-red-500",
  },
};

const STEPS = ["REQUESTED", "ACCEPTED", "ARRIVED", "STARTED", "COMPLETED"];

export default function RideStatusCard({ journey, onCancel, onPaymentDone, onNewRide }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [qr, setQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [error, setError] = useState("");

  if (!journey) return null;

  const config = STATUS_CONFIG[journey.status] || STATUS_CONFIG.REQUESTED;
  const StatusIcon = config.icon;
  const currentStep = STEPS.indexOf(journey.status);
  const canCancel = ["REQUESTED", "ACCEPTED", "ARRIVED"].includes(journey.status);

  async function handleCancel() {
    if (!cancelReason.trim()) return setError("Please enter a cancellation reason.");
    setCancelLoading(true);
    setError("");
    try {
      await journeyApi.cancel(journey._id, cancelReason, "RIDER");
      onCancel && onCancel();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to cancel ride.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleGetQR() {
    setQrLoading(true);
    setError("");
    try {
      const res = await journeyApi.getPaymentQR(journey._id);
      setQr(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to get payment QR.");
    } finally {
      setQrLoading(false);
    }
  }

  async function handleConfirmPayment() {
    setPayLoading(true);
    setError("");
    try {
      await journeyApi.confirmPayment(journey._id);
      setPayDone(true);
      onPaymentDone && onPaymentDone();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status Banner */}
      <div className={`rounded-2xl border p-4 ${config.color}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-zinc-900 text-sm">{config.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{config.sub}</p>
          </div>
          <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1 ${config.dot} ${
            ["REQUESTED", "ACCEPTED", "ARRIVED", "STARTED"].includes(journey.status) ? "animate-pulse" : ""
          }`} />
        </div>
      </div>

      {/* Progress Steps */}
      {journey.status !== "CANCELLED" && (
        <div className="flex items-center gap-1 px-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                i <= currentStep ? "bg-black scale-110" : "bg-zinc-200"
              }`} />
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                  i < currentStep ? "bg-black" : "bg-zinc-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Route */}
      <div className="bg-zinc-50 rounded-2xl p-4 space-y-3 text-sm">
        <div className="flex gap-3 items-start">
          <div className="w-2.5 h-2.5 rounded-full bg-black mt-1 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Pickup</p>
            <p className="text-zinc-800 font-medium text-xs">{journey.pickup?.address}</p>
          </div>
        </div>
        <div className="ml-1.5 w-px h-4 bg-zinc-300" />
        <div className="flex gap-3 items-start">
          <div className="w-2.5 h-2.5 rounded-sm bg-black mt-1 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Dropoff</p>
            <p className="text-zinc-800 font-medium text-xs">{journey.dropoff?.address}</p>
          </div>
        </div>
      </div>

      {/* Fare + Payment */}
      <div className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Est. Fare</p>
          <p className="text-zinc-900 font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            ₹{journey.actualFare ?? journey.estimatedFare}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Payment</p>
          <p className="text-zinc-700 font-semibold text-sm">{journey.paymentMethod}</p>
        </div>
      </div>

      {/* Driver Info */}
      {journey.driver && <DriverInfoCard driver={journey.driver} />}

      {/* Error */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* Payment section — completed */}
      {journey.status === "COMPLETED" && !payDone && (
        <div className="flex flex-col gap-2">
          {qr ? (
            <div className="flex flex-col items-center gap-3 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
              <p className="text-xs font-semibold text-zinc-700">Scan to pay ₹{qr.amount}</p>
              <img src={qr.qrCode} alt="Payment QR" className="w-40 h-40 rounded-xl" />
              <button
                onClick={handleConfirmPayment}
                disabled={payLoading}
                className="w-full py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-60"
              >
                {payLoading ? "Confirming…" : "Confirm payment"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGetQR}
              disabled={qrLoading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {qrLoading ? "Generating QR…" : "Pay now"}
            </button>
          )}
        </div>
      )}

      {payDone && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold text-green-700">✓ Payment confirmed!</p>
        </div>
      )}

      {/* New ride — after complete/cancel */}
      {(journey.status === "COMPLETED" || journey.status === "CANCELLED") && (
        <button
          onClick={onNewRide}
          className="w-full py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Book another ride
        </button>
      )}

      {/* Cancel */}
      {canCancel && !showCancel && (
        <button
          onClick={() => setShowCancel(true)}
          className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Cancel ride
        </button>
      )}

      {showCancel && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Reason for cancellation…"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowCancel(false); setError(""); }}
              className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {cancelLoading ? "Cancelling…" : "Confirm cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}