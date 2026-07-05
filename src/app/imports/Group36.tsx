import imgHappyBunchChat from "figma:asset/3801a4dad9b0d3378d29571589ff08210e598380.png";

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute contents left-0 top-0">
        <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[363px]" />
        <p className="-translate-x-1/2 absolute font-[Poppins] font-normal leading-[normal] left-[181.5px] not-italic text-[20px] text-center text-white top-[5px] whitespace-nowrap">Calcular dosis de insulina con IA</p>
      </div>
      <div className="absolute bg-[#f2f2f2] h-[141px] left-0 rounded-[10px] top-[41px] w-[363px]" />
      <div className="absolute h-[127px] left-[99px] top-[48px] w-[165px]" data-name="Happy Bunch Chat">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgHappyBunchChat} />
      </div>
    </div>
  );
}