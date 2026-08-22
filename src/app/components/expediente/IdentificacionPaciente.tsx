import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { historiaClinicaAPI } from '../../utils/api';

interface PatientData {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
  fechaNacimiento?: string;
  sexoBiologico?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  domicilio?: string;
  estadoCivil?: string;
  escolaridad?: string;
  alergias?: string;
  profilePicture?: string;
}

interface IdentificacionPacienteProps {
  patient: PatientData;
}

function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-[25px]">
      <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">{label}:</p>
      <div className="border-[0.5px] border-black border-solid min-h-[41px] rounded-[50px] inline-flex items-center px-[20px] py-[8px] min-w-[185px] max-w-[760px]">
        <p className="font-[Poppins] font-normal text-[18px] text-black whitespace-nowrap overflow-hidden text-ellipsis">
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  );
}

export function IdentificacionPaciente({ patient }: IdentificacionPacienteProps) {
  const [hcData, setHcData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    async function loadHC() {
      try {
        const result = await historiaClinicaAPI.get(patient.id);
        if (result.success && result.data) {
          setHcData(result.data);
          return;
        }
      } catch { /* fall through */ }
      // Fallback: localStorage
      try {
        const saved = JSON.parse(localStorage.getItem(`hc:${patient.id}`) ?? 'null');
        if (saved) setHcData(saved);
      } catch { /* ignore */ }
    }
    loadHC();
  }, [patient.id]);

  // Prefer historia clínica values when they exist (doctor may have updated them)
  const telefono   = hcData?.telefono   || patient.telefono;
  const domicilio  = hcData?.domicilio  || patient.domicilio || patient.direccion;
  const estadoCivil = hcData?.estadoCivil || patient.estadoCivil;
  const escolaridad = hcData?.nivelEstudios || patient.escolaridad;
  const ocupacion   = hcData?.ocupacion;
  const grupoEtnico = hcData?.grupoEtnico;
  const tipoSangre  = hcData?.tipoSangre;

  const nombre   = toTitleCase(patient.nombre);
  const apellidos = toTitleCase(patient.apellidos);

  return (
    <div className="p-[20px]">
      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[40px]">
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
          {patient.profilePicture ? (
            <img src={patient.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={80} className="text-white" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">
            {nombre} {apellidos}
          </p>
          <p className="font-[Poppins] font-normal text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Personal Data */}
      <div className="mb-[40px]">
        <p className="font-[Poppins] font-semibold text-[20px] text-[#7f94e2] mb-[30px]">
          DATOS PERSONALES
        </p>

        <Field label="Fecha de nacimiento" value={hcData?.fechaNacimiento || patient.fechaNacimiento} />
        <Field label="Sexo biológico" value={hcData?.sexo || patient.sexoBiologico} />

        {/* Contact row */}
        <div className="mb-[25px]">
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[12px]">
            Información de contacto:
          </p>
          <div className="flex gap-[40px] flex-wrap">
            <div>
              <p className="font-[Poppins] font-normal text-[18px] text-black mb-[8px]">Teléfono:</p>
              <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[185px]">
                <p className="font-[Poppins] font-normal text-[18px] text-black whitespace-nowrap">
                  {telefono || 'No especificado'}
                </p>
              </div>
            </div>
            <div>
              <p className="font-[Poppins] font-normal text-[18px] text-black mb-[8px]">Correo:</p>
              <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[332px]">
                <p className="font-[Poppins] font-normal text-[18px] text-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                  {patient.email || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-[25px]">
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">Dirección:</p>
          <div className="border-[0.5px] border-black border-solid min-h-[41px] rounded-[20px] inline-flex items-center px-[20px] py-[10px] max-w-[765px]">
            <p className="font-[Poppins] font-normal text-[18px] text-black">
              {domicilio || 'No especificado'}
            </p>
          </div>
        </div>
      </div>

      {/* Extra data from Historia Clínica */}
      {hcData && (
        <>
          <div className="h-px bg-[#3457bf] w-full mb-[24px]" />
          <p className="font-[Poppins] font-semibold text-[20px] text-[#7f94e2] mb-[24px]">
            DATOS COMPLEMENTARIOS (Historia clínica)
          </p>

          <div className="grid grid-cols-2 gap-x-[40px]">
            {estadoCivil && <Field label="Estado civil" value={estadoCivil} />}
            {escolaridad  && <Field label="Escolaridad"  value={escolaridad} />}
            {tipoSangre   && <Field label="Tipo de sangre" value={tipoSangre} />}
            {ocupacion    && <Field label="Ocupación"    value={ocupacion} />}
            {grupoEtnico  && <Field label="Grupo étnico" value={grupoEtnico} />}
            {patient.alergias && <Field label="Alergias" value={patient.alergias} />}
          </div>

          {!estadoCivil && !escolaridad && !tipoSangre && !ocupacion && !grupoEtnico && !patient.alergias && (
            <p className="font-[Poppins] font-normal text-[15px] text-gray-400 italic">
              Los datos complementarios aparecerán aquí una vez completada la historia clínica.
            </p>
          )}
        </>
      )}
    </div>
  );
}
