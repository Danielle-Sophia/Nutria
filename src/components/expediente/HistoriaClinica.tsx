import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";

interface ClinicalRecord {
  attribute: string;
  value: string | React.ReactNode;
  date: string;
}

interface PatientData {
  id: number;
  nombre: string;
  folio: string;
}

interface HistoriaClinicaProps {
  patient: PatientData;
}

const mockClinicalRecords: ClinicalRecord[] = [
  { attribute: 'Peso actual (kg)', value: '72', date: '00/00/0000' },
  { attribute: 'Peso habitual', value: '70', date: '00/00/0000' },
  { attribute: 'Talla (cm)', value: '178', date: '00/00/0000' },
  { attribute: 'Circunferencia de cintura', value: '84', date: '00/00/0000' },
  { attribute: 'Dosis de insulina basal U/día', value: '22', date: '00/00/0000' },
  { attribute: 'Dosis promedio de insulina rápida U/comida', value: '6', date: '00/00/0000' },
  { 
    attribute: 'Tipo de insulina', 
    value: (
      <>
        <p className="mb-0">Insulina glargina (basal)</p>
        <p>+ insulina lispro (rápida)</p>
      </>
    ), 
    date: '00/00/0000' 
  },
  { attribute: 'Frecuencia de monitoreo glucémico', value: '5 veces al día', date: '00/00/0000' },
  { 
    attribute: 'Objetivo de glucosa', 
    value: (
      <>
        <p className="mb-0">En ayuno: 80–120 mg/dL</p>
        <p className="mb-0">Postprandial: &lt;160 mg/dL</p>
        <p>Noche: 100–140 mg/dL</p>
      </>
    ), 
    date: '00/00/0000' 
  },
];

export function HistoriaClinica({ patient }: HistoriaClinicaProps) {
  return (
    <div className="p-[20px]">
      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[40px]">
        <div className="h-[121px] w-[130px] flex-shrink-0">
          <img 
            alt="Avatar paciente" 
            className="w-full h-full object-contain" 
            src={imgAvatarsDefaultWithBackdrop} 
          />
        </div>
        <div className="flex-1">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[8px]">
            {patient.nombre}
          </p>
          <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Clinical Records Table */}
      <div className="border border-[#39588a] rounded-[10px] overflow-hidden">
        {/* Table Header */}
        <div className="bg-[rgba(57,88,138,0.5)] h-[65px] flex items-center border-b border-[#39588a]">
          <div className="w-[242px] flex items-center justify-center border-r border-[#39588a]">
            <p className="font-['Poppins:Medium',sans-serif] text-[20px] text-black">
              Atributo
            </p>
          </div>
          <div className="w-[252px] flex items-center justify-center border-r border-[#39588a]">
            <p className="font-['Poppins:Medium',sans-serif] text-[20px] text-black">
              Valor
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="font-['Poppins:Medium',sans-serif] text-[20px] text-black">
              Fecha
            </p>
          </div>
        </div>

        {/* Table Rows */}
        {mockClinicalRecords.map((record, index) => {
          const isLastRow = index === mockClinicalRecords.length - 1;
          const rowHeight = index >= 6 ? 'min-h-[100px]' : 'h-[50px]';
          
          return (
            <div 
              key={index}
              className={`flex ${rowHeight} ${!isLastRow ? 'border-b border-[#39588a]' : ''}`}
            >
              {/* Attribute Column */}
              <div className="w-[242px] flex items-center justify-center px-[10px] border-r border-[#39588a]">
                <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-black text-center leading-tight">
                  {record.attribute}
                </p>
              </div>
              
              {/* Value Column */}
              <div className="w-[252px] flex items-center justify-center px-[10px] py-[8px] border-r border-[#39588a]">
                <div className="font-['Poppins:Regular',sans-serif] text-[16px] text-black text-center">
                  {record.value}
                </div>
              </div>
              
              {/* Date Column */}
              <div className="flex-1 flex items-center justify-center px-[10px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-black text-center">
                  {record.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}