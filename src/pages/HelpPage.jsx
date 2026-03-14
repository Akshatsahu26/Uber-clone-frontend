import { useNavigate } from "react-router-dom";
import {
  Car,
  Truck,
  UtensilsCrossed,
  Store,
  Bike,
  Briefcase,
  Package,
  Globe,
  ChevronDown,
  Search,
} from "lucide-react";
import HelpCard from "../components/help/HelpCard";

const CATEGORIES = [
  { icon: Car,             label: "Riders" },
  { icon: Truck,           label: "Driving &\nDelivering" },
  { icon: UtensilsCrossed, label: "Uber Eats" },
  { icon: Store,           label: "Merchants &\nRestaurants" },
  { icon: Bike,            label: "Bikes &\nScooters" },
  { icon: Briefcase,       label: "Uber for\nBusiness" },
  { icon: Package,         label: "Freight" },
];

export default function HelpPage() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("uber_user") || "null"); }
    catch { return null; }
  })();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AS";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        <button
          onClick={() => navigate("/home")}
          className="text-2xl font-black tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Uber
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language */}
          <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-full px-3 py-1.5 transition-all">
            <Globe className="w-3.5 h-3.5" />
            EN-GB
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity select-none">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Sub-nav ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-100 px-8 py-3">
        <span className="text-sm font-semibold text-zinc-900">Help</span>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">

        {/* Hero text */}
        <div className="text-center mb-14">
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-5 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Welcome to Uber Support
          </h1>
          <p className="text-zinc-500 text-base leading-relaxed max-w-2xl mx-auto">
            We're here to help. Looking for customer service contact information? Explore
            support resources for the relevant products below to find the best way to reach
            out about your issue.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 mb-12 max-w-xl mx-auto hover:border-zinc-400 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-black/5">
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for help..."
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none"
          />
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {CATEGORIES.map(({ icon, label }) => (
            <HelpCard key={label} icon={icon} label={label} />
          ))}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-black text-zinc-500 px-8 py-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-white font-black text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Uber</span>
          <div className="flex flex-wrap gap-6 text-xs">
            {["Privacy", "Accessibility", "Terms"].map((t) => (
              <button key={t} className="hover:text-white transition-colors">{t}</button>
            ))}
          </div>
          <span className="text-xs">© {new Date().getFullYear()} Uber Technologies Inc.</span>
        </div>
      </footer>
    </div>
  );
}