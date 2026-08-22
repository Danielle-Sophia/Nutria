function Button() {
  return (
    <div className="bg-[#39588a] content-stretch drop-shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Ficha de identificación</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#364153] text-[16px] text-center whitespace-nowrap">Antecedentes</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#364153] text-[16px] text-center whitespace-nowrap">Gineco - obstétricos</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#364153] text-[16px] text-center whitespace-nowrap">Padecimiento actual</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#364153] text-[16px] text-center whitespace-nowrap">Antropometría</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#e8e8e8] content-stretch flex h-full items-center px-[20px] py-[12px] relative rounded-[10px] shrink-0" data-name="Button">
      <p className="[word-break:break-word] font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#364153] text-[16px] text-center whitespace-nowrap">Laboratorio</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[20px] items-start pt-[30px] relative size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}