const SUGGESTIONS = [
  {
    id: "ride",
    label: "Ride",
    icon: "🚗",
    desc: "Go anywhere with Uber",
  },
  {
    id: "reserve",
    label: "Reserve",
    icon: "⏰",
    desc: "Reserve your ride in advance",
  },
  {
    id: "intercity",
    label: "Intercity",
    icon: "🛣️",
    desc: "Travel between cities",
  },
  {
    id: "courier",
    label: "Courier",
    icon: "📦",
    desc: "Send a package",
  },
  {
    id: "rentals",
    label: "Rentals",
    icon: "🔑",
    desc: "Rent a car by the hour",
  },
  {
    id: "bike",
    label: "Bike",
    icon: "🏍️",
    desc: "Quick two-wheel rides",
  },
];

export default function SuggestionCards({ onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-zinc-800 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
        Suggestions
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item)}
            className="group flex flex-col items-center gap-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 hover:border-zinc-200 rounded-2xl p-4 transition-all duration-200 hover:shadow-sm active:scale-[0.97] text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-zinc-800">{item.label}</span>
            <span className="text-[11px] text-zinc-400 leading-tight hidden sm:block">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}