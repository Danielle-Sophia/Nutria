import imgRegistrar from "figma:asset/014a7d00a40d56526e789e2e4f9dde6b606274b4.png";

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#193073] h-[80px] left-0 top-0 w-[1440px]" />
      <p className="absolute font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] font-normal leading-[normal] left-[60px] not-italic text-[0px] text-[40px] text-nowrap text-white top-[11px]">
        Nutr<span className="text-[#8db9f2]">IA</span>
      </p>
    </div>
  );
}

export default function Registrar() {
  return (
    <div className="relative size-full" data-name="Registrar">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgRegistrar} />
      <Group />
      <div className="absolute h-[840px] left-[400px] top-[118px] w-[640px]">
        <div className="absolute bg-[rgba(255,255,255,0.85)] inset-0 rounded-[20px]" />
        <p className="absolute font-[Poppins] font-normal h-[28px] leading-[normal] left-[74px] not-italic text-[18px] text-black top-[193px] w-[355px]">{`¿Ya tienes una cuenta? `}</p>
        <p className="absolute font-[Poppins] font-normal h-[54px] leading-[normal] left-[calc(50%-245px)] not-italic text-[18px] text-black top-[124px] w-[480px]">Recuerda que debes ser un profesional de la salud para crear una cuenta</p>
        <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[493px] w-[375px]">Correo electrónico</p>
        <p className="absolute font-[Poppins] font-normal h-[23px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[577px] w-[319px]">Contraseña</p>
        <p className="[text-underline-position:from-font] absolute decoration-solid font-[Poppins] font-bold h-[28px] leading-[normal] left-[294px] not-italic text-[#458dff] text-[18px] top-[193px] underline w-[150px]">Inicia sesión</p>
        <p className="absolute font-[Poppins] font-bold leading-[normal] left-[calc(50%-248px)] not-italic text-[48px] text-black text-nowrap top-[37px]">Crea tu cuenta</p>
        <div className="absolute bg-[#e1e9f2] h-[40px] left-[calc(50%+1px)] rounded-[10px] top-[529px] translate-x-[-50%] w-[492px]" />
        <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[325px] w-[492px]">Cédula profesional (CP)</p>
        <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[74px] not-italic text-[18px] text-black top-[240px] w-[109px]">Nombre (s)</p>
        <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[339px] not-italic text-[18px] text-black top-[240px] w-[88px]">Apellidos</p>
        <div className="absolute bg-[#e1e9f2] h-[40px] left-1/2 rounded-[10px] top-[361px] translate-x-[-50%] w-[492px]" />
        <p className="absolute font-[Poppins] font-normal h-[27px] leading-[normal] left-[75px] not-italic text-[18px] text-black top-[409px] w-[492px]">Especialidad</p>
        <div className="absolute bg-[#e1e9f2] h-[40px] left-1/2 rounded-[10px] top-[445px] translate-x-[-50%] w-[492px]" />
        <div className="absolute bg-[#e1e9f2] h-[40px] left-[calc(50%-127px)] rounded-[10px] top-[277px] translate-x-[-50%] w-[242px]" />
        <div className="absolute bg-[#e1e9f2] h-[40px] left-[calc(50%+132.5px)] rounded-[10px] top-[277px] translate-x-[-50%] w-[227px]" />
        <div className="absolute bg-[#e1e9f2] h-[41px] left-[calc(50%+1px)] rounded-[10px] top-[609px] translate-x-[-50%] w-[492px]" />
        <div className="absolute bg-[#39588a] h-[60px] left-[174px] rounded-[15px] top-[694px] w-[292px]" />
        <p className="absolute font-[Poppins] font-bold h-[36px] leading-[normal] left-[319.5px] not-italic text-[24px] text-center text-white top-[706px] translate-x-[-50%] w-[239px]">Crear cuenta</p>
      </div>
    </div>
  );
}