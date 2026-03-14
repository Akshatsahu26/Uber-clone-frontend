export default function HelpCard({ icon, label }) {
  const Icon = icon;
  return (
    <button className="flex flex-col items-center justify-center gap-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 rounded-2xl p-8 transition-all duration-200 hover:shadow-md active:scale-[0.97] group w-full text-center">
      <Icon
        className="w-8 h-8 text-zinc-800 group-hover:scale-110 transition-transform duration-200"
        strokeWidth={1.5}
      />
      <span className="text-sm font-semibold text-zinc-900 leading-tight">{label}</span>
    </button>
  );
}