import { Phone, Star, Car } from "lucide-react";

export default function DriverInfoCard({ driver }) {
  if (!driver) return null;

  const ratingVal = Number(driver.rating);
  const ratingLabel = Number.isFinite(ratingVal) ? ratingVal.toFixed(1) : "New";

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Your Driver
      </p>
      <div className="flex items-center gap-3 mb-4">
  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
          {(driver.name || "D")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 text-sm truncate">{driver.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-zinc-500">{ratingLabel}</span>
          </div>
        </div>
        <a
          href={`tel:${driver.phone}`}
          className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0"
        >
          <Phone className="w-4 h-4 text-zinc-700" />
        </a>
      </div>

      <div className="bg-zinc-50 rounded-xl p-3 flex items-center gap-3">
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
          <Car className="w-4 h-4 text-zinc-700" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-800">
            {driver.vehicleModel || "Vehicle"}
            {driver.vehicleColor ? ` · ${driver.vehicleColor}` : ""}
          </p>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {driver.vehicleNumber || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}