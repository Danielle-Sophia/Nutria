import { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertCircle, ClipboardList, Pill, UserCircle, CheckSquare, Square, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { historiaClinicaAPI, diagnosticoAPI } from '../../utils/api';
import { ExportMenu, type ExportFormat } from '../ExportMenu';
import { exportHistoriaClinica } from '../../utils/exportHistoriaClinica';

type TopTab = 'datos-generales' | 'diagnostico' | 'tratamiento';
type StepId = 'ficha' | 'antecedentes' | 'gineco' | 'padecimiento' | 'antropometria' | 'laboratorio';

interface PatientData {
  id: string;
  nombre: string;
  apellidos?: string;
  folio: string;
  sexoBiologico?: string;
  fechaNacimiento?: string;
  edad?: number;
  telefono?: string;
  email?: string;
  direccion?: string;
  domicilio?: string;
  estadoCivil?: string;
  escolaridad?: string;
  alergias?: string;
  peso?: number;
  talla?: number;
  profilePicture?: string;
}

interface HistoriaClinicaProps {
  patient: PatientData;
}

const ALL_STEPS: StepId[] = ['ficha', 'antecedentes', 'gineco', 'padecimiento', 'antropometria', 'laboratorio'];

const STEP_LABELS: Record<StepId, string> = {
  ficha: 'Ficha de identificación',
  antecedentes: 'Antecedentes',
  gineco: 'Gineco-obstétricos',
  padecimiento: 'Padecimiento actual',
  antropometria: 'Antropometría',
  laboratorio: 'Laboratorio',
};

const IN  = 'w-full bg-transparent font-[Poppins] font-normal text-[15px] text-black outline-none placeholder:text-gray-400';
const TA  = `${IN} resize-none`;
const SEC = 'font-[Poppins] font-bold text-[18px] text-black mb-[12px]';
const BTN = 'bg-[#39588a] text-white font-[Poppins] font-bold text-[18px] px-[40px] py-[8px] rounded-[15px] hover:bg-[#2d4570] active:scale-95 transition-all';

function FieldBox({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#d9d9d9] rounded-[10px] px-[14px] py-[10px] ${className ?? ''}`}>
      <p className="font-[Poppins] font-bold text-[12px] text-black leading-tight mb-[4px]">{label}</p>
      {children}
    </div>
  );
}

function toTitleCase(str?: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function nowDate() {
  return new Date().toLocaleDateString('es-MX');
}
function nowTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function buildInitialForm(patient: PatientData) {
  return {
    fechaElaboracion:                nowDate(),
    horaElaboracion:                 nowTime(),
    nombreCompleto:                  toTitleCase(patient.nombre) + (patient.apellidos ? ' ' + toTitleCase(patient.apellidos) : ''),
    edad:                            patient.edad ? String(patient.edad) : '',
    sexo:                            patient.sexoBiologico ?? '',
    fechaNacimiento:                 patient.fechaNacimiento ?? '',
    ocupacion:                       '',
    grupoEtnico:                     '',
    domicilio:                       patient.domicilio ?? patient.direccion ?? '',
    telefono:                        patient.telefono ?? '',
    estadoCivil:                     patient.estadoCivil ?? '',
    tipoSangre:                      '',
    nivelEstudios:                   patient.escolaridad ?? '',
    nombreTutor:                     '',
    parentescoTutor:                 '',
    telefonoTutor:                   '',
    antecedentesHeredoFamiliares:    '',
    antecedentesPersonalesNoPatologicos: '',
    antecedentesPersonalesPatologicos:   '',
    menarca:                         '',
    ritmoMenstrual:                  '',
    fur:                             '',
    gestas:                          '',
    partos:                          '',
    cesareas:                        '',
    abortos:                         '',
    metodoAnticonceptivo:            '',
    motivoConsulta:                  '',
    padecimientoActual:              '',
    pesoActual:                      patient.peso  ? String(patient.peso)  : '',
    pesoHabitual:                    '',
    talla:                           patient.talla ? String(patient.talla) : '',
    circunferenciaCintura:           '',
    frecuenciaCardiaca:              '',
    spo2:                            '',
    temperatura:                     '',
    frecuenciaRespiratoria:          '',
    tensionArterial:                 '',
    glucosaAyuno:                    '',
    hba1c:                           '',
    colesterolTotal:                 '',
    hdl:                             '',
    ldl:                             '',
    trigliceridos:                   '',
    creatinina:                      '',
    otrosExamenes:                   '',
  };
}

// Fields excluded from dirty tracking (readOnly, auto-set)
const DIRTY_EXCLUDE = new Set(['fechaElaboracion', 'horaElaboracion']);
function toComparable(f: ReturnType<typeof buildInitialForm>) {
  return JSON.stringify(Object.fromEntries(Object.entries(f).filter(([k]) => !DIRTY_EXCLUDE.has(k))));
}

// ══════════════════════════════════════════════════════════════════
export function HistoriaClinica({ patient }: HistoriaClinicaProps) {
  const [activeTab, setActiveTab]   = useState<TopTab>('datos-generales');
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);

  const initialForm = buildInitialForm(patient);
  const [cleanSnapshot, setCleanSnapshot] = useState(() => toComparable(initialForm));

  // ── Diagnóstico state ─────────────────────────────────────────
  const [dxGenerating, setDxGenerating] = useState(false);
  const [dxList, setDxList]             = useState<string[]>([]);
  const [dxSelected, setDxSelected]     = useState<Set<string>>(new Set());
  const [dxNotas, setDxNotas]           = useState('');
  const [dxSaving, setDxSaving]         = useState(false);
  const [dxLoaded, setDxLoaded]         = useState(false);

  // ── Tratamiento AI state ──────────────────────────────────────
  const [isAITx, setIsAITx]         = useState(false);
  const [treatmentResult, setTreatmentResult] = useState('');

  // ── Questionnaire state ───────────────────────────────────────
  const [form, setForm] = useState(() => buildInitialForm(patient));

  const femaleValues = ['mujer', 'femenino', 'femenina', 'f'];
  const isFemale =
    femaleValues.includes((patient.sexoBiologico ?? '').toLowerCase()) ||
    femaleValues.includes((form.sexo ?? '').toLowerCase());
  const steps = ALL_STEPS.filter(s => s !== 'gineco' || isFemale);
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const imc = (() => {
    const p = parseFloat(form.pesoActual);
    const t = parseFloat(form.talla) / 100;
    return p && t ? (p / (t * t)).toFixed(1) : '';
  })();

  const goNext = () => setStepIdx(i => Math.min(i + 1, steps.length - 1));
  const goPrev = () => setStepIdx(i => Math.max(i - 1, 0));

  // ── Load historia from API on mount ──────────────────────────
  useEffect(() => {
    async function loadHistoria() {
      try {
        const result = await historiaClinicaAPI.get(patient.id);
        if (result.success && result.data) {
          const merged = { ...buildInitialForm(patient), ...result.data };
          setForm(merged);
          setCleanSnapshot(toComparable(merged));
        }
      } catch {
        // Fallback: try localStorage
        try {
          const saved = JSON.parse(localStorage.getItem(`hc:${patient.id}`) ?? 'null');
          if (saved) {
            const merged = { ...buildInitialForm(patient), ...saved };
            setForm(merged);
            setCleanSnapshot(toComparable(merged));
          }
        } catch { /* ignore */ }
      } finally {
        setIsLoading(false);
      }
    }
    loadHistoria();
  }, [patient.id]);

  // ── Load diagnosis on mount ───────────────────────────────────
  useEffect(() => {
    async function loadDx() {
      try {
        const result = await diagnosticoAPI.get(patient.id);
        if (result.success && result.data) {
          const d = result.data;
          if (d.generados?.length) setDxList(d.generados);
          if (d.seleccionados?.length) setDxSelected(new Set(d.seleccionados));
          if (d.notas) setDxNotas(d.notas);
        }
      } catch { /* ignore */ }
      setDxLoaded(true);
    }
    loadDx();
  }, [patient.id]);

  // ── Save historia ─────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const updatedForm = {
      ...form,
      fechaElaboracion: nowDate(),
      horaElaboracion:  nowTime(),
    };
    setForm(updatedForm);

    try {
      await historiaClinicaAPI.save(patient.id, updatedForm);
      localStorage.setItem(`hc:${patient.id}`, JSON.stringify(updatedForm));
      setCleanSnapshot(toComparable(updatedForm));
      toast.success('Historia clínica guardada', { icon: '💾', duration: 3000 });
      setActiveTab('diagnostico');
    } catch {
      toast.error('Error al guardar. Datos guardados localmente.');
      localStorage.setItem(`hc:${patient.id}`, JSON.stringify(updatedForm));
      setCleanSnapshot(toComparable(updatedForm));
    } finally {
      setIsSaving(false);
    }
  }, [form, patient.id]);

  // ── Build anonymized string for Gemini ───────────────────────
  const buildAnonymizedData = useCallback(() => {
    const lines: string[] = [];
    if (form.edad)    lines.push(`Edad: ${form.edad} años`);
    if (form.sexo)    lines.push(`Sexo biológico: ${form.sexo}`);
    if (form.estadoCivil)  lines.push(`Estado civil: ${form.estadoCivil}`);
    if (form.ocupacion)    lines.push(`Ocupación: ${form.ocupacion}`);
    if (form.grupoEtnico)  lines.push(`Grupo étnico: ${form.grupoEtnico}`);

    if (form.antecedentesHeredoFamiliares)
      lines.push(`\nAntecedentes heredo-familiares:\n${form.antecedentesHeredoFamiliares}`);
    if (form.antecedentesPersonalesNoPatologicos)
      lines.push(`\nAntecedentes personales no patológicos:\n${form.antecedentesPersonalesNoPatologicos}`);
    if (form.antecedentesPersonalesPatologicos)
      lines.push(`\nAntecedentes personales patológicos:\n${form.antecedentesPersonalesPatologicos}`);

    if (isFemale) {
      const g: string[] = [];
      if (form.menarca)             g.push(`Menarca: ${form.menarca}`);
      if (form.ritmoMenstrual)      g.push(`Ritmo menstrual: ${form.ritmoMenstrual}`);
      if (form.fur)                 g.push(`FUR: ${form.fur}`);
      if (form.gestas)              g.push(`Gestas: ${form.gestas}`);
      if (form.partos)              g.push(`Partos: ${form.partos}`);
      if (form.cesareas)            g.push(`Cesáreas: ${form.cesareas}`);
      if (form.abortos)             g.push(`Abortos: ${form.abortos}`);
      if (form.metodoAnticonceptivo) g.push(`Método anticonceptivo: ${form.metodoAnticonceptivo}`);
      if (g.length) lines.push(`\nAntecedentes gineco-obstétricos:\n${g.join(', ')}`);
    }

    if (form.motivoConsulta)      lines.push(`\nMotivo de consulta:\n${form.motivoConsulta}`);
    if (form.padecimientoActual)  lines.push(`\nPadecimiento actual:\n${form.padecimientoActual}`);

    const antro: string[] = [];
    if (form.pesoActual)           antro.push(`Peso actual: ${form.pesoActual} kg`);
    if (form.pesoHabitual)         antro.push(`Peso habitual: ${form.pesoHabitual} kg`);
    if (form.talla)                antro.push(`Talla: ${form.talla} cm`);
    if (imc)                       antro.push(`IMC: ${imc} kg/m²`);
    if (form.circunferenciaCintura) antro.push(`Circunferencia de cintura: ${form.circunferenciaCintura} cm`);
    if (antro.length) lines.push(`\nAntropometría:\n${antro.join(', ')}`);

    const sv: string[] = [];
    if (form.frecuenciaCardiaca)    sv.push(`FC: ${form.frecuenciaCardiaca} lpm`);
    if (form.spo2)                  sv.push(`SpO2: ${form.spo2}%`);
    if (form.temperatura)           sv.push(`Temperatura: ${form.temperatura}°C`);
    if (form.frecuenciaRespiratoria) sv.push(`FR: ${form.frecuenciaRespiratoria} rpm`);
    if (form.tensionArterial)       sv.push(`TA: ${form.tensionArterial} mmHg`);
    if (sv.length) lines.push(`\nSignos vitales:\n${sv.join(', ')}`);

    const lab: string[] = [];
    if (form.glucosaAyuno)   lab.push(`Glucosa ayuno: ${form.glucosaAyuno} mg/dL`);
    if (form.hba1c)          lab.push(`HbA1c: ${form.hba1c}%`);
    if (form.colesterolTotal) lab.push(`Colesterol total: ${form.colesterolTotal} mg/dL`);
    if (form.hdl)            lab.push(`HDL: ${form.hdl} mg/dL`);
    if (form.ldl)            lab.push(`LDL: ${form.ldl} mg/dL`);
    if (form.trigliceridos)  lab.push(`Triglicéridos: ${form.trigliceridos} mg/dL`);
    if (form.creatinina)     lab.push(`Creatinina: ${form.creatinina} mg/dL`);
    if (form.otrosExamenes)  lab.push(`Otros: ${form.otrosExamenes}`);
    if (lab.length) lines.push(`\nLaboratorio:\n${lab.join(', ')}`);

    return lines.join('\n');
  }, [form, isFemale, imc]);

  // ── Generate diagnosis with Gemini ────────────────────────────
  const handleGenerarDx = useCallback(async () => {
    setDxGenerating(true);
    try {
      const datos = buildAnonymizedData();
      const result = await diagnosticoAPI.generar(patient.id, datos);
      if (result.success && result.diagnosticos?.length) {
        setDxList(result.diagnosticos);
        setDxSelected(new Set());
        toast.success('Diagnósticos generados con IA', { icon: '🤖', duration: 3000 });
      } else {
        toast.error(result.error ?? 'No se pudieron generar diagnósticos');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Error al conectar con Gemini');
    } finally {
      setDxGenerating(false);
    }
  }, [patient.id, buildAnonymizedData]);

  // ── Toggle diagnosis selection ────────────────────────────────
  const toggleDx = (dx: string) => {
    setDxSelected(prev => {
      const next = new Set(prev);
      next.has(dx) ? next.delete(dx) : next.add(dx);
      return next;
    });
  };

  // ── Save specialist's diagnosis ───────────────────────────────
  const handleSaveDx = useCallback(async () => {
    setDxSaving(true);
    try {
      await diagnosticoAPI.save(patient.id, Array.from(dxSelected), dxNotas);
      toast.success('Diagnóstico guardado', { icon: '✅', duration: 3000 });
    } catch {
      toast.error('Error al guardar diagnóstico');
    } finally {
      setDxSaving(false);
    }
  }, [patient.id, dxSelected, dxNotas]);

  // ── Export handler ────────────────────────────────────────────
  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await exportHistoriaClinica(format as any, form as any, patient, isFemale);
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al exportar');
    }
  }, [form, patient, isFemale]);

  // ── Step content ──────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {

      case 'ficha':
        return (
          <div className="space-y-[12px]">
            <p className={SEC}>I. Ficha de identificación</p>

            <div className="grid grid-cols-2 gap-[12px]">
              <FieldBox label="Fecha de elaboración">
                <input className={`${IN} text-gray-600`} value={form.fechaElaboracion} readOnly />
              </FieldBox>
              <FieldBox label="Hora de elaboración">
                <input className={`${IN} text-gray-600`} value={form.horaElaboracion} readOnly />
              </FieldBox>
            </div>

            <div className="grid grid-cols-[1fr_130px_130px] gap-[12px]">
              <FieldBox label="Nombre de la o del paciente">
                <input className={IN} value={form.nombreCompleto} onChange={set('nombreCompleto')} placeholder="Ej. María García López" />
              </FieldBox>
              <FieldBox label="Edad">
                <input className={IN} value={form.edad} onChange={set('edad')} placeholder="Ej. 35" />
              </FieldBox>
              <FieldBox label="Sexo">
                <input className={IN} value={form.sexo} onChange={set('sexo')} placeholder="Ej. Femenino" />
              </FieldBox>
            </div>

            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Fecha de nacimiento">
                <input className={IN} value={form.fechaNacimiento} onChange={set('fechaNacimiento')} placeholder="Ej. 15/03/1990" />
              </FieldBox>
              <FieldBox label="Ocupación de la o del paciente">
                <input className={IN} value={form.ocupacion} onChange={set('ocupacion')} placeholder="Ej. Maestra, comerciante, ama de casa" />
              </FieldBox>
              <FieldBox label="Grupo étnico">
                <input className={IN} value={form.grupoEtnico} onChange={set('grupoEtnico')} placeholder="Ej. Mestizo, indígena, afromexicano" />
              </FieldBox>
            </div>

            <div className="grid grid-cols-[1fr_200px] gap-[12px]">
              <FieldBox label="Domicilio">
                <input className={IN} value={form.domicilio} onChange={set('domicilio')} placeholder="Ej. Av. Juárez 45, Col. Centro, Oaxaca" />
              </FieldBox>
              <FieldBox label="Teléfono">
                <input className={IN} value={form.telefono} onChange={set('telefono')} placeholder="Ej. 55-1234-5678" />
              </FieldBox>
            </div>

            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Estado civil">
                <input className={IN} value={form.estadoCivil} onChange={set('estadoCivil')} placeholder="Ej. Casado/a, soltero/a" />
              </FieldBox>
              <FieldBox label="Tipo de sangre">
                <input className={IN} value={form.tipoSangre} onChange={set('tipoSangre')} placeholder="Ej. O+, A-, B+, AB+" />
              </FieldBox>
              <FieldBox label="Nivel de estudios">
                <input className={IN} value={form.nivelEstudios} onChange={set('nivelEstudios')} placeholder="Ej. Licenciatura, secundaria completa" />
              </FieldBox>
            </div>

            <FieldBox label="Nombre del Padre o Tutor en caso de ser menor de edad o persona con capacidades diferentes">
              <input className={IN} value={form.nombreTutor} onChange={set('nombreTutor')} placeholder="Ej. Pedro García Mendoza" />
            </FieldBox>

            <div className="grid grid-cols-2 gap-[12px]">
              <FieldBox label="Parentesco con la o el paciente">
                <input className={IN} value={form.parentescoTutor} onChange={set('parentescoTutor')} placeholder="Ej. Padre, madre, hermano/a" />
              </FieldBox>
              <FieldBox label="Teléfono del tutor">
                <input className={IN} value={form.telefonoTutor} onChange={set('telefonoTutor')} placeholder="Ej. 55-9876-5432" />
              </FieldBox>
            </div>
          </div>
        );

      case 'antecedentes':
        return (
          <div className="space-y-[20px]">
            <div>
              <p className={SEC}>II. Antecedentes heredo familiares</p>
              <FieldBox label="Especificación de antecedentes">
                <textarea className={TA} value={form.antecedentesHeredoFamiliares} onChange={set('antecedentesHeredoFamiliares')} rows={4} placeholder="Ej. Abuelo paterno finado por diabetes mellitus e hipertensión arterial." />
              </FieldBox>
            </div>
            <div>
              <p className={SEC}>III. Antecedentes personales no patológicos</p>
              <FieldBox label="Especificación de antecedentes">
                <textarea className={TA} value={form.antecedentesPersonalesNoPatologicos} onChange={set('antecedentesPersonalesNoPatologicos')} rows={4} placeholder="Ej. Originaria y residente de Oaxaca. Escolaridad: primaria completa." />
              </FieldBox>
            </div>
            <div>
              <p className={SEC}>IV. Antecedentes personales patológicos</p>
              <FieldBox label="Especificación de antecedentes">
                <textarea className={TA} value={form.antecedentesPersonalesPatologicos} onChange={set('antecedentesPersonalesPatologicos')} rows={4} placeholder="Ej. Diabetes mellitus tipo 2 diagnosticada en 2018." />
              </FieldBox>
            </div>
          </div>
        );

      case 'gineco':
        return (
          <div className="space-y-[12px]">
            <p className={SEC}>V. Antecedentes gineco-obstétricos</p>

            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Menarca (edad)">
                <input className={IN} value={form.menarca} onChange={set('menarca')} placeholder="Ej. 12 años" />
              </FieldBox>
              <FieldBox label="Ritmo menstrual">
                <input className={IN} value={form.ritmoMenstrual} onChange={set('ritmoMenstrual')} placeholder="Ej. 28/5 días" />
              </FieldBox>
              <FieldBox label="Fecha de última regla (FUR)">
                <input className={IN} value={form.fur} onChange={set('fur')} placeholder="Ej. 01/08/2025" />
              </FieldBox>
            </div>

            <div className="grid grid-cols-4 gap-[12px]">
              <FieldBox label="Gestas">
                <input className={IN} value={form.gestas} onChange={set('gestas')} placeholder="Ej. 3" />
              </FieldBox>
              <FieldBox label="Partos">
                <input className={IN} value={form.partos} onChange={set('partos')} placeholder="Ej. 2" />
              </FieldBox>
              <FieldBox label="Cesáreas">
                <input className={IN} value={form.cesareas} onChange={set('cesareas')} placeholder="Ej. 1" />
              </FieldBox>
              <FieldBox label="Abortos">
                <input className={IN} value={form.abortos} onChange={set('abortos')} placeholder="Ej. 0" />
              </FieldBox>
            </div>

            <FieldBox label="Método anticonceptivo actual">
              <input className={IN} value={form.metodoAnticonceptivo} onChange={set('metodoAnticonceptivo')} placeholder="Ej. Implante subdérmico, DIU hormonal, ninguno" />
            </FieldBox>
          </div>
        );

      case 'padecimiento':
        return (
          <div className="space-y-[16px]">
            <p className={SEC}>VI. Padecimiento actual</p>
            <FieldBox label="Motivo de consulta">
              <textarea className={TA} value={form.motivoConsulta} onChange={set('motivoConsulta')} rows={3} placeholder="Ej. Control y seguimiento de diabetes mellitus tipo 2." />
            </FieldBox>
            <FieldBox label="Padecimiento actual">
              <textarea className={TA} value={form.padecimientoActual} onChange={set('padecimientoActual')} rows={6} placeholder="Ej. Paciente femenina de 52 años con DM2 de 6 años de evolución..." />
            </FieldBox>
          </div>
        );

      case 'antropometria':
        return (
          <div className="space-y-[12px]">
            <p className={SEC}>VII. Antropometría y signos vitales</p>

            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Peso actual (kg)">
                <input className={IN} value={form.pesoActual} onChange={set('pesoActual')} placeholder="Ej. 72.5" />
              </FieldBox>
              <FieldBox label="Peso habitual (kg)">
                <input className={IN} value={form.pesoHabitual} onChange={set('pesoHabitual')} placeholder="Ej. 68.0" />
              </FieldBox>
              <FieldBox label="Talla (cm)">
                <input className={IN} value={form.talla} onChange={set('talla')} placeholder="Ej. 165" />
              </FieldBox>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <FieldBox label="Circunferencia de cintura (cm)">
                <input className={IN} value={form.circunferenciaCintura} onChange={set('circunferenciaCintura')} placeholder="Ej. 88" />
              </FieldBox>
              <FieldBox label="IMC (calculado automáticamente)">
                <input className={`${IN} text-[#39588a] font-bold`} value={imc ? `${imc} kg/m²` : ''} readOnly placeholder="—" />
              </FieldBox>
            </div>

            <p className="font-[Poppins] font-bold text-[15px] text-[#39588a] mt-[4px]">Signos vitales</p>
            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Frecuencia cardiaca — FC (lpm)">
                <input className={IN} value={form.frecuenciaCardiaca} onChange={set('frecuenciaCardiaca')} placeholder="Ej. 78" />
              </FieldBox>
              <FieldBox label="SpO₂ (%)">
                <input className={IN} value={form.spo2} onChange={set('spo2')} placeholder="Ej. 97" />
              </FieldBox>
              <FieldBox label="Temperatura (°C)">
                <input className={IN} value={form.temperatura} onChange={set('temperatura')} placeholder="Ej. 36.5" />
              </FieldBox>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <FieldBox label="Frecuencia respiratoria — FR (rpm)">
                <input className={IN} value={form.frecuenciaRespiratoria} onChange={set('frecuenciaRespiratoria')} placeholder="Ej. 16" />
              </FieldBox>
              <FieldBox label="Tensión arterial (mmHg)">
                <input className={IN} value={form.tensionArterial} onChange={set('tensionArterial')} placeholder="Ej. 120/80" />
              </FieldBox>
            </div>
          </div>
        );

      case 'laboratorio':
        return (
          <div className="space-y-[12px]">
            <p className={SEC}>VIII. Laboratorio</p>
            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="Glucosa en ayuno (mg/dL)">
                <input className={IN} value={form.glucosaAyuno} onChange={set('glucosaAyuno')} placeholder="Ej. 126" />
              </FieldBox>
              <FieldBox label="HbA1c (%)">
                <input className={IN} value={form.hba1c} onChange={set('hba1c')} placeholder="Ej. 7.2" />
              </FieldBox>
              <FieldBox label="Colesterol total (mg/dL)">
                <input className={IN} value={form.colesterolTotal} onChange={set('colesterolTotal')} placeholder="Ej. 195" />
              </FieldBox>
            </div>
            <div className="grid grid-cols-3 gap-[12px]">
              <FieldBox label="HDL (mg/dL)">
                <input className={IN} value={form.hdl} onChange={set('hdl')} placeholder="Ej. 48" />
              </FieldBox>
              <FieldBox label="LDL (mg/dL)">
                <input className={IN} value={form.ldl} onChange={set('ldl')} placeholder="Ej. 120" />
              </FieldBox>
              <FieldBox label="Triglicéridos (mg/dL)">
                <input className={IN} value={form.trigliceridos} onChange={set('trigliceridos')} placeholder="Ej. 145" />
              </FieldBox>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <FieldBox label="Creatinina (mg/dL)">
                <input className={IN} value={form.creatinina} onChange={set('creatinina')} placeholder="Ej. 0.9" />
              </FieldBox>
              <div />
            </div>
            <FieldBox label="Otros exámenes y observaciones">
              <textarea className={TA} value={form.otrosExamenes} onChange={set('otrosExamenes')} rows={3} placeholder="Ej. Microalbuminuria: 28 mg/g creatinina. TSH: 2.1 mUI/L (normal)." />
            </FieldBox>
          </div>
        );

      default: return null;
    }
  };

  // ── Diagnóstico tab ───────────────────────────────────────────
  const renderDiagnostico = () => (
    <div className="space-y-[20px]">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-[Poppins] font-bold text-[20px] text-black">Diagnóstico preliminar</p>
          <p className="font-[Poppins] font-normal text-[13px] text-gray-500 mt-[2px]">
            Generado por IA con base en los datos clínicos anonimizados del paciente
          </p>
        </div>
        <button
          onClick={handleGenerarDx}
          disabled={dxGenerating}
          className={`flex items-center gap-[8px] px-[20px] py-[10px] rounded-[12px] font-[Poppins] font-semibold text-[15px] transition-all shadow-md ${
            dxGenerating
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-gradient-to-r from-[#5e7deb] to-[#8db9f2] hover:from-[#4d6bd9] hover:to-[#7aa8e1] text-white active:scale-95'
          }`}
        >
          {dxGenerating
            ? <><RefreshCw size={18} className="animate-spin" /> Analizando con IA...</>
            : <><Sparkles size={18} /> {dxList.length ? 'Regenerar diagnósticos' : 'Generar diagnósticos con IA'}</>
          }
        </button>
      </div>

      {/* Generating animation */}
      {dxGenerating && (
        <div className="bg-gradient-to-br from-[#f0f8ff] to-[#e8f4ff] rounded-[15px] p-[28px] text-center">
          <div className="animate-pulse flex justify-center mb-[12px]">
            <Sparkles size={36} className="text-[#5e7deb]" />
          </div>
          <p className="font-[Poppins] font-medium text-[15px] text-[#193073]">
            Gemini está analizando los datos clínicos...
          </p>
          <p className="font-[Poppins] font-normal text-[13px] text-[#39588a] mt-[4px]">
            No se incluye información identificable del paciente
          </p>
        </div>
      )}

      {/* Diagnosis checklist */}
      {!dxGenerating && dxList.length > 0 && (
        <div className="bg-white border border-[#d9d9d9] rounded-[16px] overflow-hidden">
          <div className="bg-[#39588a] px-[20px] py-[12px] flex items-center gap-[10px]">
            <ClipboardList size={20} className="text-white" />
            <p className="font-[Poppins] font-bold text-[15px] text-white">
              Posibles diagnósticos — seleccione los aplicables
            </p>
          </div>
          <div className="divide-y divide-[#f0f0f0]">
            {dxList.map((dx, i) => {
              const checked = dxSelected.has(dx);
              return (
                <button
                  key={i}
                  onClick={() => toggleDx(dx)}
                  className={`w-full flex items-center gap-[14px] px-[20px] py-[14px] text-left transition-colors ${
                    checked ? 'bg-[#eef3fb]' : 'hover:bg-[#f8f9fc]'
                  }`}
                >
                  {checked
                    ? <CheckSquare size={22} className="text-[#39588a] flex-shrink-0" />
                    : <Square size={22} className="text-gray-400 flex-shrink-0" />
                  }
                  <span className={`font-[Poppins] text-[15px] ${checked ? 'text-[#193073] font-semibold' : 'text-gray-700 font-normal'}`}>
                    {dx}
                  </span>
                </button>
              );
            })}
          </div>
          {dxSelected.size > 0 && (
            <div className="bg-[#f0f4fa] px-[20px] py-[10px] border-t border-[#d9d9d9]">
              <p className="font-[Poppins] font-medium text-[13px] text-[#39588a]">
                {dxSelected.size} diagnóstico{dxSelected.size !== 1 ? 's' : ''} seleccionado{dxSelected.size !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!dxGenerating && dxList.length === 0 && (
        <div className="bg-gray-50 rounded-[15px] p-[40px] text-center border border-dashed border-gray-300">
          <ClipboardList size={56} className="text-gray-300 mx-auto mb-[16px]" />
          <p className="font-[Poppins] font-medium text-[17px] text-gray-500 mb-[8px]">
            Sin diagnósticos generados
          </p>
          <p className="font-[Poppins] font-normal text-[13px] text-gray-400">
            Guarda la historia clínica y haz clic en "Generar diagnósticos con IA" para obtener un análisis preliminar
          </p>
        </div>
      )}

      {/* Specialist notes */}
      <div>
        <p className="font-[Poppins] font-bold text-[16px] text-black mb-[8px]">
          Notas del especialista
        </p>
        <div className="bg-[#d9d9d9] rounded-[10px] px-[14px] py-[10px]">
          <textarea
            className={`${TA} min-h-[120px]`}
            value={dxNotas}
            onChange={e => setDxNotas(e.target.value)}
            placeholder="Describa aquí su criterio diagnóstico, hallazgos relevantes, observaciones clínicas adicionales u otras consideraciones..."
            rows={5}
          />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-[10px] p-[14px] flex items-start gap-[10px]">
        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-[1px]" />
        <p className="font-[Poppins] font-normal text-[12px] text-yellow-800">
          <strong>Privacidad:</strong> Gemini recibe únicamente datos clínicos anonimizados (sin nombre, fecha de nacimiento, domicilio ni teléfono). El diagnóstico final es responsabilidad exclusiva del profesional de salud.
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveDx}
          disabled={dxSaving}
          className={`flex items-center gap-[8px] px-[28px] py-[10px] rounded-[12px] font-[Poppins] font-bold text-[15px] transition-all ${
            dxSaving
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95 shadow-md'
          }`}
        >
          <Save size={18} />
          {dxSaving ? 'Guardando...' : 'Guardar diagnóstico'}
        </button>
      </div>
    </div>
  );

  // ── Tratamiento tab ───────────────────────────────────────────
  const handleComplementTreatment = () => {
    setIsAITx(true);
    setTimeout(() => {
      setTreatmentResult(`Plan de Tratamiento Personalizado:

**ESQUEMA ACTUAL DE INSULINA:**
• Insulina glargina (basal): 22 U/día
• Insulina lispro (rápida): ~6 U/comida

**OPTIMIZACIÓN SUGERIDA:**
1. Ajuste de Dosis Basal: Considerar aumento gradual de 2U cada 3 días si glucosa de ayuno >120 mg/dL
2. Insulina Prandial: Ratio insulina/carbohidratos recomendado 1:10 a 1:15
3. Plan Nutricional: 45-50% carbohidratos, 30% proteínas, 20-25% grasas

**SEGUIMIENTO:**
• Control médico mensual primeros 3 meses
• Educación en conteo de carbohidratos`);
      setIsAITx(false);
    }, 2500);
  };

  const renderTratamiento = () => (
    <div>
      <div className="mb-[20px] flex justify-end">
        <button onClick={handleComplementTreatment} disabled={isAITx}
          className={`rounded-[15px] px-[25px] py-[12px] font-[Poppins] font-bold text-[16px] transition-all flex items-center gap-[10px] shadow-lg ${isAITx ? 'bg-gray-400 text-gray-200 cursor-wait' : 'bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-white active:scale-95'}`}
        >
          <Sparkles size={20} className={isAITx ? 'animate-spin' : ''} />
          {isAITx ? 'Generando plan...' : 'Complementar tratamiento con IA'}
        </button>
      </div>
      {isAITx && (
        <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-[15px] p-[30px] text-center mb-[20px]">
          <div className="animate-pulse flex justify-center mb-[15px]"><Sparkles size={40} className="text-[#10b981]" /></div>
          <p className="font-[Poppins] font-medium text-[16px] text-[#065f46]">La IA está generando un plan de tratamiento personalizado...</p>
        </div>
      )}
      {treatmentResult ? (
        <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-2 border-[#10b981] rounded-[20px] p-[30px]">
          <div className="flex items-start gap-[15px] mb-[20px]">
            <div className="bg-[#10b981] rounded-full p-[12px]"><Pill size={28} className="text-white" /></div>
            <h3 className="font-[Poppins] font-bold text-[24px] text-[#065f46]">Plan de Tratamiento Generado con IA</h3>
          </div>
          <div className="bg-white rounded-[15px] p-[25px] whitespace-pre-line">
            <p className="font-[Poppins] font-normal text-[15px] text-gray-800 leading-relaxed">{treatmentResult}</p>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-[10px] p-[15px] mt-[20px] flex items-start gap-[10px]">
            <AlertCircle size={24} className="text-orange-600 flex-shrink-0 mt-[2px]" />
            <p className="font-[Poppins] font-normal text-[13px] text-orange-800">
              <strong>Importante:</strong> Este plan debe ser revisado y aprobado por el médico tratante antes de su implementación.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[15px] p-[40px] text-center">
          <Pill size={64} className="text-gray-300 mx-auto mb-[20px]" />
          <p className="font-[Poppins] font-medium text-[18px] text-gray-500 mb-[10px]">No hay plan de tratamiento generado</p>
          <p className="font-[Poppins] font-normal text-[14px] text-gray-400">Haz clic en "Complementar tratamiento con IA" para generar un plan personalizado</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="p-[20px] flex items-center justify-center h-[400px]">
        <p className="font-[Poppins] font-normal text-[18px] text-gray-500">Cargando historia clínica...</p>
      </div>
    );
  }

  return (
    <div className="p-[20px]">

      {/* ── Patient Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-[30px] mb-[20px]">
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
          {patient.profilePicture
            ? <img src={patient.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
            : <UserCircle size={80} className="text-white" strokeWidth={1.5} />
          }
        </div>
        <div>
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">{toTitleCase(patient.nombre)}{patient.apellidos ? ' ' + toTitleCase(patient.apellidos) : ''}</p>
          <p className="font-[Poppins] font-normal text-[18px] text-black">Folio (identificador): {patient.folio}</p>
        </div>
      </div>

      {/* ── Main tabs ──────────────────────────────────────────── */}
      <div className="flex items-center gap-[10px] mb-[24px] flex-wrap">
        {([
          { id: 'datos-generales', label: 'Datos Generales',  icon: <ClipboardList size={20} />, active: 'bg-[#39588a]' },
          { id: 'diagnostico',    label: 'Diagnóstico',       icon: <AlertCircle size={20} />,  active: 'bg-[#5e7deb]' },
          { id: 'tratamiento',    label: 'Tratamiento',       icon: <Pill size={20} />,         active: 'bg-[#10b981]' },
        ] as const).map(({ id, label, icon, active }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[10px] font-[Poppins] font-semibold text-[16px] transition-all ${
              activeTab === id ? `${active} text-white shadow-md` : 'bg-[#e8e8e8] text-gray-700 hover:bg-[#d0d0d0]'
            }`}
          >
            {icon}{label}
          </button>
        ))}
        <div className="ml-auto">
          <ExportMenu mode="historia" onExport={handleExport} />
        </div>
      </div>

      {/* ── Datos Generales ────────────────────────────────────── */}
      {activeTab === 'datos-generales' && (
        <>
          <div className="flex gap-[8px] flex-wrap mb-[24px]">
            {steps.map((step, idx) => (
              <button
                key={step}
                onClick={() => setStepIdx(idx)}
                className={`px-[16px] py-[8px] rounded-[10px] font-[Poppins] font-semibold text-[14px] transition-all ${
                  idx === stepIdx
                    ? 'bg-[#39588a] text-white shadow-md'
                    : idx < stepIdx
                    ? 'bg-[#7a9cc7] text-white'
                    : 'bg-[#e8e8e8] text-[#364153] hover:bg-[#d5dde8]'
                }`}
              >
                {STEP_LABELS[step]}
              </button>
            ))}
          </div>

          <div className="min-h-[320px]">
            {renderStep()}
          </div>

          <div className="flex justify-between items-center mt-[28px] gap-[12px]">
            {/* Left: Anterior */}
            {stepIdx > 0
              ? <button onClick={goPrev} className={BTN}>Anterior</button>
              : <div />
            }

            {/* Center: Guardar todos los cambios — only when something was edited */}
            {toComparable(form) !== cleanSnapshot && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-[8px] bg-[#39588a] text-white font-[Poppins] font-bold text-[16px] px-[28px] py-[8px] rounded-[15px] hover:bg-[#2d4570] active:scale-95 transition-all ${isSaving ? 'opacity-60 cursor-wait' : ''}`}
              >
                <Save size={17} />
                {isSaving ? 'Guardando...' : 'Guardar todos los cambios'}
              </button>
            )}

            {/* Right: Siguiente or Guardar (last step) */}
            {stepIdx < steps.length - 1
              ? <button onClick={goNext} className={BTN}>Siguiente</button>
              : (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`${BTN} flex items-center gap-[8px] ${isSaving ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {isSaving ? <><RefreshCw size={18} className="animate-spin" /> Guardando...</> : 'Guardar'}
                </button>
              )
            }
          </div>
        </>
      )}

      {activeTab === 'diagnostico' && renderDiagnostico()}
      {activeTab === 'tratamiento' && renderTratamiento()}
    </div>
  );
}
