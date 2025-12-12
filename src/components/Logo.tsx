export const Logo = () => (
  <div className="flex items-center gap-3 text-brand-text no-underline select-none group">
    <div className="grid grid-cols-2 gap-[3px] w-5 h-5">
      <div className="rounded-full bg-brand-text group-hover:bg-gray-700 transition-colors"></div>
      <div className="rounded-full bg-[#7a7a7a] group-hover:bg-gray-600 transition-colors"></div>
      <div className="rounded-full bg-[#7a7a7a] group-hover:bg-gray-600 transition-colors"></div>
      <div className="rounded-full bg-brand-text group-hover:bg-gray-700 transition-colors"></div>
    </div>
    <span className="font-bold text-xl tracking-tight text-brand-text group-hover:text-gray-700 transition-colors">
      NOVARA
    </span>
  </div>
);

