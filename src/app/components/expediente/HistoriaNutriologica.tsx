import { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExportMenu, type ExportFormat } from '../ExportMenu';
import { exportHistoriaNutriologica } from '../../utils/exportHistoriaNutriologica';
import { diagnosticoAPI } from '../../utils/api';

interface PatientData {
  id: string;
  nombre: string;
  apellidos?: string;
  folio: string;
  sexoBiologico?: string;
  fechaNacimiento?: string;
  edad?: number;
  peso?: number;
  talla?: number;
  profilePicture?: string;
}

interface HistoriaNutriologicaProps {
  patient: PatientData;
}

const IN  = 'w-full bg-transparent font-[Poppins] font-normal text-[15px] text-black outline-none placeholder:text-gray-400';
const TA  = `${IN} resize-none`;
const BTN = 'bg-[#39588a] text-white font-[Poppins] font-bold text-[18px] px-[40px] py-[8px] rounded-[15px] hover:bg-[#2d4570] active:scale-95 transition-all';

function toTitleCase(str?: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function FieldBox({ label, className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#d9d9d9] rounded-[10px] px-[14px] py-[10px] ${className ?? ''}`}>
      {label && <p className="font-[Poppins] font-bold text-[12px] text-black leading-tight mb-[4px]">{label}</p>}
      {children}
    </div>
  );
}

function SectionHeader({ numeral, children }: { numeral: string; children: React.ReactNode }) {
  return (
    <p className="font-[Poppins] font-bold text-[19px] text-black mb-[12px]">
      <span className="text-[#39588a] mr-[8px]">{numeral}.</span>{children}
    </p>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[Poppins] font-bold text-[15px] text-[#39588a] mb-[10px] uppercase tracking-wide text-center border-b-2 border-[#39588a] pb-[4px]">
      {children}
    </p>
  );
}

type ActiveTab = 'subjetivo' | 'objetivo';
type NivelActividad = 'sedentario' | 'poco-activo' | 'activo' | 'muy-activo' | '';

function buildInitialForm(patient: PatientData) {
  return {
    // Datos personales
    nombrePaciente:   toTitleCase(patient.nombre) + (patient.apellidos ? ' ' + toTitleCase(patient.apellidos) : ''),
    sexo:             patient.sexoBiologico ?? '',
    edad:             patient.edad ? String(patient.edad) : '',
    ocupacion:        '',

    // Subjetivo — Nivel de actividad física
    nivelActividad:   '' as NivelActividad,
    descripcionActividad: '',

    // Ejercicio
    ejercicioTipo:         '',
    ejercicioDuracion:     '',
    ejercicioFrecuencia:   '',
    ejercicioObservaciones:'',

    // Hábitos dietéticos
    horarioAlimentos:      '',
    numColaciones:         '',
    lugarComidas:          '',
    preparaAlimentos:      '',
    habitosDietObservaciones: '',

    // Consumo de alcohol / tabaco
    alcoholTabacoTipo:         '',
    alcoholTabacoFrecuencia:   '',
    alcoholTabacoCantidad:     '',
    alcoholTabacoObservaciones:'',

    // Intolerancias y alergias
    intolerancias: '',
    alergias:      '',

    // Objetivo — Antropométricos
    pesoActual:    patient.peso  ? String(patient.peso)  : '',
    estatura:      patient.talla ? String(patient.talla) : '',
    pesoTeorico:   '',
    imc:           '',

    // Bioquímicos
    glucosa:       '',
    colesterolLDL: '',
    colesterolHDL: '',
    trigliceridos: '',
    hemoglobina:   '',

    // Clínicos
    dxMedico:             '',
    medicamentosUso:      '',
    medicamentosNombre:   '',

    // Dietéticos
    ingestaAgua:           '',
    complementosSuplementos: '',
    alergiaIntolerancia:   '',
  };
}

const STORAGE_KEY = (id: string) => `hn:${id}`;

export function HistoriaNutriologica({ patient }: HistoriaNutriologicaProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('subjetivo');
  const [isSaving, setIsSaving]   = useState(false);
  const [form, setForm]           = useState(() => buildInitialForm(patient));

  // Derived IMC
  const calcImc = () => {
    const p = parseFloat(form.pesoActual);
    const t = parseFloat(form.estatura) / 100;
    return p && t ? (p / (t * t)).toFixed(1) : '';
  };
  const imcVal = calcImc();

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Load from localStorage + seed ocupacion from HC + seed dxMedico from saved diagnosis
  useEffect(() => {
    async function load() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY(patient.id)) ?? 'null');
        const hc    = JSON.parse(localStorage.getItem(`hc:${patient.id}`) ?? 'null');
        const base  = buildInitialForm(patient);

        // Seed ocupacion from Historia Clínica if not already in nutricológica
        if (hc?.ocupacion && !saved?.ocupacion) base.ocupacion = hc.ocupacion;

        // Seed dxMedico from saved selected diagnoses if not already set
        if (!saved?.dxMedico) {
          try {
            const dxResult = await diagnosticoAPI.get(patient.id);
            if (dxResult.success && dxResult.data?.seleccionados?.length) {
              base.dxMedico = dxResult.data.seleccionados.join(', ');
            }
          } catch { /* ignore if diagnosis not available */ }
        }

        if (saved) setForm({ ...base, ...saved });
        else setForm(prev => ({ ...prev, ...base }));
      } catch { /* ignore */ }
    }
    load();
  }, [patient.id]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await exportHistoriaNutriologica(format as any, form as any, patient, imcVal);
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al exportar');
    }
  }, [form, patient, imcVal]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const toSave = { ...form, imc: imcVal };
      localStorage.setItem(STORAGE_KEY(patient.id), JSON.stringify(toSave));
      setForm(prev => ({ ...prev, imc: imcVal }));
      toast.success('Historia nutriológica guardada', { icon: '💾', duration: 3000 });
    } catch {
      toast.error('Error al guardar la historia nutriológica');
    } finally {
      setIsSaving(false);
    }
  }, [form, patient.id, imcVal]);

  // ── Subjetivo tab ─────────────────────────────────────────────
  const renderSubjetivo = () => (
    <div className="space-y-[20px]">

      {/* Datos personales */}
      <div>
        <SectionHeader numeral="I">Datos personales</SectionHeader>
        <div className="space-y-[10px]">
          <FieldBox label="Nombre del paciente">
            <input className={IN} value={form.nombrePaciente} onChange={set('nombrePaciente')} placeholder="Ej. María García López" />
          </FieldBox>
          <div className="grid grid-cols-3 gap-[10px]">
            <FieldBox label="Sexo">
              <input className={IN} value={form.sexo} onChange={set('sexo')} placeholder="Ej. Femenino" />
            </FieldBox>
            <FieldBox label="Edad">
              <input className={IN} value={form.edad} onChange={set('edad')} placeholder="Ej. 35" />
            </FieldBox>
            <FieldBox label="Ocupación">
              <input className={IN} value={form.ocupacion} onChange={set('ocupacion')} placeholder="Ej. Maestra, comerciante" />
            </FieldBox>
          </div>
        </div>
      </div>

      {/* Nivel de actividad física */}
      <div>
        <SectionHeader numeral="II">Nivel de actividad física</SectionHeader>
        <div className="grid grid-cols-4 gap-[10px] mb-[10px]">
          {([
            { val: 'sedentario',   label: 'Sedentario' },
            { val: 'poco-activo',  label: 'Poco activo' },
            { val: 'activo',       label: 'Activo' },
            { val: 'muy-activo',   label: 'Muy activo' },
          ] as const).map(({ val, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, nivelActividad: prev.nivelActividad === val ? '' : val }))}
              className={`rounded-[10px] px-[14px] py-[14px] font-[Poppins] font-semibold text-[14px] transition-all border-2 ${
                form.nivelActividad === val
                  ? 'bg-[#39588a] text-white border-[#39588a] shadow-md'
                  : 'bg-[#d9d9d9] text-[#333] border-transparent hover:border-[#39588a] hover:bg-[#c5d5e8]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <FieldBox label="Descripción de actividades">
          <textarea className={TA} value={form.descripcionActividad} onChange={set('descripcionActividad')} rows={2} placeholder="Ej. Camina 30 min diario, cuida niños, trabajo de oficina..." />
        </FieldBox>
      </div>

      {/* Ejercicio */}
      <div>
        <SectionHeader numeral="III">Ejercicio</SectionHeader>
        <div className="grid grid-cols-4 gap-[10px]">
          <FieldBox label="Tipo">
            <input className={IN} value={form.ejercicioTipo} onChange={set('ejercicioTipo')} placeholder="Ej. Natación, pesas" />
          </FieldBox>
          <FieldBox label="Duración">
            <input className={IN} value={form.ejercicioDuracion} onChange={set('ejercicioDuracion')} placeholder="Ej. 45 min" />
          </FieldBox>
          <FieldBox label="Frecuencia">
            <input className={IN} value={form.ejercicioFrecuencia} onChange={set('ejercicioFrecuencia')} placeholder="Ej. 3 veces/sem" />
          </FieldBox>
          <FieldBox label="Observaciones">
            <input className={IN} value={form.ejercicioObservaciones} onChange={set('ejercicioObservaciones')} placeholder="Ej. Suspendido por lesión" />
          </FieldBox>
        </div>
      </div>

      {/* Hábitos dietéticos */}
      <div>
        <SectionHeader numeral="IV">Hábitos dietéticos</SectionHeader>
        <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
          <FieldBox label="¿Tiene horarios establecidos de alimentos?">
            <input className={IN} value={form.horarioAlimentos} onChange={set('horarioAlimentos')} placeholder="Sí / No / Parcialmente" />
          </FieldBox>
          <FieldBox label="Número de colaciones que realiza al día">
            <input className={IN} value={form.numColaciones} onChange={set('numColaciones')} placeholder="Ej. 2 colaciones" />
          </FieldBox>
        </div>
        <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
          <FieldBox label="Lugar donde realiza las comidas">
            <input className={IN} value={form.lugarComidas} onChange={set('lugarComidas')} placeholder="Ej. Casa, trabajo, restaurante" />
          </FieldBox>
          <FieldBox label="Persona que prepara sus alimentos">
            <input className={IN} value={form.preparaAlimentos} onChange={set('preparaAlimentos')} placeholder="Ej. El mismo paciente, madre, cónyuge" />
          </FieldBox>
        </div>
        <FieldBox label="Observaciones generales">
          <textarea className={TA} value={form.habitosDietObservaciones} onChange={set('habitosDietObservaciones')} rows={2} placeholder="Ej. Saltea el desayuno, prefiere comida frita..." />
        </FieldBox>
      </div>

      {/* Consumo de alcohol / tabaco */}
      <div>
        <SectionHeader numeral="V">Consumo de alcohol / tabaco</SectionHeader>
        <div className="grid grid-cols-4 gap-[10px]">
          <FieldBox label="Tipo">
            <input className={IN} value={form.alcoholTabacoTipo} onChange={set('alcoholTabacoTipo')} placeholder="Ej. Cerveza, cigarro" />
          </FieldBox>
          <FieldBox label="Frecuencia">
            <input className={IN} value={form.alcoholTabacoFrecuencia} onChange={set('alcoholTabacoFrecuencia')} placeholder="Ej. Fines de semana" />
          </FieldBox>
          <FieldBox label="Cantidad">
            <input className={IN} value={form.alcoholTabacoCantidad} onChange={set('alcoholTabacoCantidad')} placeholder="Ej. 2-3 cervezas" />
          </FieldBox>
          <FieldBox label="Observaciones">
            <input className={IN} value={form.alcoholTabacoObservaciones} onChange={set('alcoholTabacoObservaciones')} placeholder="Ej. Intento de cese" />
          </FieldBox>
        </div>
      </div>

      {/* Intolerancias y alergias */}
      <div>
        <SectionHeader numeral="VI">Intolerancias y alergias alimentarias</SectionHeader>
        <div className="grid grid-cols-2 gap-[10px]">
          <FieldBox label="Intolerancias">
            <textarea className={TA} value={form.intolerancias} onChange={set('intolerancias')} rows={3} placeholder="Ej. Intolerancia a la lactosa, gluten..." />
          </FieldBox>
          <FieldBox label="Alergias">
            <textarea className={TA} value={form.alergias} onChange={set('alergias')} rows={3} placeholder="Ej. Alergia a mariscos, nueces..." />
          </FieldBox>
        </div>
      </div>
    </div>
  );

  // ── Objetivo tab ──────────────────────────────────────────────
  const renderObjetivo = () => (
    <div className="space-y-[20px]">

      {/* ABCD: Antropométrico, Bioquímico, Clínico */}
      <div>
        <div className="grid grid-cols-3 gap-[10px]">

          {/* Antropométricos */}
          <div>
            <SubHeader>Antropométricos</SubHeader>
            <div className="space-y-[8px]">
              <FieldBox label="Peso actual (kg)">
                <input className={IN} value={form.pesoActual} onChange={set('pesoActual')} placeholder="Ej. 72.5" />
              </FieldBox>
              <FieldBox label="Estatura (cm)">
                <input className={IN} value={form.estatura} onChange={set('estatura')} placeholder="Ej. 165" />
              </FieldBox>
              <FieldBox label="Peso teórico (kg)">
                <input className={IN} value={form.pesoTeorico} onChange={set('pesoTeorico')} placeholder="Ej. 60.0" />
              </FieldBox>
              <FieldBox label="IMC (calculado automáticamente)">
                <input
                  className={`${IN} text-[#39588a] font-bold`}
                  value={imcVal ? `${imcVal} kg/m²` : ''}
                  readOnly
                  placeholder="—"
                />
              </FieldBox>
            </div>
          </div>

          {/* Bioquímicos */}
          <div>
            <SubHeader>Bioquímicos</SubHeader>
            <div className="space-y-[8px]">
              <FieldBox label="Glucosa (mg/dL)">
                <input className={IN} value={form.glucosa} onChange={set('glucosa')} placeholder="Ej. 95" />
              </FieldBox>
              <FieldBox label="Colesterol LDL (mg/dL)">
                <input className={IN} value={form.colesterolLDL} onChange={set('colesterolLDL')} placeholder="Ej. 120" />
              </FieldBox>
              <FieldBox label="Colesterol HDL (mg/dL)">
                <input className={IN} value={form.colesterolHDL} onChange={set('colesterolHDL')} placeholder="Ej. 48" />
              </FieldBox>
              <FieldBox label="Triglicéridos (mg/dL)">
                <input className={IN} value={form.trigliceridos} onChange={set('trigliceridos')} placeholder="Ej. 145" />
              </FieldBox>
              <FieldBox label="Hemoglobina (g/dL)">
                <input className={IN} value={form.hemoglobina} onChange={set('hemoglobina')} placeholder="Ej. 13.5" />
              </FieldBox>
            </div>
          </div>

          {/* Clínicos */}
          <div>
            <SubHeader>Clínicos</SubHeader>
            <div className="space-y-[8px]">
              <FieldBox label="Diagnóstico médico (Dx médico)">
                <textarea className={TA} value={form.dxMedico} onChange={set('dxMedico')} rows={3} placeholder="Ej. Diabetes mellitus tipo 2, obesidad grado I..." />
              </FieldBox>
              <FieldBox label="Uso de medicamentos">
                <input className={IN} value={form.medicamentosUso} onChange={set('medicamentosUso')} placeholder="Sí / No" />
              </FieldBox>
              <FieldBox label="Nombre del medicamento">
                <textarea className={TA} value={form.medicamentosNombre} onChange={set('medicamentosNombre')} rows={3} placeholder="Ej. Metformina 850 mg c/12h, Insulina glargina 22U nocturna..." />
              </FieldBox>
            </div>
          </div>
        </div>
      </div>

      {/* Dietéticos */}
      <div>
        <SectionHeader numeral="VII">Dietéticos</SectionHeader>
        <div className="grid grid-cols-3 gap-[10px]">
          <FieldBox label="Ingesta de agua (L/día)">
            <input className={IN} value={form.ingestaAgua} onChange={set('ingestaAgua')} placeholder="Ej. 1.5 L" />
          </FieldBox>
          <FieldBox label="Uso de complementos o suplementos">
            <textarea className={TA} value={form.complementosSuplementos} onChange={set('complementosSuplementos')} rows={3} placeholder="Ej. Omega-3, vitamina D, proteína en polvo..." />
          </FieldBox>
          <FieldBox label="Alergias o intolerancias alimentarias">
            <textarea className={TA} value={form.alergiaIntolerancia} onChange={set('alergiaIntolerancia')} rows={3} placeholder="Ej. Intolerancia a la lactosa, alergia a mariscos..." />
          </FieldBox>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-[20px]">

      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[20px]">
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
          {patient.profilePicture
            ? <img src={patient.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
            : <UserCircle size={80} className="text-white" strokeWidth={1.5} />
          }
        </div>
        <div>
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[4px]">
            Historia Nutriológica
          </p>
          <p className="font-[Poppins] font-normal text-[18px] text-black">
            {toTitleCase(patient.nombre)}{patient.apellidos ? ' ' + toTitleCase(patient.apellidos) : ''}
          </p>
          <p className="font-[Poppins] font-normal text-[15px] text-gray-500 mt-[2px]">
            Folio: {patient.folio}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[10px] mb-[24px] flex-wrap">
        {([
          { id: 'subjetivo', label: 'Subjetivo' },
          { id: 'objetivo',  label: 'Objetivo'  },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-[24px] py-[10px] rounded-[10px] font-[Poppins] font-semibold text-[16px] transition-all ${
              activeTab === id
                ? 'bg-[#39588a] text-white shadow-md'
                : 'bg-[#e8e8e8] text-gray-700 hover:bg-[#d0d0d0]'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <ExportMenu mode="historia" onExport={handleExport} />
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[320px]">
        {activeTab === 'subjetivo' ? renderSubjetivo() : renderObjetivo()}
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-[28px]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`${BTN} flex items-center gap-[8px] ${isSaving ? 'opacity-60 cursor-wait' : ''}`}
        >
          {isSaving
            ? <><RefreshCw size={18} className="animate-spin" /> Guardando...</>
            : <><Save size={18} /> Guardar</>
          }
        </button>
      </div>
    </div>
  );
}
