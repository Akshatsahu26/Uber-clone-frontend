import { useNavigate } from "react-router-dom";

const NAV_LINKS = ["Ride", "Drive", "Business", "About"];

export default function Navbar({ user }) {
  const navigate = useNavigate();
  // const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("uber_token");
    localStorage.removeItem("uber_user");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <span
            className="text-2xl font-black tracking-tight cursor-pointer select-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
            onClick={() => navigate("/home")}
          >
            Uber
          </span>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-full transition-all duration-150"
              >
                {link}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Help + User */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/help")} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-full transition-all duration-150">
            Help
          </button>
          {user && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                {(user.name || user.email || "U")[0]}
              </div>
              <span className="text-sm font-medium text-zinc-800 hidden sm:block">
                {user.name || user.email}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-zinc-800 active:scale-[0.97] transition-all duration-150"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Welcome bar */}
      {user && (
        <div className="bg-black text-white px-6 py-2.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Welcome back, {user.name || "Rider"}</span>
            <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <span>📅</span>
              You have no upcoming trips
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {[
              { icon: "🔖", label: "Activity" },
              { icon: "🏷️", label: "Promotions" },
              { icon: "👤", label: "Account" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-1 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}