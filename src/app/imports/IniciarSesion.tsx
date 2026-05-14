import imgIniciarSesion from "figma:asset/54e3689f0316108b9ac0b7ce7baeb6fbcc865e7e.png";

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[164px] p-[10px] top-[442px] w-[312px]">
      <div className="bg-[#39588a] h-[60px] rounded-[15px] shrink-0 w-full" />
    </div>
  );
}

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

export default function IniciarSesion() {
  return (
    <div className="relative size-full" data-name="Iniciar sesión">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIniciarSesion} />
      <Group />
      <div className="absolute h-[703px] left-[400px] top-[160px] w-[640px]">
        <div className="absolute bg-[rgba(255,255,255,0.85)] inset-0 rounded-[20px]" />
        <p className="absolute font-['Poppins:Regular',sans-serif] h-[27px] leading-[normal] left-[83px] not-italic text-[18px] text-black top-[299px] w-[474px]">Contraseña</p>
        <p className="[text-underline-position:from-font] absolute decoration-solid font-['Poppins:Bold',sans-serif] h-[23px] leading-[normal] left-[83px] not-italic text-[#458dff] text-[18px] top-[392px] underline w-[518px]">Olvidé mi contraseña</p>
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[83px] not-italic text-[18px] text-black text-nowrap top-[137px]">{`¿Eres nuevo aquí? `}</p>
        <p className="[text-underline-position:from-font] absolute decoration-solid font-['Poppins:Bold',sans-serif] leading-[normal] left-[251px] not-italic text-[#458dff] text-[18px] text-nowrap top-[137px] underline">Regístrate</p>
        <p className="absolute font-['Poppins:Regular',sans-serif] inset-[29.73%_12.97%_66.43%_12.97%] leading-[normal] not-italic text-[18px] text-black">Correo electrónico</p>
        <div className="absolute bg-[#e1e9f2] inset-[33.57%_12.97%_60.6%_12.97%] rounded-[10px]" />
        <div className="absolute bg-[#e1e9f2] h-[41px] left-[83px] rounded-[10px] top-[326px] w-[474px]" />
        <Frame />
        <p className="absolute font-['Poppins:Bold',sans-serif] h-[36px] leading-[normal] left-[319.5px] not-italic text-[24px] text-center text-white top-[464px] translate-x-[-50%] w-[239px]">{`Iniciar sesión `}</p>
        <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-[calc(50%-237px)] not-italic text-[48px] text-black text-nowrap top-[41px]">Iniciar sesión</p>
      </div>
    </div>
  );
}