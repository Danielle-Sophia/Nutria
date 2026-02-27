import imgAvatarsDefaultWithBackdrop from "figma:asset/ebefd4d6aa1c1b49de47858ad31c32fe5f8d5e81.png";

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute h-[208px] left-0 top-0 w-[221px]" data-name="Avatars Default with Backdrop">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgAvatarsDefaultWithBackdrop} />
      </div>
      <p className="absolute font-['Poppins:SemiBold',sans-serif] h-[27px] leading-[normal] left-[253px] not-italic text-[18px] text-black top-[101px] w-[204px] whitespace-pre-wrap">Dra. Alejandra Triviño</p>
      <p className="absolute font-['Poppins:Regular',sans-serif] h-[27px] leading-[normal] left-[253px] not-italic text-[18px] text-black top-[137px] w-[320px] whitespace-pre-wrap">Especialidad: Especialidad</p>
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-[calc(50%-33.5px)] not-italic text-[#7f94e2] text-[32px] top-[44px]">¡Bienvenida!</p>
    </div>
  );
}