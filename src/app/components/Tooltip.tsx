import { Info } from "lucide-react";

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  return (
    <div className="relative inline-block group ml-2">
      <button
        type="button"
        className="cursor-help text-[#458dff] hover:text-[#3a7ae0] transition-colors"
      >
        <Info size={18} />
      </button>
      <div 
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white border-2 border-[#458dff] p-3 rounded-lg shadow-lg z-50 w-[280px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
      >
        <p className="font-[Poppins] font-normal text-[14px] text-gray-700 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}