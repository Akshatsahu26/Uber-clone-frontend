import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../services/driverApi";

// Fields that contribute to profile completion (from model):
// languagePrefrence +10, city +10, aadharNumber +15
// licenseNumber +15, rcNumber +10, vehicleType +10  → total 70% (required)
// vehicleModel +5, vehicleColor +5 → optional bonus

const LANGUAGES = ["HINDI", "ENGLISH", "MARATHI", "TAMIL", "TELUGU", "KANNADA", "BENGALI", "GUJARATI"];
const CITIES    = ["MUMBAI", "DELHI", "BANGALORE", "HYDERABAD", "CHENNAI", "KOLKATA", "PUNE", "AHMEDABAD"];
const VEHICLE_TYPES = [
  { value: "CAR",              label: "Car",         icon: "🚗" },
  { value: "BIKE",             label: "Bike",        icon: "🏍️" },
  { value: "AUTO",             label: "Auto",        icon: "🛺" },
  { value: "E_RICKSHAW",       label: "E-Rickshaw",  icon: "⚡" },
  { value: "ELECTRIC_SCOOTER", label: "E-Scooter",   icon: "🛵" },
];

const STEPS = [
  { id: "personal",  title: "Personal Info",  icon: "👤", points: 35 },
  { id: "documents", title: "Documents",      icon: "📄", points: 25 },
  { id: "vehicle",   title: "Vehicle Info",   icon: "🚗", points: 10 },
];

// ── Reusable field components ─────────────────────────────────────────────────
function Label({ children }) {
  return <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">{children}</p>;
}

function TextInput({ placeholder, value, onChange, error, type = "text", maxLength }) {
  return (
    <div>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange} maxLength={maxLength}
        className={`w-full px-4 py-3 border rounded-xl text-sm text-zinc-900 bg-white outline-none transition-all
          placeholder:text-zinc-300 focus:border-black focus:ring-2 focus:ring-black/5
          ${error ? "border-red-400 bg-red-50/30" : "border-zinc-200"}`}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

function SelectGrid({ options, value, onChange, columns = 4 }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const val   = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const icon  = typeof opt === "object" ? opt.icon : null;
        return (
          <button key={val} type="button" onClick={() => onChange(val)}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-semibold transition-all duration-150
              ${value === val ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}>
            {icon && <span className="text-base">{icon}</span>}
            <span className="leading-tight text-center">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function CompletionBar({ form }) {
  let pct = 0;
  if (form.personalInfo.languagePrefrence) pct += 10;
  if (form.city)                            pct += 10;
  if (form.personalInfo.aadharNumber?.length === 12) pct += 15;
  if (form.documents.licenseNumber?.length >= 8)     pct += 15;
  if (form.documents.rcNumber?.length >= 8)          pct += 10;
  if (form.vehicleInfo.vehicleType)                   pct += 10;
  if (form.vehicleInfo.vehicleModel)                  pct += 5;
  if (form.vehicleInfo.vehicleColor)                  pct += 5;

  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-zinc-500">Profile completion</span>
        <span className={`text-xs font-black ${pct >= 70 ? "text-emerald-600" : "text-zinc-700"}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {pct < 70 && (
        <p className="text-[11px] text-zinc-400 mt-1">{70 - pct}% more needed to go online</p>
      )}
      {pct >= 70 && (
        <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ 70% reached — you can go online after registration</p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DriverSetupPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0); // 0=personal, 1=docs, 2=vehicle
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    city: "",
    personalInfo: {
      languagePrefrence: "",
      aadharNumber: "",
    },
    documents: {
      licenseNumber: "",
      licenseExpiry: "",
      rcNumber: "",
      rcExpiry: "",
    },
    vehicleInfo: {
      vehicleType: "",
      vehicleNumber: "",
      vehicleModel: "",
      vehicleColor: "",
    },
  });

  function setPersonal(key, val) {
    setForm((p) => ({ ...p, personalInfo: { ...p.personalInfo, [key]: val } }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  function setDoc(key, val) {
    setForm((p) => ({ ...p, documents: { ...p.documents, [key]: val } }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  function setVehicle(key, val) {
    setForm((p) => ({ ...p, vehicleInfo: { ...p.vehicleInfo, [key]: val } }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  // ── Validation per step ───────────────────────────────────────────────────
  function validateStep() {
    const errs = {};
    if (step === 0) {
      if (!form.personalInfo.languagePrefrence) errs.languagePrefrence = "Please select a language";
      if (!form.city)                            errs.city = "Please select your city";
      if (!form.personalInfo.aadharNumber || !/^[0-9]{12}$/.test(form.personalInfo.aadharNumber))
        errs.aadharNumber = "Aadhar must be exactly 12 digits";
    }
    if (step === 1) {
      if (!form.documents.licenseNumber || form.documents.licenseNumber.length < 8)
        errs.licenseNumber = "License number must be at least 8 characters";
      if (!form.documents.rcNumber || form.documents.rcNumber.length < 8)
        errs.rcNumber = "RC number must be at least 8 characters";
      if (form.documents.licenseExpiry && new Date(form.documents.licenseExpiry) <= new Date())
        errs.licenseExpiry = "License expiry must be in the future";
      if (form.documents.rcExpiry && new Date(form.documents.rcExpiry) <= new Date())
        errs.rcExpiry = "RC expiry must be in the future";
    }
    if (step === 2) {
      if (!form.vehicleInfo.vehicleType) errs.vehicleType = "Please select a vehicle type";
      if (form.vehicleInfo.vehicleNumber &&
          !/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(form.vehicleInfo.vehicleNumber.toUpperCase()))
        errs.vehicleNumber = "Format: MH12AB1234";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    setApiError("");

    // Build payload matching backend service normalisation
    const payload = {
      city: form.city,
      personalInfo: {
        languagePrefrence: form.personalInfo.languagePrefrence,
        aadharNumber:      form.personalInfo.aadharNumber,
      },
      documents: {
        licenseNumber: form.documents.licenseNumber.toUpperCase(),
        licenseExpiry: form.documents.licenseExpiry || undefined,
        rcNumber:      form.documents.rcNumber.toUpperCase(),
        rcExpiry:      form.documents.rcExpiry      || undefined,
      },
      vehicleInfo: {
        vehicleType:   form.vehicleInfo.vehicleType   || undefined,
        vehicleNumber: form.vehicleInfo.vehicleNumber?.toUpperCase() || undefined,
        vehicleModel:  form.vehicleInfo.vehicleModel?.toUpperCase() || undefined,
        vehicleColor:  form.vehicleInfo.vehicleColor?.toUpperCase() || undefined,
      },
    };

    try {
      const res = await axiosInstance.post("driver/register", payload);
      if (!res.data.success) throw new Error(res.data.message || "Registration failed");
      // Profile created — go to dashboard
      navigate("/driver/dashboard", { replace: true });
    } catch (e) {
      setApiError(e.response?.data?.message || e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center py-10 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Uber</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 px-2 py-0.5 rounded-full">Driver Setup</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            Complete your profile
          </h1>
          <p className="text-zinc-400 text-sm">Fill in the required fields to reach 70% and start driving.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${i < step ? "bg-black text-white" : i === step ? "bg-black text-white ring-4 ring-black/10" : "bg-zinc-200 text-zinc-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0 hidden sm:block">
                <p className={`text-xs font-semibold truncate ${i === step ? "text-zinc-900" : "text-zinc-400"}`}>{s.title}</p>
                <p className="text-[10px] text-zinc-300">+{s.points}%</p>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${i < step ? "bg-black" : "bg-zinc-200"}`} />}
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <CompletionBar form={form} />

        {/* Card */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">

          {/* ── Step 0: Personal Info ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <SectionTitle icon="👤" title="Personal Information" sub="Language, city and Aadhar — together worth 35%" />

              <div>
                <Label>Language Preference <Required /></Label>
                <SelectGrid
                  options={LANGUAGES}
                  value={form.personalInfo.languagePrefrence}
                  onChange={(v) => setPersonal("languagePrefrence", v)}
                  columns={4}
                />
                {errors.languagePrefrence && <p className="text-xs text-red-500 font-medium mt-1">{errors.languagePrefrence}</p>}
              </div>

              <div>
                <Label>City <Required /></Label>
                <SelectGrid
                  options={CITIES}
                  value={form.city}
                  onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                  columns={4}
                />
                {errors.city && <p className="text-xs text-red-500 font-medium mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label>Aadhar Number <Required /> <span className="text-zinc-300 normal-case text-[10px]">(12 digits, encrypted & stored securely)</span></Label>
                <TextInput
                  placeholder="Enter 12-digit Aadhar number"
                  value={form.personalInfo.aadharNumber}
                  onChange={(e) => setPersonal("aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  error={errors.aadharNumber}
                  maxLength={12}
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Documents ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <SectionTitle icon="📄" title="Documents" sub="License and RC number are worth 25% together" />

              <div>
                <Label>Driving License Number <Required /></Label>
                <TextInput
                  placeholder="e.g. MH1220240012345"
                  value={form.documents.licenseNumber}
                  onChange={(e) => setDoc("licenseNumber", e.target.value.toUpperCase())}
                  error={errors.licenseNumber}
                />
              </div>

              <div>
                <Label>License Expiry Date <span className="text-zinc-300 normal-case text-[10px]">(optional, +5%)</span></Label>
                <TextInput
                  type="date"
                  value={form.documents.licenseExpiry}
                  onChange={(e) => setDoc("licenseExpiry", e.target.value)}
                  error={errors.licenseExpiry}
                />
              </div>

              <div>
                <Label>RC Number <Required /></Label>
                <TextInput
                  placeholder="e.g. MH12AB1234"
                  value={form.documents.rcNumber}
                  onChange={(e) => setDoc("rcNumber", e.target.value.toUpperCase())}
                  error={errors.rcNumber}
                />
              </div>

              <div>
                <Label>RC Expiry Date <span className="text-zinc-300 normal-case text-[10px]">(optional, +5%)</span></Label>
                <TextInput
                  type="date"
                  value={form.documents.rcExpiry}
                  onChange={(e) => setDoc("rcExpiry", e.target.value)}
                  error={errors.rcExpiry}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Vehicle Info ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <SectionTitle icon="🚗" title="Vehicle Information" sub="Vehicle type is required (+10%). Model & color add 5% each." />

              <div>
                <Label>Vehicle Type <Required /></Label>
                <SelectGrid
                  options={VEHICLE_TYPES}
                  value={form.vehicleInfo.vehicleType}
                  onChange={(v) => setVehicle("vehicleType", v)}
                  columns={3}
                />
                {errors.vehicleType && <p className="text-xs text-red-500 font-medium mt-1">{errors.vehicleType}</p>}
              </div>

              <div>
                <Label>Vehicle Number <span className="text-zinc-300 normal-case text-[10px]">(optional) format: MH12AB1234</span></Label>
                <TextInput
                  placeholder="MH12AB1234"
                  value={form.vehicleInfo.vehicleNumber}
                  onChange={(e) => setVehicle("vehicleNumber", e.target.value.toUpperCase())}
                  error={errors.vehicleNumber}
                  maxLength={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vehicle Model <span className="text-zinc-300 normal-case text-[10px]">(+5%)</span></Label>
                  <TextInput
                    placeholder="Swift Dzire"
                    value={form.vehicleInfo.vehicleModel}
                    onChange={(e) => setVehicle("vehicleModel", e.target.value)}
                    error={errors.vehicleModel}
                  />
                </div>
                <div>
                  <Label>Vehicle Color <span className="text-zinc-300 normal-case text-[10px]">(+5%)</span></Label>
                  <TextInput
                    placeholder="White"
                    value={form.vehicleInfo.vehicleColor}
                    onChange={(e) => setVehicle("vehicleColor", e.target.value)}
                    error={errors.vehicleColor}
                  />
                </div>
              </div>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">{apiError}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                ← Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" /></svg> Creating profile…</>
                  : "Create Driver Profile ✓"
                }
              </button>
            )}
          </div>
        </div>

        {/* Logout link */}
        <p className="text-center mt-4 text-xs text-zinc-400">
          Wrong account?{" "}
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="text-zinc-600 font-semibold hover:text-black transition-colors underline underline-offset-2"
          >
            Log out
          </button>
        </p>
      </div>
    </div>
  );
}

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>;
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div className="flex items-start gap-3 pb-2 border-b border-zinc-50">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-bold text-zinc-900 text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}