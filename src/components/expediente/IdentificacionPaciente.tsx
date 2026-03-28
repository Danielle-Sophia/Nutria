import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";

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
}

interface IdentificacionPacienteProps {
  patient: PatientData;
}

export function IdentificacionPaciente({ patient }: IdentificacionPacienteProps) {
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
            {patient.nombre} {patient.apellidos}
          </p>
          <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Personal Data Section */}
      <div className="mb-[60px]">
        <p className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#7f94e2] mb-[30px]">
          DATOS PERSONALES
        </p>

        {/* Birth Date */}
        <div className="mb-[25px]">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[8px]">
            Fecha de nacimiento:
          </p>
          <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[185px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black whitespace-nowrap">
              {patient.fechaNacimiento || 'No especificado'}
            </p>
          </div>
        </div>

        {/* Biological Sex */}
        <div className="mb-[25px]">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[8px]">
            Sexo biológico:
          </p>
          <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[185px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black whitespace-nowrap">
              {patient.sexoBiologico || 'No especificado'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-[25px]">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[12px]">
            Información de contacto:
          </p>
          <div className="flex gap-[40px] flex-wrap">
            <div>
              <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black mb-[8px]">
                Teléfono:
              </p>
              <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[185px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black whitespace-nowrap">
                  {patient.telefono || 'No especificado'}
                </p>
              </div>
            </div>
            <div>
              <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black mb-[8px]">
                Correo:
              </p>
              <div className="border-[0.5px] border-black border-solid h-[41px] rounded-[50px] inline-flex items-center px-[20px] min-w-[332px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                  {patient.email || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-[25px]">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[8px]">
            Dirección:
          </p>
          <div className="border-[0.5px] border-black border-solid min-h-[41px] rounded-[20px] inline-flex items-center px-[20px] py-[10px] max-w-[765px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black whitespace-nowrap">
              {patient.direccion || 'No especificado'}
            </p>
          </div>
        </div>
      </div>

      {/* Family History Section */}
      <div>
        <div className="h-px bg-[#3457bf] w-full mb-[20px]" />
        <p className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#7f94e2] mb-[20px]">
          ANTECEDENTES FAMILIARES
        </p>
        <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 italic">
          Esta sección estará disponible próximamente
        </p>
      </div>
    </div>
  );
}