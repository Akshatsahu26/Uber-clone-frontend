import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Prefer Vite env override so frontend can point to a different backend port locally
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, type = "text", id, placeholder, maxLength, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        {label}
      </label>
      <input
        id={id} type={type} placeholder={placeholder} maxLength={maxLength}
        value={value} onChange={onChange}
        className={`w-full px-4 py-3.5 rounded-xl border text-[15px] text-black bg-white outline-none transition-all duration-150
          placeholder:text-zinc-300 focus:ring-2 focus:ring-black/10 focus:border-black
          ${error ? "border-red-400 bg-red-50/40" : "border-zinc-200"}`}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-2xl transition-all duration-300
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      ${type === "error" ? "bg-red-500" : "bg-emerald-700"}`}>
      {message}
    </div>
  );
}

// ── Hero Panel ────────────────────────────────────────────────────────────────
function HeroPanel({ role }) {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-black p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="relative z-10">
        <span className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Uber</span>
      </div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400 tracking-widest uppercase font-medium">
            {role === "DRIVER" ? "Driver Portal" : "Live in your city"}
          </span>
        </div>
        <h1 className="text-6xl font-black leading-[1.04] tracking-[-2px] text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
          {role === "DRIVER" ? (<>Drive &<br /><span className="text-zinc-600">earn more.</span></>) : (<>Go anywhere,<br /><span className="text-zinc-600">get anything.</span></>)}
        </h1>
        <p className="text-zinc-500 text-base leading-relaxed max-w-xs">
          {role === "DRIVER"
            ? "Accept rides, manage your schedule, and grow your income."
            : "Request a ride, get food delivered — all in one tap."}
        </p>
      </div>
      <div className="relative z-10 flex gap-10">
        {role === "DRIVER"
          ? [{ num: "5M+", label: "Drivers" }, { num: "₹800+", label: "Daily avg. earning" }, { num: "4.8★", label: "Avg rating" }].map(({ num, label }) => (
            <div key={label}><div className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{num}</div><div className="text-zinc-600 text-xs mt-1">{label}</div></div>
          ))
          : [{ num: "10B+", label: "Trips" }, { num: "70+", label: "Countries" }, { num: "5M+", label: "Drivers" }].map(({ num, label }) => (
            <div key={label}><div className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{num}</div><div className="text-zinc-600 text-xs mt-1">{label}</div></div>
          ))
        }
      </div>
    </div>
  );
}

// ── Main Auth Component ───────────────────────────────────────────────────────
export default function UberAuth() {
  const navigate = useNavigate();
  const [role, setRole]   = useState("RIDER"); // "RIDER" | "DRIVER"
  const [tab, setTab]     = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  // Signup state
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", password: "" });
  const [signupErrors, setSignupErrors] = useState({});

  // Login state
  const [loginMethod, setLoginMethod] = useState("email");
  const [login, setLogin] = useState({ email: "", phone: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  }

  // ── Signup ───────────────────────────────────────────────────────────────
  function validateSignup() {
    const errs = {};
    if (!signup.name || signup.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!signup.email || !/\S+@\S+\.\S+/.test(signup.email)) errs.email = "Enter a valid email address";
    if (!signup.phone || !/^[0-9]{10}$/.test(signup.phone)) errs.phone = "Phone must be exactly 10 digits";
    if (!signup.password || signup.password.length < 6) errs.password = "Password must be at least 6 characters";
    setSignupErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignup() {
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signup, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      localStorage.setItem("uber_token", data.data.token);
      localStorage.setItem("uber_user", JSON.stringify(data.data.user));
      localStorage.setItem("uber_role", role);
      // navigate(role === "DRIVER" ? "/driver/dashboard" : "/home");
      navigate(role === "DRIVER" ? "/driver/dashboard" : "/home", { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Login ────────────────────────────────────────────────────────────────
  function validateLogin() {
    const errs = {};
    if (loginMethod === "email") {
      if (!login.email || !/\S+@\S+\.\S+/.test(login.email)) errs.email = "Enter a valid email address";
    } else {
      if (!login.phone || !/^[0-9]{10}$/.test(login.phone)) errs.phone = "Phone must be exactly 10 digits";
    }
    if (!login.password) errs.password = "Password is required";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validateLogin()) return;
    setLoading(true);
    const body = { password: login.password };
    if (loginMethod === "email") body.email = login.email;
    else body.phone = login.phone;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("uber_token", data.data.token);
      localStorage.setItem("uber_user", JSON.stringify(data.data.user));
      localStorage.setItem("uber_role", role);
      navigate(role === "DRIVER" ? "/driver/dashboard" : "/home");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key !== "Enter" || loading) return;
    if (tab === "signup") handleSignup(); else handleLogin();
  }

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .auth-animate { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen grid lg:grid-cols-2 bg-black" onKeyDown={handleKeyDown}>
        <HeroPanel role={role} />

        <div className="bg-white flex items-center justify-center p-8 sm:p-12 min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-sm auth-animate">

            {/* ── Role Toggle ── */}
            <div className="flex bg-zinc-100 rounded-xl p-1 mb-6">
              {["RIDER", "DRIVER"].map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    ${role === r ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}>
                  <span>{r === "RIDER" ? "🚗" : "🏍️"}</span>
                  {r === "RIDER" ? "Rider" : "Driver"}
                </button>
              ))}
            </div>

            {/* ── Auth Tab ── */}
            <div className="flex bg-zinc-100 rounded-xl p-1 mb-9">
              {["login", "signup"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${tab === t ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}>
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {/* ── Signup ── */}
            {tab === "signup" && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {role === "DRIVER" ? "Become a driver" : "Create account"}
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    {role === "DRIVER" ? "Start earning on your schedule." : "Join millions of riders worldwide."}
                  </p>
                </div>
                <Field label="Full Name" id="s-name" placeholder="John Doe" value={signup.name} onChange={(e) => setSignup((p) => ({ ...p, name: e.target.value }))} error={signupErrors.name} />
                <Field label="Email Address" id="s-email" type="email" placeholder="john@example.com" value={signup.email} onChange={(e) => setSignup((p) => ({ ...p, email: e.target.value }))} error={signupErrors.email} />
                <Field label="Phone Number" id="s-phone" type="tel" placeholder="10-digit number" maxLength={10} value={signup.phone} onChange={(e) => setSignup((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} error={signupErrors.phone} />
                <Field label="Password" id="s-password" type="password" placeholder="Min. 6 characters" value={signup.password} onChange={(e) => setSignup((p) => ({ ...p, password: e.target.value }))} error={signupErrors.password} />
                <Btn loading={loading} onClick={handleSignup} label={role === "DRIVER" ? "Register as Driver" : "Create account"} />
              </div>
            )}

            {/* ── Login ── */}
            {tab === "login" && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    {role === "DRIVER" ? "Sign in to your driver account." : "Sign in to continue your journey."}
                  </p>
                </div>
                <div className="flex bg-zinc-100 rounded-lg p-1">
                  {["email", "phone"].map((m) => (
                    <button key={m} onClick={() => setLoginMethod(m)}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-150
                        ${loginMethod === m ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}>
                      {m === "email" ? "Email" : "Phone"}
                    </button>
                  ))}
                </div>
                {loginMethod === "email"
                  ? <Field label="Email Address" id="l-email" type="email" placeholder="john@example.com" value={login.email} onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))} error={loginErrors.email} />
                  : <Field label="Phone Number" id="l-phone" type="tel" placeholder="10-digit number" maxLength={10} value={login.phone} onChange={(e) => setLogin((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} error={loginErrors.phone} />
                }
                <Field label="Password" id="l-password" type="password" placeholder="Your password" value={login.password} onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))} error={loginErrors.password} />
                <Btn loading={loading} onClick={handleLogin} label="Sign in" />
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast {...toast} />
    </>
  );
}

function Btn({ loading, onClick, label }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full mt-2 py-4 bg-black text-white rounded-xl font-semibold text-[15px] hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
      {loading
        ? <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" /></svg>
        : label}
    </button>
  );
}