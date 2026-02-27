import svgPaths from "./svg-0sazedst7o";
import imgAvatarsDefaultWithBackdrop from "figma:asset/ebefd4d6aa1c1b49de47858ad31c32fe5f8d5e81.png";
import imgLifesaversNewPatient from "figma:asset/8d4c75af8bdd5521ebb3ccb7852724c6e92c2782.png";
import imgLifesaversUsingComputer from "figma:asset/0f8d6bd54bbc2235127b830c3e7fadd1652447df.png";
import imgLifesaversStudyOnline from "figma:asset/661e850e5bbc3a2800f0efb364ea3899adfa1b3b.png";
import imgLifesaversHand from "";

function User() {
  return (
    <div className="absolute left-[1333px] size-[30px] top-[25px]" data-name="User">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="User">
          <path d={svgPaths.p112b4400} id="Icon" stroke="var(--stroke-0, #F5F5F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Search() {
  return (
    <div className="absolute left-[1155px] size-[30px] top-[25px]" data-name="Search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Search">
          <path d={svgPaths.p182ce800} id="Icon" stroke="var(--stroke-0, #F5F5F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Bell() {
  return (
    <div className="absolute left-[1244px] size-[30px] top-[25px]" data-name="Bell">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Bell">
          <path d={svgPaths.p39f73a00} id="Icon" stroke="var(--stroke-0, #F5F5F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#193073] h-[80px] left-0 top-0 w-[1440px]" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Medium',sans-serif] h-[28px] leading-[normal] left-[1026.5px] not-italic text-[18px] text-center text-white top-[27px] w-[193px] whitespace-pre-wrap">Mis pacientes</p>
      <User />
      <Search />
      <Bell />
      <p className="absolute font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] font-normal leading-[0] left-[60px] not-italic text-[0px] text-[40px] text-white top-[11px]">
        <span className="leading-[normal]">Nutr</span>
        <span className="leading-[normal] text-[#8db9f2]">IA</span>
      </p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[172px] top-[167px]">
      <div className="absolute h-[208px] left-[172px] top-[167px] w-[221px]" data-name="Avatars Default with Backdrop">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgAvatarsDefaultWithBackdrop} />
      </div>
      <p className="absolute font-['Poppins:SemiBold',sans-serif] h-[27px] leading-[normal] left-[425px] not-italic text-[18px] text-black top-[268px] w-[204px] whitespace-pre-wrap">Dra. Alejandra Triviño</p>
      <p className="absolute font-['Poppins:Regular',sans-serif] h-[27px] leading-[normal] left-[425px] not-italic text-[18px] text-black top-[304px] w-[320px] whitespace-pre-wrap">Especialidad: Especialidad</p>
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-[calc(50%-295px)] not-italic text-[#7f94e2] text-[32px] top-[211px]">¡Bienvenida!</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[266px]" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[132.5px] not-italic text-[20px] text-center text-white top-[6px]">Px registrados</p>
    </div>
  );
}

function Component({ className }: { className?: string }) {
  return (
    <div className={className || "absolute h-[262px] left-[162px] top-[486px] w-[266px]"} data-name="Component 1">
      <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px]" />
      <Group />
      <div className="absolute h-[173px] left-[20px] top-[59px] w-[225px]" data-name="Lifesavers New Patient">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLifesaversNewPatient} />
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[266px]" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[132px] not-italic text-[20px] text-center text-white top-[6px]">Expedientes</p>
    </div>
  );
}

function Component1() {
  return (
    <div className="absolute h-[262px] left-[445px] top-[486px] w-[266px]" data-name="Component 2">
      <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px]" />
      <Group1 />
      <div className="absolute h-[173px] left-[20px] top-[55px] w-[225px]" data-name="Lifesavers Using Computer">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLifesaversUsingComputer} />
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[266px]" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[132.5px] not-italic text-[20px] text-center text-white top-[6px]">Tablas de evolución</p>
    </div>
  );
}

function Component2() {
  return (
    <div className="absolute h-[262px] left-[728px] top-[486px] w-[266px]" data-name="Component 3">
      <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px]" />
      <Group2 />
      <div className="absolute h-[173px] left-[20px] top-[55px] w-[225px]" data-name="Lifesavers Study Online">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLifesaversStudyOnline} />
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#3457bf] h-[41px] left-0 rounded-[5px] top-0 w-[266px]" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[132.5px] not-italic text-[20px] text-center text-white top-[6px]">Configuración</p>
    </div>
  );
}

function Component3() {
  return (
    <div className="absolute h-[262px] left-[1011px] top-[486px] w-[266px]" data-name="Component 4">
      <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px]" />
      <Group3 />
      <div className="absolute h-[173px] left-[20px] top-[59px] w-[225px]" data-name="Lifesavers Hand">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLifesaversHand} />
      </div>
    </div>
  );
}

export default function MenuPrincipalProfesional() {
  return (
    <div className="bg-[#85aab3] relative size-full" data-name="Menú principal - profesional">
      <Group5 />
      <div className="absolute bg-white h-[758px] left-[107px] rounded-[40px] top-[148px] w-[1225px]" />
      <Group4 />
      <p className="absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[172px] not-italic text-[20px] text-black top-[417px]">¿Qué deseas consultar hoy?</p>
      <Component />
      <Component1 />
      <Component2 />
      <Component3 />
    </div>
  );
}