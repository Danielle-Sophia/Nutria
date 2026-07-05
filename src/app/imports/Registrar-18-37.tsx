import imgRegistrar from "figma:asset/014a7d00a40d56526e789e2e4f9dde6b606274b4.png";

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#193073] h-[80px] left-0 top-0 w-[1440px]" />
      <p className="absolute font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] font-normal leading-[0] left-[60px] not-italic text-[0px] text-[40px] text-white top-[11px]">
        <span className="leading-[normal]">Nutr</span>
        <span className="leading-[normal] text-[#8db9f2]">IA</span>
      </p>
    </div>
  );
}

function Rectangle({ className }: { className?: string }) {
  return (
    <div className={className || "absolute h-[840px] left-[400px] top-[118px] w-[640px]"}>
      <div className="absolute bg-[rgba(255,255,255,0.85)] inset-0 rounded-[20px]" />
      <p className="absolute font-[Poppins] font-normal h-[28px] leading-[normal] left-[74px] not-italic text-[18px] text-black top-[193px] w-[355px] whitespace-pre-wrap">{`¿Ya tienes una cuenta? `}</p>
      <p className="absolute font-[Poppins] font-normal h-[54px] leading-[normal] left-[calc(50%-245px)] not-italic text-[18px] text-black top-[124px] w-[480px] whitespace-pre-wrap">Recuerda que debes ser un profesional de la salud para crear una cuenta</p>
      <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[493px] w-[375px] whitespace-pre-wrap">Correo electrónico</p>
      <p className="absolute font-[Poppins] font-normal h-[23px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[577px] w-[319px] whitespace-pre-wrap">Contraseña</p>
      <p className="absolute decoration-solid font-[Poppins] font-bold h-[28px] leading-[normal] left-[294px] not-italic text-[#458dff] text-[18px] top-[193px] underline w-[150px] whitespace-pre-wrap">Inicia sesión</p>
      <p className="absolute font-[Poppins] font-bold leading-[normal] left-[calc(50%-248px)] not-italic text-[48px] text-black top-[37px]">Crea tu cuenta</p>
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[40px] left-[calc(50%+1px)] rounded-[10px] top-[529px] w-[492px]" />
      <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[325px] w-[492px] whitespace-pre-wrap">Cédula profesional (CP)</p>
      <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[74px] not-italic text-[18px] text-black top-[240px] w-[109px] whitespace-pre-wrap">Nombre (s)</p>
      <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[339px] not-italic text-[18px] text-black top-[240px] w-[88px] whitespace-pre-wrap">Apellidos</p>
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[40px] left-1/2 rounded-[10px] top-[361px] w-[492px]" />
      <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[409px] w-[492px] whitespace-pre-wrap">Especialidad</p>
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[40px] left-1/2 rounded-[10px] top-[445px] w-[492px]" />
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[40px] left-[calc(50%-127px)] rounded-[10px] top-[277px] w-[242px]" />
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[40px] left-[calc(50%+132.5px)] rounded-[10px] top-[277px] w-[227px]" />
      <div className="-translate-x-1/2 absolute bg-[#e1e9f2] h-[41px] left-[calc(50%+1px)] rounded-[10px] top-[609px] w-[492px]" />
      <div className="absolute bg-[#39588a] h-[60px] left-[174px] rounded-[15px] top-[694px] w-[292px]" />
      <p className="-translate-x-1/2 absolute font-[Poppins] font-bold h-[36px] leading-[normal] left-[319.5px] not-italic text-[24px] text-center text-white top-[706px] w-[239px] whitespace-pre-wrap">Crear cuenta</p>
    </div>
  );
}

export default function Registrar() {
  return (
    <div className="relative size-full" data-name="Registrar">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRegistrar} />
      <Group />
      <Rectangle />
    </div>
  );
}