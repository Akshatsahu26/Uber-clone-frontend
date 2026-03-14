import { useState } from "react";
import { Star, Car, Shield, CheckCircle, AlertCircle, Edit3, Save, X } from "lucide-react";
import { driverApi } from "../../services/driverApi";
import { useDriver } from "../../context/DriverContext";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-zinc-50 last:border-0">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-zinc-800">{value || "—"}</span>
    </div>
  );
}

export default function DriverProfile() {
  const { driver, setDriver } = useDriver();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    vehicleNumber: driver?.vehicleInfo?.vehicleNumber || "",
    vehicleModel:  driver?.vehicleInfo?.vehicleModel  || "",
    vehicleColor:  driver?.vehicleInfo?.vehicleColor  || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [saved, setSaved]     = useState(false);

  if (!driver) return (
    <div className="flex flex-col items-center py-16 gap-3">
      <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-zinc-400">Loading profile…</p>
    </div>
  );

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await driverApi.updateProfile({ vehicalInfo: form });
      if (!res.success) throw new Error(res.message);
      setDriver(res.data);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  const completion = driver.status?.profileCompletionPercentage ?? 0;
  const ratingValue = Number(driver.stats?.rating);
  const ratingLabel = Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : "5.0";

  return (
    <div className="flex flex-col gap-5">
      {/* Profile Header */}
      <div className="bg-black rounded-2xl p-5 text-white flex items-start gap-4">
  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black uppercase shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
          {(driver.user?.name || "D")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-lg truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{driver.user?.name}</p>
          <p className="text-zinc-400 text-xs truncate">{driver.user?.email}</p>
          <p className="text-zinc-400 text-xs">{driver.user?.phone}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold">{ratingLabel}</span>
            </div>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">{driver.stats?.totalRides || 0} rides</span>
          </div>
        </div>
  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${driver.status?.isVerified ? "bg-green-400/20 text-green-400" : "bg-zinc-600 text-zinc-300"}`}>
          {driver.status?.isVerified ? "Verified" : "Pending"}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-zinc-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-zinc-700">Profile Completion</p>
          <p className="text-sm font-black text-zinc-900" style={{ fontFamily: "'Syne', sans-serif" }}>{completion}%</p>
        </div>
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${completion >= 70 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${completion}%` }} />
        </div>
        {completion < 70 && (
          <div className="flex items-start gap-2 mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">Complete at least 70% to go online and receive rides.</p>
          </div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-zinc-500" />
            <p className="text-sm font-semibold text-zinc-700">Vehicle Information</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-black transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            {[
              { label: "Vehicle Number", key: "vehicleNumber", placeholder: "MH12AB1234" },
              { label: "Vehicle Model",  key: "vehicleModel",  placeholder: "Swift Dzire" },
              { label: "Vehicle Color",  key: "vehicleColor",  placeholder: "White" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                <input
                  type="text" placeholder={placeholder} value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            ))}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setError(""); }} className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 flex items-center justify-center gap-1">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-1">
                {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" /></svg> : <><Save className="w-3.5 h-3.5" /> Save</>}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <InfoRow label="Vehicle Number" value={driver.vehicleInfo?.vehicleNumber} />
            <InfoRow label="Vehicle Model"  value={driver.vehicleInfo?.vehicleModel}  />
            <InfoRow label="Vehicle Color"  value={driver.vehicleInfo?.vehicleColor}  />
            <InfoRow label="Vehicle Type"   value={driver.vehicleInfo?.vehicleType}   />
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 mt-3 bg-green-50 border border-green-100 rounded-xl p-2.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">Vehicle info updated!</p>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-700">Documents</p>
        </div>
        <InfoRow label="License Number" value={driver.documents?.licenseNumber} />
        <InfoRow label="License Expiry" value={driver.documents?.licenseExpiry ? new Date(driver.documents.licenseExpiry).toLocaleDateString("en-IN") : null} />
        <InfoRow label="RC Number"     value={driver.documents?.rcNumber}     />
        <InfoRow label="RC Expiry"     value={driver.documents?.rcExpiry ? new Date(driver.documents.rcExpiry).toLocaleDateString("en-IN") : null} />
        <InfoRow label="Aadhar"        value={driver.personalInfo?.aadharNumber} />
      </div>
    </div>
  );
}