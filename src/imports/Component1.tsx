import imgLifesaversNewPatient from "figma:asset/8d4c75af8bdd5521ebb3ccb7852724c6e92c2782.png";

export default function Component({ className }: { className?: string }) {
  return (
    <div className={className || "h-[262px] relative w-[266px]"} data-name="Component 1">
      <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px]" />
      <div className="absolute contents left-0 top-0">
        <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[266px]" />
        <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[132.5px] not-italic text-[20px] text-center text-white top-[6px]">Px registrados</p>
      </div>
      <div className="absolute h-[173px] left-[20px] top-[59px] w-[225px]" data-name="Lifesavers New Patient">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLifesaversNewPatient} />
      </div>
    </div>
  );
}