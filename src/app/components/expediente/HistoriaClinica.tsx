import { useState } from 'react';
import { Sparkles, AlertCircle, ClipboardList, Pill, UserCircle } from 'lucide-react';

type TabType = 'datos-generales' | 'diagnostico' | 'tratamiento';

interface ClinicalRecord {
  attribute: string;
  value: string | React.ReactNode;
  date: string;
}

interface PatientData {
  id: number;
  nombre: string;
  folio: string;
  profilePicture?: string;
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
  const [activeTab, setActiveTab] = useState<TabType>('datos-generales');
  const [isComplementingDiagnosis, setIsComplementingDiagnosis] = useState(false);
  const [isComplementingTreatment, setIsComplementingTreatment] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [treatmentResult, setTreatmentResult] = useState('');

  const handleComplementDiagnosis = () => {
    setIsComplementingDiagnosis(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setDiagnosisResult(`Basado en el análisis de los datos clínicos del paciente ${patient.nombre}:

• **Diagnóstico Principal**: Diabetes Mellitus Tipo 1 con control glucémico variable
• **Hallazgos Relevantes**: 
  - IMC: 22.7 (Peso normal: 72kg, Talla: 178cm)
  - Circunferencia de cintura: 84cm (dentro de rango saludable)
  - Control glucémico: Requiere 5 mediciones diarias
  
• **Consideraciones Adicionales**:
  - El paciente mantiene un peso estable (72kg actual vs 70kg habitual)
  - Dosis de insulina basal de 22 U/día con complemento de 6 U/comida sugiere control moderado
  - Los objetivos glucémicos están bien establecidos (ayuno: 80-120 mg/dL)

• **Recomendaciones de Seguimiento**:
  - Evaluar HbA1c cada 3 meses
  - Revisar perfil lipídico anual
  - Monitoreo de función renal semestral
  - Exploración oftalmológica anual`);
      setIsComplementingDiagnosis(false);
    }, 2500);
  };

  const handleComplementTreatment = () => {
    setIsComplementingTreatment(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setTreatmentResult(`Plan de Tratamiento Personalizado para ${patient.nombre}:

**ESQUEMA ACTUAL DE INSULINA:**
• Insulina glargina (basal): 22 U/día
• Insulina lispro (rápida): ~6 U/comida (3 veces al día)
• Dosis total diaria: ~40 U

**OPTIMIZACIÓN SUGERIDA:**
1. **Ajuste de Dosis Basal**:
   - Considerar aumento gradual de 2U cada 3 días si glucosa de ayuno >120 mg/dL
   - Meta: Glucosa de ayuno entre 80-100 mg/dL

2. **Insulina Prandial - Esquema de Carbohidratos**:
   - Ratio insulina/carbohidratos recomendado: 1:10 a 1:15
   - Ajustar según respuesta individual
   - Considerar factor de sensibilidad: 1U reduce ~50 mg/dL

3. **Plan Nutricional**:
   - Distribución: 45-50% carbohidratos, 30% proteínas, 20-25% grasas
   - 5 comidas al día (3 principales + 2 colaciones)
   - Conteo de carbohidratos en cada comida

4. **Actividad Física**:
   - 150 minutos/semana de ejercicio aeróbico moderado
   - Monitoreo pre y post ejercicio
   - Ajuste de insulina: reducir 10-20% antes de ejercicio prolongado

5. **Tecnología de Apoyo**:
   - Considerar MCG (Monitoreo Continuo de Glucosa)
   - App para registro de alimentos y dosis
   - Bomba de insulina si variabilidad glucémica persiste

**SEGUIMIENTO:**
• Control médico mensual primeros 3 meses
• Ajuste de dosis según tendencias
• Educación en conteo de carbohidratos
• Revisión de técnica de inyección`);
      setIsComplementingTreatment(false);
    }, 2500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'datos-generales':
        return (
          <div className="flex justify-center">
            <div className="border border-[#39588a] rounded-[10px] overflow-hidden">
              {/* Table Header */}
              <div className="bg-[rgba(57,88,138,0.5)] h-[65px] flex items-center border-b border-[#39588a]">
                <div className="w-[242px] flex items-center justify-center border-r border-[#39588a]">
                  <p className="font-[Poppins] font-medium text-[20px] text-black">
                    Atributo
                  </p>
                </div>
                <div className="w-[252px] flex items-center justify-center border-r border-[#39588a]">
                  <p className="font-[Poppins] font-medium text-[20px] text-black">
                    Valor
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="font-[Poppins] font-medium text-[20px] text-black">
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
                      <p className="font-[Poppins] font-normal text-[16px] text-black text-center leading-tight">
                        {record.attribute}
                      </p>
                    </div>
                    
                    {/* Value Column */}
                    <div className="w-[252px] flex items-center justify-center px-[10px] py-[8px] border-r border-[#39588a]">
                      <div className="font-[Poppins] font-normal text-[16px] text-black text-center">
                        {record.value}
                      </div>
                    </div>
                    
                    {/* Date Column */}
                    <div className="flex-1 flex items-center justify-center px-[10px]">
                      <p className="font-[Poppins] font-normal text-[16px] text-black text-center">
                        {record.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'diagnostico':
        return (
          <div>
            {/* AI Button */}
            <div className="mb-[20px] flex justify-end">
              <button
                onClick={handleComplementDiagnosis}
                disabled={isComplementingDiagnosis}
                className={`rounded-[15px] px-[25px] py-[12px] font-[Poppins] font-bold text-[16px] transition-all flex items-center gap-[10px] shadow-lg ${
                  isComplementingDiagnosis
                    ? 'bg-gray-400 text-gray-200 cursor-wait'
                    : 'bg-gradient-to-r from-[#5e7deb] to-[#8db9f2] hover:from-[#4d6bd9] hover:to-[#7aa8e1] text-white active:scale-95'
                }`}
              >
                <Sparkles size={20} className={isComplementingDiagnosis ? 'animate-spin' : ''} />
                {isComplementingDiagnosis ? 'Analizando con IA...' : 'Complementar diagnóstico con IA'}
              </button>
            </div>

            {/* Loading State */}
            {isComplementingDiagnosis && (
              <div className="bg-gradient-to-br from-[#f0f8ff] to-[#e8f4ff] rounded-[15px] p-[30px] text-center mb-[20px]">
                <div className="flex justify-center mb-[15px]">
                  <div className="animate-pulse">
                    <Sparkles size={40} className="text-[#5e7deb]" />
                  </div>
                </div>
                <p className="font-[Poppins] font-medium text-[16px] text-[#193073]">
                  La IA está analizando los datos clínicos del paciente...
                </p>
              </div>
            )}

            {/* Diagnosis Content */}
            {diagnosisResult ? (
              <div className="bg-gradient-to-br from-[#e8f4ff] to-[#d4e7ff] border-2 border-[#5e7deb] rounded-[20px] p-[30px]">
                <div className="flex items-start gap-[15px] mb-[20px]">
                  <div className="bg-[#5e7deb] rounded-full p-[12px]">
                    <ClipboardList size={28} className="text-white" />
                  </div>
                  <h3 className="font-[Poppins] font-bold text-[24px] text-[#193073]">
                    Diagnóstico Complementado con IA
                  </h3>
                </div>

                <div className="bg-white rounded-[15px] p-[25px] whitespace-pre-line">
                  <p className="font-[Poppins] font-normal text-[15px] text-gray-800 leading-relaxed">
                    {diagnosisResult}
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-[10px] p-[15px] mt-[20px] flex items-start gap-[10px]">
                  <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-[2px]" />
                  <p className="font-[Poppins] font-normal text-[13px] text-yellow-800">
                    <strong>Nota importante:</strong> Este análisis es una herramienta de apoyo generada por IA. 
                    El diagnóstico final debe ser realizado por el médico tratante basándose en su criterio clínico profesional.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-[15px] p-[40px] text-center">
                <ClipboardList size={64} className="text-gray-300 mx-auto mb-[20px]" />
                <p className="font-[Poppins] font-medium text-[18px] text-gray-500 mb-[10px]">
                  No hay diagnóstico complementario generado
                </p>
                <p className="font-[Poppins] font-normal text-[14px] text-gray-400">
                  Haz clic en "Complementar diagnóstico con IA" para generar un análisis automático
                </p>
              </div>
            )}
          </div>
        );

      case 'tratamiento':
        return (
          <div>
            {/* AI Button */}
            <div className="mb-[20px] flex justify-end">
              <button
                onClick={handleComplementTreatment}
                disabled={isComplementingTreatment}
                className={`rounded-[15px] px-[25px] py-[12px] font-[Poppins] font-bold text-[16px] transition-all flex items-center gap-[10px] shadow-lg ${
                  isComplementingTreatment
                    ? 'bg-gray-400 text-gray-200 cursor-wait'
                    : 'bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-white active:scale-95'
                }`}
              >
                <Sparkles size={20} className={isComplementingTreatment ? 'animate-spin' : ''} />
                {isComplementingTreatment ? 'Generando plan...' : 'Complementar tratamiento con IA'}
              </button>
            </div>

            {/* Loading State */}
            {isComplementingTreatment && (
              <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-[15px] p-[30px] text-center mb-[20px]">
                <div className="flex justify-center mb-[15px]">
                  <div className="animate-pulse">
                    <Sparkles size={40} className="text-[#10b981]" />
                  </div>
                </div>
                <p className="font-[Poppins] font-medium text-[16px] text-[#065f46]">
                  La IA está generando un plan de tratamiento personalizado...
                </p>
              </div>
            )}

            {/* Treatment Content */}
            {treatmentResult ? (
              <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-2 border-[#10b981] rounded-[20px] p-[30px]">
                <div className="flex items-start gap-[15px] mb-[20px]">
                  <div className="bg-[#10b981] rounded-full p-[12px]">
                    <Pill size={28} className="text-white" />
                  </div>
                  <h3 className="font-[Poppins] font-bold text-[24px] text-[#065f46]">
                    Plan de Tratamiento Generado con IA
                  </h3>
                </div>

                <div className="bg-white rounded-[15px] p-[25px] whitespace-pre-line">
                  <p className="font-[Poppins] font-normal text-[15px] text-gray-800 leading-relaxed">
                    {treatmentResult}
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-[10px] p-[15px] mt-[20px] flex items-start gap-[10px]">
                  <AlertCircle size={24} className="text-orange-600 flex-shrink-0 mt-[2px]" />
                  <p className="font-[Poppins] font-normal text-[13px] text-orange-800">
                    <strong>Importante:</strong> Este plan de tratamiento es una recomendación generada por IA basada en los datos disponibles. 
                    Debe ser revisado, ajustado y aprobado por el médico tratante antes de su implementación. 
                    Cada paciente requiere un enfoque individualizado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-[15px] p-[40px] text-center">
                <Pill size={64} className="text-gray-300 mx-auto mb-[20px]" />
                <p className="font-[Poppins] font-medium text-[18px] text-gray-500 mb-[10px]">
                  No hay plan de tratamiento generado
                </p>
                <p className="font-[Poppins] font-normal text-[14px] text-gray-400">
                  Haz clic en "Complementar tratamiento con IA" para generar un plan personalizado
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-[20px]">
      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[30px]">
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
          {patient.profilePicture ? (
            <img
              src={patient.profilePicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle size={80} className="text-white" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">
            {patient.nombre}
          </p>
          <p className="font-[Poppins] font-normal text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[10px] mb-[30px]">
        <button
          onClick={() => setActiveTab('datos-generales')}
          className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[10px] font-[Poppins] font-semibold text-[16px] transition-all ${
            activeTab === 'datos-generales'
              ? 'bg-[#39588a] text-white shadow-md'
              : 'bg-[#e8e8e8] text-gray-700 hover:bg-[#d0d0d0]'
          }`}
        >
          <ClipboardList size={20} />
          Datos Generales
        </button>
        <button
          onClick={() => setActiveTab('diagnostico')}
          className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[10px] font-[Poppins] font-semibold text-[16px] transition-all ${
            activeTab === 'diagnostico'
              ? 'bg-[#5e7deb] text-white shadow-md'
              : 'bg-[#e8e8e8] text-gray-700 hover:bg-[#d0d0d0]'
          }`}
        >
          <AlertCircle size={20} />
          Diagnóstico
        </button>
        <button
          onClick={() => setActiveTab('tratamiento')}
          className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[10px] font-[Poppins] font-semibold text-[16px] transition-all ${
            activeTab === 'tratamiento'
              ? 'bg-[#10b981] text-white shadow-md'
              : 'bg-[#e8e8e8] text-gray-700 hover:bg-[#d0d0d0]'
          }`}
        >
          <Pill size={20} />
          Tratamiento
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}